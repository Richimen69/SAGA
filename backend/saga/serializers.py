from rest_framework import serializers
from .models import (
    Estatus, Movimiento, Tarea, Tramite, TramiteTarea, 
    Compromiso, ObservacionTramite,
    RamoFianza, TipoFianza,

)
from .legacy_helpers import get_cliente_by_id


class MovimientoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Movimiento"""
    
    class Meta:
        model = Movimiento
        fields = '__all__'
        
class EstatusSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Estatus"""
    
    class Meta:
        model = Estatus
        fields = '__all__'        


class TareaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Tarea"""
    
    movimiento_nombre = serializers.CharField(source='movimiento.nombre', read_only=True)
    
    class Meta:
        model = Tarea
        fields = ['id', 'movimiento', 'movimiento_nombre', 'nombre', 'bloqueado']


class TramiteTareaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo TramiteTarea"""
    
    tarea_nombre = serializers.CharField(source='tarea.nombre', read_only=True)
    tramite_folio = serializers.CharField(source='tramite.folio', read_only=True)
    
    class Meta:
        model = TramiteTarea
        fields = [
            'id', 'tramite', 'tramite_folio', 'tarea', 'tarea_nombre',
            'completado', 'fecha_completado', 'observaciones'
        ]


class CompromisoSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Compromiso"""
    
    tramite_folio = serializers.CharField(source='tramite.folio', read_only=True)
    esta_vencido = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Compromiso
        fields = [
            'id', 'tramite', 'tramite_folio', 'nombre_persona', 'categoria',
            'observaciones', 'fecha_vencimiento', 'fecha_completado', 'completado',
            'creado_por', 'completado_por', 'fecha_creacion', 'fecha_actualizacion',
            'esta_vencido'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion', 'esta_vencido']


class ObservacionTramiteSerializer(serializers.ModelSerializer):
    tramite_folio = serializers.CharField(source='tramite.folio', read_only=True)
    tramite = serializers.PrimaryKeyRelatedField(queryset=Tramite.objects.all())
    
    class Meta:
        model = ObservacionTramite
        fields = ['id', 'tramite', 'tramite_folio', 'observacion', 'fecha', 'nombre']

class TramiteSerializer(serializers.ModelSerializer):
    """Serializer completo para el modelo Tramite"""
    
    # Campos de solo lectura
    movimiento_nombre_display = serializers.CharField(source='movimiento.nombre', read_only=True)
    prima_total_calculada = serializers.DecimalField(
        source='prima_total', 
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    
    # Relaciones anidadas (opcional, puedes comentarlas si no las necesitas)
    compromisos = CompromisoSerializer(many=True, read_only=True)
    observaciones = ObservacionTramiteSerializer(many=True, read_only=True)
    tramite_tareas = TramiteTareaSerializer(many=True, read_only=True)
    
    # Campo para obtener datos del cliente desde la BD legacy
    cliente_data = serializers.SerializerMethodField()
    
    def get_cliente_data(self, obj):
        """
        Obtiene los datos del cliente desde la BD legacy
        """
        if not obj.cliente_id:
            return None
        
        try:
            cliente_data = get_cliente_by_id(obj.cliente_id)
            return cliente_data
        except Exception:
            # Si hay algún error al obtener datos, retornar None
            return None
    
    class Meta:
        model = Tramite
        fields = [
            'id', 'folio', 'fecha', 
            # Cliente
            'cliente_id', 'cliente_nombre', 'cliente_data',
            # Agente
            'agente_id', 'agente_nombre',
            # Beneficiario
            'beneficiario_id', 'beneficiario_nombre',
            # Afianzadora
            'afianzadora_id', 'afianzadora_nombre',
            # Movimiento
            'movimiento', 'movimiento_nombre_display',
            # Proceso
            'tipo_proceso', 'programa_proveedores', 'numero_fianza',
            # Financiero
            'prima_inicial', 'prima_futura', 'prima_total', 'prima_total_calculada', 'importe_total',
            # Estatus
            'estatus', 'fecha_termino', 'fecha_emision',
            # Pago
            'fecha_pago', 'estatus_pago', 'observaciones_pago',
            # Timestamps
            'fecha_creacion', 'fecha_actualizacion',
            # Relaciones anidadas
            'compromisos', 'observaciones', 'tramite_tareas'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion', 'prima_total_calculada']
    
    
    
    def validate(self, data):
        """
        Validaciones adicionales a nivel de objeto
        """
        # Validar que prima_inicial y prima_futura sean positivas
        if data.get('prima_inicial', 0) < 0:
            raise serializers.ValidationError({
                'prima_inicial': 'La prima inicial no puede ser negativa.'
            })
        
        if data.get('prima_futura', 0) < 0:
            raise serializers.ValidationError({
                'prima_futura': 'La prima futura no puede ser negativa.'
            })
        
        return data


class TramiteListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de trámites (sin relaciones anidadas)
    """
    
    movimiento_nombre_display = serializers.CharField(source='movimiento.nombre', read_only=True)
    
    class Meta:
        model = Tramite
        fields = [
            'id', 'folio', 'fecha', 'cliente_id', 'cliente_nombre',
            'movimiento', 'movimiento_nombre_display', 'tipo_proceso',
            'numero_fianza', 'prima_total', 'importe_total', 'estatus',
            'estatus_pago', 'fecha_creacion'
        ]
        read_only_fields = ['fecha_creacion']


class TramiteCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y actualizar trámites (sin relaciones anidadas)
    
    IMPORTANTE: 
    - El campo 'folio' NO debe enviarse desde el frontend (se genera automáticamente)
    - El campo 'creado_por' ES OBLIGATORIO (se usa para generar el folio)
    """
    
    class Meta:
        model = Tramite
        fields = [
            'fecha', 'creado_por',
            # Cliente
            'cliente_id', 'cliente_nombre',
            # Agente
            'agente_id', 'agente_nombre',
            # Beneficiario
            'beneficiario_id', 'beneficiario_nombre',
            # Afianzadora
            'afianzadora_id', 'afianzadora_nombre',
            # Movimiento
            'movimiento',
            # Estatus
            'estatus',
            # Proceso
            'tipo_proceso', 'programa_proveedores', 'numero_fianza',
            # Financiero
            'prima_inicial', 'prima_futura', 'importe_total',
            # Fechas
            'fecha_termino', 'fecha_pago', 'fecha_emision',
            # Pago
            'estatus_pago', 'observaciones_pago',
            'relativo_a',
            'tipo_fianza',
        ]
        read_only_fields = ['folio']  # El folio se genera automáticamente
    
    def validate(self, data):
        """
        Validaciones adicionales
        """
        # Validar que creado_por esté presente
        if not data.get('creado_por'):
            raise serializers.ValidationError({
                'creado_por': 'El campo creado_por es obligatorio para generar el folio.'
            })
        
        return data
    
    def create(self, validated_data):
        """
        Crear un nuevo trámite
        El folio se generará automáticamente en el método save() del modelo
        """
        tramite = Tramite.objects.create(**validated_data)
        return tramite

class RamoFianzaSerializer(serializers.ModelSerializer):
        class Meta:
            model = RamoFianza
            fields = ['id', 'nombre']

class TipoFianzaSerializer(serializers.ModelSerializer):
        ramo_nombre = serializers.CharField(source='ramo.nombre', read_only=True)

        class Meta:
            model = TipoFianza
            fields = ['id', 'ramo', 'ramo_nombre', 'nombre']