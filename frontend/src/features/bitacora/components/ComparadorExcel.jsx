import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Download, Info } from 'lucide-react';

const InfoFiltros = ({ resultado }) => {
  if (!resultado?.filtros_aplicados) return null;

  const { fecha_inicio, fecha_fin, filtrado_por_fecha } = resultado.filtros_aplicados;

  if (!filtrado_por_fecha) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
      <div className="flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800 mb-1">
            Filtro de Fechas Aplicado
          </p>
          <div className="text-xs text-blue-700">
            {fecha_inicio && fecha_fin && (
              <p>Período: {fecha_inicio} al {fecha_fin}</p>
            )}
            {fecha_inicio && !fecha_fin && (
              <p>Desde: {fecha_inicio}</p>
            )}
            {!fecha_inicio && fecha_fin && (
              <p>Hasta: {fecha_fin}</p>
            )}
            <p className="mt-1">
              Solo se muestran trámites cuya <strong>fecha de término</strong> esté en este rango
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoDeteccion = ({ resultado }) => {
  if (!resultado?.deteccion_columna) return null;

  const { columna_utilizada, metodo, confianza } = resultado.deteccion_columna;

  return (
    <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">
            Columna detectada: <span className="font-mono">{columna_utilizada}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const TarjetaConExpedicion = ({ item }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <div>
          <span className="font-mono text-sm font-semibold text-gray-900">
            {item.numero_fianza_normalizado}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-500">Fila {item.fila_excel}</span>
    </div>

    {item.expedicion && (
      <div className="bg-green-50 rounded p-3 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-green-800">📄 EXPEDICIÓN</span>
          <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded">
            {item.expedicion.folio}
          </span>
        </div>
        <p className="text-sm text-gray-700">{item.expedicion.cliente_nombre}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
          <span>💰 ${item.expedicion.prima_total?.toLocaleString()}</span>
          <span>📅 {item.expedicion.fecha && new Date(item.expedicion.fecha).toLocaleDateString()}</span>
          {item.expedicion.fecha_termino && (
            <span>✅ {new Date(item.expedicion.fecha_termino).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    )}

    {item.cantidad_otros > 0 && item.otros_movimientos && (
      <div className="mt-2">
        <p className="text-xs font-semibold text-gray-700 mb-1">
          Otros movimientos ({item.cantidad_otros}):
        </p>
        <div className="space-y-1">
          {item.otros_movimientos.map((mov, idx) => (
            <div key={mov.id || idx} className="bg-yellow-50 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded font-semibold">
                  {mov.folio} - {mov.movimiento}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  ${Number(mov.prima_total).toLocaleString('en-US')}
                </span>
              </div>
              <p className="text-sm text-gray-700">{mov.cliente_nombre}</p>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Estatus: {mov.estatus}</span>
                <span className="text-xs text-gray-500">Fecha: {mov.fecha}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const TarjetaSinExpedicion = ({ item }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 text-yellow-600 flex items-center justify-center font-bold border-2 border-yellow-600 rounded-full">!</span>
        <div>
          <span className="font-mono text-sm font-semibold text-gray-900">
            {item.numero_fianza_normalizado}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-500">Fila {item.fila_excel}</span>
    </div>

    {item.movimientos && (
      <div className="space-y-2">
        {item.movimientos.map((mov, index) => (
          <div key={mov.id || index} className="bg-yellow-50 rounded p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded font-semibold">
                {mov.folio} - {mov.movimiento}
              </span>
              <span className="text-xs font-semibold text-gray-600">
                ${Number(mov.prima_total).toLocaleString('en-US')}
              </span>
            </div>
            <p className="text-sm text-gray-700">{mov.cliente_nombre}</p>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Estatus: {mov.estatus}</span>
              <span className="text-xs text-gray-500">Fecha: {mov.fecha}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const ComparadorExcelCompleto = () => {
  const [archivo, setArchivo] = useState(null);
  const [hoja, setHoja] = useState('');
  const [autoDetectar, setAutoDetectar] = useState(true);
  const [columnaManual, setColumnaManual] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('con_expedicion');

  // ============================================================
  // FUNCIÓN DE EXPORTACIÓN A EXCEL
  // ============================================================
  const exportarAExcel = () => {
    if (!resultado) return;

    // Importar XLSX dinámicamente
    import('xlsx').then((XLSX) => {
      const wb = XLSX.utils.book_new();

      // ============================================================
      // HOJA 1: RESUMEN
      // ============================================================
      const resumenData = [
        ['REPORTE DE COMPARACIÓN DE FIANZAS'],
        [],
        ['Archivo analizado:', resultado.info_archivo?.nombre || 'N/A'],
        ['Fecha de generación:', new Date().toLocaleString()],
      ];

      // Filtros
      if (resultado.filtros_aplicados?.filtrado_por_fecha) {
        const { fecha_inicio, fecha_fin } = resultado.filtros_aplicados;
        let filtroTexto = '';
        if (fecha_inicio && fecha_fin) {
          filtroTexto = `${fecha_inicio} al ${fecha_fin}`;
        } else if (fecha_inicio) {
          filtroTexto = `Desde ${fecha_inicio}`;
        } else if (fecha_fin) {
          filtroTexto = `Hasta ${fecha_fin}`;
        }
        resumenData.push(['Filtro de fechas:', filtroTexto]);
      }

      resumenData.push(['Columna detectada:', resultado.deteccion_columna?.columna_utilizada || 'N/A']);
      resumenData.push([]);
      resumenData.push(['ESTADÍSTICAS']);
      resumenData.push(['Categoría', 'Cantidad']);
      resumenData.push(['Total de fianzas en Excel', resultado.resumen.total_en_excel]);
      resumenData.push(['Con Expedición ✅', resultado.resumen.con_expedicion]);
      resumenData.push(['Sin Expedición (con otros) ⚠️', resultado.resumen.sin_expedicion_pero_con_otros]);
      resumenData.push(['Sin ningún trámite ❌', resultado.resumen.sin_ningun_tramite]);
      resumenData.push(['Valores vacíos', resultado.resumen.vacios_o_invalidos]);
      resumenData.push(['Duplicados en Excel', resultado.resumen.duplicados_en_excel]);

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      wsResumen['!cols'] = [{ wch: 35 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // ============================================================
      // HOJA 2: CON EXPEDICIÓN
      // ============================================================
      const expedicionData = [
        ['Fila Excel', 'Número Fianza', 'Folio', 'Cliente', 'Prima Total', 'Fecha', 'Fecha Término', 'Estatus', 'Otros Mov.']
      ];

      resultado.con_expedicion.forEach(item => {
        const exp = item.expedicion || {};
        expedicionData.push([
          item.fila_excel,
          item.numero_fianza_normalizado,
          exp.folio || '',
          exp.cliente_nombre || '',
          exp.prima_total || 0,
          exp.fecha || '',
          exp.fecha_termino || '',
          exp.estatus || '',
          item.cantidad_otros || 0
        ]);
      });

      const wsExpedicion = XLSX.utils.aoa_to_sheet(expedicionData);
      wsExpedicion['!cols'] = [
        { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 35 },
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, wsExpedicion, 'Con Expedición');

      // ============================================================
      // HOJA 3: SIN EXPEDICIÓN
      // ============================================================
      const sinExpedicionData = [
        ['Fila Excel', 'Número Fianza', 'Total Trámites', 'Movimientos']
      ];

      resultado.sin_expedicion_pero_con_otros.forEach(item => {
        const movimientos = item.movimientos || [];
        const movimientosTexto = movimientos
          .slice(0, 3)
          .map(m => `${m.folio} (${m.movimiento})`)
          .join(', ') + (movimientos.length > 3 ? ` ...y ${movimientos.length - 3} más` : '');

        sinExpedicionData.push([
          item.fila_excel,
          item.numero_fianza_normalizado,
          item.total_tramites || 0,
          movimientosTexto
        ]);
      });

      const wsSinExpedicion = XLSX.utils.aoa_to_sheet(sinExpedicionData);
      wsSinExpedicion['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsSinExpedicion, 'Sin Expedición');

      // ============================================================
      // HOJA 4: SIN TRÁMITES
      // ============================================================
      const sinTramitesData = [
        ['Fila Excel', 'Número Fianza']
      ];

      resultado.sin_ningun_tramite.forEach(item => {
        sinTramitesData.push([
          item.fila_excel,
          item.numero_fianza_normalizado
        ]);
      });

      const wsSinTramites = XLSX.utils.aoa_to_sheet(sinTramitesData);
      wsSinTramites['!cols'] = [{ wch: 12 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsSinTramites, 'Sin Captura');

      // ============================================================
      // HOJA 5: DETALLE COMPLETO
      // ============================================================
      const detalleCompletoData = [
        ['Fila Excel', 'Número Fianza', 'Tipo', 'Folio', 'Movimiento', 'Cliente', 'Prima Total', 'Fecha', 'Fecha Término', 'Estatus']
      ];

      resultado.con_expedicion.forEach(item => {
        // Agregar expedición
        const exp = item.expedicion || {};
        detalleCompletoData.push([
          item.fila_excel,
          item.numero_fianza_normalizado,
          'EXPEDICIÓN',
          exp.folio || '',
          'EXPEDICIÓN',
          exp.cliente_nombre || '',
          exp.prima_total || 0,
          exp.fecha || '',
          exp.fecha_termino || '',
          exp.estatus || ''
        ]);

        // Agregar otros movimientos
        (item.otros_movimientos || []).forEach(mov => {
          detalleCompletoData.push([
            item.fila_excel,
            item.numero_fianza_normalizado,
            'OTRO',
            mov.folio || '',
            mov.movimiento || '',
            mov.cliente_nombre || '',
            mov.prima_total || 0,
            mov.fecha || '',
            mov.fecha_termino || '',
            mov.estatus || ''
          ]);
        });
      });

      const wsDetalleCompleto = XLSX.utils.aoa_to_sheet(detalleCompletoData);
      wsDetalleCompleto['!cols'] = [
        { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 20 },
        { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(wb, wsDetalleCompleto, 'Detalle Completo');

      // ============================================================
      // DESCARGAR ARCHIVO
      // ============================================================
      const nombreArchivo = `comparacion_fianzas_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
    }).catch(err => {
      console.error('Error al cargar XLSX:', err);
      alert('Error al generar Excel. Asegúrate de tener instalado: npm install xlsx');
    });
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const esExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      if (!esExcel) {
        setError('Por favor selecciona un archivo Excel (.xlsx o .xls)');
        setArchivo(null);
        return;
      }
      setArchivo(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!archivo) {
      setError('Por favor selecciona un archivo Excel');
      return;
    }

    setCargando(true);
    setError(null);
    setResultado(null);

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('auto_detectar', autoDetectar ? 'true' : 'false');

    if (!autoDetectar && columnaManual) {
      formData.append('columna', columnaManual);
    }

    if (hoja) {
      formData.append('hoja', hoja);
    }

    if (fechaInicio) {
      formData.append('fecha_inicio', fechaInicio);
    }

    if (fechaFin) {
      formData.append('fecha_fin', fechaFin);
    }

    try {
      const response = await fetch('https://api.bilseconsultores.com/api/tramites-completo/comparar_excel/', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Token ${import.meta.env.VITE_API_TOKEN}`,
        }
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setResultado(data);
        setVistaActiva('con_expedicion');
      } else {
        if (data.columnas_disponibles) {
          setError({
            mensaje: data.error,
            columnas: data.columnas_disponibles
          });
        } else {
          setError({ mensaje: data.error || 'Error al procesar el archivo' });
        }
      }
    } catch (err) {
      setError({ mensaje: 'Error de conexión: ' + err.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      
      {/* FORMULARIO */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Comparador de Trámites</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">✨ Detección Automática Activada</p>
              <ul className="list-disc list-inside space-y-1">
                <li>El sistema detectará automáticamente la columna de fianza</li>
                <li>Soporta múltiples formatos: números, strings, con guiones, etc.</li>
                <li>Compatible con reportes de diferentes afianzadoras</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo Excel *
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                <Upload className="w-4 h-4" />
                Seleccionar archivo
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleArchivoChange}
                  className="hidden"
                />
              </label>
              {archivo && (
                <span className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  {archivo.name}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoDetectar}
                onChange={(e) => setAutoDetectar(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Detectar automáticamente la columna de fianza
              </span>
            </label>
          </div>

          {!autoDetectar && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la columna de fianza
              </label>
              <input
                type="text"
                value={columnaManual}
                onChange={(e) => setColumnaManual(e.target.value)}
                placeholder="Ej: Fianza, Póliza, Número, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoja (opcional)
            </label>
            <input
              type="text"
              value={hoja}
              onChange={(e) => setHoja(e.target.value)}
              placeholder="0 o nombre de la hoja (default: primera hoja)"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              📅 Filtrar por Fecha de Término (opcional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Solo se compararán trámites cuya fecha de término esté en este rango
            </p>
          </div>

          <button
            type="submit"
            disabled={cargando || !archivo}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Comparar con Base de Datos
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-2">{error.mensaje}</p>

                {error.columnas && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-red-800 mb-2">Columnas disponibles en tu archivo:</p>
                    <div className="bg-white rounded border border-red-200 p-3 max-h-64 overflow-y-auto">
                      {error.columnas.map((col, idx) => (
                        <div key={idx} className="mb-3 pb-3 border-b last:border-b-0">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-semibold text-gray-900">{col.nombre}</span>
                            <button
                              onClick={() => {
                                setAutoDetectar(false);
                                setColumnaManual(col.nombre);
                                setError(null);
                              }}
                              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Usar esta
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Tipo: {col.tipo} • {col.valores_validos} valores ({col.porcentaje_validos}%)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Ejemplos: {col.ejemplos.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {resultado && (
        <>
          <InfoDeteccion resultado={resultado} />
          <InfoFiltros resultado={resultado} />

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Resultados</h3>
              
              {/* BOTÓN DE EXPORTACIÓN */}
              <button
                onClick={exportarAExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar a Excel
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded p-3">
                <p className="text-2xl font-bold text-green-700">{resultado.resumen.con_expedicion}</p>
                <p className="text-xs text-green-600">Con Expedición</p>
              </div>
              <div className="bg-yellow-50 rounded p-3">
                <p className="text-2xl font-bold text-yellow-700">{resultado.resumen.sin_expedicion_pero_con_otros}</p>
                <p className="text-xs text-yellow-600">Sin Expedición</p>
              </div>
              <div className="bg-red-50 rounded p-3">
                <p className="text-2xl font-bold text-red-700">{resultado.resumen.sin_ningun_tramite}</p>
                <p className="text-xs text-red-600">Sin Captura</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-2xl font-bold text-gray-700">{resultado.resumen.vacios_o_invalidos}</p>
                <p className="text-xs text-gray-600">Vacíos</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setVistaActiva('con_expedicion')}
                className={`px-4 py-2 -mb-px ${vistaActiva === 'con_expedicion'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Con Expedición ({resultado.resumen.con_expedicion})
              </button>
              <button
                onClick={() => setVistaActiva('sin_expedicion')}
                className={`px-4 py-2 -mb-px ${vistaActiva === 'sin_expedicion'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Otros Tramites ({resultado.resumen.sin_expedicion_pero_con_otros})
              </button>
              <button
                onClick={() => setVistaActiva('sin_tramites')}
                className={`px-4 py-2 -mb-px ${vistaActiva === 'sin_tramites'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Sin Captura ({resultado.resumen.sin_ningun_tramite})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vistaActiva === 'con_expedicion' && (
                resultado.con_expedicion.map((item, idx) => (
                  <TarjetaConExpedicion key={idx} item={item} />
                ))
              )}

              {vistaActiva === 'sin_expedicion' && (
                resultado.sin_expedicion_pero_con_otros.map((item, idx) => (
                  <TarjetaSinExpedicion key={idx} item={item} />
                ))
              )}

              {vistaActiva === 'sin_tramites' && (
                resultado.sin_ningun_tramite.map((item, idx) => (
                  <div key={idx} className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <p className="font-mono text-sm">{item.numero_fianza_normalizado}</p>
                    <p className="text-xs text-red-700 mt-1">Sin registros en BD</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparadorExcelCompleto;