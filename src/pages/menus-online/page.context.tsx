import { Dispatch, ReactNode, SetStateAction, useMemo, useState } from "react";
import { IoAdd, IoClose } from "react-icons/io5";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { JSX } from "@emotion/react/jsx-runtime";
import { HiMenu } from "react-icons/hi";
import { LayoutWorkbenchPageContext } from "./contexts";
import { ModalCreateMenuOnline } from "./modals/create";
import { Button, Spinner } from "@chakra-ui/react";
import { useGetMenusOnline } from "../../hooks/menu-online";

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

export function LayoutSitesPageProvider(): JSX.Element {
  const [toggledMenu, setToggledMenu] = useState(true);
  const { pathname } = useLocation();
  const { data: menusOnline, isFetching, isPending } = useGetMenusOnline();

  const dataValue = useMemo(
    () => ({
      ToggleMenu: ToggleMenu({ setToggledMenu, toggledMenu }),
    }),
    [toggledMenu],
  );

  return (
    <LayoutWorkbenchPageContext.Provider value={dataValue}>
      <div className="h-full gap-y-2 flex flex-col">
        <div className="flex flex-col gap-y-0.5">
          <div className="flex items-center gap-x-5">
            <h1 className="text-lg font-semibold">Cardápios on-line</h1>
            <ModalCreateMenuOnline
              trigger={
                <Button variant="outline" size={"sm"}>
                  <IoAdd /> Adicionar
                </Button>
              }
            />
          </div>
          <p className="text-white/60 font-light">
            Sua bancada de trabalho feita para otimizar e automatizar seus
            processos.
          </p>
        </div>

        {(isFetching || isPending) && (
          <div className="flex w-full h-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {!(isFetching || isPending) && !menusOnline?.length && (
          <div
            style={{ maxHeight: "calc(100vh - 180px)" }}
            className="flex flex-1 items-start gap-x-2 w-full"
          >
            <div className="mt-20 flex flex-col text-sm text-center w-full">
              <span className="text-white font-semibold">
                Nenhum cardápio online
              </span>
              <span className="text-white/70">
                Seus cardápios on-line aparecerão aqui.
              </span>
            </div>
          </div>
        )}
        {!(isFetching || isPending) && !!menusOnline?.length && (
          <div
            style={{ maxHeight: "calc(100vh - 180px)" }}
            className="flex flex-1 items-start gap-x-2"
          >
            <Sidebar
              collapsed={!toggledMenu}
              backgroundColor={""}
              collapsedWidth="70px"
              width="200px"
              style={{}}
              rootStyles={{
                borderRadius: "8px !important",
                backgroundColor: toggledMenu ? "#1f1d1d73" : "transparent",
                border: "none !important",
                boxShadow: toggledMenu ? `4px 0 8px #12111149` : undefined,
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
                  {menusOnline.map(({ uuid, identifier }) => (
                    <MenuItem
                      active={pathname === `/auth/menus-online/${uuid}`}
                      component={<Link to={`${uuid}`} />}
                      key={uuid}
                    >
                      {identifier}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            </Sidebar>
            <Outlet />
          </div>
        )}
      </div>
    </LayoutWorkbenchPageContext.Provider>
  );
}
