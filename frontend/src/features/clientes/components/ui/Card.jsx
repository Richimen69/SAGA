import React from "react";

export default function Card({ name, icon, total }) {
  return (
    <div>
      <div className="flex rounded-2xl justify-between p-5 items-center gap-5 border-gray-300 bg-white border-2">
        <div >
          <p className="text-base text-gray-500">{name}</p>
          <p className="text-3xl font-bold text-black">{total}</p>
        </div>
        <div className="flex gap-2 text-white items-center justify-center">
          <div className="bg-gray-200 flex p-3 rounded-xl items-center justify-center text-black">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
