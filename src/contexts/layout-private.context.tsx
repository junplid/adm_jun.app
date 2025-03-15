import {
  createContext,
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { BsDiscord, BsFillGearFill } from "react-icons/bs";
import { FaRobot, FaTools, FaWpforms } from "react-icons/fa";
import { HiMiniUserGroup } from "react-icons/hi2";
import { IoIosPeople, IoMdHelpCircle } from "react-icons/io";
import { IoClose, IoPlanet } from "react-icons/io5";
import {
  MdBusiness,
  MdIntegrationInstructions,
  MdMonitorHeart,
} from "react-icons/md";
import { PiPlugsConnectedFill } from "react-icons/pi";
import { TiFlowChildren } from "react-icons/ti";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { TbSend } from "react-icons/tb";
import { InViewComponent } from "@components/InView";
import { JSX } from "@emotion/react/jsx-runtime";
import { HiMenu } from "react-icons/hi";
import { useColorModeValue } from "@components/ui/color-mode";
import { Tooltip } from "@components/ui/tooltip";

const themeMockColor = "#e2ec55";

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
          bottom: 59,
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
    className="dark:text-[#ededed] text-[#1c1c1c] cursor-pointer"
  >
    {toggledMenu ? <IoClose size={25} /> : <HiMenu size={25} />}
  </button>
);

export function LayoutPrivateProvider(): JSX.Element {
  const [toggledMenu, setToggledMenu] = useState(false);
  const [toggledTo, setToggledTo] = useState<null | string>(null);
  const { pathname } = useLocation();

  const bgSideBar = useColorModeValue("#ffffff", "#121111");
  const shadowSideBar = useColorModeValue("#dadada5c", "#12111199");

  const dataValue = useMemo(
    () => ({
      ToggleMenu: ToggleMenu({ setToggledMenu, toggledMenu }),
    }),
    [toggledMenu]
  );

  return (
    <LayoutPrivateContext.Provider value={dataValue}>
      <div className="items-start  duration-500 w-full flex bg-[#f1f1f1] dark:bg-[#1c1c1c]">
        <Sidebar
          collapsed={!toggledMenu}
          backgroundColor={bgSideBar}
          collapsedWidth="82px"
          width="350px"
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
              className="relative font-semibold"
              menuItemStyles={{
                button(params) {
                  return {
                    ...params,
                    color:
                      params.open || params.active ? themeMockColor : "#fff",
                    fontWeight: params.active ? 400 : 200,
                    ":hover": {
                      background: "transparent",
                    },
                  };
                },
                subMenuContent: {
                  background: "#00000034",
                  boxShadow: "0 7px 10px -10px #000000ae inset",
                },
                icon(params) {
                  return {
                    ...params,
                    width: 29,
                    height: 29,
                    minWidth: 29,
                    color:
                      params.open || params.active ? themeMockColor : "#bfdaf0",
                    marginRight: 20,
                  };
                },
              }}
            >
              <MenuItem
                icon={<MdMonitorHeart size={25} />}
                active={pathname === "/auth/dashboard"}
                component={<Link to={"/auth/dashboard"} />}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                icon={<MdBusiness size={25} />}
                component={<Link to={"/auth/business"} />}
                active={pathname === "/auth/business"}
              >
                Negócios
              </MenuItem>
              <MenuItem
                icon={<PiPlugsConnectedFill size={25} />}
                component={<Link to={"/auth/connections"} />}
                active={pathname === "/auth/connections"}
              >
                Conexões
              </MenuItem>
              <SubMenu
                className="remove-scaped"
                icon={<HiMiniUserGroup size={25} />}
                label="Multiatendimento"
                active={pathname.includes("multi-service")}
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("multi-service"), 200);
                  } else {
                    setToggledTo((to) => {
                      if (to === null) return "multi-service";
                      if (to === "multi-service") return null;
                      return "multi-service";
                    });
                  }
                }}
                open={toggledTo === "multi-service"}
              >
                <MenuItem
                  component={<Link to={"/auth/multi-service/kanbans"} />}
                  active={pathname === "/auth/multi-service/kanbans"}
                >
                  Kanban
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/multi-service/supervisors"} />}
                  active={pathname === "/auth/multi-service/supervisors"}
                >
                  Supervisores
                </MenuItem>
                <MenuItem
                  component={
                    <Link to={"/auth/multi-service/sectors-attendants"} />
                  }
                  active={pathname === "/auth/multi-service/sectors-attendants"}
                >
                  Atendentes humanos
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/multi-service/attendant-ia"} />}
                  active={pathname === "/auth/multi-service/attendant-ia"}
                >
                  Atendente IA
                  {/* <span className="text-green-400 ml-2 rounded-sm text-xs p-0.5 py-0 border-dashed border-green-400 border-2">
                            NEW
                          </span> */}
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/multi-service/sectors"} />}
                  active={pathname === "/auth/multi-service/sectors"}
                >
                  Setores
                </MenuItem>
              </SubMenu>
              <SubMenu
                className="remove-scaped"
                icon={<TiFlowChildren size={25} />}
                label="Fluxos"
                active={pathname.includes("production-settings")}
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("production-settings"), 200);
                  } else {
                    setToggledTo((to) => {
                      if (to === null) return "production-settings";
                      if (to === "production-settings") return null;
                      return "production-settings";
                    });
                  }
                }}
                open={toggledTo === "production-settings"}
              >
                <MenuItem
                  component={<Link to={"/auth/production-settings/flows"} />}
                  active={pathname === "/auth/production-settings/flows"}
                >
                  Construtor de fluxos
                </MenuItem>
                {/* 
                          Enquanto ainda não esta funcionando será removido, depois coloca de volta
                          <MenuItem
                            component={
                              <Link to={"/auth/production-settings/flow-library"} />
                            }
                            active={
                              pathname === "/auth/production-settings/flow-library"
                            }
                          >
                            Biblioteca de fluxos
                          </MenuItem> */}
                <SubMenu
                  active={pathname.includes("production-settings/assets")}
                  label="Ativos"
                >
                  <MenuItem
                    component={
                      <Link
                        to={"/auth/production-settings/customization-tag"}
                      />
                    }
                    active={
                      pathname === "/auth/production-settings/customization-tag"
                    }
                  >
                    Tags
                  </MenuItem>
                  <MenuItem
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
                    Variáveis dinâmicas
                  </MenuItem>
                  <MenuItem
                    component={
                      <Link
                        to={
                          "/auth/production-settings/customization-variable/user/constant"
                        }
                      />
                    }
                    active={
                      pathname ===
                      "/auth/production-settings/customization-variable/user/constant"
                    }
                  >
                    Variáveis constantes
                  </MenuItem>
                  <MenuItem
                    component={
                      <Link
                        to={
                          "/auth/production-settings/customization-variable/system"
                        }
                      />
                    }
                    active={
                      pathname ===
                      "/auth/production-settings/customization-variable/user/system"
                    }
                  >
                    Variáveis do sistema
                  </MenuItem>
                  <MenuItem
                    component={
                      <Link
                        to={
                          "/auth/production-settings/assets/service-integrations"
                        }
                      />
                    }
                    active={
                      pathname ===
                      "/auth/production-settings/assets/service-integrations"
                    }
                  >
                    Trello
                  </MenuItem>
                  <MenuItem
                    component={
                      <Link to={"/auth/production-settings/assets/email"} />
                    }
                    active={
                      pathname === "/auth/production-settings/assets/email"
                    }
                  >
                    E-mail
                  </MenuItem>
                  <MenuItem
                    component={
                      <Link
                        to={
                          "/auth/production-settings/assets/customization-checkpoint"
                        }
                      />
                    }
                    active={
                      pathname ===
                      "/auth/production-settings/assets/customization-checkpoint"
                    }
                  >
                    Checkpoints
                  </MenuItem>
                  <MenuItem
                    component={
                      <Link
                        to={
                          "/auth/production-settings/assets/customization-geolocation"
                        }
                      />
                    }
                    active={
                      pathname ===
                      "/auth/production-settings/assets/customization-geolocation"
                    }
                  >
                    Endereços-Geolocalização
                  </MenuItem>
                  <MenuItem
                    component={
                      <Link
                        to={
                          "/auth/production-settings/assets/customization-link"
                        }
                      />
                    }
                    active={
                      pathname ===
                      "/auth/production-settings/assets/customization-link"
                    }
                  >
                    Links de rastreio
                  </MenuItem>
                  <MenuItem
                    component={
                      <Link
                        to={
                          "/auth/production-settings/assets/statistical-files"
                        }
                      />
                    }
                    active={
                      pathname ===
                      "/auth/production-settings/assets/statistical-files"
                    }
                  >
                    Mídias
                  </MenuItem>
                  {/* <MenuItem
                              component={
                                <Link to={"/auth/shortly?t=Números de notificações"} />
                              }
                              className="font-light relative text-white/75"
                              disabled
                              aria-disabled
                            >
                              <span
                                style={{ fontSize: 10 }}
                                className="absolute -bottom-0 px-1 bg-gray-100"
                              >
                                Em breve
                              </span>
                              Números que recebem notificações
                            </MenuItem> */}
                </SubMenu>
              </SubMenu>
              <MenuItem
                icon={<IoIosPeople size={25} />}
                component={<Link to={"/auth/campaign-audience"} />}
                active={pathname === "/auth/campaign-audience"}
              >
                Públicos
              </MenuItem>
              <MenuItem
                icon={<FaWpforms size={25} />}
                component={<Link to={"/auth/campaign-ondemand"} />}
                active={pathname === "/auth/campaign-ondemand"}
              >
                Automação p/ webform
              </MenuItem>
              <SubMenu
                className="remove-scaped"
                icon={<TbSend size={25} />}
                label="Automação de envio"
                active={pathname.includes("shipping-automation")}
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("shipping-automation"), 200);
                  } else {
                    setToggledTo((to) => {
                      if (to === null) return "shipping-automation";
                      if (to === "shipping-automation") return null;
                      return "shipping-automation";
                    });
                  }
                }}
                open={toggledTo === "shipping-automation"}
              >
                <MenuItem
                  active={
                    pathname === "/auth/shipping-automation/campaign-parameters"
                  }
                  component={
                    <Link
                      to={"/auth/shipping-automation/campaign-parameters"}
                    />
                  }
                >
                  Parâmetros de disparo
                </MenuItem>
                <MenuItem
                  active={pathname === "/auth/shipping-automation/campaigns"}
                  component={
                    <Link to={"/auth/shipping-automation/campaigns"} />
                  }
                >
                  Robô de disparo
                </MenuItem>
              </SubMenu>
              <SubMenu
                className="remove-scaped"
                icon={<FaRobot size={25} />}
                label="Automação de recebimento"
                active={pathname.includes("receiving-automation")}
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("receiving-automation"), 200);
                  } else {
                    setToggledTo((to) => {
                      if (to === null) return "receiving-automation";
                      if (to === "receiving-automation") return null;
                      return "receiving-automation";
                    });
                  }
                }}
                open={toggledTo === "receiving-automation"}
              >
                <MenuItem
                  active={pathname === "/auth/receiving-automation/chatbot"}
                  component={<Link to={"/auth/receiving-automation/chatbot"} />}
                >
                  Robô de atendimento
                </MenuItem>
                <MenuItem
                  component={
                    <Link
                      to={"/auth/receiving-automation/chatbot-link-qrcode"}
                    />
                  }
                  active={
                    pathname ===
                    "/auth/receiving-automation/chatbot-link-qrcode"
                  }
                >
                  Automação por Qrcode/Link
                </MenuItem>
              </SubMenu>
              <SubMenu
                className="remove-scaped"
                icon={<FaTools size={25} />}
                label="Ferramentas"
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("tools"), 200);
                  } else {
                    setToggledTo((to) => {
                      if (to === null) return "tools";
                      if (to === "tools") return null;
                      return "tools";
                    });
                  }
                }}
                open={toggledTo === "tools"}
              >
                <MenuItem
                  component={<Link to={"/auth/shortly?t=Filtro de números"} />}
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Filtro de números de whatsapp
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=Gerador de números"} />}
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Gerador de números de whatsapp
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=Aquecer número"} />}
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Aquecer número de whatsapp
                </MenuItem>
                <MenuItem
                  component={
                    <Link to={"/auth/shortly?t=Administração de grupos"} />
                  }
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Administração de grupos
                </MenuItem>
                <MenuItem
                  component={
                    <Link to={"/auth/shortly?t=Agendamento e calls"} />
                  }
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Serviço de agendamento e calls
                </MenuItem>
                <MenuItem
                  component={
                    <Link to={"/auth/shortly?t=Serviços de cardápio"} />
                  }
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Serviços de cardápio
                </MenuItem>
                <MenuItem
                  component={
                    <Link to={"/auth/shortly?t=Gerador de documentos"} />
                  }
                  className="relative mb-3 font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Configurar gerador de documentos
                </MenuItem>
              </SubMenu>
              <SubMenu
                className="remove-scaped"
                icon={<MdIntegrationInstructions size={25} />}
                label="Integrações"
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("integrations"), 200);
                  } else {
                    setToggledTo((to) => {
                      if (to === null) return "integrations";
                      if (to === "integrations") return null;
                      return "integrations";
                    });
                  }
                }}
                open={toggledTo === "integrations"}
              >
                <MenuItem
                  component={
                    <Link to={"/auth/integrations/artificial-intelligence"} />
                  }
                  className="font-light text-white/75"
                  active={
                    pathname === "/auth/integrations/artificial-intelligence"
                  }
                >
                  Inteligencia Artificial
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/integrations/facebook"} />}
                  className="font-light text-white/75"
                  active={pathname === "/auth/integrations/facebook"}
                >
                  Facebook
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=API Botstudio"} />}
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  API Botstudio
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=RD Station"} />}
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  RD Station
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=Hotmart"} />}
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Hotmart
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=Autentique"} />}
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Autentique
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=Pagamentos"} />}
                  className="relative font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  Pagamentos
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=GoogleSheets"} />}
                  className="relative mb-3 font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  <span
                    style={{ fontSize: 10 }}
                    className="absolute bottom-0.5 font-medium text-red-500"
                  >
                    Em breve
                  </span>{" "}
                  GoogleSheets
                </MenuItem>
              </SubMenu>
              {/* <MenuItem
                          icon={<MdContactPage size={25} />}
                          component={<Link to={"/auth/crm/contacts"} />}
                        >
                          CRM
                        </MenuItem> */}
              <MenuItem
                icon={<IoPlanet size={25} />}
                component={<Link to={"/auth/plans"} />}
                active={pathname === "/auth/plans"}
              >
                Planos
              </MenuItem>
              <SubMenu
                className="remove-scaped"
                icon={<BsFillGearFill size={25} />}
                label="Configurações"
                active={
                  pathname.includes("/auth/configuration") ||
                  pathname.includes("/auth/extra-packages")
                }
                onClick={() => {
                  if (!toggledMenu) {
                    setToggledMenu(true);
                    setTimeout(() => setToggledTo("configuration"), 200);
                  } else {
                    setToggledTo((to) => {
                      if (to === null) return "configuration";
                      if (to === "configuration") return null;
                      return "configuration";
                    });
                  }
                }}
                open={toggledTo === "configuration"}
              >
                <MenuItem
                  active={pathname === "/auth/configuration/account-data"}
                  component={<Link to={"configuration/account-data"} />}
                >
                  Dados da conta
                </MenuItem>
                <MenuItem
                  component={
                    <Link to={"/auth/system-configuration/sub-accounts"} />
                  }
                  active={
                    pathname === "/auth/system-configuration/sub-accounts"
                  }
                >
                  Usuários
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/system-configuration"} />}
                  active={pathname === "/auth/system-configuration"}
                >
                  Sistema
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/shortly?t=API"} />}
                  className="font-light text-white/75"
                  disabled
                  aria-disabled
                >
                  API{" "}
                  <span
                    style={{ fontSize: 10 }}
                    className="font-medium text-red-500"
                  >
                    Em breve
                  </span>
                </MenuItem>
                <MenuItem
                  component={<Link to={"/auth/extra-packages"} />}
                  active={pathname === "/auth/extra-packages"}
                >
                  Adquirir recursos extras
                </MenuItem>
                {/* <MenuItem
                            component={
                              <Link to={"/auth/shortly?t=Ações em casos de bloqueio"} />
                            }
                            className="font-light relative text-white/75"
                            disabled
                            aria-disabled
                          >
                            <span
                              style={{ fontSize: 10 }}
                              className="absolute bottom-0.5 text-red-500 font-medium"
                            >
                              Em breve
                            </span>
                            Ações em casos de bloqueio de números
                          </MenuItem>
                          <MenuItem
                            component={
                              <Link to={"/auth/shortly?t=Mensagens do sistema"} />
                            }
                            className="font-light text-white/75 relative"
                            disabled
                            aria-disabled
                          >
                            <span
                              style={{ fontSize: 10 }}
                              className="absolute bottom-0.5 text-red-500 font-medium"
                            >
                              Em breve
                            </span>{" "}
                            Mensagens do sistema
                          </MenuItem>
                          <MenuItem
                            component={<Link to={"/auth/shortly?t=Log geral"} />}
                            className="font-light text-white/75 relative mb-3"
                            disabled
                            aria-disabled
                          >
                            <span
                              style={{ fontSize: 10 }}
                              className="absolute bottom-0.5 text-red-500 font-medium"
                            >
                              Em breve
                            </span>{" "}
                            Log de ações de usuários
                          </MenuItem> */}
              </SubMenu>
              <SubMenu
                className="remove-scaped"
                active={pathname.includes("/auth/help")}
                icon={<IoMdHelpCircle size={25} />}
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
                  component={<Link to={"/auth/help/about-botstudio"} />}
                  active={pathname === "/auth/help/about-botstudio"}
                >
                  Sobre o {name ?? "PLATAFORMA_NAME"}
                </MenuItem>
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
                  O que há de novo
                </MenuItem>
                <MenuItem
                  active={pathname === "/auth/help/help-center"}
                  component={<Link to={"/auth/help/help-center"} />}
                >
                  Central de ajuda
                </MenuItem>
                <MenuItem
                  active={pathname === "/auth/help/botstudio-university"}
                  component={<Link to={"/auth/help/botstudio-university"} />}
                >
                  Universidade {name ?? "PLATAFORMA_NAME"}
                </MenuItem>
                <MenuItem
                  active={pathname === "/auth/help/terms-and-conditions"}
                  component={<Link to={"/auth/help/terms-and-conditions"} />}
                >
                  Termos e condições
                </MenuItem>
              </SubMenu>
            </Menu>
            <ShadowBottomMemoComponent />
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
          </div>
        </Sidebar>
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </LayoutPrivateContext.Provider>
  );
}
