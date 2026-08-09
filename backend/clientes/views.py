from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import RegistroSerializer
from .models import Registro 

@api_view(['GET', 'POST'])
def lista_registros(request):
    # 1. Si es GET: Devolvemos la lista
    if request.method == 'GET':
        registros = Registro.objects.all().order_by('-created_at') 
        serializer = RegistroSerializer(registros, many=True) # many=True es vital para listas
        return Response(serializer.data)

    # 2. Si es POST: Guardamos nuevo registro
    elif request.method == 'POST':
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)