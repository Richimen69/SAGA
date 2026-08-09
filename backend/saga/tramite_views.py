"""
ViewSet mejorado para Trámites con información completa
Incluye movimientos, estatus y todas las relaciones
OPTIMIZADO para evitar N+1 queries
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
import pandas as pd
import re
from django.db.models import (
    Q, Count, Sum, Avg, Case, When, 
    Value, BooleanField, IntegerField
)
from django.utils import timezone

from .models import Tramite, TramiteTarea, Compromiso
from .tramite_serializer import (
    TramiteCompletoSerializer,
    TramiteTablaSerializer,
    TramiteResumenSerializer,
)
from .serializers import TramiteCreateUpdateSerializer 
from .mixins import StandardResponseMixin

def detectar_columna_fianza(df):
    """
    Detecta automáticamente la columna que contiene números de fianza
    
    Returns:
        tuple: (nombre_columna, confianza)
        - nombre_columna: str o None
        - confianza: 'alta', 'media', 'baja'
    """
    # Palabras clave que indican número de fianza (orden de prioridad)
    keywords_alta_prioridad = ['fianza', 'póliza', 'poliza']
    keywords_media_prioridad = ['número', 'numero', 'no.', 'no', 'folio']
    
    columnas_candidatas = []
    
    # Buscar en nombres de columnas (case-insensitive)
    for col in df.columns:
        col_lower = str(col).lower().strip()
        
        # Alta prioridad
        for keyword in keywords_alta_prioridad:
            if keyword in col_lower:
                return col, 'alta'
        
        # Media prioridad
        for keyword in keywords_media_prioridad:
            if keyword in col_lower:
                columnas_candidatas.append((col, 'media'))
    
    # Si hay candidatos de media prioridad
    if columnas_candidatas:
        return columnas_candidatas[0]
    
    # Analizar contenido de columnas numéricas o de texto
    for col in df.columns:
        try:
            # Obtener valores no nulos
            valores = df[col].dropna()
            
            if len(valores) == 0:
                continue
            
            # Convertir a string y limpiar
            valores_str = valores.astype(str)
            
            # Verificar si parecen números de fianza
            # Criterios: 
            # - 80%+ de valores tienen 5-15 caracteres
            # - 80%+ contienen solo números, guiones, puntos
            total = len(valores_str)
            validos = 0
            
            for val in valores_str:
                val_limpio = val.strip()
                # Longitud razonable para un número de fianza
                if 4 <= len(val_limpio) <= 20:
                    # Solo contiene números, guiones, puntos, espacios
                    if re.match(r'^[\d\s\-\.]+$', val_limpio):
                        validos += 1
            
            confianza_contenido = validos / total if total > 0 else 0
            
            if confianza_contenido >= 0.8:
                columnas_candidatas.append((col, 'baja'))
                
        except Exception:
            continue
    
    # Retornar el mejor candidato
    if columnas_candidatas:
        return columnas_candidatas[0]
    
    return None, None


def normalizar_numero_fianza(valor):
    """
    Normaliza diferentes formatos de número de fianza
    
    PRESERVA: Guiones (-)
    ELIMINA: Puntos decimales, espacios, otros caracteres
    
    Ejemplos:
        "3661-05549-5" -> "3661-05549-5"
        2548173.0 -> "2548173"
        "2548173.0" -> "2548173"
        " 123-456 " -> "123-456"
        "123 - 456" -> "123-456"
    
    Returns:
        str: Número de fianza normalizado (dígitos y guiones)
    """
    if pd.isna(valor) or valor is None:
        return None
    
    # Si es número flotante, convertir a int primero para eliminar .0
    if isinstance(valor, (float, int)):
        try:
            # Convertir float a int para eliminar decimales
            valor = int(valor)
        except (ValueError, OverflowError):
            pass
    
    # Convertir a string
    valor_str = str(valor).strip()
    
    # Si está vacío
    if not valor_str or valor_str.lower() in ['nan', 'none', '']:
        return None
    
    # Quitar todo excepto dígitos y guiones, luego limpiar espacios alrededor de guiones
    # Permitir solo dígitos (0-9) y guiones (-)
    limpio = re.sub(r'[^\d\-]', '', valor_str)
    
    # Eliminar guiones duplicados
    limpio = re.sub(r'-+', '-', limpio)
    
    # Eliminar guiones al inicio y final
    limpio = limpio.strip('-')
    
    # Si no quedó nada
    if not limpio:
        return None
    
    return limpio


def obtener_columnas_disponibles(df):
    """
    Obtiene información sobre las columnas disponibles en el DataFrame
    """
    columnas_info = []
    
    for col in df.columns:
        # Contar valores no nulos
        valores_validos = df[col].notna().sum()
        total = len(df)
        
        # Obtener tipo de datos
        dtype = str(df[col].dtype)
        
        # Ejemplo de valores
        ejemplos = df[col].dropna().head(3).tolist()
        ejemplos_str = [str(e) for e in ejemplos]
        
        columnas_info.append({
            'nombre': col,
            'tipo': dtype,
            'valores_validos': valores_validos,
            'total': total,
            'porcentaje_validos': round((valores_validos / total * 100), 1) if total > 0 else 0,
            'ejemplos': ejemplos_str[:3]
        })
    
    return columnas_info

class TramiteCompletoViewSet(StandardResponseMixin, viewsets.ModelViewSet ):
    """
    ViewSet completo para gestionar Trámites con toda su información relacionada
    
    FILTROS DISPONIBLES (query params):
    - search: Búsqueda general (folio, cliente_nombre, numero_fianza)
    - estatus: ID del estatus
    - estatus__nombre: Nombre exacto del estatus
    - movimiento: ID del movimiento
    - movimiento__nombre: Nombre exacto del movimiento
    - estatus_pago: Estatus de pago exacto
    - numero_fianza: Búsqueda por número de fianza (contiene)
    - cliente_nombre: Búsqueda por nombre de cliente (contiene)
    
    Ejemplo: /api/tramites-completo/?search=ACME&movimiento__nombre=EXPEDICIÓN&estatus_pago=PAGADA
    """
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtros exactos y por relación
    filterset_fields = {
        'estatus': ['exact', 'in'],              # Por ID de estatus
        'estatus__nombre': ['exact', 'icontains', 'in'], # Por Nombre de estatus
        'cliente_id': ['exact', 'in'],           # Por ID de cliente (Agregado)
        'agente_nombre': ['exact', 'icontains'],
        'afianzadora_id': ['exact'],
        'estatus_pago': ['exact'],
        'tipo_proceso': ['exact', 'icontains'],
        'movimiento': ['exact', 'in'],           # Por ID de movimiento
        'movimiento__nombre': ['exact', 'icontains'],
        'programa_proveedores': ['exact'],
        'fecha': ['gte', 'lte', 'exact'],
        'fecha_creacion': ['gte', 'lte'],
        'numero_fianza': ['exact', 'icontains'],
        'cliente_nombre': ['icontains'],
        'beneficiario_nombre': ['icontains'],
        'creado_por': ['exact', 'icontains'],
    }
    
    # Búsqueda general (parámetro ?search=)
    search_fields = [
        'folio',
        'cliente_nombre',
        'numero_fianza',
        'beneficiario_nombre',
        'afianzadora_nombre',
    ]
    
    ordering_fields = [
        'fecha',
        'fecha_creacion',
        'folio',
        'cliente_nombre',
        'prima_total',
        'movimiento__nombre',
        'estatus__nombre'
    ]
    
    ordering = ['-fecha']
    
    def get_queryset(self):
        """
        Queryset OPTIMIZADO con anotaciones para evitar N+1 queries
        """
        hoy = timezone.now().date()
        
        return Tramite.objects.select_related(
            'movimiento',
            'estatus'
        ).prefetch_related(
            'observaciones'
        ).annotate(
            total_tareas_count=Count(
                'tramite_tareas',
                distinct=True
            ),
            tareas_completadas_count=Count(
                'tramite_tareas',
                filter=Q(tramite_tareas__completado=True),
                distinct=True
            ),
            tiene_compromisos_vencidos_flag=Case(
                When(
                    Q(compromisos__completado=False) & 
                    Q(compromisos__fecha_vencimiento__lt=hoy),
                    then=Value(True)
                ),
                default=Value(False),
                output_field=BooleanField()
            )
        ).distinct()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TramiteTablaSerializer
        elif self.action in ['create', 'update', 'partial_update']:  # ← agregar esta línea
            return TramiteCreateUpdateSerializer
        elif self.action == 'dashboard':
            return TramiteResumenSerializer
        else:
            return TramiteCompletoSerializer
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        queryset = self.filter_queryset(self.get_queryset())[:100]
        serializer = TramiteResumenSerializer(queryset, many=True)
        return Response(serializer.data)
    @action(detail=False, methods=['get'])
    def estado_cuenta_cliente(self, request):
        """
        GET /api/tramites-completo/estado_cuenta_cliente/?cliente_id=X
        Obtiene los trámites de un cliente filtrando movimientos específicos 
        y excluyendo trámites ya pagados o que no aplican.
        """
        cliente_id = request.query_params.get('cliente_id')
        
        if not cliente_id:
            return Response(
                {'error': 'Se requiere el parámetro cliente_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Lista de IDs de movimientos permitidos
        movimientos_validos = [21, 5, 24, 23, 20, 22, 4, 27, 28]
        # Lista de estatus de pago a excluir
        estatus_excluidos = ['NO APLICA', 'PAGADA']
        
        # Filtro ORM (Equivalente a tu WHERE, AND e IN / NOT IN)
        queryset = self.get_queryset().filter(
            cliente_id=cliente_id,
            movimiento_id__in=movimientos_validos
        ).exclude(
            estatus_pago__in=estatus_excluidos
        )
        
        # Opcional: Agregar ordenamiento por fecha
        queryset = queryset.order_by('-fecha')
        
        # Usamos el serializer de tabla para que la respuesta sea optimizada
        serializer = TramiteTablaSerializer(queryset, many=True)
        
        # Calculamos los totales si el frontend los necesita para mostrar un resumen
        stats = queryset.aggregate(
            total_tramites=Count('id'),
            suma_importes=Sum('importe_total')
        )
        
        return Response({
            'cliente_id': cliente_id,
            'estadisticas': {
                'total_registros': stats['total_tramites'],
                'importe_adeudado': float(stats['suma_importes'] or 0)
            },
            'tramites': serializer.data
        })
    @action(detail=False, methods=['get'])
    def estadisticas_generales(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        total_tramites = queryset.count()
        
        por_estatus = queryset.values(
            'estatus__id',
            'estatus__nombre'
        ).annotate(
            cantidad=Count('id'),
            prima_total_sum=Sum('prima_total')
        ).order_by('estatus__nombre')
        
        por_movimiento = queryset.values(
            'movimiento__id',
            'movimiento__nombre'
        ).annotate(
            cantidad=Count('id'),
            prima_total_sum=Sum('prima_total')
        ).order_by('movimiento__nombre')
        
        por_estatus_pago = queryset.values(
            'estatus_pago'
        ).annotate(
            cantidad=Count('id'),
            prima_total_sum=Sum('prima_total')
        ).order_by('estatus_pago')
        
        totales_financieros = queryset.aggregate(
            total_prima_inicial=Sum('prima_inicial'),
            total_prima_futura=Sum('prima_futura'),
            total_prima_total=Sum('prima_total'),
            total_importe=Sum('importe_total'),
            promedio_prima=Avg('prima_total')
        )
        
        tareas_stats = {
            'total_tareas': TramiteTarea.objects.count(),
            'tareas_completadas': TramiteTarea.objects.filter(completado=True).count(),
            'tareas_pendientes': TramiteTarea.objects.filter(completado=False).count()
        }
        
        hoy = timezone.now().date()
        compromisos_stats = {
            'total_compromisos': Compromiso.objects.count(),
            'compromisos_completados': Compromiso.objects.filter(completado=True).count(),
            'compromisos_pendientes': Compromiso.objects.filter(completado=False).count(),
            'compromisos_vencidos': Compromiso.objects.filter(
                completado=False,
                fecha_vencimiento__lt=hoy
            ).count()
        }
        
        return Response({
            'resumen': {
                'total_tramites': total_tramites,
                'tramites_con_tareas': queryset.filter(tramite_tareas__isnull=False).distinct().count(),
                'tramites_con_compromisos': queryset.filter(compromisos__isnull=False).distinct().count(),
            },
            'por_estatus': list(por_estatus),
            'por_movimiento': list(por_movimiento),
            'por_estatus_pago': list(por_estatus_pago),
            'financiero': {
                'total_prima_inicial': float(totales_financieros['total_prima_inicial'] or 0),
                'total_prima_futura': float(totales_financieros['total_prima_futura'] or 0),
                'total_prima_total': float(totales_financieros['total_prima_total'] or 0),
                'total_importe': float(totales_financieros['total_importe'] or 0),
                'promedio_prima': float(totales_financieros['promedio_prima'] or 0),
            },
            'tareas': tareas_stats,
            'compromisos': compromisos_stats
        })
    
    @action(detail=False, methods=['get'])
    def por_movimiento(self, request):
        movimiento_id = request.query_params.get('movimiento_id')
        
        if not movimiento_id:
            return Response(
                {'error': 'Se requiere el parámetro movimiento_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(movimiento_id=movimiento_id)
        
        stats = queryset.aggregate(
            total=Count('id'),
            total_prima=Sum('prima_total'),
            promedio_prima=Avg('prima_total')
        )
        
        serializer = TramiteTablaSerializer(queryset, many=True)
        
        return Response({
            'movimiento_id': movimiento_id,
            'estadisticas': {
                'total_tramites': stats['total'],
                'total_prima': float(stats['total_prima'] or 0),
                'promedio_prima': float(stats['promedio_prima'] or 0)
            },
            'tramites': serializer.data
        })
    @action(detail=False, methods=['get'])
    def por_estatus(self, request):
        # 1. Obtener parámetros (pueden venir separados por comas o repetidos)
        # request.query_params.getlist() captura múltiples parámetros repetidos en la URL
        estatus_ids_raw = request.query_params.get('estatus_id')
        estatus_nombres_raw = request.query_params.getlist('estatus_nombre') or request.query_params.get('estatus_nombre')
        cliente_id = request.query_params.get('cliente_id')
        
        # 2. Validar que al menos venga un estatus (por ID o por Nombre)
        if not estatus_ids_raw and not estatus_nombres_raw:
            return Response(
                {'error': 'Se requiere al menos un parámetro de estatus: estatus_id o estatus_nombre'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset()
        
        # 3. Filtrar por MÚLTIPLES IDs (ej: estatus_id=1,2,3)
        if estatus_ids_raw:
            # Convierte "1, 2, 3" en lista [1, 2, 3]
            ids_list = [e.strip() for e in str(estatus_ids_raw).split(',') if e.strip()]
            queryset = queryset.filter(estatus_id__in=ids_list)
            
        # 4. Filtrar por MÚLTIPLES Nombres
        elif estatus_nombres_raw:
            # Permite tanto la sintaxis con comas (PENDIENTE,CANCELADO) como múltiple en URL (&estatus_nombre=X&estatus_nombre=Y)
            if isinstance(estatus_nombres_raw, list):
                nombres_list = estatus_nombres_raw
            else:
                nombres_list = [n.strip() for n in estatus_nombres_raw.split(',') if n.strip()]
                
            # iexact sobre una lista se maneja con __in o combinando Q objects
            from django.db.models import Q
            q_objects = Q()
            for nombre in nombres_list:
                q_objects |= Q(estatus__nombre__iexact=nombre)
            
            queryset = queryset.filter(q_objects)
            
        # 5. Filtrar opcionalmente por cliente_id (también soporta varios: cliente_id=5,10)
        if cliente_id:
            clientes_list = [c.strip() for c in str(cliente_id).split(',') if c.strip()]
            queryset = queryset.filter(cliente_id__in=clientes_list)
        
        # 6. Agregaciones sobre todo el queryset filtrado
        stats = queryset.aggregate(
            total=Count('id'),
            total_prima=Sum('prima_total'),
            promedio_prima=Avg('prima_total')
        )
        
        serializer = TramiteTablaSerializer(queryset, many=True)
        
        return Response({
            'filtros_aplicados': {
                'estatus_id': estatus_ids_raw,
                'estatus_nombre': estatus_nombres_raw,
                'cliente_id': cliente_id,
            },
            'estadisticas': {
                'total_tramites': stats['total'],
                'total_prima': float(stats['total_prima'] or 0),
                'promedio_prima': float(stats['promedio_prima'] or 0)
            },
            'tramites': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def por_fianza(self, request):
        numero_fianza = request.query_params.get('numero_fianza')
        busqueda_exacta = request.query_params.get('exacta', 'false').lower() == 'true'
        incluir_expedicion = request.query_params.get('incluir_expedicion', 'false').lower() == 'true'
        
        if not numero_fianza:
            return Response(
                {'error': 'Se requiere el parámetro numero_fianza'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if busqueda_exacta:
            queryset = self.get_queryset().filter(numero_fianza=numero_fianza)
        else:
            queryset = self.get_queryset().filter(numero_fianza__icontains=numero_fianza)
        
        if not incluir_expedicion:
            queryset = queryset.exclude(movimiento_id=21)
        
        stats = queryset.aggregate(
            total=Count('id'),
            total_prima=Sum('prima_total'),
            promedio_prima=Avg('prima_total')
        )
        
        serializer = TramiteTablaSerializer(queryset, many=True)
        
        return Response({
            'numero_fianza_buscado': numero_fianza,
            'busqueda_exacta': busqueda_exacta,
            'expedicion_excluida': not incluir_expedicion,
            'estadisticas': {
                'total_tramites': stats['total'],
                'total_prima': float(stats['total_prima'] or 0),
                'promedio_prima': float(stats['promedio_prima'] or 0)
            },
            'tramites': serializer.data
        })
        
    @action(detail=False, methods=['get'])
    def con_alertas(self, request):
        hoy = timezone.now().date()
        
        con_compromisos_vencidos = self.get_queryset().filter(
            compromisos__completado=False,
            compromisos__fecha_vencimiento__lt=hoy
        ).distinct()
        
        sin_movimiento = self.get_queryset().filter(movimiento__isnull=True)
        sin_estatus = self.get_queryset().filter(estatus__isnull=True)
        
        return Response({
            'con_compromisos_vencidos': {
                'cantidad': con_compromisos_vencidos.count(),
                'tramites': TramiteResumenSerializer(con_compromisos_vencidos[:10], many=True).data
            },
            'sin_movimiento': {
                'cantidad': sin_movimiento.count(),
                'tramites': TramiteResumenSerializer(sin_movimiento[:10], many=True).data
            },
            'sin_estatus': {
                'cantidad': sin_estatus.count(),
                'tramites': TramiteResumenSerializer(sin_estatus[:10], many=True).data
            }
        })
    
    @action(detail=True, methods=['get'])
    def historial_completo(self, request, pk=None):
        tramite = self.get_object()
        
        observaciones = tramite.observaciones.all().order_by('-fecha')
        compromisos = tramite.compromisos.all().order_by('-fecha_creacion')
        tareas = tramite.tramite_tareas.all().select_related('tarea', 'tarea__movimiento')
        
        from .tramite_serializer import (
            ObservacionTramiteDetalleSerializer,
            CompromisoDetalleSerializer,
            TramiteTareaDetalleSerializer
        )
        
        return Response({
            'tramite_id': tramite.id,
            'folio': tramite.folio,
            'observaciones': ObservacionTramiteDetalleSerializer(observaciones, many=True).data,
            'compromisos': CompromisoDetalleSerializer(compromisos, many=True).data,
            'tareas': TramiteTareaDetalleSerializer(tareas, many=True).data
        })
    @action(
        detail=False, 
        methods=['post'],
        permission_classes=[AllowAny]
    )
    def comparar_excel(self, request):
        """
        Compara archivo Excel con detección automática de columnas
        
        POST /api/tramites-completo/comparar_excel/
        
        Body (multipart/form-data):
        - archivo: Archivo Excel (.xlsx o .xls) [REQUERIDO]
        - columna: Nombre de columna de fianza [OPCIONAL - se detecta automáticamente]
        - hoja: Nombre o índice de hoja [OPCIONAL - default: primera hoja]
        - auto_detectar: true/false [OPCIONAL - default: true]
        - fecha_inicio: YYYY-MM-DD [OPCIONAL - filtrar por fecha_termino >= fecha_inicio]
        - fecha_fin: YYYY-MM-DD [OPCIONAL - filtrar por fecha_termino <= fecha_fin]
        """
        
        # ============================================================
        # 1. VALIDACIONES INICIALES
        # ============================================================
        
        if 'archivo' not in request.FILES:
            return Response({
                'error': 'No se proporcionó ningún archivo',
                'ayuda': 'Debes enviar un archivo Excel con el campo "archivo"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        archivo = request.FILES['archivo']
        
        # Validar extensión
        if not (archivo.name.endswith('.xlsx') or archivo.name.endswith('.xls')):
            return Response({
                'error': 'El archivo debe ser un Excel (.xlsx o .xls)',
                'archivo_recibido': archivo.name
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener filtros de fecha
        fecha_inicio = request.data.get('fecha_inicio', None)
        fecha_fin = request.data.get('fecha_fin', None)
        
        # Validar formato de fechas
        from datetime import datetime
        
        if fecha_inicio:
            try:
                fecha_inicio_obj = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            except ValueError:
                return Response({
                    'error': 'Formato de fecha_inicio inválido',
                    'formato_esperado': 'YYYY-MM-DD',
                    'valor_recibido': fecha_inicio
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if fecha_fin:
            try:
                fecha_fin_obj = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            except ValueError:
                return Response({
                    'error': 'Formato de fecha_fin inválido',
                    'formato_esperado': 'YYYY-MM-DD',
                    'valor_recibido': fecha_fin
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar que fecha_inicio <= fecha_fin
        if fecha_inicio and fecha_fin:
            if fecha_inicio_obj > fecha_fin_obj:
                return Response({
                    'error': 'fecha_inicio no puede ser mayor que fecha_fin',
                    'fecha_inicio': fecha_inicio,
                    'fecha_fin': fecha_fin
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # ============================================================
        # 2. LEER ARCHIVO EXCEL
        # ============================================================
        
        try:
            hoja = request.data.get('hoja', None)
            
            if hoja:
                try:
                    indice_hoja = int(hoja)
                    df = pd.read_excel(archivo, sheet_name=indice_hoja)
                except ValueError:
                    df = pd.read_excel(archivo, sheet_name=hoja)
            else:
                df = pd.read_excel(archivo, sheet_name=0)
                
        except Exception as e:
            return Response({
                'error': f'Error al leer el archivo Excel: {str(e)}',
                'tipo_error': type(e).__name__
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ============================================================
        # 3. DETECCIÓN DE COLUMNA DE FIANZA
        # ============================================================
        
        columna_manual = request.data.get('columna', None)
        auto_detectar = request.data.get('auto_detectar', 'true').lower() == 'true'
        
        columna_fianza = None
        confianza = None
        metodo_deteccion = None
        
        # Opción A: Usuario especificó columna manualmente
        if columna_manual:
            if columna_manual not in df.columns:
                columnas_info = obtener_columnas_disponibles(df)
                return Response({
                    'error': f'La columna "{columna_manual}" no existe en el Excel',
                    'columnas_disponibles': columnas_info,
                    'ayuda': 'Usa una de las columnas listadas en columnas_disponibles'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            columna_fianza = columna_manual
            metodo_deteccion = 'manual'
            confianza = 'manual'
        
        # Opción B: Detección automática
        elif auto_detectar:
            columna_detectada, confianza = detectar_columna_fianza(df)
            
            if columna_detectada:
                columna_fianza = columna_detectada
                metodo_deteccion = 'automatica'
            else:
                # No se pudo detectar
                columnas_info = obtener_columnas_disponibles(df)
                return Response({
                    'error': 'No se pudo detectar automáticamente la columna de fianza',
                    'columnas_disponibles': columnas_info,
                    'ayuda': 'Especifica la columna manualmente con el parámetro "columna"'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            # No hay columna manual ni auto-detección
            columnas_info = obtener_columnas_disponibles(df)
            return Response({
                'error': 'Debes especificar la columna de fianza o activar auto_detectar=true',
                'columnas_disponibles': columnas_info
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ============================================================
        # 4. EXTRAER Y NORMALIZAR NÚMEROS DE FIANZA
        # ============================================================
        
        fianzas_excel = df[columna_fianza].tolist()
        
        fianzas_procesadas = []
        fianzas_vacias = []
        fianzas_duplicadas_indices = {}
        
        for idx, fianza_raw in enumerate(fianzas_excel):
            # Normalizar
            fianza_limpia = normalizar_numero_fianza(fianza_raw)
            
            if not fianza_limpia:
                fianzas_vacias.append({
                    'fila': idx + 2,
                    'valor_original': str(fianza_raw),
                    'motivo': 'Vacío o inválido'
                })
                continue
            
            fianzas_procesadas.append({
                'fila': idx + 2,
                'valor_original': str(fianza_raw),
                'numero_fianza_normalizado': fianza_limpia
            })
            
            # Detectar duplicados
            if fianza_limpia in fianzas_duplicadas_indices:
                fianzas_duplicadas_indices[fianza_limpia].append(idx + 2)
            else:
                fianzas_duplicadas_indices[fianza_limpia] = [idx + 2]
        
        # Identificar duplicados (aparecen más de 1 vez)
        duplicados_en_excel = [
            {
                'numero_fianza': fianza,
                'filas': filas,
                'apariciones': len(filas)
            }
            for fianza, filas in fianzas_duplicadas_indices.items()
            if len(filas) > 1
        ]
        
        # Obtener números únicos para búsqueda
        fianzas_unicas = list(set([f['numero_fianza_normalizado'] for f in fianzas_procesadas]))
        
        # ============================================================
        # 5. BÚSQUEDA EN BASE DE DATOS (con filtro de fechas)
        # ============================================================
        
        queryset = self.get_queryset()
        
        # Aplicar filtro de fechas si se proporcionaron
        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(
                fecha_termino__range=[fecha_inicio_obj, fecha_fin_obj]
            )
        elif fecha_inicio:
            queryset = queryset.filter(
                fecha_termino__gte=fecha_inicio_obj
            )
        elif fecha_fin:
            queryset = queryset.filter(
                fecha_termino__lte=fecha_fin_obj
            )
        
        # Normalizar números de fianza en la BD también
        from django.db.models import F
        
        tramites_encontrados = queryset.filter(
            numero_fianza__isnull=False
        ).values(
            'id',
            'folio',
            'numero_fianza',
            'cliente_nombre',
            'movimiento__id',
            'movimiento__nombre',
            'estatus__nombre',
            'prima_total',
            'fecha_creacion',
            'fecha',
            'fecha_termino'
        ).order_by('numero_fianza', 'fecha_creacion')
        
        # Normalizar y agrupar
        fianzas_con_tramites = {}
        
        for tramite in tramites_encontrados:
            numero_fianza_bd = normalizar_numero_fianza(tramite['numero_fianza'])
            
            if not numero_fianza_bd:
                continue
            
            # Solo considerar si está en el Excel
            if numero_fianza_bd not in fianzas_unicas:
                continue
            
            if numero_fianza_bd not in fianzas_con_tramites:
                fianzas_con_tramites[numero_fianza_bd] = {
                    'numero_fianza_normalizado': numero_fianza_bd,
                    'numero_fianza_bd': tramite['numero_fianza'],
                    'total_tramites': 0,
                    'tiene_expedicion': False,
                    'tramite_expedicion': None,
                    'otros_tramites': []
                }
            
            # Verificar si es EXPEDICIÓN (movimiento_id = 21)
            if tramite['movimiento__id'] == 21:
                fianzas_con_tramites[numero_fianza_bd]['tiene_expedicion'] = True
                fianzas_con_tramites[numero_fianza_bd]['tramite_expedicion'] = {
                    'id': tramite['id'],
                    'folio': tramite['folio'],
                    'cliente_nombre': tramite['cliente_nombre'],
                    'movimiento': tramite['movimiento__nombre'],
                    'estatus': tramite['estatus__nombre'],
                    'prima_total': float(tramite['prima_total']) if tramite['prima_total'] else 0,
                    'fecha': tramite['fecha'],
                    'fecha_termino': tramite['fecha_termino'],
                    'fecha_creacion': tramite['fecha_creacion']
                }
            else:
                fianzas_con_tramites[numero_fianza_bd]['otros_tramites'].append({
                    'id': tramite['id'],
                    'folio': tramite['folio'],
                    'cliente_nombre': tramite['cliente_nombre'],
                    'movimiento': tramite['movimiento__nombre'],
                    'estatus': tramite['estatus__nombre'],
                    'prima_total': float(tramite['prima_total']) if tramite['prima_total'] else 0,
                    'fecha': tramite['fecha'],
                    'fecha_termino': tramite['fecha_termino'],
                    'fecha_creacion': tramite['fecha_creacion']
                })
            
            fianzas_con_tramites[numero_fianza_bd]['total_tramites'] += 1
        
        # ============================================================
        # 6. CLASIFICAR RESULTADOS
        # ============================================================
        
        con_expedicion = []
        sin_expedicion_pero_con_otros = []
        sin_ningun_tramite = []
        
        for fianza_info in fianzas_procesadas:
            fianza_norm = fianza_info['numero_fianza_normalizado']
            fila = fianza_info['fila']
            valor_original = fianza_info['valor_original']
            
            if fianza_norm in fianzas_con_tramites:
                info_tramites = fianzas_con_tramites[fianza_norm]
                
                if info_tramites['tiene_expedicion']:
                    con_expedicion.append({
                        'fila_excel': fila,
                        'valor_original': valor_original,
                        'numero_fianza_normalizado': fianza_norm,
                        'numero_fianza_bd': info_tramites['numero_fianza_bd'],
                        'total_tramites': info_tramites['total_tramites'],
                        'expedicion': info_tramites['tramite_expedicion'],
                        'otros_movimientos': info_tramites['otros_tramites'],
                        'cantidad_otros': len(info_tramites['otros_tramites'])
                    })
                else:
                    sin_expedicion_pero_con_otros.append({
                        'fila_excel': fila,
                        'valor_original': valor_original,
                        'numero_fianza_normalizado': fianza_norm,
                        'numero_fianza_bd': info_tramites['numero_fianza_bd'],
                        'total_tramites': info_tramites['total_tramites'],
                        'movimientos': info_tramites['otros_tramites'],
                        'advertencia': 'Tiene trámites pero NO tiene EXPEDICIÓN'
                    })
            else:
                sin_ningun_tramite.append({
                    'fila_excel': fila,
                    'valor_original': valor_original,
                    'numero_fianza_normalizado': fianza_norm
                })
        
        # ============================================================
        # 7. PREPARAR RESPUESTA
        # ============================================================
        
        resumen = {
            'total_en_excel': len(fianzas_excel),
            'total_procesados': len(fianzas_procesadas),
            'con_expedicion': len(con_expedicion),
            'sin_expedicion_pero_con_otros': len(sin_expedicion_pero_con_otros),
            'sin_ningun_tramite': len(sin_ningun_tramite),
            'vacios_o_invalidos': len(fianzas_vacias),
            'duplicados_en_excel': len(duplicados_en_excel)
        }
        
        total_tramites_encontrados = sum(
            info['total_tramites'] for info in fianzas_con_tramites.values()
        )
        
        return Response({
            'resumen': resumen,
            'estadisticas': {
                'total_tramites_encontrados': total_tramites_encontrados,
                'promedio_tramites_por_fianza': round(
                    total_tramites_encontrados / len(fianzas_con_tramites) if fianzas_con_tramites else 0,
                    2
                )
            },
            'con_expedicion': con_expedicion,
            'sin_expedicion_pero_con_otros': sin_expedicion_pero_con_otros,
            'sin_ningun_tramite': sin_ningun_tramite,
            'vacios_o_invalidos': fianzas_vacias,
            'duplicados_en_excel': duplicados_en_excel,
            'deteccion_columna': {
                'columna_utilizada': columna_fianza,
                'metodo': metodo_deteccion,
                'confianza': confianza
            },
            'filtros_aplicados': {
                'fecha_inicio': fecha_inicio,
                'fecha_fin': fecha_fin,
                'filtrado_por_fecha': bool(fecha_inicio or fecha_fin)
            },
            'info_archivo': {
                'nombre': archivo.name,
                'total_filas': len(df),
                'columnas_excel': list(df.columns)
            }
        })
