import {
  createContext,
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { IoClose, IoHelpCircleOutline, IoLogoWhatsapp } from "react-icons/io5";
import { PiBracketsCurlyBold, PiProjectorScreenBold } from "react-icons/pi";
import { GrConnect, GrSend, GrStorage } from "react-icons/gr";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { InViewComponent } from "@components/InView";
import { JSX } from "@emotion/react/jsx-runtime";
import { HiMenu } from "react-icons/hi";
import { useColorModeValue } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import { TbDoorExit, TbTags } from "react-icons/tb";
import { GoWorkflow } from "react-icons/go";
import {
  LuBotMessageSquare,
  LuBrainCircuit,
  LuChartNoAxesCombined,
} from "react-icons/lu";
import { Badge } from "@chakra-ui/react";
import { AuthContext } from "./auth.context";
import { ModalOnboarded } from "./ModalOnboarded";
import { updateAccount } from "../services/api/Account";
import { FiInbox } from "react-icons/fi";
import { MdInsights } from "react-icons/md";

export const ShadowTopMemoComponent = memo(() => {
  const [showShadowTop, setShowShadowTop] = useState(true);
  const gradient = useColorModeValue(
    "linear-gradient(rgba(255, 255, 255, 0.797) 0%, rgba(214, 214, 214, 0) 90%)",
    "linear-gradient(#121111 0%, transparent 90%)"
  );

  return (
    <>
      <InViewComponent onChange={(isTop) => setShowShadowTop(isTop)} />
      <div
        className={`pointer-events-none absolute left-0 z-30 h-12 w-full`}
        style={{
          background: gradient,
          opacity: Number(!showShadowTop),
          top: 50,
        }}
      ></div>
    </>
  );
});

const ShadowBottomMemoComponent = memo(() => {
  const [showShadowBottom, setShowShadowBottom] = useState(true);
  const gradient = useColorModeValue(
    "linear-gradient(rgba(214, 214, 214, 0) 0%,rgba(255, 255, 255, 0.797) 90%)",
    "linear-gradient(transparent 0%, #121111 90%)"
  );

  return (
    <>
      <InViewComponent onChange={(is) => setShowShadowBottom(is)} />
      <div
        className={`pointer-events-none absolute left-0 z-30 h-12 w-full`}
        style={{
          background: gradient,
          opacity: Number(!showShadowBottom),
          bottom: 58,
        }}
      ></div>
    </>
  );
});

interface IFlowContextProps {
  ToggleMenu: ReactNode;
}

export const LayoutPrivateContext = createContext({} as IFlowContextProps);

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

export function LayoutPrivateProvider(): JSX.Element {
  const {
    account: { onboarded },
    setAccount,
  } = useContext(AuthContext);
  const [toggledMenu, setToggledMenu] = useState(false);
  const [toggledTo, setToggledTo] = useState<null | string>(null);
  const { pathname } = useLocation();

  const bgSideBar = useColorModeValue("#ffffff", "#121111");
  const shadowSideBar = useColorModeValue("#e9e9e940", "#12111149");

  const activeColor = useColorModeValue("#1d1d1d", "#ffffff");
  const disabledColor = useColorModeValue("#979797", "#a7a7a7");
  const subMenuBg = useColorModeValue("#cecece67", "#2b2b2b42");

  const dataValue = useMemo(
    () => ({
      ToggleMenu: ToggleMenu({ setToggledMenu, toggledMenu }),
    }),
    [toggledMenu]
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

      <div className="items-start duration-500 w-full flex">
        <Sidebar
          collapsed={!toggledMenu}
          backgroundColor={bgSideBar}
          collapsedWidth="70px"
          width="280px"
          rootStyles={{
            border: "none !important",
            boxShadow: toggledMenu ? `4px 0 8px ${shadowSideBar}` : undefined,
            zIndex: 9,
            position: "relative",
          }}
        >
          <div className="flex h-screen flex-col scroll-hidden overflow-y-scroll scroll-by">
            <ShadowTopMemoComponent />

            <div
              style={{ minHeight: 50, background: bgSideBar }}
              className="sticky top-0 z-50 flex w-full items-center justify-center p-1 px-2"
            >
              {!toggledMenu && (
                <img
                  src="/logo-icon.svg"
                  style={{ width: 40, height: 40 }}
                  alt="Logo"
                />
              )}
              {toggledMenu && (
                <img src="/logo.svg" style={{ width: 150 }} alt="Logo" />
              )}
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
                Sua doação contribui e impulsiona nosso time de desenvolvedores.
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
                icon={<LuChartNoAxesCombined size={20} />}
                active={pathname === "/auth/dashboard"}
                component={<Link to={"/auth/dashboard"} />}
              >
                Visão geral
              </MenuItem>
              <MenuItem
                icon={<PiProjectorScreenBold size={20} />}
                component={<Link to={"/auth/businesses"} />}
                active={pathname === "/auth/businesses"}
              >
                Projetos
              </MenuItem>
              <MenuItem
                icon={<GrConnect size={20} />}
                component={<Link to={"/auth/connectionswa"} />}
                active={pathname === "/auth/connectionswa"}
              >
                Conexões WA
              </MenuItem>
              <MenuItem
                icon={<GrStorage size={20} />}
                component={<Link to={"/auth/storage"} />}
                active={pathname === "/auth/storage"}
              >
                Storage <Badge colorPalette={"green"}>NEW</Badge>
              </MenuItem>
              <MenuItem
                icon={<FiInbox size={22} />}
                component={<Link to={"/auth/inboxes/attendants"} />}
                active={pathname === "/auth/inboxes/attendants"}
              >
                Inboxes <Badge colorPalette={"green"}>NEW</Badge>
              </MenuItem>
              <MenuItem
                icon={<LuBrainCircuit size={20} />}
                component={<Link to={"/auth/agents-ai"} />}
                active={pathname === "/auth/agents-ai"}
              >
                Agentes IA <Badge colorPalette={"green"}>NEW</Badge>
              </MenuItem>
              <MenuItem
                icon={<TbTags size={21} />}
                component={<Link to={"/auth/tags"} />}
                active={pathname === "/auth/tags"}
              >
                Etiquetas
              </MenuItem>
              <MenuItem
                icon={<PiBracketsCurlyBold size={19} />}
                component={<Link to={"/auth/variables"} />}
                active={pathname === "/auth/variables"}
              >
                Variáveis
              </MenuItem>
              <MenuItem
                icon={<MdInsights size={19} />}
                component={<Link to={"/auth/fb-pixels"} />}
                active={pathname === "/auth/fb-pixels"}
              >
                Pixels do Facebook <Badge colorPalette={"green"}>NEW</Badge>
              </MenuItem>
              <MenuItem
                icon={<GoWorkflow size={20} />}
                component={<Link to={"/auth/flows"} />}
                active={pathname === "/auth/flows"}
              >
                Construtores de fluxos
              </MenuItem>
              <MenuItem
                icon={<LuBotMessageSquare size={22} />}
                active={pathname === "/auth/chatbots"}
                component={<Link to={"/auth/chatbots"} />}
              >
                Bots de recepção
              </MenuItem>
              <MenuItem
                icon={<GrSend size={20} />}
                active={pathname === "/auth/campaigns"}
                component={<Link to={"/auth/campaigns"} />}
              >
                Campanhas <Badge colorPalette={"green"}>NEW</Badge>
              </MenuItem>
              <SubMenu
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
                {/* <MenuItem
                  active={pathname === "/auth/help/faq"}
                  component={<Link to={"/auth/help/faq"} />}
                >
                  F.A.Q.
                </MenuItem> */}
                <MenuItem
                  active={pathname === "/auth/help/whats-new"}
                  component={<Link to={"/auth/help/releases"} />}
                >
                  Releases
                </MenuItem>
                <MenuItem component={<Link to={"/terms-of-service"} />}>
                  Termos e serviço
                </MenuItem>
                <MenuItem component={<Link to={"/privacy-terms"} />}>
                  Política de privacidade
                </MenuItem>
              </SubMenu>
            </Menu>

            <div
              style={{ background: bgSideBar }}
              className="sticky bottom-0 gap-2 z-50 pb-3 pt-3 flex flex-wrap w-full items-center justify-center p-1 px-2"
            >
              <Tooltip
                showArrow
                positioning={{ placement: toggledMenu ? "top" : "right" }}
                content="Suporte Whatsapp"
              >
                <a
                  href="https://web.whatsapp.com/send?phone=5517981912525&text=Olá, preciso de ajuda"
                  target="_blank"
                  className="flex text-white border border-white/25 justify-center cursor-pointer items-center bg-[#70af64] hover:bg-[#388f3f] duration-300 p-2 rounded-sm"
                >
                  <IoLogoWhatsapp size={18} />
                </a>
              </Tooltip>
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
      </div>
    </LayoutPrivateContext.Provider>
  );
}
