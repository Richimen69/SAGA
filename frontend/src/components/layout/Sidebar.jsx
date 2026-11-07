import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  LogOut,
  FileSpreadsheet 
} from "lucide-react";
import LogoPrincipal from "@/assets/logos/LogoPrincipal.svg";

// `match` = rutas que deben dejar este item marcado como activo.
// Así "Trámites" sigue activo en /vistaprevia, /tramitecliente, etc.
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, match: ["/"], exact: true },
  {
    to: "/tramites",
    label: "Trámites",
    Icon: ClipboardCheck,
    match: ["/tramites", "/vistaprevia", "/tramitecliente", "/comparar-tramites"],
  },
  { to: "/clientes", label: "Clientes", Icon: Users, match: ["/clientes"] },
  { to: "/catalogos", label: "Catálogos", Icon: BookOpen, match: ["/catalogos", "/catalogo"] },
  { to: "/reportes", label: "Reportes", Icon: FileSpreadsheet, match: ["/reportes", "/reportes"] },
  { to: "/rpp", label: "RPP", Icon: FileText, match: ["/rpp"] },
  {
    to: "/bilse-academy",
    label: "Bilse Academy",
    Icon: GraduationCap,
    match: ["/bilse-academy"],
  },
];

// Las etiquetas se ven siempre en móvil (drawer) y solo al expandir en escritorio.
const LABEL_CLASS =
  "whitespace-nowrap text-sm opacity-100 transition-opacity duration-150 " +
  "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100";

const ITEM_BASE =
  "flex h-12 w-full items-center gap-3 rounded-xl px-[13px] transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003f4f]";

function isActive(pathname, item) {
  if (item.exact) return pathname === "/";
  return item.match.some((p) => pathname.startsWith(p));
}

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Cierra el drawer móvil al cambiar de ruta
  useEffect(() => {
    onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navegación principal"
        className={`group fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col overflow-hidden border-r border-gray-200 bg-white
          transition-[width,transform,box-shadow] duration-200
          md:w-[72px] md:translate-x-0
          md:hover:w-[232px] md:hover:shadow-[8px_0_24px_rgba(0,0,0,0.12)]
          md:focus-within:w-[232px] md:focus-within:shadow-[8px_0_24px_rgba(0,0,0,0.12)]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Marca: cuadro "B" colapsado, logo completo expandido.
            Cambia la "B" por un isotipo cuando lo tengas. */}
        <Link
          to="/"
          className="relative mx-3 mb-2 mt-4 flex h-11 shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003f4f] rounded-xl"
        >
          <span
            aria-hidden="true"
            className="absolute left-0.5 hidden w-11 items-center justify-center rounded-xl text-xl font-bold text-white transition-opacity duration-150 md:flex md:group-hover:opacity-0 md:group-focus-within:opacity-0"
          >
            <img src="/escudo.svg" alt="" />
          </span>
          <img
            src={LogoPrincipal}
            alt="Bilse Consultores"
            className="w-auto h-25 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          />
        </Link>

        <div className="mx-3 my-2 h-px bg-gray-200" />

        <nav className="flex flex-col gap-2 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`${ITEM_BASE} ${
                  active
                    ? "bg-[#003f4f] font-semibold text-white"
                    : "font-medium text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.Icon className="h-[22px] w-[22px] shrink-0" aria-hidden="true" />
                <span className={LABEL_CLASS}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pb-4">
          <button
            type="button"
            onClick={handleLogout}
            className={`${ITEM_BASE} font-medium text-red-700 hover:bg-red-50`}
          >
            <LogOut className="h-[22px] w-[22px] shrink-0" aria-hidden="true" />
            <span className={LABEL_CLASS}>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}