from django.contrib import admin
from .models import Registro

# Esto hace que aparezca en el panel
@admin.register(Registro)
class RegistroAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'email', 'telefono', 'empresa', 'created_at')
    search_fields = ('nombre', 'email')