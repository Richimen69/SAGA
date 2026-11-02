import React from "react";
import { Menu } from "lucide-react";

// Barra superior. La navegación y el logout viven ahora en <Sidebar />.
export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b-2 border-secondary bg-white px-4 md:px-10">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="mr-3 flex h-11 w-11 items-center justify-center rounded-xl text-primary hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003f4f] md:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <span className="hidden text-sm text-gray-600 md:block">
        Sistema de Administración y Gestión de Afianzamiento
      </span>
      <span className="text-base font-semibold text-primary md:hidden">SAGA</span>
    </header>
  );
}