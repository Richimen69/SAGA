from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Estatus, Movimiento, Tarea, Tramite, TramiteTarea,
    Compromiso, ObservacionTramite
)


@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    """Configuración del admin para Movimiento"""
    
    list_display = ['id', 'nombre']
    search_fields = ['nombre']
    ordering = ['nombre']
    
@admin.register(Estatus)
class EstatusAdmin(admin.ModelAdmin):
    """Configuración del admin para estatus"""
    
    list_display = ['id', 'nombre']
    search_fields = ['nombre']
    ordering = ['nombre']


class TareaInline(admin.TabularInline):
    """Inline para mostrar tareas dentro de un movimiento"""
    model = Tarea
    extra = 1
    fields = ['nombre', 'bloqueado']


@admin.register(Tarea)
class TareaAdmin(admin.ModelAdmin):
    """Configuración del admin para Tarea"""
    
    list_display = ['id', 'nombre', 'movimiento', 'bloqueado']
    list_filter = ['bloqueado', 'movimiento']
    search_fields = ['nombre', 'movimiento__nombre']
    ordering = ['movimiento', 'nombre']


class TramiteTareaInline(admin.TabularInline):
    """Inline para mostrar tareas del trámite"""
    model = TramiteTarea
    extra = 1
    fields = ['tarea', 'completado', 'fecha_completado', 'observaciones']
    autocomplete_fields = ['tarea']


class CompromisoInline(admin.TabularInline):
    """Inline para mostrar compromisos del trámite"""
    model = Compromiso
    extra = 1
    fields = ['nombre_persona', 'categoria', 'fecha_vencimiento', 'completado', 'observaciones']


class ObservacionTramiteInline(admin.TabularInline):
    """Inline para mostrar observaciones del trámite"""
    model = ObservacionTramite
    extra = 1
    fields = ['fecha', 'nombre', 'observacion']


@admin.register(Tramite)
class TramiteAdmin(admin.ModelAdmin):
    """Configuración del admin para Tramite"""
    
    list_display = [
        'folio', 'fecha', 'cliente_nombre', 'get_movimiento_nombre',
        'tipo_proceso', 'numero_fianza', 'estatus_badge', 'estatus_pago_badge',
        'prima_total', 'fecha_creacion'
    ]
    
    list_filter = [
        'estatus', 'estatus_pago', 'tipo_proceso', 
        'programa_proveedores', 'fecha', 'fecha_creacion'
    ]
    
    search_fields = [
        'folio', 'cliente_nombre', 'numero_fianza',
        'beneficiario_nombre', 'afianzadora_nombre'
    ]
    
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion', 'prima_total']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('folio', 'fecha', 'tipo_proceso', 'programa_proveedores')
        }),
        ('Cliente', {
            'fields': ('cliente_id', 'cliente_nombre')
        }),
        ('Otros Participantes', {
            'fields': (
                ('agente_id', 'agente_nombre'),
                ('beneficiario_id', 'beneficiario_nombre'),
                ('afianzadora_id', 'afianzadora_nombre'),
            ),
            'classes': ('collapse',)
        }),
        ('Movimiento', {
            'fields': ('movimiento',)
        }),
        ('Información de Fianza', {
            'fields': ('numero_fianza', 'prima_inicial', 'prima_futura', 'prima_total', 'importe_total')
        }),
        ('Estatus', {
            'fields': ('estatus', 'fecha_termino')
        }),
        ('Información de Pago', {
            'fields': ('estatus_pago', 'fecha_pago', 'observaciones_pago')
        }),
        ('Timestamps', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [TramiteTareaInline, CompromisoInline, ObservacionTramiteInline]
    
    date_hierarchy = 'fecha'
    
    ordering = ['-fecha_creacion']
    
    def get_movimiento_nombre(self, obj):
        """Obtiene el nombre del movimiento"""
        return obj.movimiento.nombre if obj.movimiento else '-'
    get_movimiento_nombre.short_description = 'Movimiento'
    get_movimiento_nombre.admin_order_field = 'movimiento__nombre'
    
    def estatus_badge(self, obj):
        """Muestra el estatus con color"""
        colors = {
            # En Revisión
            'EN REVISIÓN DE DOCUMENTOS': '#17a2b8',
            'EN REVISIÓN DE PREVIAS': '#17a2b8',
            # En Proceso
            'EN PROCESO/C.N.S.': '#ffc107',
            'EN PROCESO/CANCELACIÓN': '#fd7e14',
            'EN PROCESO/C.T.T.': '#ffc107',
            'EN PROCESO/ACT EF': '#ffc107',
            'EN PROCESO/ACT CLG': '#ffc107',
            'EN PROCESO/OTROS': '#ffc107',
            # No Procede
            'NO PROCEDE': '#dc3545',
            # Pendientes
            'PENDIENTE/C.N.S.': '#6c757d',
            'PENDIENTE/CANCELACIÓN': '#6c757d',
            'PENDIENTE/C.T.T.': '#6c757d',
            'PENDIENTE/ACT EF': '#6c757d',
            'PENDIENTE/ACT CLG': '#6c757d',
            'PENDIENTE/OTROS': '#6c757d',
            # Terminados
            'TERMINADO': '#28a745',
            'TERMINADO/COMPROMISO': '#20c997',
            'TERMINADO/PENDIENTE': '#17a2b8',
        }
        color = colors.get(obj.estatus, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px; white-space: nowrap;">{}</span>',
            color,
            obj.estatus
        )
    estatus_badge.short_description = 'Estatus'
    
    def estatus_pago_badge(self, obj):
        """Muestra el estatus de pago con color"""
        colors = {
            'SE MANDÓ RECIBO': '#28a745',
            'NO PAGADA': '#dc3545',
            'PENDIENTE': '#ffc107',
        }
        color = colors.get(obj.estatus_pago, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px; white-space: nowrap;">{}</span>',
            color,
            obj.estatus_pago
        )
    estatus_pago_badge.short_description = 'Pago'


@admin.register(TramiteTarea)
class TramiteTareaAdmin(admin.ModelAdmin):
    """Configuración del admin para TramiteTarea"""
    
    list_display = ['id', 'tramite', 'tarea', 'completado', 'fecha_completado']
    list_filter = ['completado', 'tramite__estatus']
    search_fields = ['tramite__folio', 'tarea__nombre']
    autocomplete_fields = ['tramite', 'tarea']
    ordering = ['tramite', 'tarea']


@admin.register(Compromiso)
class CompromisoAdmin(admin.ModelAdmin):
    """Configuración del admin para Compromiso"""
    
    list_display = [
        'id', 'tramite', 'nombre_persona', 'categoria',
        'fecha_vencimiento', 'completado_badge', 'vencido_badge'
    ]
    
    list_filter = ['completado', 'categoria', 'fecha_vencimiento']
    
    search_fields = ['tramite__folio', 'nombre_persona', 'observaciones']
    
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    fieldsets = (
        ('Información del Compromiso', {
            'fields': ('tramite', 'nombre_persona', 'categoria', 'observaciones')
        }),
        ('Fechas', {
            'fields': ('fecha_vencimiento', 'fecha_completado')
        }),
        ('Estado', {
            'fields': ('completado', 'creado_por', 'completado_por')
        }),
        ('Timestamps', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'fecha_vencimiento'
    
    ordering = ['fecha_vencimiento', '-completado']
    
    def completado_badge(self, obj):
        """Muestra si está completado con badge"""
        if obj.completado:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">✓ Sí</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">✗ No</span>'
        )
    completado_badge.short_description = 'Completado'
    
    def vencido_badge(self, obj):
        """Muestra si está vencido con badge"""
        if obj.esta_vencido:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">⚠ VENCIDO</span>'
            )
        return format_html(
            '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">✓ OK</span>'
        )
    vencido_badge.short_description = 'Estado'


@admin.register(ObservacionTramite)
class ObservacionTramiteAdmin(admin.ModelAdmin):
    """Configuración del admin para ObservacionTramite"""
    
    list_display = ['id', 'tramite', 'fecha', 'nombre', 'observacion_corta']
    list_filter = ['fecha', 'nombre']
    search_fields = ['tramite__folio', 'observacion', 'nombre']
    date_hierarchy = 'fecha'
    ordering = ['-fecha']
    
    def observacion_corta(self, obj):
        """Muestra una versión corta de la observación"""
        if len(obj.observacion) > 50:
            return f"{obj.observacion[:50]}..."
        return obj.observacion
    observacion_corta.short_description = 'Observación'