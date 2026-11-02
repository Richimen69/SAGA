import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CircleDollarSign, UserPlus } from "lucide-react";
import TableRpp from "@/features/rpp/components/tables/TableRpp";
import { FormularioUsers } from "@/features/rpp/components/forms/FormularioUsers";

function Rpp() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Trámites RPP
          </h1>
          <div className="flex flex-wrap gap-3">
            {/* Antes este link también abría el formulario de usuarios al navegar; ya no */}
            <Link
              to="/catalogo"
              className="flex h-11 items-center gap-2 whitespace-nowrap rounded-[10px] border border-gray-300 bg-white px-[18px] text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#003f4f]"
            >
              <CircleDollarSign size={18} aria-hidden="true" />
              Catálogo
            </Link>
            <button
              type="button"
              onClick={() => setShowDialog(true)}
              className="flex h-11 items-center gap-2 whitespace-nowrap rounded-[10px] bg-[#003f4f] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#002b36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003f4f]"
            >
              <UserPlus size={18} aria-hidden="true" />
              Agregar usuario
            </button>
          </div>
        </div>

        <TableRpp />
      </div>

      {showDialog && <FormularioUsers onClose={() => setShowDialog(false)} />}
    </div>
  );
}

export default Rpp;