# Data migration – 0014_seed_ramos_tipos_fianza
# Inserta los ramos y tipos de fianza iniciales

from django.db import migrations

SEED_DATA = [
    {
        'ramo': 'Administrativas',
        'tipos': [
            'Arrendamiento Bienes Inmuebles',
            'Arrendamiento Bienes Muebles',
            'Fiscales Capital Constitutivo IMSS',
            'Fiscales Convenio de Pagos',
            'Fiscales Inconformidad',
            'Fiscales Inconformidad C.O.P. IMSS',
            'Obra Anticipo',
            'Obra Buena Calidad',
            'Obra Contingencias Laborales',
            'Obra Cumplimiento y Buena Calidad',
            'Obra Cumplimiento',
            'Obra Licitación',
            'Otras Corredor o Notario',
            'Otras Permisos y Concesiones',
            'Otras Rifas y Sorteos',
            'Proveeduría Anticipo',
            'Proveeduría Buena Calidad',
            'Proveeduría Concurso',
            'Proveeduría Cumplimiento',
            'Proveeduría Cumplimiento y Buena Calidad',
            'Proveeduría Licitación',
            'Suministro Licitación',
        ],
    },
    {
        'ramo': 'Crédito',
        'tipos': [
            'Suministro Estaciones de Servicio',
            'Suministros ASA, CFE y Particulares',
        ],
    },
    {
        'ramo': 'Fidelidad',
        'tipos': [
            'Global Administrativos',
            'Global Vendedores',
        ],
    },
    {
        'ramo': 'Judiciales',
        'tipos': [
            'No Penal Amparo',
            'No Penal Daños y Perjuicios',
            'No Penal Pensión Alimenticia',
            'No Penal Embargo',
            'Penal Amparo',
            'Penal Libertad Condicional',
            'Penal Libertad Preparatoria',
            'Penal Libertad Provisional',
            'Penal Reparación del Daño',
            'Penal Sanción Pecuniaria',
            'Penal Suspensión Orden de Aprehensión',
        ],
    },
]


def seed_ramos_tipos(apps, schema_editor):
    RamoFianza = apps.get_model('saga', 'RamoFianza')
    TipoFianza = apps.get_model('saga', 'TipoFianza')

    for entry in SEED_DATA:
        ramo, _ = RamoFianza.objects.get_or_create(nombre=entry['ramo'])
        for nombre_tipo in entry['tipos']:
            TipoFianza.objects.get_or_create(ramo=ramo, nombre=nombre_tipo)


def unseed_ramos_tipos(apps, schema_editor):
    """Elimina los datos semilla (para rollback)"""
    RamoFianza = apps.get_model('saga', 'RamoFianza')
    nombres_ramos = [e['ramo'] for e in SEED_DATA]
    RamoFianza.objects.filter(nombre__in=nombres_ramos).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('saga', '0013_ramofianza_tipofianza_tramite_tipo_fianza_relativo_a'),
    ]

    operations = [
        migrations.RunPython(seed_ramos_tipos, reverse_code=unseed_ramos_tipos),
    ]