import { JSX, useContext } from "react";
import { Outlet } from "react-router-dom";
import { LayoutPrivateContext } from "@contexts/layout-private.context";
import { AuthContext } from "@contexts/auth.context";

export function LayoutMain(): JSX.Element {
  const { clientMeta } = useContext(AuthContext);
  const { ToggleMenu } = useContext(LayoutPrivateContext);

  return (
    <div className="w-full h-svh flex flex-col">
      <header className="p-1 px-4 flex justify-between w-full items-center">
        {clientMeta.isMobileLike || clientMeta.isSmallScreen
          ? undefined
          : ToggleMenu}
      </header>
      <div
        className="w-full mb-16 h-full max-w-7xl mx-auto p-0 sm:p-8 pb-1! py-2 flex-1"
        // style={{ height: "calc(100vh - 65px)" }}
      >
        <Outlet />
      </div>
    </div>
  );
}
