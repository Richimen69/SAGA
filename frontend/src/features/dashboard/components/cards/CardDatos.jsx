import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { IconContext } from "react-icons";
export default function CardDatos({ icon, tittle, data }) {
  return (
      <div className="w-full">
        <Card className="transition-all hover:shadow-lg w-full cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full p-1">
                  <IconContext.Provider
                    value={{
                      className: "global-class-name",
                      size: "2em",
                    }}
                  >
                    {icon}
                  </IconContext.Provider>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {tittle}
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                      {data}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
