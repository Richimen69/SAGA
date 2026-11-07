import { fechaCorta, moneyCompact, numero } from "../../utils/formatoDashboard";
import KpiCard from "./KpiCard";

export default function ResumenKpis({ data }) {
  const { ventas, cobranza, convencion, compromisos, anio } = data;

  const anterior = ventas.anio_anterior;
  const variacion = anterior?.variacion_pct;
  const badgeVentas =
    variacion == null
      ? null
      : {
          tono: variacion < 0 ? "rojo" : "verde",
          texto: `${variacion < 0 ? "−" : "+"}${Math.abs(variacion).toFixed(1)}% vs mismo periodo ${anio - 1} (${moneyCompact(anterior.total_prima)})`,
        };

  const vencimientos = compromisos.proximos_vencimientos.map(fechaCorta).join(" y ");

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        titulo={`Venta por prima ${anio}`}
        color="azul"
        valor={moneyCompact(ventas.total_prima)}
        detalle={`${numero(ventas.total_tramites)} trámites · ${numero(ventas.tramites_con_prima)} con prima`}
        badge={badgeVentas}
      />
      <KpiCard
        titulo="Cobranza pendiente"
        color="ambar"
        valor={moneyCompact(cobranza.monto_total)}
        detalle={`${numero(cobranza.total_tramites)} trámites · ${numero(cobranza.tramites_con_prima)} con prima > 0`}
        badge={
          cobranza.no_pagada.monto > 0
            ? { tono: "ambar", texto: `${moneyCompact(cobranza.no_pagada.monto)} en NO PAGADA` }
            : null
        }
      />
      {!convencion.configurada ? (
        <KpiCard
          titulo="Alcance de conversión"
          color="teal"
          valor="Sin meta"
          detalle="Configúrala en Catálogos para ver el alcance."
        />
      ) : convencion.por_afianzadora ? (
        // Todas las afianzadoras: cada una tiene su propia meta, así que no se muestra un porcentaje global
        <KpiCard
          titulo="Metas de conversión cumplidas"
          color="teal"
          valor={`${convencion.por_afianzadora.filter((a) => a.porcentaje >= 100).length} de ${convencion.por_afianzadora.length}`}
          detalle="Cada afianzadora se mide contra su propia meta"
        />
      ) : (
        <KpiCard
          titulo="Alcance de conversión"
          color="teal"
          valor={`${convencion.porcentaje.toFixed(1)}%`}
          detalle={`${moneyCompact(convencion.avance)} de ${moneyCompact(convencion.meta)} (meta de conversión)`}
          badge={
            convencion.proyeccion_pct == null
              ? null
              : { tono: "teal", texto: `Proyección al cierre: ${Math.round(convencion.proyeccion_pct)}%` }
          }
        />
      )}
      <KpiCard
        titulo="Compromisos abiertos"
        color="violeta"
        valor={numero(compromisos.abiertos)}
        detalle={`${moneyCompact(compromisos.monto_abierto)} · ${numero(compromisos.registrados)} registrados, ${numero(compromisos.cumplidos)} cumplidos`}
        badge={vencimientos ? { tono: "azul", texto: `Vencen ${vencimientos}` } : null}
      />
    </div>
  );
}