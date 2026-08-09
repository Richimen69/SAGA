# saga/mixins.py
from rest_framework import status
from rest_framework.response import Response

class StandardResponseMixin:
    """
    Mixin para estandarizar las respuestas de la API
    """
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            instance = serializer.save()
            
            return Response({
                'success': True,
                'message': f'{self.get_serializer().Meta.model.__name__} creado exitosamente',
                'data': serializer.data,
                'id': instance.id
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': f'Error al crear {self.get_serializer().Meta.model.__name__}',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            
            return Response({
                'success': True,
                'message': f'{self.get_serializer().Meta.model.__name__} actualizado exitosamente',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': f'Error al actualizar {self.get_serializer().Meta.model.__name__}',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance_id = instance.id
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': f'{self.get_serializer().Meta.model.__name__} eliminado exitosamente',
            'id': instance_id
        })
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            
            # Modificar la respuesta paginada
            paginated_response.data = {
                'success': True,
                'count': paginated_response.data.get('count', 0),
                'next': paginated_response.data.get('next'),
                'previous': paginated_response.data.get('previous'),
                'data': paginated_response.data.get('results', serializer.data)
            }
            return paginated_response
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return Response({
            'success': True,
            'data': serializer.data
        })