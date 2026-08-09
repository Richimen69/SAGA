"""
Helper functions para consultar datos de la base de datos legacy (PHP)
Usa MySQLdb directamente para evitar la verificación de versión de Django 5.2

IMPORTANTE: Este archivo usa conexiones directas a MySQL sin pasar por Django
para poder conectarse a MySQL 5.7.23
"""

import MySQLdb
from MySQLdb.cursors import DictCursor
from django.conf import settings
from typing import List, Dict, Optional


def _get_connection():
    """
    Crea una conexión directa a MySQL usando MySQLdb
    Bypasea la verificación de versión de Django
    
    Returns:
        Conexión MySQLdb
    """
    legacy_db = settings.DATABASES['legacy']
    
    connection = MySQLdb.connect(
        host=legacy_db['HOST'],
        user=legacy_db['USER'],
        passwd=legacy_db['PASSWORD'],
        db=legacy_db['NAME'],
        port=int(legacy_db['PORT']),
        charset='utf8mb4',
        cursorclass=DictCursor  # Retorna resultados como diccionarios
    )
    
    return connection


def get_cliente_by_id(cliente_id: int) -> Optional[Dict]:
    """
    Obtiene un cliente de la BD legacy por su ID
    
    Args:
        cliente_id: ID del cliente (id_cli)
        
    Returns:
        Dict con datos del cliente o None si no existe
    """
    conn = _get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                id_cli as id,
                nombre_cli as nombre,
                telefono_cli as telefono,
                correo_cli as correo,
                tipo_persona_cli as tipo_persona,
                empresa_cli as empresa,
                rfc_cli as rfc,
                calle_cli as calle,
                num_ext_cli as num_ext,
                num_int_cli as num_int,
                colonia_cli as colonia,
                cp_cli as cp,
                municipio_cli as municipio,
                estado_cli as estado,
                representante_cli as representante,
                telefono_r_cli as telefono_representante,
                correo_r_cli as correo_representante,
                tipo_poder_cli as tipo_poder,
                contacto_cli as contacto,
                telefono_c_cli as telefono_contacto,
                correo_c_cli as correo_contacto,
                seguimiento_cli as seguimiento,
                estatus_cli as estatus,
                tipo_cliente,
                observaciones,
                puesto_c as puesto_contacto,
                grupo_cli as grupo
            FROM clientes
            WHERE id_cli = %s
            AND (eliminar_cli IS NULL OR eliminar_cli != '1')
        """, (cliente_id,))
        
        result = cursor.fetchone()
        return result  # DictCursor ya retorna dict o None
        
    finally:
        cursor.close()
        conn.close()


def get_all_clientes(limit: int = 100, offset: int = 0) -> List[Dict]:
    """
    Obtiene una lista de clientes de la BD legacy con paginación
    
    Args:
        limit: Número máximo de resultados (default: 100)
        offset: Número de registros a saltar (default: 0)
        
    Returns:
        Lista de diccionarios con datos de clientes
    """
    conn = _get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                id_cli as id,
                nombre_cli as nombre,
                telefono_cli as telefono,
                correo_cli as correo,
                tipo_persona_cli as tipo_persona,
                empresa_cli as empresa,
                rfc_cli as rfc,
                municipio_cli as municipio,
                estado_cli as estado,
                tipo_cliente,
                estatus_cli as estatus
            FROM clientes
            WHERE (eliminar_cli IS NULL OR eliminar_cli != '1')
            ORDER BY nombre_cli
            LIMIT %s OFFSET %s
        """, (limit, offset))
        
        results = cursor.fetchall()
        return results  # DictCursor retorna lista de dicts
        
    finally:
        cursor.close()
        conn.close()


def search_clientes(search_term: str, limit: int = 50) -> List[Dict]:
    """
    Busca clientes por nombre, RFC, empresa o correo en la BD legacy
    
    Args:
        search_term: Término de búsqueda
        limit: Número máximo de resultados (default: 50)
        
    Returns:
        Lista de diccionarios con datos de clientes encontrados
    """
    conn = _get_connection()
    cursor = conn.cursor()
    
    try:
        search_pattern = f"%{search_term}%"
        
        cursor.execute("""
            SELECT 
                id_cli as id,
                nombre_cli as nombre,
                telefono_cli as telefono,
                correo_cli as correo,
                tipo_persona_cli as tipo_persona,
                empresa_cli as empresa,
                rfc_cli as rfc,
                municipio_cli as municipio,
                estado_cli as estado,
                tipo_cliente
            FROM clientes
            WHERE (eliminar_cli IS NULL OR eliminar_cli != '1')
            AND (
                nombre_cli LIKE %s 
                OR rfc_cli LIKE %s 
                OR correo_cli LIKE %s
                OR empresa_cli LIKE %s
            )
            ORDER BY nombre_cli
            LIMIT %s
        """, (search_pattern, search_pattern, search_pattern, search_pattern, limit))
        
        results = cursor.fetchall()
        return results
        
    finally:
        cursor.close()
        conn.close()


def get_cliente_nombre(cliente_id: int) -> str:
    """
    Obtiene solo el nombre de un cliente de la BD legacy
    
    Args:
        cliente_id: ID del cliente
        
    Returns:
        Nombre del cliente o string vacío si no existe
    """
    cliente = get_cliente_by_id(cliente_id)
    return cliente['nombre'] if cliente else ''


def get_clientes_por_tipo(tipo_persona: str, limit: int = 100) -> List[Dict]:
    """
    Obtiene clientes filtrados por tipo de persona
    
    Args:
        tipo_persona: Tipo de persona ('F' para Física, 'M' para Moral, etc.)
        limit: Número máximo de resultados
        
    Returns:
        Lista de clientes del tipo especificado
    """
    conn = _get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                id_cli as id,
                nombre_cli as nombre,
                telefono_cli as telefono,
                correo_cli as correo,
                tipo_persona_cli as tipo_persona,
                empresa_cli as empresa,
                rfc_cli as rfc,
                tipo_cliente
            FROM clientes
            WHERE tipo_persona_cli = %s
            AND (eliminar_cli IS NULL OR eliminar_cli != '1')
            ORDER BY nombre_cli
            LIMIT %s
        """, (tipo_persona, limit))
        
        results = cursor.fetchall()
        return results
        
    finally:
        cursor.close()
        conn.close()


def get_clientes_con_seguimiento() -> List[Dict]:
    """
    Obtiene clientes que tienen seguimiento activo
    
    Returns:
        Lista de clientes con seguimiento activo
    """
    conn = _get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                id_cli as id,
                nombre_cli as nombre,
                telefono_cli as telefono,
                correo_cli as correo,
                empresa_cli as empresa,
                seguimiento_cli as seguimiento,
                observaciones
            FROM clientes
            WHERE seguimiento_cli = '1'
            AND (eliminar_cli IS NULL OR eliminar_cli != '1')
            ORDER BY nombre_cli
        """)
        
        results = cursor.fetchall()
        return results
        
    finally:
        cursor.close()
        conn.close()


def get_cliente_direccion_completa(cliente_id: int) -> str:
    """
    Obtiene la dirección completa formateada de un cliente
    
    Args:
        cliente_id: ID del cliente
        
    Returns:
        Dirección completa formateada como string
    """
    cliente = get_cliente_by_id(cliente_id)
    
    if not cliente:
        return ''
    
    partes = []
    
    if cliente.get('calle'):
        partes.append(cliente['calle'])
    
    if cliente.get('num_ext'):
        partes.append(f"#{cliente['num_ext']}")
    
    if cliente.get('num_int'):
        partes.append(f"Int. {cliente['num_int']}")
    
    if cliente.get('colonia'):
        partes.append(f"Col. {cliente['colonia']}")
    
    if cliente.get('cp'):
        partes.append(f"C.P. {cliente['cp']}")
    
    if cliente.get('municipio'):
        partes.append(cliente['municipio'])
    
    if cliente.get('estado'):
        partes.append(cliente['estado'])
    
    return ', '.join(partes) if partes else ''


def count_clientes_activos() -> int:
    """
    Cuenta el total de clientes activos (no eliminados)
    
    Returns:
        Número total de clientes activos
    """
    conn = _get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM clientes
            WHERE (eliminar_cli IS NULL OR eliminar_cli != '1')
        """)
        
        result = cursor.fetchone()
        return result['total']
        
    finally:
        cursor.close()
        conn.close()


def get_clientes_por_grupo(grupo_id: int, limit: int = 100) -> List[Dict]:
    """
    Obtiene clientes de un grupo específico
    
    Args:
        grupo_id: ID del grupo
        limit: Número máximo de resultados
        
    Returns:
        Lista de clientes del grupo especificado
    """
    conn = _get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                id_cli as id,
                nombre_cli as nombre,
                telefono_cli as telefono,
                correo_cli as correo,
                empresa_cli as empresa,
                rfc_cli as rfc,
                grupo_cli as grupo
            FROM clientes
            WHERE grupo_cli = %s
            AND (eliminar_cli IS NULL OR eliminar_cli != '1')
            ORDER BY nombre_cli
            LIMIT %s
        """, (grupo_id, limit))
        
        results = cursor.fetchall()
        return results
        
    finally:
        cursor.close()
        conn.close()