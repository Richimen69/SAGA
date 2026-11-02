const TONOS = {
  rojo: "bg-red-100 text-red-700",
  verde: "bg-emerald-100 text-emerald-700",
  ambar: "bg-amber-100 text-amber-800",
  teal: "bg-teal-100 text-teal-700",
  azul: "bg-blue-100 text-blue-700",
};

const BARRAS = {
  azul: "bg-blue-900",
  ambar: "bg-amber-500",
  teal: "bg-teal-600",
  violeta: "bg-violet-500",
};

export default function KpiCard({ titulo, color, valor, detalle, badge }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <span className={`h-3.5 w-1 rounded-full ${BARRAS[color]}`} />
        {titulo}
      </p>
      <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{valor}</p>
      {detalle && <p className="mt-2 text-xs text-slate-500">{detalle}</p>}
      {badge && (
        <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${TONOS[badge.tono]}`}>
          {badge.texto}
        </span>
      )}
    </div>
  );
}