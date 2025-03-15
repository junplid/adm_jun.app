import { JSX, useContext } from "react";
import { Outlet } from "react-router-dom";
import { LayoutPrivateContext } from "@contexts/layout-private.context";
import { ColorModeButton } from "@components/ui/color-mode";

export function LayoutMain(): JSX.Element {
  const { ToggleMenu } = useContext(LayoutPrivateContext);
  // const bgSideBar = useColorModeValue("#d8d8d8", "#3f3f3f");
  // const shadowSideBar = useColorModeValue("#dadada5c", "#12111199");

  return (
    <div className="w-full relative">
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
        <ColorModeButton />
      </header>
      <div className="w-full block">
        <Outlet />
      </div>
    </div>
  );
}
