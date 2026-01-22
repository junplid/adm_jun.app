import { JSX, useContext } from "react";
import { Outlet } from "react-router-dom";
import { LayoutPrivateContext } from "@contexts/layout-private.context";

export function LayoutMain(): JSX.Element {
  const { ToggleMenu } = useContext(LayoutPrivateContext);

  return (
    <div className="w-full h-svh flex flex-col">
      <header className="p-1 px-4 flex justify-between w-full items-center">
        {ToggleMenu}
      </header>
      <div
        className="w-full h-full max-w-7xl mx-auto p-0 sm:p-8 pb-1! py-2 flex-1"
        // style={{ height: "calc(100vh - 65px)" }}
      >
        <Outlet />
      </div>
      <footer className="text-white/50 p-0.5 text-end flex items-center justify-between px-3">
        <span></span>
        <div className="flex items-center gap-x-3">
          <span className="font-light text-sm">
            Este produto não representa a versão final.
          </span>
        </div>
      </footer>
    </div>
  );
}
