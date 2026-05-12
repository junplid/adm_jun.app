import {
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { IoClose } from "react-icons/io5";
import { PiPicnicTableBold } from "react-icons/pi";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { InViewComponent } from "@components/InView";
import { JSX } from "@emotion/react/jsx-runtime";
import { HiMenu } from "react-icons/hi";
import { TbLayoutKanban } from "react-icons/tb";
import {
  LuBotMessageSquare,
  LuCalendarDays,
  LuChartNoAxesCombined,
} from "react-icons/lu";

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
import { BottomSheetComponent } from "@components/BottomSheet";
import { CgWebsite } from "react-icons/cg";
import { GiTable } from "react-icons/gi";
import { useColorModeValue } from "@components/ui/color-mode";
import { QrCode } from "@components/ui/qr-code";
import { Presence } from "@chakra-ui/react";

export const ShadowTopMemoComponent = memo(() => {
  const [showShadowTop, setShowShadowTop] = useState(true);
  const bgSidebar = useColorModeValue("#ffffff", "#121111");

  return (
    <>
      <InViewComponent onChange={(isTop) => setShowShadowTop(isTop)} />
      <div
        className={`pointer-events-none absolute left-0 z-30 h-12 w-full`}
        style={{
          background: `linear-gradient(${bgSidebar} 0%, transparent 90%)`,
          opacity: Number(!showShadowTop),
          top: 50,
        }}
      ></div>
    </>
  );
});

const ShadowBottomMemoComponent = memo(() => {
  const bgSidebar = useColorModeValue("#ffffff", "#121111");
  const [showShadowBottom, setShowShadowBottom] = useState(true);

  return (
    <>
      <InViewComponent onChange={(is) => setShowShadowBottom(is)} />
      <div
        className={`pointer-events-none absolute left-0 z-30 h-12 w-full`}
        style={{
          background: `linear-gradient(transparent 0%, ${bgSidebar} 90%)`,
          opacity: Number(!showShadowBottom),
          // bottom: 58,
          bottom: 0,
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
}: IToggleMenuProps): ReactNode => {
  const colorLogo = useColorModeValue("#1d1c1c", "#ededed");

  return (
    <button
      onClick={() => {
        if (!toggledMenu) {
          setToggledMenu(!toggledMenu);
        } else {
          setToggledMenu(!toggledMenu);
        }
      }}
      className={`text-[${colorLogo}]! cursor-pointer pointer-events-auto`}
    >
      {toggledMenu ? (
        <IoClose size={25} color={colorLogo} />
      ) : (
        <HiMenu size={25} color={colorLogo} />
      )}
    </button>
  );
};

export function LayoutPrivateProvider(): JSX.Element {
  const bgSidebar = useColorModeValue("#ffffff", "#121111");
  const shadowSidebar = useColorModeValue("#e7e7e746", "#12111149");

  const colorLogo = useColorModeValue("#1d1c1c", "#ededed");
  const colorTextActive = useColorModeValue("#1d1c1c", "#ededed");
  const colorTextOff = useColorModeValue("#b6b6b6", "#ededed");

  const {
    account: { onboarded },
    setAccount,
    clientMeta,
  } = useContext(AuthContext);
  const [toggledMenu, setToggledMenu] = useState(false);
  // const [toggledTo, setToggledTo] = useState<null | string>(null);
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const [showDonate, setShowDonate] = useState(false);
  useEffect(() => {
    if (toggledMenu) {
      setTimeout(() => {
        setShowDonate(true);
      }, 180);
    }
    if (!toggledMenu) {
      setShowDonate(false);
    }
  }, [toggledMenu]);

  return (
    <LayoutPrivateContext.Provider
      value={{
        ToggleMenu: ToggleMenu({ setToggledMenu, toggledMenu }),
      }}
    >
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
            ? "flex flex-col select-none"
            : "flex",
        )}
        style={{ overflowX: "hidden", overflowY: "hidden" }}
      >
        <Sidebar
          collapsed={!toggledMenu}
          backgroundColor={bgSidebar}
          collapsedWidth="70px"
          width="250px"
          rootStyles={{
            border: "none !important",
            boxShadow: toggledMenu ? `4px 0 8px ${shadowSidebar}` : undefined,
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
              style={{ minHeight: 50, background: bgSidebar }}
              className="sticky top-0 z-50 flex w-full items-center gap-x-2 p-1 px-2 pl-4"
            >
              <svg
                style={{ minWidth: 30, height: 30 }}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_5_65)">
                  <path
                    d="M12.3711 8.87327C12.3711 8.13803 12.9671 7.54199 13.7024 7.54199H13.9243C14.4144 7.54199 14.8118 7.93935 14.8118 8.42951V14.975C14.8118 15.4651 14.4144 15.8625 13.9243 15.8625H13.7024C12.9671 15.8625 12.3711 15.2665 12.3711 14.5312V8.87327Z"
                    fill={colorLogo}
                  />
                  <path
                    d="M37.6641 8.42951C37.6641 7.93935 38.0614 7.54199 38.5516 7.54199H38.7735C39.5087 7.54199 40.1047 8.13803 40.1047 8.87327V14.5312C40.1047 15.2665 39.5087 15.8625 38.7735 15.8625H38.5516C38.0614 15.8625 37.6641 15.4651 37.6641 14.975V8.42951Z"
                    fill={colorLogo}
                  />
                  <rect
                    x="20.4453"
                    y="22.0771"
                    width="11.5378"
                    height="3.21726"
                    fill={colorLogo}
                  />
                  <g filter="url(#filter0_d_5_65)">
                    <rect
                      x="20"
                      y="19.6357"
                      width="12.7581"
                      height="3.21726"
                      fill={colorLogo}
                    />
                  </g>
                  <path
                    d="M13.9238 5.32512C13.9238 2.38413 16.308 0 19.2489 0H38.4416V17.5285C38.4416 20.4695 36.0574 22.8536 33.1164 22.8536H19.2489C16.308 22.8536 13.9238 20.4695 13.9238 17.5285V5.32512Z"
                    fill={colorLogo}
                  />
                  <path
                    d="M13.5834 32.687C14.0438 28.5543 16.9639 25.0664 21.1222 25.0664H31.6503C35.6942 25.0664 38.9724 28.3446 38.9724 32.3885L38.9724 32.6659C38.9724 36.7097 35.6942 39.9879 31.6503 39.9879H14.5775C12.3419 39.9879 10.2288 38.9666 8.83995 37.2148L4.91428 32.2633C2.47157 29.1823 4.88322 23.17 7.54392 26.0649V26.0649C9.3763 28.0585 6.87636 32.4439 7.54392 32.9986C7.36103 32.6103 8.21148 33.5533 7.54392 32.9986C7.7268 33.387 13.1927 33.165 13.5023 32.9986C13.5365 32.9803 13.5631 32.8695 13.5834 32.687Z"
                    fill={colorLogo}
                  />
                  <ellipse
                    cx="31.8395"
                    cy="11.4264"
                    rx="3.16179"
                    ry="3.43914"
                    fill="#15AC65"
                  />
                  <ellipse
                    cx="20.8571"
                    cy="11.4264"
                    rx="3.16179"
                    ry="3.43914"
                    fill="#15AC65"
                  />
                </g>
                <defs>
                  <filter
                    id="filter0_d_5_65"
                    x="19.4453"
                    y="19.5248"
                    width="13.8672"
                    height="4.3262"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feMorphology
                      radius="0.11094"
                      operator="dilate"
                      in="SourceAlpha"
                      result="effect1_dropShadow_5_65"
                    />
                    <feOffset dy="0.44376" />
                    <feGaussianBlur stdDeviation="0.22188" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_5_65"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_5_65"
                      result="shape"
                    />
                  </filter>
                  <clipPath id="clip0_5_65">
                    <rect width="40" height="40" fill={colorLogo} />
                  </clipPath>
                </defs>
              </svg>

              <svg
                style={{
                  minWidth: 90,
                  width: 90,
                  height: "auto",
                  transform: toggledMenu ? "translateX(0)" : "translateX(30px)",
                  opacity: toggledMenu ? 1 : 0,
                }}
                className="duration-300"
                viewBox="0 0 114 41"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_20_9)">
                  <path
                    d="M7.09882 36C6.14275 36 5.27034 35.761 4.48158 35.2829C3.69282 34.8049 3.05942 34.1715 2.58139 33.3828C2.12726 32.594 1.90019 31.7335 1.90019 30.8014V15.2055H7.38564V30.5145H17.4961V15.2055H22.9815V30.8014C22.9815 31.7335 22.7425 32.594 22.2645 33.3828C21.8103 34.1715 21.1889 34.8049 20.4001 35.2829C19.6114 35.761 18.739 36 17.7829 36H7.09882ZM25.7892 36V15.2055H41.672C42.628 15.2055 43.5004 15.4445 44.2892 15.9225C45.078 16.4006 45.6994 17.034 46.1535 17.8227C46.6316 18.6115 46.8706 19.4719 46.8706 20.4041V36H41.3851V20.6909H31.2747V36H25.7892ZM48.6621 44.2461V15.2055H64.5448C65.5009 15.2055 66.3733 15.4445 67.1621 15.9225C67.9508 16.4006 68.5723 17.034 69.0264 17.8227C69.5044 18.6115 69.7434 19.4719 69.7434 20.4041V30.8014C69.7434 31.7335 69.5044 32.594 69.0264 33.3828C68.5723 34.1715 67.9508 34.8049 67.1621 35.2829C66.3733 35.761 65.5009 36 64.5448 36H54.1475V44.2461H48.6621ZM54.1475 30.5145H64.258V20.6909H54.1475V30.5145ZM76.5218 36C75.5897 36 74.7292 35.761 73.9404 35.2829C73.1517 34.8049 72.5183 34.1715 72.0403 33.3828C71.5622 32.594 71.3232 31.7335 71.3232 30.8014V8.35762H76.8445V30.5145H81.0393V36H76.5218ZM83.4123 36V15.2055H88.8977V36H83.4123ZM83.4123 13.9148V8.39348H88.8977V13.9148H83.4123ZM95.3887 36C94.4327 36 93.5602 35.761 92.7715 35.2829C91.9827 34.8049 91.3493 34.1715 90.8713 33.3828C90.4172 32.594 90.1901 31.7335 90.1901 30.8014V20.4041C90.1901 19.4719 90.4172 18.6115 90.8713 17.8227C91.3493 17.034 91.9827 16.4006 92.7715 15.9225C93.5602 15.4445 94.4327 15.2055 95.3887 15.2055H105.822V8.39348H111.307V36H95.3887ZM95.7114 30.5145H105.822V20.6909H95.7114V30.5145Z"
                    fill={colorLogo}
                  />
                </g>
                <defs>
                  <clipPath id="clip0_20_9">
                    <rect width="113.361" height="40.2036" fill={colorLogo} />
                  </clipPath>
                </defs>
              </svg>
            </div>

            <Menu
              className="relative font-semibold flex-1"
              menuItemStyles={{
                button(params) {
                  return {
                    ...params,
                    color:
                      params.open || params.active
                        ? colorTextActive
                        : colorTextOff,
                    fontWeight: params.active ? 500 : 300,
                    fontSize: 15.3,
                    ":hover": {
                      background: "transparent",
                      color: `${colorTextActive} !important`,
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
                      params.open || params.active
                        ? colorTextActive
                        : colorTextOff,
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
              <MenuItem
                icon={<CgWebsite size={22} />}
                component={
                  <Link
                    to={
                      !pathname.includes("menus-online")
                        ? "/auth/menus-online"
                        : "#"
                    }
                  />
                }
                active={pathname.includes("menus-online")}
              >
                Cardápio digital
              </MenuItem>
              <MenuItem
                icon={<TbLayoutKanban size={20} />}
                component={<Link to={"/auth/orders"} />}
                active={pathname === "/auth/orders"}
              >
                Pedidos
              </MenuItem>
              <MenuItem
                icon={<GiTable size={20} />}
                component={<Link to={"/auth/tables"} />}
                active={pathname === "/auth/tables"}
              >
                Controle de mesas
              </MenuItem>
              <MenuItem
                icon={<GrConnect size={20} />}
                component={<Link to={"/auth/connections"} />}
                active={pathname === "/auth/connections"}
              >
                Conexões
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

            {toggledMenu && (
              <Presence
                animationName={{
                  _open: "slide-from-top, fade-in",
                  _closed: "slide-to-top, fade-out",
                }}
                animationDuration="moderate"
                present={showDonate}
              >
                <div className="p-4 text-center">
                  <h3 className="text-lg font-bold dark:text-white mb-1">
                    Apoie nosso trabalho ❤️
                  </h3>
                  <p className="text-sm text-zinc-400 mb-1">
                    Sua doação contribui e impulsiona nosso time de
                    desenvolvedores.
                  </p>
                  <div className="flex justify-center">
                    <QrCode
                      size={"md"}
                      value="00020126360014BR.GOV.BCB.PIX0114+55199877266775204000053039865802BR5925Janderson Gabriel Silva d6009SAO PAULO6214051083oLAs51LG63048238"
                    />
                  </div>
                  <p className="text-xs dark:text-zinc-200 text-teal-700">
                    Escaneie com o Pix
                  </p>
                </div>
              </Presence>
            )}
            {/* 
            <div
              style={{ background: bgSidebar }}
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
            </div> */}
            <ShadowBottomMemoComponent />
          </div>
        </Sidebar>
        <main className="w-full h-screen">
          <Outlet />
        </main>
        {(clientMeta.isMobileLike || clientMeta.isSmallScreen) && (
          <BottomSheetComponent>
            {(api) => (
              <div
                key={pathname}
                className="grid select-none! grid-cols-[repeat(auto-fit,84px)] auto-rows-[55px] justify-center gap-1 gap-y-4 bg-[#1a1c1c] w-full px-2"
              >
                <a
                  style={{ touchAction: "manipulation" }}
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/tables") {
                        navigate("/auth/tables", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    }, 10);
                  }}
                  className={clsx(
                    pathname === "/auth/tables"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full h-full select-none! justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <GiTable size={18} />
                  <span className="text-xs select-none w-full text-center font-medium px-2 truncate">
                    Mesas
                  </span>
                </a>
                <a
                  style={{ touchAction: "manipulation" }}
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/orders") {
                        navigate("/auth/orders", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    }, 10);
                  }}
                  className={clsx(
                    pathname === "/auth/orders"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full h-full select-none! justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <TbLayoutKanban size={18} />
                  <span className="text-xs select-none w-full text-center font-medium px-2 truncate">
                    Pedidos
                  </span>
                </a>
                <a
                  style={{ touchAction: "manipulation" }}
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (!pathname.includes("menus-online")) {
                        navigate("/auth/menus-online", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    }, 10);
                  }}
                  className={clsx(
                    pathname.includes("menus-online")
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full h-full select-none! justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <CgWebsite size={18} />
                  <span className="text-xs select-none w-full text-center font-medium px-2 truncate">
                    Cardápio
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/agents-ai") {
                        navigate("/auth/agents-ai", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname === "/auth/agents-ai"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none! h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <BsStars size={18} />
                  <span className="text-xs select-none w-full text-center px-2 font-medium truncate">
                    Assistente
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/appointments") {
                        navigate("/auth/appointments", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname === "/auth/appointments"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none! h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <LuCalendarDays size={18} />
                  <span className="text-xs select-none! w-full text-center font-medium px-2 truncate">
                    Agenda
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/dashboard") {
                        navigate("/auth/dashboard", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname === "/auth/dashboard"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none! h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <LuChartNoAxesCombined size={18} />
                  <span className="text-xs select-none w-full text-center font-medium px-2 truncate">
                    Home
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/connections") {
                        navigate("/auth/connections", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname === "/auth/connections"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none! h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <GrConnect size={18} />
                  <span className="text-xs select-none! w-full text-center font-medium px-2 truncate">
                    Conexões
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/chatbots") {
                        navigate("/auth/chatbots", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname === "/auth/chatbots"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none! h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <LuBotMessageSquare size={18} />
                  <span className="text-xs select-none! w-full text-center font-medium px-2 truncate">
                    Chatbots
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/inboxes/departments") {
                        navigate("/auth/inboxes/departments", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname === "/auth/inboxes/departments"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none! h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <FiInbox size={18} />
                  <span className="text-xs select-none! w-full text-center font-medium px-2 truncate">
                    Suporte
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/workbench/storage") {
                        navigate("/auth/workbench/storage", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname.includes("workbench")
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none! h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <PiPicnicTableBold size={18} />
                  <span className="text-xs select-none! w-full text-center font-medium px-2 truncate">
                    Workbench
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/integrations/payments") {
                        navigate("/auth/integrations/payments", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname.includes("integrations")
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none! h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <PiPuzzlePieceBold size={18} />
                  <span className="text-xs select-none! w-full text-center font-medium px-2 truncate">
                    Integrações
                  </span>
                </a>
                <a
                  onClick={() => {
                    api.stop();
                    setTimeout(() => {
                      if (pathname !== "/auth/settings/account") {
                        navigate("/auth/settings/account", {
                          replace: searchParams.get("bs") === "true",
                        });
                      }
                    });
                  }}
                  style={{ touchAction: "manipulation" }}
                  className={clsx(
                    pathname === "/auth/settings/account"
                      ? "bg-neutral-800 shadow-sm shadow-black/20"
                      : "bg-transparent",
                    "w-full select-none h-full justify-center flex flex-col items-center gap-y-1 rounded-xl",
                  )}
                >
                  <IoMdSettings size={18} />
                  <span className="text-xs w-full select-none! text-center font-medium px-2 truncate">
                    Configurações
                  </span>
                </a>
              </div>
            )}
          </BottomSheetComponent>
        )}
      </div>
    </LayoutPrivateContext.Provider>
  );
}
