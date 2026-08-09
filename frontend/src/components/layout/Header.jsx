import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogoPrincipal from "@/assets/logos/LogoPrincipal.svg";
import { useNavigate } from "react-router-dom";
import { IconContext } from "react-icons";
import { MdOutlineLogout } from "react-icons/md";
function header() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Para actualizar el estado del contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar el token y el usuario del localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirigir al login
    navigate("/login");
  };
  return (
    <header className="bg-white text-primary border-b border-secondary text-[24px] font-light w-full">
      <div className="flex justify-between items-center px-4 md:px-6 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img src={LogoPrincipal} alt="Logo" className="w-40 md:w-[195px]" />
          </Link>
        </div>

        {/* Texto descriptivo (oculto en móviles) */}
        <div className="hidden md:block text-base">
          Sistema de Administración y Gestión de Afianzamiento
        </div>
        <div className="text-base md:hidden">SAGA</div>
        {/* Botón menú hamburguesa en móvil */}
        <button
          className="md:hidden text-primary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Navegación (escritorio) */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center text-xl">
            <Link to="/">
              <li className="hover:text-secondary">Dashboard</li>
            </Link>
            <Link to="/tramites">
              <li className="hover:text-secondary">Trámites</li>
            </Link>
            <Link to="/clientes">
              <li className="hover:text-secondary">Clientes</li>
            </Link>
            <Link to="/rpp">
              <li className="hover:text-secondary">RPP</li>
            </Link>
            <Link to="/bilse-academy">
              <li className="hover:text-secondary">Bilse Academy</li>
            </Link>
            <li>
              <button
                className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-3xl active:translate-x-1 active:translate-y-1"
                onClick={() => handleLogout()} // reemplaza con tu lógica
              >
                <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
                  <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                  </svg>
                </div>
                <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  Salir
                </div>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4">
          <ul className="space-y-2 text-base">
            <Link to="/">
              <li className="hover:text-secondary">Dashboard</li>
            </Link>
            <Link to="/tramites">
              <li className="hover:text-secondary">Trámites</li>
            </Link>
            <Link to="/clientes">
              <li className="hover:text-secondary">Clientes</li>
            </Link>
            <Link to="/rpp">
              <li className="hover:text-secondary">RPP</li>
            </Link>
            <li>
              <button
                className="bg-red-600 text-white w-full py-2 rounded"
                onClick={() => handleLogout()}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default header;
