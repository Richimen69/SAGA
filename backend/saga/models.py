from django.db import models
from decimal import Decimal
from django.db import transaction


class Movimiento(models.Model):
    nombre = models.CharField(max_length=255, unique=True, verbose_name='Nombre del Movimiento')

    class Meta:
        db_table = 'movimientos'
        verbose_name = 'Movimiento'
        verbose_name_plural = 'Movimientos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Estatus(models.Model):
    nombre = models.CharField(max_length=255, unique=True, verbose_name='Estatus del tramite')

    class Meta:
        db_table = 'estatus'
        verbose_name = 'Estatus'
        verbose_name_plural = 'Estatus'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class RamoFianza(models.Model):
    """Ramo principal de la fianza (ej. Administrativas, Crédito, Fidelidad, Judiciales)"""
    nombre = models.CharField(max_length=100, unique=True, verbose_name='Nombre del Ramo')

    class Meta:
        db_table = 'ramos_fianza'
        verbose_name = 'Ramo de Fianza'
        verbose_name_plural = 'Ramos de Fianza'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class TipoFianza(models.Model):
    """Sub-ramo / Tipo de fianza (ej. Obra Anticipo, Penal Amparo, etc.)"""
    ramo = models.ForeignKey(
        RamoFianza,
        on_delete=models.PROTECT,
        related_name='tipos',
        verbose_name='Ramo'
    )
    nombre = models.CharField(max_length=150, verbose_name='Nombre del Tipo')

    class Meta:
        db_table = 'tipos_fianza'
        verbose_name = 'Tipo de Fianza'
        verbose_name_plural = 'Tipos de Fianza'
        ordering = ['ramo__nombre', 'nombre']
        unique_together = [['ramo', 'nombre']]

    def __str__(self):
        return f"{self.ramo.nombre} – {self.nombre}"


class Tarea(models.Model):
    movimiento = models.ForeignKey(
        Movimiento,
        on_delete=models.CASCADE,
        related_name='tareas',
        verbose_name='Movimiento'
    )
    nombre = models.CharField(max_length=255, verbose_name='Nombre de la Tarea')
    bloqueado = models.BooleanField(default=False, verbose_name='Bloqueado')

    class Meta:
        db_table = 'tareas'
        verbose_name = 'Tarea'
        verbose_name_plural = 'Tareas'
        ordering = ['movimiento', 'nombre']

    def __str__(self):
        return f"{self.movimiento.nombre} - {self.nombre}"


class AfianzadoraLegacy(models.Model):
    id_afi = models.IntegerField(primary_key=True)
    nombre_afi = models.CharField(max_length=255)
    meta = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    afianzadora = models.IntegerField(default=1)

    class Meta:
        managed = False
        db_table = 'afianzadoras'
        verbose_name = 'Afianzadora Legacy'

    def __str__(self):
        return self.nombre_afi


class Tramite(models.Model):
    ESTATUS_PAGO_CHOICES = [
        ('SE MANDÓ RECIBO', 'SE MANDÓ RECIBO'),
        ('NO PAGADA', 'NO PAGADA'),
        ('PAGADA', 'PAGADA'),
        ('PENDIENTE', 'PENDIENTE'),
        ('NO APLICA', 'NO APLICA'),
    ]

    # Campos básicos
    folio = models.CharField(max_length=10, unique=True, blank=True, verbose_name='Folio')
    fecha = models.DateField(verbose_name='Fecha')
    creado_por = models.CharField(null=True, max_length=100, blank=True, verbose_name='Creado Por')

    # Cliente
    cliente_id = models.IntegerField(null=True, blank=True, verbose_name='ID Cliente')
    cliente_nombre = models.CharField(max_length=255, null=True, blank=True, verbose_name='Nombre del Cliente')

    # Agente
    agente_id = models.IntegerField(null=True, blank=True, verbose_name='ID Agente')
    agente_nombre = models.CharField(null=True, max_length=255, blank=True, verbose_name='Nombre del Agente')

    # Beneficiario
    beneficiario_id = models.IntegerField(null=True, blank=True, verbose_name='ID Beneficiario')
    beneficiario_nombre = models.CharField(null=True, max_length=255, blank=True, verbose_name='Nombre del Beneficiario')

    # Afianzadora
    afianzadora_id = models.IntegerField(null=True, blank=True, verbose_name='ID Afianzadora')
    afianzadora_nombre = models.CharField(null=True, max_length=255, blank=True, verbose_name='Nombre de la Afianzadora')

    # Movimiento
    movimiento = models.ForeignKey(
        Movimiento,
        on_delete=models.PROTECT,
        related_name='tramites',
        null=True,
        blank=True,
        verbose_name='Movimiento'
    )

    estatus = models.ForeignKey(
        Estatus,
        on_delete=models.PROTECT,
        related_name='tramites',
        null=True,
        blank=True,
        verbose_name='Estatus'
    )

    # ── NUEVOS CAMPOS ─────────────────────────────────────────────────────────
    tipo_fianza = models.ForeignKey(
        TipoFianza,
        on_delete=models.SET_NULL,
        related_name='tramites',
        null=True,
        blank=True,
        verbose_name='Tipo de Fianza'
    )
    relativo_a = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name='Relativo A'
    )
    # ─────────────────────────────────────────────────────────────────────────

    # Información del proceso
    tipo_proceso = models.CharField(null=True, max_length=50, blank=True, verbose_name='Tipo de Proceso')
    programa_proveedores = models.BooleanField(null=True, default=False, verbose_name='Programa de Proveedores')
    numero_fianza = models.CharField(null=True, max_length=50, blank=True, verbose_name='Número de Fianza')

    # Información financiera
    prima_inicial = models.DecimalField(null=True, max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name='Prima Inicial')
    prima_futura = models.DecimalField(null=True, max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name='Prima Futura')
    prima_total = models.DecimalField(null=True, max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name='Prima Total')
    importe_total = models.DecimalField(null=True, max_digits=15, decimal_places=2, default=Decimal('0.00'), verbose_name='Importe Total')

    fecha_termino = models.DateField(null=True, blank=True, verbose_name='Fecha de Término')
    fecha_emision = models.DateField(null=True, blank=True, verbose_name='Fecha de Emisión')

    # Información de pago
    fecha_pago = models.DateField(null=True, blank=True, verbose_name='Fecha de Pago')
    estatus_pago = models.CharField(
        null=True, max_length=50, choices=ESTATUS_PAGO_CHOICES,
        default='PENDIENTE', verbose_name='Estatus de Pago'
    )
    observaciones_pago = models.CharField(null=True, max_length=255, blank=True, verbose_name='Observaciones de Pago')

    # Timestamps
    fecha_creacion = models.DateTimeField(null=True, blank=True, auto_now_add=True, verbose_name='Fecha de Creación')
    fecha_actualizacion = models.DateTimeField(null=True, auto_now=True, verbose_name='Fecha de Actualización')

    class Meta:
        db_table = 'tramites'
        verbose_name = 'Trámite'
        verbose_name_plural = 'Trámites'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['folio']),
            models.Index(fields=['cliente_id']),
            models.Index(fields=['estatus']),
            models.Index(fields=['fecha']),
        ]

    def __str__(self):
        return f"{self.folio} - {self.cliente_nombre}"

    @staticmethod
    def generar_folio(usuario_inicial):
        inicial = usuario_inicial.upper()
        with transaction.atomic():
            folios_existentes = Tramite.objects.select_for_update().filter(
                folio__startswith=f"{inicial}-"
            ).values_list('folio', flat=True)

            if folios_existentes:
                numeros = []
                for folio in folios_existentes:
                    try:
                        numero = int(folio.split('-')[1])
                        numeros.append(numero)
                    except (IndexError, ValueError):
                        continue
                ultimo_numero = max(numeros) if numeros else 0
            else:
                ultimo_numero = 0

            nuevo_numero = ultimo_numero + 1
            return f"{inicial}-{nuevo_numero:04d}"

    def save(self, *args, **kwargs):
        if not self.folio and self.creado_por:
            inicial = self.creado_por[0].upper()
            self.folio = self.generar_folio(inicial)

        if self.prima_inicial is not None and self.prima_futura is not None:
            self.prima_total = self.prima_inicial + self.prima_futura

        super().save(*args, **kwargs)


class TramiteTarea(models.Model):
    tramite = models.ForeignKey(Tramite, on_delete=models.CASCADE, related_name='tramite_tareas', verbose_name='Trámite')
    tarea = models.ForeignKey(Tarea, on_delete=models.PROTECT, related_name='tramite_tareas', verbose_name='Tarea')
    completado = models.BooleanField(default=False, verbose_name='Completado')
    fecha_completado = models.DateField(null=True, blank=True, verbose_name='Fecha de Completado')
    observaciones = models.TextField(blank=True, verbose_name='Observaciones')

    class Meta:
        db_table = 'tramite_tareas'
        verbose_name = 'Tarea del Trámite'
        verbose_name_plural = 'Tareas del Trámite'
        unique_together = [['tramite', 'tarea']]
        ordering = ['tramite', 'tarea']

    def __str__(self):
        return f"{self.tramite.folio} - {self.tarea.nombre}"


class Compromiso(models.Model):
    CATEGORIA_CHOICES = [
        ('BC-AFIANZADORA', 'BC-AFIANZADORA'),
        ('CLIENTES-AFIANZADORA', 'CLIENTES-AFIANZADORA'),
        ('CLIENTES-BC', 'CLIENTES-BC'),
    ]

    tramite = models.ForeignKey(Tramite, on_delete=models.CASCADE, related_name='compromisos', verbose_name='Trámite')
    nombre_persona = models.CharField(max_length=255, verbose_name='Nombre de la Persona')
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES, verbose_name='Categoría')
    observaciones = models.TextField(blank=True, verbose_name='Observaciones')
    fecha_vencimiento = models.DateField(verbose_name='Fecha de Vencimiento')
    fecha_completado = models.DateField(null=True, blank=True, verbose_name='Fecha de Completado')
    completado = models.BooleanField(default=False, verbose_name='Completado')
    creado_por = models.CharField(max_length=255, verbose_name='Creado Por')
    completado_por = models.CharField(max_length=255, blank=True, verbose_name='Completado Por')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')

    class Meta:
        db_table = 'compromisos'
        verbose_name = 'Compromiso'
        verbose_name_plural = 'Compromisos'
        ordering = ['fecha_vencimiento', '-completado']
        indexes = [
            models.Index(fields=['tramite', 'completado']),
            models.Index(fields=['fecha_vencimiento']),
        ]

    def __str__(self):
        return f"{self.tramite.folio} - {self.nombre_persona} ({self.categoria})"

    @property
    def esta_vencido(self):
        from django.utils import timezone
        if not self.completado and self.fecha_vencimiento:
            return self.fecha_vencimiento < timezone.now().date()
        return False


class ObservacionTramite(models.Model):
    tramite = models.ForeignKey(Tramite, on_delete=models.CASCADE, related_name='observaciones', verbose_name='Trámite')
    observacion = models.TextField(verbose_name='Observación')
    fecha = models.DateTimeField(verbose_name='Fecha')
    nombre = models.CharField(max_length=50, verbose_name='Nombre')

    class Meta:
        db_table = 'observaciones_tramites'
        verbose_name = 'Observación del Trámite'
        verbose_name_plural = 'Observaciones de Trámites'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.tramite.folio} - {self.fecha} - {self.nombre}"