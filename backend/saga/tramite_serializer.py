"""
Serializer mejorado para mostrar trámites con información completa
de movimientos, estatus y todas sus relaciones
"""

from rest_framework import serializers
from .models import (
    Estatus, Movimiento, Tarea, Tramite, TramiteTarea, 
    Compromiso, ObservacionTramite, TipoFianza
)


# ============================================================================
# SERIALIZERS DETALLADOS PARA RELACIONES
# ============================================================================
class TipoFianzaDetalleSerializer(serializers.ModelSerializer):
    ramo_nombre = serializers.CharField(source='ramo.nombre', read_only=True)
    
    class Meta:
        model = TipoFianza
        fields = ['id', 'nombre', 'ramo', 'ramo_nombre']
class MovimientoDetalleSerializer(serializers.ModelSerializer):
    """Serializer detallado para Movimiento"""
    total_tramites = serializers.SerializerMethodField()
    
    class Meta:
        model = Movimiento
        fields = ['id', 'nombre', 'total_tramites']
    
    def get_total_tramites(self, obj):
        """Cuenta cuántos trámites tiene este movimiento"""
        return obj.tramites.count()


class EstatusDetalleSerializer(serializers.ModelSerializer):
    """Serializer detallado para Estatus"""
    total_tramites = serializers.SerializerMethodField()
    
    class Meta:
        model = Estatus
        fields = ['id', 'nombre', 'total_tramites']
    
    def get_total_tramites(self, obj):
        """Cuenta cuántos trámites tienen este estatus"""
        return obj.tramites.count()


class TareaResumenSerializer(serializers.ModelSerializer):
    """Serializer resumido para Tarea"""
    movimiento_nombre = serializers.CharField(source='movimiento.nombre', read_only=True)
    
    class Meta:
        model = Tarea
        fields = ['id', 'nombre', 'bloqueado', 'movimiento', 'movimiento_nombre']


class TramiteTareaDetalleSerializer(serializers.ModelSerializer):
    """Serializer detallado para TramiteTarea"""
    tarea_info = TareaResumenSerializer(source='tarea', read_only=True)
    
    class Meta:
        model = TramiteTarea
        fields = [
            'id', 'tarea', 'tarea_info', 'completado', 
            'fecha_completado', 'observaciones'
        ]


class CompromisoDetalleSerializer(serializers.ModelSerializer):
    """Serializer detallado para Compromiso"""
    esta_vencido = serializers.BooleanField(read_only=True)
    dias_para_vencer = serializers.SerializerMethodField()
    
    class Meta:
        model = Compromiso
        fields = [
            'id', 'nombre_persona', 'categoria', 'observaciones',
            'fecha_vencimiento', 'fecha_completado', 'completado',
            'creado_por', 'completado_por', 'esta_vencido', 'dias_para_vencer',
            'fecha_creacion', 'fecha_actualizacion'
        ]
    
    def get_dias_para_vencer(self, obj):
        """Calcula los días para vencer o días vencidos"""
        from django.utils import timezone
        if obj.completado:
            return None
        
        hoy = timezone.now().date()
        diferencia = (obj.fecha_vencimiento - hoy).days
        return diferencia


class ObservacionTramiteDetalleSerializer(serializers.ModelSerializer):
    """Serializer detallado para ObservacionTramite"""
    
    class Meta:
        model = ObservacionTramite
        fields = ['id', 'observacion', 'fecha', 'nombre']


# ============================================================================
# SERIALIZER PRINCIPAL - TRAMITE COMPLETO
# ============================================================================

class TramiteCompletoSerializer(serializers.ModelSerializer):
    """
    Serializer COMPLETO para trámites que incluye:
    - Información del movimiento (completa)
    - Información del estatus (completo)
    - Todas las tareas asociadas
    - Todos los compromisos
    - Todas las observaciones
    """
    
    # Información de Movimiento (completa)
    movimiento_info = MovimientoDetalleSerializer(source='movimiento', read_only=True)
    
    # Información de Estatus (completa)
    estatus_info = EstatusDetalleSerializer(source='estatus', read_only=True)
    
    # Relaciones anidadas detalladas
    tareas = TramiteTareaDetalleSerializer(source='tramite_tareas', many=True, read_only=True)
    compromisos_detalle = CompromisoDetalleSerializer(source='compromisos', many=True, read_only=True)
    observaciones_detalle = ObservacionTramiteDetalleSerializer(source='observaciones', many=True, read_only=True)
    
    # Estadísticas calculadas
    total_tareas = serializers.SerializerMethodField()
    tareas_completadas = serializers.SerializerMethodField()
    porcentaje_avance = serializers.SerializerMethodField()
    total_compromisos = serializers.SerializerMethodField()
    compromisos_pendientes = serializers.SerializerMethodField()
    compromisos_vencidos = serializers.SerializerMethodField()
    tipo_fianza_info = TipoFianzaDetalleSerializer(source='tipo_fianza', read_only=True)
    tipo_fianza_id = serializers.IntegerField(source='tipo_fianza.id', read_only=True)
    # Prima total calculada
    prima_total_calculada = serializers.DecimalField(
        source='prima_total', 
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    
    class Meta:
        model = Tramite
        fields = [
            # IDs y Referencias
            'id', 'folio', 'fecha',
            
            # Cliente
            'cliente_id', 'cliente_nombre',
            
            # Agente
            'agente_id', 'agente_nombre',
            
            # Beneficiario
            'beneficiario_id', 'beneficiario_nombre',
            
            # Afianzadora
            'afianzadora_id', 'afianzadora_nombre',
            
            # Movimiento (IDs + Info completa)
            'movimiento', 'movimiento_info',
            
            # Estatus (IDs + Info completa)
            'estatus', 'estatus_info',
            
            # Proceso
            'tipo_proceso', 'programa_proveedores', 'numero_fianza',
            
            # Financiero
            'prima_inicial', 'prima_futura', 'prima_total', 
            'prima_total_calculada', 'importe_total',
            
            # Fechas de proceso
            'fecha_termino', 'fecha_emision',
            
            # Pago
            'fecha_pago', 'estatus_pago', 'observaciones_pago',
            
            # Timestamps
            'fecha_creacion', 'fecha_actualizacion',
            
            # Relaciones completas
            'tareas',
            'compromisos_detalle',
            'observaciones_detalle',
            'relativo_a',
            'tipo_fianza', 
            
            # Usamos estos para mostrar info en el JSON de respuesta (GET)
            'tipo_fianza_id', 
            'tipo_fianza_info',
            # Estadísticas
            'total_tareas',
            'tareas_completadas',
            'porcentaje_avance',
            'total_compromisos',
            'compromisos_pendientes',
            'compromisos_vencidos',
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def get_total_tareas(self, obj):
        """Total de tareas asociadas al trámite"""
        return obj.tramite_tareas.count()
    
    def get_tareas_completadas(self, obj):
        """Tareas completadas del trámite"""
        return obj.tramite_tareas.filter(completado=True).count()
    
    def get_porcentaje_avance(self, obj):
        """Porcentaje de avance basado en tareas completadas"""
        total = obj.tramite_tareas.count()
        if total == 0:
            return 0
        
        completadas = obj.tramite_tareas.filter(completado=True).count()
        return round((completadas / total) * 100, 2)
    
    def get_total_compromisos(self, obj):
        """Total de compromisos del trámite"""
        return obj.compromisos.count()
    
    def get_compromisos_pendientes(self, obj):
        """Compromisos pendientes (no completados)"""
        return obj.compromisos.filter(completado=False).count()
    
    def get_compromisos_vencidos(self, obj):
        """Compromisos vencidos y no completados"""
        from django.utils import timezone
        hoy = timezone.now().date()
        return obj.compromisos.filter(
            completado=False,
            fecha_vencimiento__lt=hoy
        ).count()


# ============================================================================
# SERIALIZER PARA LISTADO (Vista de tabla) - OPTIMIZADO
# ============================================================================

class TramiteTablaSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para mostrar en tabla/grid
    USA ANOTACIONES del queryset para evitar N+1 queries
    """
    
    movimiento_nombre = serializers.CharField(source='movimiento.nombre', read_only=True)
    estatus_nombre = serializers.CharField(source='estatus.nombre', read_only=True)
    ultima_observacion = serializers.SerializerMethodField()
    # Campos que usan las anotaciones del queryset (NO hacen queries adicionales)
    tareas_completadas = serializers.IntegerField(source='tareas_completadas_count', read_only=True)
    total_tareas = serializers.IntegerField(source='total_tareas_count', read_only=True)
    tiene_compromisos_vencidos = serializers.BooleanField(source='tiene_compromisos_vencidos_flag', read_only=True)
    compromisos = CompromisoDetalleSerializer(many=True, read_only=True)
    # Solo este necesita cálculo, pero usa datos ya cargados
    avance = serializers.SerializerMethodField()
    
    class Meta:
        model = Tramite
        fields = [
            'id', 'folio', 'fecha',
            'cliente_id', 'cliente_nombre',
            'movimiento', 'movimiento_nombre',
            'afianzadora_id', 'afianzadora_nombre',
            'estatus', 'estatus_nombre', 'beneficiario_nombre',
            'relativo_a', 'agente_nombre',
            'tipo_proceso', 'numero_fianza',
            'prima_total', 'importe_total',
            'estatus_pago', 'fecha_pago','fecha_emision',
            'ultima_observacion',
            'tareas_completadas', 'total_tareas', 'avance',
            'tiene_compromisos_vencidos',
            'fecha_creacion',
            'creado_por',
            'compromisos',
        ]
    def get_ultima_observacion(self, obj):
        """Retorna la última observación (solo texto resumido)"""
        ultima = obj.observaciones.first()  # Ya están ordenadas por -fecha
        if ultima:
            return {
                'fecha': ultima.fecha,
                'nombre': ultima.nombre,
                'observacion': ultima.observacion
            }
        return None   

    def get_avance(self, obj):
        """Calcula avance usando las anotaciones (sin queries adicionales)"""
        total = getattr(obj, 'total_tareas_count', 0) or 0
        if total == 0:
            return 0
        completadas = getattr(obj, 'tareas_completadas_count', 0) or 0
        return round((completadas / total) * 100, 2)


# ============================================================================
# SERIALIZER PARA DASHBOARD/RESUMEN
# ============================================================================

class TramiteResumenSerializer(serializers.ModelSerializer):
    """
    Serializer super resumido para dashboards y listados rápidos
    """
    
    movimiento_nombre = serializers.CharField(source='movimiento.nombre', read_only=True)
    estatus_nombre = serializers.CharField(source='estatus.nombre', read_only=True)
    
    class Meta:
        model = Tramite
        fields = [
            'id', 'folio', 'fecha',
            'cliente_nombre',
            'movimiento_nombre',
            'estatus_nombre',
            'prima_total',
            'estatus_pago',
        ]