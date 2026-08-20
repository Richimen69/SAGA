from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum
from django.utils import timezone
from django.db.models.functions import ExtractMonth
import calendar
from .models import AfianzadoraLegacy
from .models import RamoFianza, TipoFianza
from .serializers import RamoFianzaSerializer, TipoFianzaSerializer
from .models import (
    Estatus, Movimiento, Tarea, Tramite, TramiteTarea,
    Compromiso, ObservacionTramite
)
from .serializers import (
    EstatusSerializer, MovimientoSerializer, TareaSerializer,
    TramiteSerializer, TramiteListSerializer, TramiteCreateUpdateSerializer,
    TramiteTareaSerializer, CompromisoSerializer, ObservacionTramiteSerializer,
    RamoFianzaSerializer, TipoFianzaSerializer,
)
from .legacy_helpers import (
    get_all_clientes,
    get_cliente_by_id,
    search_clientes,
    get_clientes_por_tipo,
    get_clientes_con_seguimiento,
    get_cliente_direccion_completa,
    count_clientes_activos,
    get_clientes_por_grupo
)
from .mixins import StandardResponseMixin

class MovimientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Movimientos
    
    list: Listar todos los movimientos
    retrieve: Obtener un movimiento específico
    create: Crear un nuevo movimiento
    update: Actualizar un movimiento
    destroy: Eliminar un movimiento
    """
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'id']
    ordering = ['nombre']

class EstatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Movimientos
    
    list: Listar todos los movimientos
    retrieve: Obtener un movimiento específico
    create: Crear un nuevo movimiento
    update: Actualizar un movimiento
    destroy: Eliminar un movimiento
    """
    queryset = Estatus.objects.all()
    serializer_class = EstatusSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'id']
    ordering = ['nombre']


class TareaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Tareas
    """
    queryset = Tarea.objects.select_related('movimiento').all()
    serializer_class = TareaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['movimiento', 'bloqueado']
    search_fields = ['nombre', 'movimiento__nombre']
    ordering_fields = ['nombre', 'movimiento']
    ordering = ['movimiento', 'nombre']
    
    @action(detail=False, methods=['get'])
    def por_movimiento(self, request):
        """Obtener tareas agrupadas por movimiento"""
        movimiento_id = request.query_params.get('movimiento_id')
        if not movimiento_id:
            return Response(
                {'error': 'Se requiere el parámetro movimiento_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tareas = self.queryset.filter(movimiento_id=movimiento_id)
        serializer = self.get_serializer(tareas, many=True)
        return Response(serializer.data)


class TramiteViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    """
    ViewSet para gestionar Trámites
    
    Endpoints adicionales:
    - /tramites/estadisticas/ - Estadísticas generales
    - /tramites/por_estatus/ - Filtrar por estatus
    - /tramites/pendientes/ - Trámites pendientes
    - /tramites/{id}/cambiar_estatus/ - Cambiar estatus de un trámite
    """
    queryset = Tramite.objects.select_related('movimiento').prefetch_related(
        'compromisos', 'observaciones', 'tramite_tareas'
    ).all()
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estatus', 'estatus_pago', 'tipo_proceso', 'movimiento']
    search_fields = ['folio', 'cliente_nombre', 'numero_fianza']
    ordering_fields = ['fecha', 'fecha_creacion', 'folio']
    ordering = ['-fecha_creacion']
    
    def get_serializer_class(self):
        """Usar diferentes serializers según la acción"""
        if self.action == 'list':
            return TramiteListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TramiteCreateUpdateSerializer
        return TramiteSerializer
    @action(detail=False, methods=['get'])
    def dashboard_ventas(self, request):
        try:
            # 1. Recibir parámetros de fecha
            fecha_inicio = request.query_params.get('fecha_inicio')
            fecha_fin = request.query_params.get('fecha_fin')
            
            filtros = (
                Q(programa_proveedores=False) | Q(programa_proveedores__isnull=True)
            ) & Q(
                movimiento_id__in=[21, 5, 24, 22, 17, 4]
            ) & ~Q(estatus_id=4)
            
            if fecha_inicio and fecha_fin:
                # Si el usuario mandó fechas, buscamos en ese rango
                filtros &= Q(fecha_termino__range=[fecha_inicio, fecha_fin])
            else:
                # Si NO mandó fechas, aplicamos el filtro del año actual por defecto
                año_actual = timezone.now().year
                filtros &= Q(fecha_termino__year=año_actual)
                
            tramites_base = self.queryset.filter(filtros)
            
            ventas_anuales = tramites_base.values(
                'afianzadora_id', 'afianzadora_nombre'
            ).annotate(
                venta_anual=Sum('prima_total')
            ).order_by('afianzadora_nombre')
            
            ventas_mensuales_db = tramites_base.annotate(
                mes_num=ExtractMonth('fecha_termino')
            ).values(
                'afianzadora_id', 'afianzadora_nombre', 'mes_num'
            ).annotate(
                venta_mensual=Sum('prima_total')
            ).order_by('afianzadora_nombre', 'mes_num')

            ventas_mensuales = []
            for v in ventas_mensuales_db:
                if v['mes_num']:
                    mes_nombre = calendar.month_name[v['mes_num']]
                    ventas_mensuales.append({
                        'id_afi': v['afianzadora_id'],
                        'nombre_afi': v['afianzadora_nombre'],
                        'mes': mes_nombre,
                        'venta_mensual': float(v['venta_mensual'] or 0)
                    })

            afianzadoras_legacy = AfianzadoraLegacy.objects.filter(
                afianzadora=1
            ).values('id_afi', 'nombre_afi', 'meta')

            metas_dict = {
                afi['id_afi']: float(afi['meta'] or 0) 
                for afi in afianzadoras_legacy
            }

            respuesta_anual = []
            for v in ventas_anuales:
                afianzadora_id = v['afianzadora_id']
                meta_anual = metas_dict.get(afianzadora_id, 0.0)
                
                respuesta_anual.append({
                    'id_afi': afianzadora_id,
                    'nombre_afi': v['afianzadora_nombre'],
                    'venta_anual': float(v['venta_anual'] or 0),
                    'meta_anual': meta_anual,
                    'meta_mensual': round(meta_anual / 12, 2) if meta_anual else 0.0
                })
                
            return Response({
                'resumen_anual': respuesta_anual,
                'desglose_mensual': ventas_mensuales
            })
            
        # AQUÍ ESTÁ LA MAGIA QUE ATRAPARÁ EL ERROR
        except Exception as e:
            import traceback
            return Response({
                "¡ALERTA_DE_ERROR!": str(e),
                "TIPO_DE_ERROR": str(type(e)),
                "TRAZA_COMPLETA": traceback.format_exc()
            })
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas generales de trámites"""
        total = self.queryset.count()
        por_estatus = self.queryset.values('estatus').annotate(
            count=Count('id')
        ).order_by('estatus')
        
        por_estatus_pago = self.queryset.values('estatus_pago').annotate(
            count=Count('id')
        ).order_by('estatus_pago')
        
        total_prima = self.queryset.aggregate(
            total=Sum('prima_total')
        )['total'] or 0
        
        return Response({
            'total_tramites': total,
            'por_estatus': list(por_estatus),
            'por_estatus_pago': list(por_estatus_pago),
            'total_prima': float(total_prima)
        })
    
    @action(detail=False, methods=['get'])
    def por_estatus(self, request):
        """Filtrar trámites por estatus"""
        estatus = request.query_params.get('estatus')
        if not estatus:
            return Response(
                {'error': 'Se requiere el parámetro estatus'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tramites = self.queryset.filter(estatus=estatus)
        serializer = TramiteListSerializer(tramites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Obtener trámites con estatus pendientes"""
        tramites = self.queryset.filter(
            estatus__startswith='PENDIENTE/'
        )
        serializer = TramiteListSerializer(tramites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def en_proceso(self, request):
        """Obtener trámites en proceso"""
        tramites = self.queryset.filter(
            estatus__startswith='EN PROCESO/'
        )
        serializer = TramiteListSerializer(tramites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def terminados(self, request):
        """Obtener trámites terminados"""
        tramites = self.queryset.filter(
            estatus__startswith='TERMINADO'
        )
        serializer = TramiteListSerializer(tramites, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cambiar_estatus(self, request, pk=None):
        """Cambiar el estatus de un trámite"""
        tramite = self.get_object()
        nuevo_estatus = request.data.get('estatus')
        
        if not nuevo_estatus:
            return Response(
                {'error': 'Se requiere el campo estatus'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el estatus sea válido
        estatus_validos = dict(Tramite.ESTATUS_CHOICES).keys()
        if nuevo_estatus not in estatus_validos:
            return Response(
                {'error': f'Estatus inválido. Valores permitidos: {", ".join(estatus_validos)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tramite.estatus = nuevo_estatus
        # Si el estatus es TERMINADO, agregar fecha_termino automáticamente
        if nuevo_estatus.startswith('TERMINADO'):
            tramite.fecha_termino = timezone.now().date()
        tramite.save()
        
        serializer = self.get_serializer(tramite)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def buscar_por_cliente(self, request):
        """Buscar trámites por cliente_id"""
        cliente_id = request.query_params.get('cliente_id')
        if not cliente_id:
            return Response(
                {'error': 'Se requiere el parámetro cliente_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tramites = self.queryset.filter(cliente_id=cliente_id)
        serializer = TramiteListSerializer(tramites, many=True)
        return Response(serializer.data)


class TramiteTareaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar TramiteTareas"""
    queryset = TramiteTarea.objects.select_related('tramite', 'tarea').all()
    serializer_class = TramiteTareaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tramite', 'tarea', 'completado']
    
    @action(detail=True, methods=['post'])
    def marcar_completada(self, request, pk=None):
        """Marcar una tarea como completada"""
        tarea = self.get_object()
        tarea.completado = True
        tarea.fecha_completado = timezone.now().date()
        tarea.save()
        
        serializer = self.get_serializer(tarea)
        return Response(serializer.data)


class CompromisoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Compromisos
    
    Endpoints adicionales:
    - /compromisos/vencidos/ - Compromisos vencidos
    - /compromisos/pendientes/ - Compromisos pendientes
    - /compromisos/{id}/marcar_completado/ - Marcar como completado
    """
    queryset = Compromiso.objects.select_related('tramite').all()
    serializer_class = CompromisoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tramite', 'completado', 'categoria', 'tramite__cliente_id']
    search_fields = ['nombre_persona', 'observaciones', 'tramite__cliente_nombre']
    ordering_fields = ['fecha_vencimiento', 'fecha_creacion']
    ordering = ['fecha_vencimiento', '-completado']
    
    @action(detail=False, methods=['get'])
    def por_cliente(self, request):
        """Obtener compromisos de un cliente específico"""
        cliente_id = request.query_params.get('cliente_id')
        if not cliente_id:
            return Response(
                {'error': 'Se requiere el parámetro cliente_id'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
        compromisos = self.queryset.filter(tramite__cliente_id=cliente_id)
        serializer = self.get_serializer(compromisos, many=True)
        return Response({
            'cliente_id': cliente_id,
            'count': compromisos.count(),
            'data': serializer.data
        })

    @action(detail=False, methods=['get'])
    def vencidos(self, request):
        """Obtener compromisos vencidos y no completados"""
        hoy = timezone.now().date()
        compromisos = self.queryset.filter(
            completado=False,
            fecha_vencimiento__lt=hoy
        )
        serializer = self.get_serializer(compromisos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Obtener compromisos pendientes (no completados)"""
        compromisos = self.queryset.filter(completado=False)
        serializer = self.get_serializer(compromisos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def marcar_completado(self, request, pk=None):
        """Marcar un compromiso como completado"""
        compromiso = self.get_object()
        compromiso.completado = True
        
        # 1. Obtenemos la fecha que viene del frontend
        fecha_enviada = request.data.get('fecha_completado')
        
        # 2. Si nos enviaron una fecha, la usamos. Si no, usamos la de hoy.
        if fecha_enviada:
            compromiso.fecha_completado = fecha_enviada
        else:
            compromiso.fecha_completado = timezone.now().date()
            
        compromiso.completado_por = request.data.get('completado_por', '')
        
        # Guardamos en la base de datos
        compromiso.save()
        
        serializer = self.get_serializer(compromiso)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_tramite(self, request):
        """Obtener compromisos de un trámite específico"""
        tramite_id = request.query_params.get('tramite_id')
        if not tramite_id:
            return Response(
                {'error': 'Se requiere el parámetro tramite_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        compromisos = self.queryset.filter(tramite_id=tramite_id)
        serializer = self.get_serializer(compromisos, many=True)
        return Response(serializer.data)


class ObservacionTramiteViewSet(StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet para gestionar ObservacionTramite"""
    queryset = ObservacionTramite.objects.select_related('tramite').all()
    serializer_class = ObservacionTramiteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tramite']
    search_fields = ['observacion', 'nombre']
    ordering_fields = ['fecha']
    ordering = ['-fecha']
    
    @action(detail=False, methods=['get'])
    def por_tramite(self, request):
        """Obtener observaciones de un trámite específico"""
        tramite_id = request.query_params.get('tramite_id')
        if not tramite_id:
            return Response(
                {'error': 'Se requiere el parámetro tramite_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        observaciones = self.queryset.filter(tramite_id=tramite_id)
        serializer = self.get_serializer(observaciones, many=True)
        return Response(serializer.data)


# ViewSet adicional para consultar clientes de la BD legacy
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class ClienteLegacyViewSet(viewsets.ViewSet):
    """
    ViewSet para consultar clientes de la base de datos legacy (PHP)
    
    Endpoints:
    - GET /api/clientes-legacy/ - Lista con paginación
    - GET /api/clientes-legacy/{id}/ - Detalle de un cliente
    - GET /api/clientes-legacy/buscar/?q=termino - Buscar clientes
    - GET /api/clientes-legacy/estadisticas/ - Estadísticas
    
    SOLO LECTURA
    """
    
    def list(self, request):
        """
        GET /api/clientes-legacy/
        
        Lista clientes con paginación adecuada
        
        Query params:
        - limit: Resultados por página (default: 100, max: 500)
        - offset: Registros a saltar (default: 0)
        
        Ejemplo:
            GET /api/clientes-legacy/?limit=50&offset=100
            
        Respuesta:
            {
                "count": 1523,              // Total de clientes en BD
                "next": "url...",           // URL siguiente página
                "previous": "url...",       // URL página anterior
                "page_size": 50,            // Tamaño de esta página
                "current_offset": 100,      // Offset actual
                "results": [...]            // Clientes de esta página
            }
        """
        try:
            # Obtener parámetros
            limit = int(request.query_params.get('limit', 100))
            offset = int(request.query_params.get('offset', 0))
            
            # Validar límites
            if limit > 500:
                limit = 500
            if limit < 1:
                limit = 1
            if offset < 0:
                offset = 0
                
            # Obtener clientes de esta página
            clientes = get_all_clientes(limit=limit, offset=offset)
            
            # Obtener el TOTAL REAL de registros en la BD
            total_count = count_clientes_activos()
            
            # Construir URLs de paginación
            base_url = request.build_absolute_uri(request.path)
            next_url = None
            previous_url = None
            
            # URL de siguiente página (si hay más resultados)
            if offset + limit < total_count:
                next_offset = offset + limit
                next_url = f"{base_url}?limit={limit}&offset={next_offset}"
            
            # URL de página anterior (si no es la primera)
            if offset > 0:
                previous_offset = max(0, offset - limit)
                previous_url = f"{base_url}?limit={limit}&offset={previous_offset}"
            
            # Calcular número de página actual
            current_page = (offset // limit) + 1
            total_pages = (total_count + limit - 1) // limit  # Redondeo hacia arriba
            
            return Response({
                'count': total_count,           # Total en BD
                'next': next_url,               # URL siguiente
                'previous': previous_url,       # URL anterior
                'page_size': limit,             # Tamaño página
                'current_offset': offset,       # Offset actual
                'current_page': current_page,   # Página actual
                'total_pages': total_pages,     # Total de páginas
                'results': clientes             # Resultados
            })
            
        except ValueError:
            return Response(
                {'error': 'Los parámetros limit y offset deben ser números enteros'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error al consultar clientes: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, pk=None):
        """
        GET /api/clientes-legacy/{id}/
        
        Obtiene un cliente específico
        """
        try:
            cliente_id = int(pk)
            cliente = get_cliente_by_id(cliente_id)
            
            if not cliente:
                return Response(
                    {'error': 'Cliente no encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(cliente)
            
        except ValueError:
            return Response(
                {'error': 'ID debe ser un número entero'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error al consultar cliente: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def buscar(self, request):
        """
        GET /api/clientes-legacy/buscar/?q=termino
        
        Busca clientes por nombre, RFC, empresa o correo
        """
        try:
            search_term = request.query_params.get('q', '')
            
            if not search_term:
                return Response(
                    {'error': 'Se requiere el parámetro "q" para buscar'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if len(search_term) < 2:
                return Response(
                    {'error': 'El término de búsqueda debe tener al menos 2 caracteres'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            limit = int(request.query_params.get('limit', 50))
            if limit > 200:
                limit = 200
            
            clientes = search_clientes(search_term, limit=limit)
            
            return Response({
                'search_term': search_term,
                'count': len(clientes),
                'results': clientes
            })
            
        except ValueError:
            return Response(
                {'error': 'El parámetro limit debe ser un número entero'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error en búsqueda: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        GET /api/clientes-legacy/estadisticas/
        
        Estadísticas de clientes
        """
        try:
            total = count_clientes_activos()
            
            return Response({
                'total_clientes_activos': total,
                'mensaje': 'Total de clientes activos en la BD legacy'
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error al obtener estadísticas: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        """
        GET /api/clientes-legacy/por_tipo/?tipo=F
        
        Filtra por tipo de persona (F=Física, M=Moral)
        """
        try:
            tipo = request.query_params.get('tipo', '')
            
            if not tipo:
                return Response(
                    {'error': 'Se requiere el parámetro "tipo"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            limit = int(request.query_params.get('limit', 100))
            if limit > 500:
                limit = 500
            
            clientes = get_clientes_por_tipo(tipo, limit=limit)
            
            return Response({
                'tipo_persona': tipo,
                'count': len(clientes),
                'results': clientes
            })
            
        except ValueError:
            return Response(
                {'error': 'El parámetro limit debe ser un número entero'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error al filtrar clientes: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def con_seguimiento(self, request):
        """
        GET /api/clientes-legacy/con_seguimiento/
        
        Clientes con seguimiento activo
        """
        try:
            clientes = get_clientes_con_seguimiento()
            
            return Response({
                'count': len(clientes),
                'results': clientes
            })
            
        except Exception as e:
            return Response(
                {'error': f'Error al obtener clientes con seguimiento: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def por_grupo(self, request):
        """
        GET /api/clientes-legacy/por_grupo/?grupo=1
        
        Filtra por grupo
        """
        try:
            grupo = request.query_params.get('grupo', '')
            
            if not grupo:
                return Response(
                    {'error': 'Se requiere el parámetro "grupo"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            grupo_id = int(grupo)
            limit = int(request.query_params.get('limit', 100))
            
            if limit > 500:
                limit = 500
            
            clientes = get_clientes_por_grupo(grupo_id, limit=limit)
            
            return Response({
                'grupo': grupo_id,
                'count': len(clientes),
                'results': clientes
            })
            
        except ValueError:
            return Response(
                {'error': 'Los parámetros grupo y limit deben ser números enteros'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error al filtrar clientes por grupo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def direccion(self, request, pk=None):
        """
        GET /api/clientes-legacy/{id}/direccion/
        
        Dirección completa formateada
        """
        try:
            cliente_id = int(pk)
            direccion = get_cliente_direccion_completa(cliente_id)
            
            if not direccion:
                return Response(
                    {'error': 'Cliente no encontrado o sin dirección'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response({
                'cliente_id': cliente_id,
                'direccion_completa': direccion
            })
            
        except ValueError:
            return Response(
                {'error': 'ID debe ser un número entero'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error al obtener dirección: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RamoFianzaViewSet(viewsets.ModelViewSet):
    queryset = RamoFianza.objects.all()
    serializer_class = RamoFianzaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering = ['nombre']

    @action(detail=True, methods=['get'])
    def tipos(self, request, pk=None):
        ramo = self.get_object()
        tipos = TipoFianza.objects.filter(ramo=ramo).order_by('nombre')
        serializer = TipoFianzaSerializer(tipos, many=True)
        return Response({
            'ramo_id': ramo.id,
            'ramo': ramo.nombre,
            'count': tipos.count(),
            'data': serializer.data
        })


class TipoFianzaViewSet(viewsets.ModelViewSet):
    queryset = TipoFianza.objects.select_related('ramo').all()
    serializer_class = TipoFianzaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ramo']
    search_fields = ['nombre', 'ramo__nombre']
    ordering = ['ramo__nombre', 'nombre']
