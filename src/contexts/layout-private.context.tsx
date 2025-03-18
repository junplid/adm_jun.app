import {
  createContext,
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { BsChatLeftDots, BsDiscord } from "react-icons/bs";
import { IoMdHelpCircle } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdBusiness, MdMonitorHeart } from "react-icons/md";
import { PiBracketsCurlyBold, PiPlugsConnectedFill } from "react-icons/pi";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { InViewComponent } from "@components/InView";
import { JSX } from "@emotion/react/jsx-runtime";
import { HiMenu } from "react-icons/hi";
import { useColorModeValue } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";
import { TbTags } from "react-icons/tb";
import { GoWorkflow } from "react-icons/go";

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
        className={`pointer-events-none absolute left-0 z-30 h-20 w-full`}
        style={{
          background: gradient,
          opacity: Number(!showShadowBottom),
          bottom: 50,
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
  const [toggledMenu, setToggledMenu] = useState(false);
  const [toggledTo, setToggledTo] = useState<null | string>(null);
  const { pathname } = useLocation();

  const bgSideBar = useColorModeValue("#ffffff", "#121111");
  const shadowSideBar = useColorModeValue("#e9e9e940", "#12111199");

  const activeColor = useColorModeValue("#1d1d1d", "#ffffff");
  const disabledColor = useColorModeValue("#979797", "#a7a7a7");
  const subMenuBg = useColorModeValue("#cecece67", "#2b2b2b42");

  const dataValue = useMemo(
    () => ({
      ToggleMenu: ToggleMenu({ setToggledMenu, toggledMenu }),
    }),
    [toggledMenu]
  );

  return (
    <LayoutPrivateContext.Provider value={dataValue}>
      <div className="items-start duration-500 w-full flex bg-[#f5f5f5] dark:bg-[#181616c5]">
        <Sidebar
          collapsed={!toggledMenu}
          backgroundColor={bgSideBar}
          collapsedWidth="70px"
          width="280px"
          rootStyles={{
            border: "none !important",
            boxShadow: toggledMenu ? `10px 0 10px ${shadowSideBar}` : undefined,
          }}
        >
          <div className="flex h-screen flex-col scroll-hidden overflow-y-scroll">
            <ShadowTopMemoComponent />
            <div
              style={{ minHeight: 50, background: bgSideBar }}
              className="sticky top-0 z-50 flex w-full items-center justify-center p-1 px-2"
            >
              <span className="block font-bold text-lg">Junplid</span>
            </div>
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
                icon={<MdMonitorHeart size={20} />}
                active={pathname === "/auth/dashboard"}
                component={<Link to={"/auth/dashboard"} />}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                icon={<MdBusiness size={20} />}
                component={<Link to={"/auth/business"} />}
                active={pathname === "/auth/business"}
              >
                Negócios
              </MenuItem>
              <MenuItem
                icon={<PiPlugsConnectedFill size={20} />}
                component={<Link to={"/auth/connections"} />}
                active={pathname === "/auth/connections"}
              >
                Conexões WA
              </MenuItem>
              <MenuItem
                icon={<GoWorkflow size={20} />}
                component={<Link to={"/auth/flows/1"} />}
                active={pathname === "/auth/flows/1"}
              >
                Construtor de fluxos
              </MenuItem>
              <MenuItem
                icon={<TbTags size={21} />}
                component={
                  <Link to={"/auth/production-settings/customization-tag"} />
                }
                active={
                  pathname === "/auth/production-settings/customization-tag"
                }
              >
                Etiquetas
              </MenuItem>
              <MenuItem
                icon={<PiBracketsCurlyBold size={19} />}
                component={
                  <Link
                    to={
                      "/auth/production-settings/customization-variable/user/dynamics"
                    }
                  />
                }
                active={
                  pathname ===
                  "/auth/production-settings/customization-variable/user/dynamics"
                }
              >
                Variáveis
              </MenuItem>

              <MenuItem
                icon={<BsChatLeftDots size={19} />}
                active={pathname === "/auth/receiving-automation/chatbot"}
                component={<Link to={"/auth/receiving-automation/chatbot"} />}
              >
                Robô de recebimento
              </MenuItem>
              {/* <MenuItem
                icon={<BsChatRightDotsFill size={25} />}
                active={pathname === "/auth/receiving-automation/chatbot"}
                component={<Link to={"/auth/receiving-automation/chatbot"} />}
              >
                Robô de envio
              </MenuItem> */}

              <SubMenu
                className="remove-scaped"
                active={pathname.includes("/auth/help")}
                icon={<IoMdHelpCircle size={21} />}
                label="Ajuda"
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("help"), 200);
                  } else {
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
                <MenuItem
                  active={pathname === "/auth/help/report-bugs-and-suggestions"}
                  component={
                    <Link to={"/auth/help/report-bugs-and-suggestions"} />
                  }
                >
                  Reportar bugs e sugestões
                </MenuItem>
                <MenuItem
                  active={pathname === "/auth/help/support-contacts"}
                  component={<Link to={"/auth/help/support-contacts"} />}
                >
                  Contatos do suporte
                </MenuItem>
                <MenuItem
                  active={pathname === "/auth/help/whats-new"}
                  component={<Link to={"/auth/help/whats-new"} />}
                >
                  Releases
                </MenuItem>
                <MenuItem
                  active={pathname === "/auth/help/terms-and-conditions"}
                  component={<Link to={"/auth/help/terms-and-conditions"} />}
                >
                  Termos e condições
                </MenuItem>
              </SubMenu>
            </Menu>
            <div
              style={{ background: bgSideBar }}
              className="sticky bottom-0 z-50 pb-3 pt-3 flex w-full items-center justify-center p-1 px-2"
            >
              <Tooltip
                showArrow
                positioning={{
                  placement: "right",
                }}
                content="Acesse a comunidade"
              >
                <a className="flex text-white border border-white/25 justify-center cursor-pointer items-center bg-[#646ee4] hover:bg-[#4460ff] duration-300 p-2 rounded-sm">
                  <BsDiscord size={18} />
                </a>
              </Tooltip>
            </div>
            <ShadowBottomMemoComponent />
          </div>
        </Sidebar>
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </LayoutPrivateContext.Provider>
  );
}
