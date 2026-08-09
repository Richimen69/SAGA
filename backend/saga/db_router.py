"""
Database Router para manejar múltiples bases de datos

Este router dirige las consultas a las bases de datos correctas:
- 'default': Base de datos principal de Django (SAGA)
- 'legacy': Base de datos legacy de PHP (solo lectura)
"""


class DatabaseRouter:
    """
    Router para dirigir las operaciones de base de datos a la BD correcta
    """
    
    # Apps que usarán la base de datos legacy
    legacy_apps = []  # Por ahora vacío, puedes agregar apps si creas modelos para leer de legacy
    
    # Modelos específicos que usarán la BD legacy (si los necesitas)
    legacy_models = ['AfianzadoraLegacy']  # Ejemplo: ['Cliente', 'Usuario'] si creas modelos para leer de legacy
    
    def db_for_read(self, model, **hints):
        """
        Determina qué base de datos usar para operaciones de lectura
        """
        # Si el modelo está en la lista de modelos legacy, usar BD legacy
        if model.__name__ in self.legacy_models:
            return 'legacy'
        
        # Si la app está en la lista de apps legacy, usar BD legacy
        if model._meta.app_label in self.legacy_apps:
            return 'legacy'
        
        # Por defecto, usar la BD principal
        return 'default'
    
    def db_for_write(self, model, **hints):
        """
        Determina qué base de datos usar para operaciones de escritura
        """
        # IMPORTANTE: NO permitir escrituras en la BD legacy desde Django
        if model.__name__ in self.legacy_models:
            return None  # Esto evitará escrituras accidentales
        
        if model._meta.app_label in self.legacy_apps:
            return None  # Esto evitará escrituras accidentales
        
        # Todas las escrituras van a la BD principal
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Determina si se permite una relación entre dos objetos
        """
        # Permitir relaciones si ambos objetos están en la misma BD
        db_set = {'default', 'legacy'}
        
        if obj1._state.db in db_set and obj2._state.db in db_set:
            return True
        
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Determina si se permiten migraciones en una base de datos específica
        """
        # Las apps/modelos legacy NO deben migrarse
        if app_label in self.legacy_apps:
            return db == 'legacy'
        
        if model_name in self.legacy_models:
            return False  # No migrar modelos legacy
        
        # Las migraciones de Django y apps propias solo en 'default'
        return db == 'default'