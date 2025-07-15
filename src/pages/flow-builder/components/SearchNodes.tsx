import { Badge, Input, InputGroup } from "@chakra-ui/react";
import { useColorModeValue } from "@components/ui/color-mode";
import {
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@components/ui/popover";
import { JSX, ReactNode, useContext, useMemo, useRef, useState } from "react";
import { BsChatLeftDots, BsRegex } from "react-icons/bs";
import { IoSearchSharp } from "react-icons/io5";
import {
  PiBracketsCurlyBold,
  PiEarBold,
  PiFile,
  PiFileVideoFill,
  PiFlowArrowBold,
} from "react-icons/pi";
import { TbHeadphones, TbNumber123, TbTags, TbTextSize } from "react-icons/tb";
import { TypesNodes } from "..";
import removeAccents from "remove-accents";
import { LiaHourglassHalfSolid, LiaListSolid } from "react-icons/lia";
import {
  MdInsights,
  MdOutlineImage,
  MdOutlineNotificationsActive,
} from "react-icons/md";
import { VscDebugStop, VscMic } from "react-icons/vsc";
import {
  LuBrainCircuit,
  LuBriefcaseBusiness,
  LuMessageCircleHeart,
  LuNotepadText,
} from "react-icons/lu";
import { FaCrown } from "react-icons/fa";
import { AuthContext } from "@contexts/auth.context";
import { GiDirectionSigns } from "react-icons/gi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { HiOutlineUserGroup } from "react-icons/hi";
import useStore from "../flowStore";
import { HiOutlineQueueList } from "react-icons/hi2";
import { CgCalculator } from "react-icons/cg";

export function SearchNodesComponents(): JSX.Element {
  const {
    account: { isPremium },
  } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const bg = useColorModeValue("#ffffffd8", "#252525d5");
  const [search, setSearch] = useState("");
  const setTypeDrag = useStore((s) => s.setTypeDrag);

  const onDragStart = (event: any, nodeType: TypesNodes) => {
    setTypeDrag(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const nodeListFilter = useMemo(() => {
    if (!search.length) return nodesList;

    const normalizedSearch = removeAccents(search.toLowerCase());

    return nodesList.filter((node) => {
      const normalizedName = removeAccents(node.name.toLowerCase());
      const normalizedDescription = node.description
        ? removeAccents(node.description.toLowerCase())
        : "";

      return (
        normalizedName.includes(normalizedSearch) ||
        normalizedDescription.includes(normalizedSearch)
      );
    });
  }, [search]);

  return (
    <PopoverRoot
      autoFocus={false}
      open={open}
      onOpenChange={(s) => setOpen(s.open)}
      onExitComplete={() => setSearch("")}
      unmountOnExit
      lazyMount
    >
      <PopoverTrigger>
        <InputGroup
          endElement={
            <IoSearchSharp
              size={16}
              className="!text-[#242424] dark:!text-[#f0f0f0c5]"
            />
          }
        >
          <Input
            ref={ref}
            size={"sm"}
            className="!text-[#1f1f1f] dark:placeholder:text-[#dadadac5] dark:!text-[#ffffff]  pointer-events-auto !bg-[#f5f5f5] dark:!bg-[#181616c5]"
            placeholder="Busque pelo node"
            fontSize={"14px"}
            w={"320px"}
            onChange={({ target }) => setSearch(target.value)}
            value={search}
          />
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent
        css={{ "--popover-bg": bg }}
        w={"320px"}
        h={"100vh"}
        className="scroll-hidden overflow-y-scroll backdrop-blur-xs duration-300"
      >
        {!search.length && (
          <PopoverHeader
            paddingX={"20px"}
            paddingTop={"15px"}
            paddingBottom={"5px"}
          >
            <PopoverTitle className="font-medium text-base">
              Todos os nodes
            </PopoverTitle>
          </PopoverHeader>
        )}
        <PopoverBody paddingX={"8px"} paddingTop={"10px"}>
          <ul>
            {nodeListFilter.map((node) => (
              <li
                className={`${!isPremium && node.premium ? "" : "dndnode cursor-grab dark:hover:bg-zinc-700/40 hover:bg-zinc-300/50"} flex min-h-[52px] items-center gap-3.5 select-none p-1.5 rounded-lg px-3`}
                onDragStart={(event) => {
                  if (!isPremium && node.premium) return;
                  onDragStart(event, node.type);
                }}
                draggable={isPremium ? true : !node.premium}
                key={node.type}
              >
                <div className="relative">
                  {!isPremium && node.premium && (
                    <FaCrown
                      color={"#ffc444"}
                      className="absolute -top-3 -left-3"
                      size={17}
                    />
                  )}
                  {node.icon}
                </div>
                <div>
                  <span className="font-medium">
                    {node.name}{" "}
                    <Badge colorPalette={"green"} hidden={!node.new}>
                      New
                    </Badge>
                  </span>
                  {node.description && (
                    <p className="font-light dark:text-white/65 text-black/65">
                      {node.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
}

const nodesList: {
  name: string;
  description?: string;
  icon: ReactNode;
  type: TypesNodes;
  new?: boolean;
  premium?: boolean;
}[] = [
  {
    icon: (
      <TbTextSize className="dark:text-teal-400 text-teal-700 w-8" size={31} />
    ),
    name: "Enviar texto",
    description: "Envie vários balões de texto",
    type: "NodeMessage",
  },
  {
    icon: (
      <HiOutlineUserGroup
        className="dark:text-teal-600 text-teal-800 w-8"
        size={31}
      />
    ),
    name: "Enviar mensagem para grupo",
    description: "Envie vários balões de texto para um grupo",
    type: "NodeSendTextGroup",
    new: true,
    premium: true,
  },
  {
    icon: (
      <LiaHourglassHalfSolid
        className="dark:text-zinc-400 text-zinc-700 w-8"
        size={31}
      />
    ),
    name: "Aguardar tempo",
    description: "Pausa o fluxo por um tempo",
    type: "NodeTimer",
  },
  {
    icon: (
      <MdInsights className="dark:text-blue-600 text-blue-800 w-8" size={27} />
    ),
    name: "Rastrear pixel de conversão",
    description: "Rastreia evento do Facebook Pixel",
    type: "NodeFbPixel",
    new: true,
    premium: true,
  },
  {
    icon: (
      <LiaListSolid
        className="dark:text-purple-400 text-purple-700 w-8"
        size={31}
      />
    ),
    name: "Menu",
    description: "Envia um menu de opções",
    type: "NodeMenu",
  },
  {
    icon: (
      <BsChatLeftDots
        className="dark:text-blue-400 text-blue-700 w-8"
        size={26.8}
      />
    ),
    name: "Receber resposta",
    description: "Espera a resposta do lead",
    type: "NodeReply",
  },
  {
    icon: <GiDirectionSigns className="dark:text-white/70 w-8" size={27} />,
    name: "Switch de variável",
    description: "Verifica e direciona o fluxo",
    type: "NodeSwitchVariable",
    new: true,
  },
  {
    icon: (
      <LuBriefcaseBusiness
        className="dark:text-neutral-300 text-neutral-800 w-8"
        size={27}
      />
    ),
    name: "Transferir para departamento",
    description: "Transfere a conversa para um departamento",
    type: "NodeTransferDepartment",
    new: true,
  },
  {
    icon: (
      <PiFile className="dark:text-[#999999] text-teal-700 w-8" size={31} />
    ),
    name: "Enviar documentos",
    description: "Envie vários documentos",
    type: "NodeSendFiles",
    new: true,
  },
  {
    icon: (
      <MdOutlineImage
        className="dark:text-[#6daebe] text-teal-700 w-8"
        size={31}
      />
    ),
    name: "Enviar imagens",
    description: "Envie várias imagens",
    type: "NodeSendImages",
    new: true,
  },
  {
    icon: (
      <PiFileVideoFill
        className="dark:text-[#8eb87a] text-teal-700 w-8"
        size={31}
      />
    ),
    name: "Enviar vídeos",
    description: "Envie vários vídeos",
    type: "NodeSendVideos",
    new: true,
  },
  {
    icon: (
      <VscMic className="dark:text-[#0dacd4] text-teal-700 w-8" size={31} />
    ),
    name: "Enviar áudios gravados",
    description: "Envie áudios como se fossem grava...",
    type: "NodeSendAudiosLive",
    new: true,
    premium: true,
  },
  {
    icon: (
      <TbHeadphones
        className="dark:text-[#daa557] text-teal-700 w-8"
        size={31}
      />
    ),
    name: "Enviar áudios",
    description: "Envie vários áudios",
    type: "NodeSendAudios",
    new: true,
  },
  {
    icon: (
      <TbTags className="dark:text-green-300 text-green-800 w-8" size={29} />
    ),
    name: "Adicionar etiquetas",
    description: "Adicione várias tags/etiquetas",
    type: "NodeAddTags",
  },
  {
    icon: <BsRegex className="dark:text-white/70 w-8" size={29} />,
    name: "Extrair da variável",
    description: "Extrai texto de uma variável para outra com regex",
    type: "NodeExtractVariable",
    new: true,
    premium: true,
  },
  {
    icon: (
      <PiBracketsCurlyBold
        className="dark:text-green-300 text-green-800 w-8"
        size={29}
      />
    ),
    name: "Adicionar variáveis",
    description: "Atribua/Sobrescreva várias variáveis",
    type: "NodeAddVariables",
  },
  {
    icon: <TbTags className="dark:text-red-300 text-red-800 w-8" size={29} />,
    name: "Remover etiquetas",
    description: "Remova várias tags/etiquetas",
    type: "NodeRemoveTags",
  },
  {
    icon: (
      <MdOutlineNotificationsActive
        className="dark:text-green-500 text-green-600 w-8"
        size={29}
      />
    ),
    name: "Notificar WhatsApps",
    description: "Notifique números de WhatsApp",
    type: "NodeNotifyWA",
    new: true,
    premium: true,
  },
  {
    icon: (
      <div className="relative">
        <PiEarBold
          className="dark:text-white translate-x-1 text-black/70"
          size={26.8}
        />
        <LuMessageCircleHeart
          className="dark:text-red-300 absolute top-4 left-[1px] text-black/70"
          size={13}
        />
      </div>
    ),
    name: "Escutar reações",
    description:
      "Escuta reações de mensagens enviadas pela conexão WA do fluxo.",
    type: "NodeListenReaction",
    new: true,
    premium: true,
  },
  {
    icon: (
      <PiBracketsCurlyBold
        className="dark:text-red-300 text-red-800 w-8"
        size={29}
      />
    ),
    name: "Remover variáveis",
    description: "Remova várias variáveis",
    type: "NodeRemoveVariables",
  },
  {
    icon: (
      <RiMoneyDollarCircleLine className="dark:text-white/70 w-8" size={31} />
    ),
    name: "Gerar cobrança",
    description: "Cria cobrança e fica monitorando os status do pagamento",
    type: "NodeCharge",
    new: true,
    premium: true,
  },
  {
    icon: (
      <PiFlowArrowBold
        className="dark:text-neutral-300 text-neutral-800 w-8"
        size={27}
      />
    ),
    name: "Enviar fluxos",
    description: "Envie para outro fluxo de conversa",
    type: "NodeSendFlow",
  },
  {
    icon: (
      <LuBrainCircuit
        className="dark:text-teal-600 text-teal-600 w-8"
        size={31}
      />
    ),
    name: "Chama agente IA",
    description: "Chama um agente de IA",
    type: "NodeAgentAI",
    new: true,
    premium: true,
  },
  {
    icon: (
      <div className="p-[1px] translate-y-0.5 text-sm w-8 font-bold dark:text-yellow-300 text-yellow-600">
        {"if (..)"}
      </div>
    ),
    name: "Condição lógica",
    description: "Crie condições IF..else 'E' - 'OU'",
    type: "NodeIF",
  },
  {
    icon: (
      <TbNumber123 className="dark:text-white/70 text-black/70 w-8" size={31} />
    ),
    name: "Código randômico",
    description: "Gera código numérico randômico",
    type: "NodeRandomCode",
    new: true,
  },
  {
    icon: (
      <LuNotepadText
        className="dark:text-green-400 text-green-700 w-8"
        size={31}
      />
    ),
    name: "Criar pedido",
    description: "Cria um novo pedido/ordem",
    type: "NodeCreateOrder",
    new: true,
    premium: true,
  },
  {
    icon: (
      <LuNotepadText
        className="dark:text-blue-400 text-blue-700 w-8"
        size={31}
      />
    ),
    name: "Atualizar pedido",
    description: "Atualiza um pedido/ordem",
    type: "NodeUpdateOrder",
    new: true,
    premium: true,
  },
  {
    icon: (
      <HiOutlineQueueList
        className="dark:text-zinc-100 text-zinc-800 w-8"
        size={31}
      />
    ),
    name: "Fila temporizada",
    description: "Cria uma fila temporizada de anti-repique",
    type: "NodeTimedQueue",
    new: true,
  },
  {
    icon: <CgCalculator className="dark:text-white text-black w-8" size={31} />,
    name: "Calculadora",
    description: "Faz cálculos matemáticos",
    type: "NodeCalculator",
    new: true,
  },
  {
    icon: (
      <VscDebugStop
        className="dark:text-zinc-100 text-zinc-800 w-8"
        size={31}
      />
    ),
    name: "Finaliza fluxo",
    description: "Encerra o fluxo de atendimento",
    type: "NodeFinish",
  },
];
