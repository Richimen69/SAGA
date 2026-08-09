import React from "react";
import TableCalatogo from "@/features/rpp/components/tables/TableCalatogo";

export default function CatalogoRPP() {
  return (
    <div className="p-5">
      <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-3xl overflow-hidden w-full">
        <div className="p-5 mr-5 flex justify-between w-full">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 p-1">
            Catalogo de tramites
          </h1>
        </div>
        <div className="p-5 w-full">
          <TableCalatogo />
        </div>
      </div>
    </div>
  );
}
