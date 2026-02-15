import {
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { IoClose } from "react-icons/io5";
import { PiPicnicTableBold } from "react-icons/pi";
// import { GrConnect, GrSend } from "react-icons/gr";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { InViewComponent } from "@components/InView";
import { JSX } from "@emotion/react/jsx-runtime";
import { HiMenu } from "react-icons/hi";
import { Tooltip } from "@components/ui/tooltip";
import { TbDoorExit } from "react-icons/tb";
import {
  LuBotMessageSquare,
  LuCalendarDays,
  LuChartNoAxesCombined,
  LuNotepadText,
} from "react-icons/lu";
// import { Badge } from "@chakra-ui/react";
import { AuthContext } from "./auth.context";
import { ModalOnboarded } from "./ModalOnboarded";
import { updateAccount } from "../services/api/Account";
import { FiInbox } from "react-icons/fi";
import { PiPuzzlePieceBold } from "react-icons/pi";
import { GrConnect } from "react-icons/gr";
import { LayoutPrivateContext } from "./layout-private.context";
import { BsStars } from "react-icons/bs";
import clsx from "clsx";
import { IoMdSettings } from "react-icons/io";
// import { CgWebsite } from "react-icons/cg";
// import { QrCode } from "@components/ui/qr-code";

export const ShadowTopMemoComponent = memo(() => {
  const [showShadowTop, setShowShadowTop] = useState(true);

  return (
    <>
      <InViewComponent onChange={(isTop) => setShowShadowTop(isTop)} />
      <div
        className={`pointer-events-none absolute left-0 z-30 h-12 w-full`}
        style={{
          background: "linear-gradient(#121111 0%, transparent 90%)",
          opacity: Number(!showShadowTop),
          // top: 50,
          top: 0,
        }}
      ></div>
    </>
  );
});

const ShadowBottomMemoComponent = memo(() => {
  const [showShadowBottom, setShowShadowBottom] = useState(true);

  return (
    <>
      <InViewComponent onChange={(is) => setShowShadowBottom(is)} />
      <div
        className={`pointer-events-none absolute left-0 z-30 h-12 w-full`}
        style={{
          background: "linear-gradient(transparent 0%, #121111 90%)",
          opacity: Number(!showShadowBottom),
          bottom: 58,
        }}
      ></div>
    </>
  );
});

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

export function LayoutPrivateProvider(): JSX.Element {
  const {
    account: { onboarded },
    setAccount,
    clientMeta,
  } = useContext(AuthContext);
  const [toggledMenu, setToggledMenu] = useState(false);
  // const [toggledTo, setToggledTo] = useState<null | string>(null);
  const { pathname } = useLocation();

  const dataValue = useMemo(
    () => ({
      ToggleMenu: ToggleMenu({ setToggledMenu, toggledMenu }),
    }),
    [toggledMenu],
  );

  // const [showDonate, setShowDonate] = useState(false);
  // useEffect(() => {
  //   if (toggledMenu) {
  //     setTimeout(() => {
  //       setShowDonate(true);
  //     }, 180);
  //   }
  //   if (!toggledMenu) {
  //     setShowDonate(false);
  //   }
  // }, [toggledMenu]);

  return (
    <LayoutPrivateContext.Provider value={dataValue}>
      {!onboarded && (
        <ModalOnboarded
          onClose={async () => {
            await updateAccount({ onboarded: true });
            setTimeout(() => {
              setAccount((s) => ({ ...s, onboarded: true }));
            }, 300);
          }}
        />
      )}

      <div
        className={clsx(
          "items-start duration-500 h-svh w-full",
          clientMeta.isMobileLike || clientMeta.isSmallScreen
            ? "flex flex-col"
            : "flex",
        )}
        style={{ overflowX: "hidden", overflowY: "hidden" }}
      >
        <Sidebar
          collapsed={!toggledMenu}
          backgroundColor={"#121111"}
          collapsedWidth="70px"
          width="250px"
          rootStyles={{
            border: "none !important",
            boxShadow: toggledMenu ? `4px 0 8px #12111149` : undefined,
            zIndex: 9,
            position: "relative",
            display:
              clientMeta.isMobileLike || clientMeta.isSmallScreen
                ? "none"
                : "block",
          }}
        >
          <div className="flex h-svh overflow-x-hidden flex-col scroll-hidden overflow-y-scroll scroll-by">
            <ShadowTopMemoComponent />

            <div
              style={{ minHeight: 50, background: "#121111" }}
              className="sticky top-0 z-50 flex w-full items-center gap-x-2 p-1 px-2 pl-4"
            >
              <img
                src="/logo-small.svg"
                style={{ width: 30, height: 30 }}
                alt="Logo Icone"
              />
              <img
                src="/logo-lyrics.svg"
                className="duration-300"
                style={{
                  minWidth: 90,
                  width: 90,
                  height: "auto",
                  transform: toggledMenu ? "translateX(0)" : "translateX(30px)",
                  opacity: toggledMenu ? 1 : 0,
                }}
                alt="UNPLID"
              />
            </div>

            {/* {toggledMenu && (
              <Presence
                animationName={{
                  _open: "slide-from-top, fade-in",
                  _closed: "slide-to-top, fade-out",
                }}
                animationDuration="moderate"
                present={showDonate}
              >
                <div className="p-4 text-center">
                  <h3 className="text-lg font-bold text-white mb-1">
                    Apoie nosso trabalho ❤️
                  </h3>
                  <p className="text-sm text-zinc-400 mb-1">
                    Sua doação contribui e impulsiona nosso time de
                    desenvolvedores.
                  </p>
                  <div className="flex justify-center">
                    <QrCode value="00020126360014BR.GOV.BCB.PIX0114+55199877266775204000053039865802BR5925Janderson Gabriel Silva d6009SAO PAULO6214051083oLAs51LG63048238" />
                  </div>
                  <p className="text-xs text-zinc-200">Escaneie com o Pix</p>
                </div>
              </Presence>
            )} */}

            <Menu
              className="relative font-semibold flex-1"
              menuItemStyles={{
                button(params) {
                  return {
                    ...params,
                    color: params.open || params.active ? "#ffffff" : "#a7a7a7",
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
                    color: params.open || params.active ? "#ffffff" : "#a7a7a7",
                    marginRight: 10,
                  };
                },
              }}
            >
              <MenuItem
                icon={<LuChartNoAxesCombined size={20} />}
                active={pathname === "/auth/dashboard"}
                component={<Link to={"/auth/dashboard"} />}
              >
                Visão geral
              </MenuItem>
              {/* <MenuItem
                icon={<PiProjectorScreenBold size={20} />}
                component={<Link to={"/auth/projects"} />}
                active={pathname === "/auth/projects"}
              >
                Projetos
              </MenuItem> */}
              {/* <MenuItem
                icon={<CgWebsite size={22} />}
                component={<Link to={"/auth/menus-online"} />}
                active={pathname.includes("menus-online")}
                disabled
              >
                Cardápios on-line{" "}
                <Badge colorPalette={"gray"}>DESCONTINUADO</Badge>
              </MenuItem> */}
              <MenuItem
                icon={<LuNotepadText size={20} />}
                component={<Link to={"/auth/orders"} />}
                active={pathname === "/auth/orders"}
              >
                Pedidos
              </MenuItem>
              <MenuItem
                icon={<GrConnect size={20} />}
                component={<Link to={"/auth/connectionswa"} />}
                active={pathname === "/auth/connectionswa"}
              >
                Conexões WA
              </MenuItem>
              <MenuItem
                icon={<LuCalendarDays size={20} />}
                component={<Link to={"/auth/appointments"} />}
                active={pathname === "/auth/appointments"}
              >
                Agenda
              </MenuItem>
              <MenuItem
                icon={<LuBotMessageSquare size={22} />}
                active={pathname === "/auth/chatbots"}
                component={<Link to={"/auth/chatbots"} />}
              >
                Bots de recepção
              </MenuItem>
              <MenuItem
                icon={<BsStars size={20} />}
                component={<Link to={"/auth/agents-ai"} />}
                active={pathname === "/auth/agents-ai"}
              >
                Assistentes de IA
              </MenuItem>
              <MenuItem
                icon={<FiInbox size={22} />}
                component={<Link to={"/auth/inboxes/departments"} />}
                active={pathname.includes("inboxes")}
              >
                Suporte humano
              </MenuItem>
              <MenuItem
                icon={<PiPicnicTableBold size={22} />}
                component={<Link to={"/auth/workbench/storage"} />}
                active={pathname.includes("workbench")}
              >
                Workbench
              </MenuItem>
              <MenuItem
                icon={<PiPuzzlePieceBold size={22} />}
                component={<Link to={"/auth/integrations/payments"} />}
                active={pathname.includes("integrations")}
              >
                Integrações
              </MenuItem>
              <MenuItem
                icon={<IoMdSettings size={22} />}
                component={<Link to={"/auth/settings/account"} />}
                active={pathname.includes("settings")}
              >
                Configurações
              </MenuItem>
              {/* <MenuItem
                icon={<GrSend size={20} />}
                active={pathname === "/auth/campaigns"}
                component={<Link to={"/auth/campaigns"} />}
              >
                Campanhas <Badge colorPalette={"green"}>NEW</Badge>
              </MenuItem> */}
              {/* <SubMenu
                className="remove-scaped mb-5"
                active={pathname.includes("/auth/help")}
                icon={<IoHelpCircleOutline size={35} />}
                label="Ajuda+"
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("help"), 200);
                  } else {
                    setTimeout(() => {
                      document.querySelector(".scroll-by")?.scrollBy({
                        top: 310,
                        behavior: "smooth",
                      });
                    }, 310);
                    setToggledTo((to) => {
                      if (to === null) return "help";
                      if (to === "help") return null;
                      return "help";
                    });
                  }
                }}
                open={toggledTo === "help"}
              >
               <MenuItem
                  active={pathname === "/auth/help/faq"}
                  component={<Link to={"/auth/help/faq"} />}
                >
                  F.A.Q.
                </MenuItem>  
                <MenuItem component={<Link to={"/terms-of-service"} />}>
                  Termos e serviço
                </MenuItem>
                <MenuItem component={<Link to={"/privacy-terms"} />}>
                  Política de privacidade
                </MenuItem>
              </SubMenu> */}
            </Menu>

            <div
              style={{ background: "#121111" }}
              className="sticky bottom-0 gap-2 z-50 pb-3 pt-3 flex flex-wrap w-full items-center justify-center p-1 px-2"
            >
              <Tooltip
                showArrow
                positioning={{ placement: toggledMenu ? "top" : "right" }}
                content="Sair"
              >
                <Link
                  to={"/login"}
                  className="flex text-white border border-white/25 justify-center cursor-pointer items-center bg-[#e46464] hover:bg-[#ff4444] duration-300 p-2 rounded-sm"
                >
                  <TbDoorExit size={18} />
                </Link>
              </Tooltip>
            </div>
            <ShadowBottomMemoComponent />
          </div>
        </Sidebar>
        <main className="w-full h-screen">
          <Outlet />
        </main>
        {(clientMeta.isMobileLike || clientMeta.isSmallScreen) && (
          <div
            className="sticky bottom-0 z-[999] left-0 flex justify-center gap-x-1 bg-neutral-900 w-full px-2 py-2"
            style={{ boxShadow: "0px -5px 10px #121212" }}
          >
            <Link
              to={"/auth/orders"}
              className={clsx(
                pathname === "/auth/orders"
                  ? "bg-neutral-800 shadow-lg shadow-black/20"
                  : "bg-transparent",
                "p-2 px-3 pb-1 flex flex-col items-center gap-y-1 duration-300 rounded-xl",
              )}
            >
              <LuNotepadText size={20} />
              <span className="text-xs">Pedidos</span>
            </Link>
            <Link
              to={"/auth/dashboard"}
              className={clsx(
                pathname === "/auth/dashboard"
                  ? "bg-neutral-800 shadow-lg shadow-black/20"
                  : "bg-transparent",
                "p-2 px-3 pb-1 flex flex-col items-center gap-y-1 duration-300 rounded-xl",
              )}
            >
              <LuChartNoAxesCombined size={20} />
              <span className="text-xs">Home</span>
            </Link>
            <Link
              to={"/auth/agents-ai"}
              className={clsx(
                pathname === "/auth/agents-ai"
                  ? "bg-neutral-800 shadow-lg shadow-black/20"
                  : "bg-transparent",
                "p-2 px-3 pb-1 flex flex-col items-center gap-y-1 duration-300 rounded-xl",
              )}
            >
              <BsStars size={20} />
              <span className="text-xs">Assis...</span>
            </Link>
            <Link
              to={"/auth/appointments"}
              className={clsx(
                pathname === "/auth/appointments"
                  ? "bg-neutral-800 shadow-lg shadow-black/20"
                  : "bg-transparent",
                "p-2 px-3 pb-1 flex flex-col items-center gap-y-1 duration-300 rounded-xl",
              )}
            >
              <LuCalendarDays size={20} />
              <span className="text-xs">Agenda</span>
            </Link>
            <Link
              to={"/auth/inboxes/departments"}
              className={clsx(
                pathname === "/auth/inboxes/departments"
                  ? "bg-neutral-800 shadow-lg shadow-black/20"
                  : "bg-transparent",
                "p-2 px-3 pb-1 flex flex-col items-center gap-y-1 duration-300 rounded-xl",
              )}
            >
              <FiInbox size={20} />
              <span className="text-xs">Suporte</span>
            </Link>
          </div>
        )}
      </div>
    </LayoutPrivateContext.Provider>
  );
}
