# Generated manually – 0013_ramofianza_tipofianza_tramite_tipo_fianza_relativo_a

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('saga', '0012_alter_tramite_importe_total_and_more'),
    ]

    operations = [
        # 1. Crear tabla ramos_fianza
        migrations.CreateModel(
            name='RamoFianza',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100, unique=True, verbose_name='Nombre del Ramo')),
            ],
            options={
                'verbose_name': 'Ramo de Fianza',
                'verbose_name_plural': 'Ramos de Fianza',
                'db_table': 'ramos_fianza',
                'ordering': ['nombre'],
            },
        ),

        # 2. Crear tabla tipos_fianza
        migrations.CreateModel(
            name='TipoFianza',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=150, verbose_name='Nombre del Tipo')),
                ('ramo', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='tipos',
                    to='saga.ramofianza',
                    verbose_name='Ramo'
                )),
            ],
            options={
                'verbose_name': 'Tipo de Fianza',
                'verbose_name_plural': 'Tipos de Fianza',
                'db_table': 'tipos_fianza',
                'ordering': ['ramo__nombre', 'nombre'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='tipofianza',
            unique_together={('ramo', 'nombre')},
        ),

        # 3. Agregar tipo_fianza al Tramite
        migrations.AddField(
            model_name='tramite',
            name='tipo_fianza',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='tramites',
                to='saga.tipofianza',
                verbose_name='Tipo de Fianza'
            ),
        ),

        # 4. Agregar relativo_a al Tramite
        migrations.AddField(
            model_name='tramite',
            name='relativo_a',
            field=models.CharField(
                blank=True,
                max_length=255,
                null=True,
                verbose_name='Relativo A'
            ),
        ),
    ]