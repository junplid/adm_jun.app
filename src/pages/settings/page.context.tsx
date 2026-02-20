import { Dispatch, ReactNode, SetStateAction, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { JSX } from "@emotion/react/jsx-runtime";
import { HiMenu } from "react-icons/hi";
import { LayoutSettingsPageContext } from "./contexts";
import { MdOutlineAccountCircle, MdWorkspacePremium } from "react-icons/md";

interface IToggleMenuProps {
  toggledMenu: boolean;
  setToggledMenu: Dispatch<SetStateAction<boolean>>;
}

const ToggleMenu = ({
  toggledMenu,
  setToggledMenu,
}: IToggleMenuProps): ReactNode => (
  <button
    onClick={() => {
      if (!toggledMenu) {
        setToggledMenu(!toggledMenu);
      } else {
        setToggledMenu(!toggledMenu);
      }
    }}
    className="text-[#ededed] cursor-pointer pointer-events-auto"
  >
    {toggledMenu ? <IoClose size={25} /> : <HiMenu size={25} />}
  </button>
);

export function LayoutSettingsPageProvider(): JSX.Element {
  const [toggledMenu, setToggledMenu] = useState(false);
  const { pathname } = useLocation();

  const dataValue = useMemo(
    () => ({
      ToggleMenu: ToggleMenu({ setToggledMenu, toggledMenu }),
    }),
    [toggledMenu],
  );

  return (
    <LayoutSettingsPageContext.Provider value={dataValue}>
      <div className="h-full gap-y-2 flex flex-col sm:p-0 px-2">
        <div className="flex flex-col gap-y-0.5">
          <div className="flex items-center gap-x-5">
            <h1 className="text-base sm:text-lg font-semibold">
              Configurações
            </h1>
          </div>
        </div>
        <div className="flex flex-1 items-start gap-x-2">
          <Sidebar
            collapsed={!toggledMenu}
            backgroundColor={""}
            collapsedWidth="65px"
            width="190px"
            rootStyles={{
              borderRadius: "8px !important",
              backgroundColor: toggledMenu ? "#1f1d1d73" : "#1E1E21",
              border: "none !important",
              boxShadow: toggledMenu ? `4px 0 8px #12111149` : undefined,
              zIndex: 9,
              position: "relative",
              marginLeft: -0,
            }}
          >
            <div
              style={{ maxHeight: "calc(100vh - 180px)", minHeight: 320 }}
              className="flex flex-col scroll-hidden overflow-y-scroll scroll-by"
            >
              <Menu
                className="relative font-semibold flex-1 pt-1"
                menuItemStyles={{
                  button(params) {
                    return {
                      ...params,
                      color:
                        params.open || params.active ? "#ffffff" : "#a7a7a7",
                      fontWeight: params.active ? 500 : 300,
                      fontSize: 15.3,
                      ":hover": {
                        background: "transparent",
                        color: `#ffffff !important`,
                      },
                    };
                  },
                  subMenuContent: { background: "#2b2b2b42" },
                  icon(params) {
                    return {
                      ...params,
                      width: 23,
                      height: 23,
                      minWidth: 23,
                      color:
                        params.open || params.active ? "#ffffff" : "#a7a7a7",
                      marginRight: 10,
                    };
                  },
                }}
              >
                <MenuItem
                  icon={<MdOutlineAccountCircle size={20} />}
                  active={pathname === "/auth/settings/account"}
                  component={<Link to={"settings/account"} />}
                >
                  Conta
                </MenuItem>
                <MenuItem
                  icon={<MdWorkspacePremium size={20} />}
                  active={pathname === "/auth/settings/subscription"}
                  component={<Link to={"settings/subscription"} />}
                >
                  Meu plano
                </MenuItem>
              </Menu>
            </div>
          </Sidebar>
          <Outlet />
        </div>
      </div>
    </LayoutSettingsPageContext.Provider>
  );
}
