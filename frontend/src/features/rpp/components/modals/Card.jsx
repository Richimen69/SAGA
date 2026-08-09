import React from "react";
import { IconContext } from "react-icons";
function Card({ icono, estado, text }) {
  return (
    <div className="flex flex-col gap-5 bg-gray-50 p-5 rounded-2xl items-center">
      <div className="grid grid-cols-1 gap-5">
        <IconContext.Provider
          value={{
            className: "global-class-name",
            size: "3em",
          }}
        >
          {icono}
        </IconContext.Provider>
      </div>
      <div className="flex">
        <p className="md:text-3xl text-xl text-primary font-bold">{text}</p>
      </div>
      <div>
        <p className="2xl:text-base md:text-xs text-center">{estado}</p>
      </div>
    </div>
  );
}

export default Card;
