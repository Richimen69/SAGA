from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .tramite_views import TramiteCompletoViewSet

# Router para ViewSets
router = DefaultRouter()
router.register(r'movimientos', views.MovimientoViewSet, basename='movimiento')
router.register(r'estatus', views.EstatusViewSet, basename='estatus')
router.register(r'tareas', views.TareaViewSet, basename='tarea')
router.register(r'tramites', views.TramiteViewSet, basename='tramite')
router.register(r'tramite-tareas', views.TramiteTareaViewSet, basename='tramite-tarea')
router.register(r'compromisos', views.CompromisoViewSet, basename='compromiso')
router.register(r'observaciones', views.ObservacionTramiteViewSet, basename='observacion')
router.register(r'clientes-legacy', views.ClienteLegacyViewSet, basename='cliente-legacy')
router.register(r'tramites-completo', TramiteCompletoViewSet, basename='tramite-completo')
router.register(r'ramos-fianza', views.RamoFianzaViewSet, basename='ramo-fianza')
router.register(r'tipos-fianza', views.TipoFianzaViewSet, basename='tipo-fianza')

app_name = 'saga'

urlpatterns = [
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]

"""
Endpoints disponibles:

MOVIMIENTOS:
- GET    /api/movimientos/                    - Listar todos los movimientos
- POST   /api/movimientos/                    - Crear un movimiento
- GET    /api/movimientos/{id}/               - Obtener un movimiento
- PUT    /api/movimientos/{id}/               - Actualizar un movimiento
- DELETE /api/movimientos/{id}/               - Eliminar un movimiento

TAREAS:
- GET    /api/tareas/                         - Listar todas las tareas
- POST   /api/tareas/                         - Crear una tarea
- GET    /api/tareas/{id}/                    - Obtener una tarea
- PUT    /api/tareas/{id}/                    - Actualizar una tarea
- DELETE /api/tareas/{id}/                    - Eliminar una tarea
- GET    /api/tareas/por_movimiento/?movimiento_id=X  - Tareas por movimiento

TRÁMITES:
- GET    /api/tramites/                       - Listar todos los trámites
- POST   /api/tramites/                       - Crear un trámite
- GET    /api/tramites/{id}/                  - Obtener un trámite
- PUT    /api/tramites/{id}/                  - Actualizar un trámite
- DELETE /api/tramites/{id}/                  - Eliminar un trámite
- GET    /api/tramites/estadisticas/          - Estadísticas generales
- GET    /api/tramites/por_estatus/?estatus=X - Filtrar por estatus
- GET    /api/tramites/pendientes/            - Trámites con estatus PENDIENTE/*
- GET    /api/tramites/en_proceso/            - Trámites con estatus EN PROCESO/*
- GET    /api/tramites/terminados/            - Trámites con estatus TERMINADO*
- POST   /api/tramites/{id}/cambiar_estatus/  - Cambiar estatus
- GET    /api/tramites/buscar_por_cliente/?cliente_id=X - Trámites de un cliente

TRÁMITE TAREAS:
- GET    /api/tramite-tareas/                 - Listar todas las tareas de trámites
- POST   /api/tramite-tareas/                 - Crear una tarea de trámite
- GET    /api/tramite-tareas/{id}/            - Obtener una tarea de trámite
- PUT    /api/tramite-tareas/{id}/            - Actualizar una tarea de trámite
- DELETE /api/tramite-tareas/{id}/            - Eliminar una tarea de trámite
- POST   /api/tramite-tareas/{id}/marcar_completada/  - Marcar como completada

COMPROMISOS:
- GET    /api/compromisos/                    - Listar todos los compromisos
- POST   /api/compromisos/                    - Crear un compromiso
- GET    /api/compromisos/{id}/               - Obtener un compromiso
- PUT    /api/compromisos/{id}/               - Actualizar un compromiso
- DELETE /api/compromisos/{id}/               - Eliminar un compromiso
- GET    /api/compromisos/vencidos/           - Compromisos vencidos
- GET    /api/compromisos/pendientes/         - Compromisos pendientes
- POST   /api/compromisos/{id}/marcar_completado/  - Marcar como completado
- GET    /api/compromisos/por_tramite/?tramite_id=X - Compromisos de un trámite

OBSERVACIONES:
- GET    /api/observaciones/                  - Listar todas las observaciones
- POST   /api/observaciones/                  - Crear una observación
- GET    /api/observaciones/{id}/             - Obtener una observación
- PUT    /api/observaciones/{id}/             - Actualizar una observación
- DELETE /api/observaciones/{id}/             - Eliminar una observación
- GET    /api/observaciones/por_tramite/?tramite_id=X - Observaciones de un trámite

CLIENTES LEGACY (SOLO LECTURA):
- GET    /api/clientes-legacy/                - Listar clientes
- GET    /api/clientes-legacy/{id}/           - Obtener un cliente
- GET    /api/clientes-legacy/buscar/?q=texto - Buscar clientes

FILTROS DISPONIBLES:
Puedes agregar parámetros a las URLs para filtrar:
- ?estatus=pendiente
- ?estatus_pago=pagado
- ?tipo_proceso=nuevo
- ?movimiento=1
- ?completado=false
- ?search=texto  (busca en varios campos)
- ?ordering=-fecha_creacion  (ordenar, usar - para descendente)
- ?page=2  (paginación)
"""