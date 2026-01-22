import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { IoClose } from "react-icons/io5";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { JSX } from "@emotion/react/jsx-runtime";
import { HiMenu } from "react-icons/hi";
import { useColorModeValue } from "@components/ui/color-mode";
import { LayoutIntegrationsPageContext } from "./contexts";
import { RiMoneyDollarCircleLine, RiTrelloLine } from "react-icons/ri";
import { AuthContext } from "@contexts/auth.context";

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
    className="dark:text-[#ededed] text-[#1c1c1c] cursor-pointer pointer-events-auto"
  >
    {toggledMenu ? <IoClose size={25} /> : <HiMenu size={25} />}
  </button>
);

export function LayoutIntegrationsPageProvider(): JSX.Element {
  const [toggledMenu, setToggledMenu] = useState(true);
  const { pathname } = useLocation();
  const { clientMeta } = useContext(AuthContext);

  const bgSideBar = useColorModeValue("", "#1f1d1d73");
  const shadowSideBar = useColorModeValue("#e9e9e940", "#12111149");
  const activeColor = useColorModeValue("#1d1d1d", "#ffffff");
  const disabledColor = useColorModeValue("#979797", "#a7a7a7");
  const subMenuBg = useColorModeValue("#cecece67", "#2b2b2b42");

  const dataValue = useMemo(
    () => ({
      ToggleMenu: ToggleMenu({ setToggledMenu, toggledMenu }),
    }),
    [toggledMenu],
  );

  return (
    <LayoutIntegrationsPageContext.Provider value={dataValue}>
      <div className="h-full gap-y-2 flex flex-col">
        <div className="flex flex-col gap-y-0.5">
          <div className="flex items-center gap-x-5">
            <h1 className="text-lg font-semibold">Integrações</h1>
          </div>
          <p className="text-white/60 font-light">
            Configure e administre integrações com parceiros externos.
          </p>
        </div>
        {clientMeta.isMobileLike ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm px-2">
              Disponível apenas para acesso via desktop. Para utilizá-la, acesse
              o sistema por um computador.
            </span>
          </div>
        ) : (
          <div
            style={{ maxHeight: "calc(100vh - 180px)" }}
            className="flex flex-1 items-start gap-x-2"
          >
            <Sidebar
              collapsed={!toggledMenu}
              backgroundColor={""}
              collapsedWidth="70px"
              width="220px"
              style={{}}
              rootStyles={{
                borderRadius: "8px !important",
                backgroundColor: toggledMenu ? bgSideBar : "transparent",
                border: "none !important",
                boxShadow: toggledMenu
                  ? `4px 0 8px ${shadowSideBar}`
                  : undefined,
                zIndex: 9,
                position: "relative",
                marginLeft: -15,
              }}
            >
              <div
                style={{ maxHeight: "calc(100vh - 180px)", minHeight: 370 }}
                className="flex flex-col scroll-hidden overflow-y-scroll scroll-by"
              >
                <Menu
                  className="relative font-semibold flex-1 pt-1"
                  menuItemStyles={{
                    button(params) {
                      return {
                        ...params,
                        color:
                          params.open || params.active
                            ? activeColor
                            : disabledColor,
                        fontWeight: params.active ? 500 : 300,
                        fontSize: 15.3,
                        ":hover": {
                          background: "transparent",
                          color: `${activeColor} !important`,
                        },
                      };
                    },
                    subMenuContent: { background: subMenuBg },
                    icon(params) {
                      return {
                        ...params,
                        width: 23,
                        height: 23,
                        minWidth: 23,
                        color:
                          params.open || params.active
                            ? activeColor
                            : disabledColor,
                        marginRight: 10,
                      };
                    },
                  }}
                >
                  <MenuItem
                    icon={<RiMoneyDollarCircleLine size={23} />}
                    active={pathname === "/auth/integrations/payments"}
                    component={<Link to={"integrations/payments"} />}
                  >
                    Pagamentos
                  </MenuItem>
                  <MenuItem
                    icon={<RiTrelloLine size={23} />}
                    active={pathname === "/auth/integrations/trello"}
                    component={<Link to={"integrations/trello"} />}
                  >
                    Trello
                  </MenuItem>
                </Menu>
              </div>
            </Sidebar>
            <Outlet />
          </div>
        )}
      </div>
    </LayoutIntegrationsPageContext.Provider>
  );
}
