# tu_app_de_registros/serializers.py
from rest_framework import serializers
from .models import Registro

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registro
        fields = ['nombre', 'email', 'telefono', 'empresa']