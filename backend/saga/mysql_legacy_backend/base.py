"""
Backend personalizado de MySQL que permite usar MySQL 5.7
"""

from django.db.backends.mysql import base

class DatabaseWrapper(base.DatabaseWrapper):
    """
    Wrapper de MySQL que permite usar MySQL 5.7
    """
    
    def check_database_version_supported(self):
        """
        Sobrescribe el método para permitir MySQL 5.7
        """
        pass  # No validar versión

    def get_database_version(self):
        """
        Retorna una versión que Django acepte
        """
        return (5, 7, 0, True)