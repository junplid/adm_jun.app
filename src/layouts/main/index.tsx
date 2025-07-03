import { JSX, useContext } from "react";
import { Outlet } from "react-router-dom";
import { LayoutPrivateContext } from "@contexts/layout-private.context";
// import { ColorModeButton } from "@components/ui/color-mode";

export function LayoutMain(): JSX.Element {
  const { ToggleMenu } = useContext(LayoutPrivateContext);
  // const bgSideBar = useColorModeValue("#d8d8d8", "#3f3f3f");
  // const shadowSideBar = useColorModeValue("#dadada5c", "#12111199");

  return (
    <div className="w-full h-full flex flex-col">
      <header
        style={
          {
            // background: bgSideBar,
            // boxShadow: `0 4px 10px ${shadowSideBar}`,
          }
        }
        className="p-1 px-4 flex justify-between w-full items-center"
      >
        {ToggleMenu}
        {/* <ColorModeButton /> */}
      </header>
      <div
        className="w-full h-full max-w-7xl mx-auto p-8 py-2 flex-1"
        // style={{ height: "calc(100vh - 65px)" }}
      >
        <Outlet />
      </div>
      <footer className="text-white/50 p-0.5 text-end flex items-center justify-between px-3">
        <span>Data da última atualização: 24/06/2025</span>
        <div className="flex items-center gap-x-3">
          <span className="font-light">
            Este produto não representa a sua versão final.
          </span>
          <span className="font-medium text-white">v0.10.0-alpha</span>
        </div>
      </footer>
    </div>
  );
}
