import { useState } from "react";
import ParametrizacionComisiones from "../components/ParametrizacionComisiones";
import ReporteComisiones from "../components/ReporteComisiones";

// Para agregar más reportes, añade una pestaña aquí y su contenido abajo
const TABS = [
  { id: "comisiones", label: "Reporte de comisiones" },
  { id: "parametrizacion", label: "Parametrización de comisiones" },
];

export default function ReportesPage() {
  const [tab, setTab] = useState(TABS[0].id);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-900">Reportes</h1>

      <div className="mt-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "comisiones" && <ReporteComisiones />}
        {tab === "parametrizacion" && <ParametrizacionComisiones />}
      </div>
    </div>
  );
}
