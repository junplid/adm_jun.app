import { Badge, Input, InputGroup } from "@chakra-ui/react";
import {
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@components/ui/popover";
import { JSX, ReactNode, useMemo, useRef, useState } from "react";
import { BsChatLeftDots, BsRegex, BsStars } from "react-icons/bs";
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
  // MdInsights,
  MdOutlineImage,
  MdOutlineNotificationsActive,
} from "react-icons/md";
import { VscDebugStop, VscMic } from "react-icons/vsc";
import {
  LuBriefcaseBusiness,
  LuCalendarDays,
  LuMessageCircleHeart,
  LuNotepadText,
} from "react-icons/lu";
import { FaRandom } from "react-icons/fa";
import { GiDirectionSigns } from "react-icons/gi";
import { RiMoneyDollarCircleLine, RiTrelloLine } from "react-icons/ri";
import { HiOutlineUserGroup } from "react-icons/hi";
import useStore from "../flowStore";
import { HiOutlineQueueList } from "react-icons/hi2";
import { CgCalculator } from "react-icons/cg";

export function SearchNodesComponents(): JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
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
          endElement={<IoSearchSharp size={16} className="text-[#f0f0f0c5]!" />}
        >
          <Input
            ref={ref}
            size={"sm"}
            className="text-[#ffffff]! placeholder:text-[#dadadac5] pointer-events-auto bg-[#181616c5]!"
            placeholder="Busque pelo node"
            fontSize={"14px"}
            w={"210px"}
            onChange={({ target }) => setSearch(target.value)}
            value={search}
          />
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent
        css={{ "--popover-bg": "#252525d5" }}
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
                // className={`${!isPremium && node.premium ? "" : ""} flex min-h-13 items-center gap-3.5 select-none p-1.5 rounded-lg px-3`}
                className={`dndnode cursor-grab dark:hover:bg-zinc-700/40 hover:bg-zinc-300/50 flex min-h-13 items-center gap-3.5 select-none p-1.5 rounded-lg px-3`}
                onDragStart={(event) => {
                  // if (!isPremium && node.premium) return;
                  onDragStart(event, node.type);
                }}
                // draggable={isPremium ? true : !node.premium}
                draggable
                key={node.type}
              >
                <div className="relative">
                  {/* {!isPremium && node.premium && (
                    <FaCrown
                      color={"#ffc444"}
                      className="absolute -top-3 -left-3"
                      size={17}
                    />
                  )} */}
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
                    <p className="font-light text-white/65">
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
    icon: <TbTextSize className="text-teal-400 w-8" size={31} />,
    name: "Enviar texto",
    description: "Envie vários balões de texto",
    type: "NodeMessage",
  },
  {
    icon: <HiOutlineUserGroup className="text-teal-600 w-8" size={31} />,
    name: "Enviar mensagem para grupo",
    description: "Envie vários balões de texto para um grupo",
    type: "NodeSendTextGroup",
    new: false,
    premium: true,
  },
  {
    icon: <LiaHourglassHalfSolid className="text-zinc-400 w-8" size={31} />,
    name: "Aguardar tempo",
    description: "Pausa o fluxo por um tempo",
    type: "NodeTimer",
  },
  // {
  //   icon: <MdInsights className="text-blue-600 w-8" size={27} />,
  //   name: "Rastrear pixel de conversão",
  //   description: "Rastreia evento do Facebook Pixel",
  //   type: "NodeFbPixel",
  //   new: false,
  //   premium: true,
  // },
  {
    icon: <LiaListSolid className="text-purple-400 w-8" size={31} />,
    name: "Menu",
    description: "Envia um menu de opções",
    type: "NodeMenu",
  },
  {
    icon: <BsChatLeftDots className="text-blue-400 w-8" size={26.8} />,
    name: "Receber resposta",
    description: "Espera a resposta do lead",
    type: "NodeReply",
  },
  {
    icon: <GiDirectionSigns className="text-white/70 w-8" size={27} />,
    name: "Switch de variável",
    description: "Verifica e direciona o fluxo",
    type: "NodeSwitchVariable",
    new: false,
  },
  {
    icon: <LuBriefcaseBusiness className="text-neutral-300 w-8" size={27} />,
    name: "Transferir para departamento",
    description: "Transfere a conversa para um departamento",
    type: "NodeTransferDepartment",
    new: false,
  },
  {
    icon: <PiFile className="text-[#999999] w-8" size={31} />,
    name: "Enviar documentos",
    description: "Envie vários documentos",
    type: "NodeSendFiles",
    new: false,
  },
  {
    icon: <MdOutlineImage className="text-[#6daebe] w-8" size={31} />,
    name: "Enviar imagens",
    description: "Envie várias imagens",
    type: "NodeSendImages",
    new: false,
  },
  {
    icon: <PiFileVideoFill className="text-[#8eb87a] w-8" size={31} />,
    name: "Enviar vídeos",
    description: "Envie vários vídeos",
    type: "NodeSendVideos",
    new: false,
  },
  {
    icon: <VscMic className="text-[#0dacd4] w-8" size={31} />,
    name: "Enviar áudios gravados",
    description: "Envie áudios como se fossem grava...",
    type: "NodeSendAudiosLive",
    new: false,
    premium: true,
  },
  {
    icon: <TbHeadphones className="text-[#daa557] w-8" size={31} />,
    name: "Enviar áudios",
    description: "Envie vários áudios",
    type: "NodeSendAudios",
    new: false,
  },
  {
    icon: <TbTags className="text-green-300 w-8" size={29} />,
    name: "Adicionar etiquetas",
    description: "Adicione várias tags/etiquetas",
    type: "NodeAddTags",
  },
  {
    icon: <BsRegex className="text-white/70 w-8" size={29} />,
    name: "Extrair da variável",
    description: "Extrai texto de uma variável para outra com regex",
    type: "NodeExtractVariable",
    new: false,
    premium: true,
  },
  {
    icon: <PiBracketsCurlyBold className="text-green-300 w-8" size={29} />,
    name: "Adicionar variáveis",
    description: "Atribua/Sobrescreva várias variáveis",
    type: "NodeAddVariables",
  },
  {
    icon: <TbTags className="text-red-300 w-8" size={29} />,
    name: "Remover etiquetas",
    description: "Remova várias tags/etiquetas",
    type: "NodeRemoveTags",
  },
  {
    icon: (
      <MdOutlineNotificationsActive className="text-green-500 w-8" size={29} />
    ),
    name: "Notificar WhatsApp",
    description: "Notifique números de WhatsApp",
    type: "NodeNotifyWA",
    new: false,
    premium: true,
  },
  {
    icon: (
      <div className="relative">
        <PiEarBold className="translate-x-1 text-white" size={26.8} />
        <LuMessageCircleHeart
          className="absolute top-4 left-px text-red-300"
          size={13}
        />
      </div>
    ),
    name: "Escutar reações",
    description:
      "Escuta reações de mensagens enviadas pela conexão WA do fluxo.",
    type: "NodeListenReaction",
    new: false,
    premium: true,
  },
  {
    icon: <PiBracketsCurlyBold className="text-red-300 w-8" size={29} />,
    name: "Remover variáveis",
    description: "Remova várias variáveis",
    type: "NodeRemoveVariables",
  },
  {
    icon: <RiMoneyDollarCircleLine className="text-white/70 w-8" size={31} />,
    name: "Gerar cobrança",
    description: "Cria cobrança e fica monitorando os status do pagamento",
    type: "NodeCharge",
    new: false,
    premium: true,
  },
  {
    icon: <PiFlowArrowBold className="text-neutral-300 w-8" size={27} />,
    name: "Enviar fluxos",
    description: "Envie para outro fluxo de conversa",
    type: "NodeSendFlow",
  },
  {
    icon: <BsStars className="text-teal-600 w-8" size={31} />,
    name: "Chamar assistente de IA",
    description: "Chama um assistente de IA",
    type: "NodeAgentAI",
    new: false,
    premium: true,
  },
  {
    icon: (
      <div className="p-px translate-y-0.5 text-sm w-8 font-bold text-yellow-300">
        {"if (..)"}
      </div>
    ),
    name: "Condição lógica",
    description: "Crie condições IF..else 'E' - 'OU'",
    type: "NodeIF",
  },
  {
    icon: <TbNumber123 className="text-white/70 w-8" size={31} />,
    name: "Código randômico",
    description: "Gera código numérico randômico",
    type: "NodeRandomCode",
    new: false,
  },
  {
    icon: <LuNotepadText className="text-green-400 w-8" size={31} />,
    name: "Criar pedido",
    description: "Cria um novo pedido/ordem",
    type: "NodeCreateOrder",
    new: false,
    premium: true,
  },
  {
    icon: <LuNotepadText className="text-blue-400 w-8" size={31} />,
    name: "Atualizar pedido",
    description: "Atualiza um pedido/ordem",
    type: "NodeUpdateOrder",
    new: false,
    premium: true,
  },
  {
    icon: <LuCalendarDays className="text-green-400 w-8" size={31} />,
    name: "Agendar evento",
    description: "Agenda um novo evento",
    type: "NodeCreateAppointment",
    new: false,
    premium: true,
  },
  {
    icon: <LuCalendarDays className="text-blue-400 w-8" size={31} />,
    name: "Atualizar evento",
    description: "Atualiza um evento",
    type: "NodeUpdateAppointment",
    new: false,
    premium: true,
  },
  {
    icon: <HiOutlineQueueList className="text-zinc-100 w-8" size={31} />,
    name: "Fila temporizada",
    description: "Cria uma fila temporizada de antirrepique",
    type: "NodeTimedQueue",
    new: false,
  },
  {
    icon: <CgCalculator className="text-white w-8" size={31} />,
    name: "Calculadora",
    description: "Faz cálculos matemáticos",
    type: "NodeCalculator",
    new: false,
  },
  {
    icon: <RiTrelloLine className="text-green-400 w-8" size={31} />,
    name: "Adicionar card no Trello",
    description: "Adiciona um novo card no Trello",
    type: "NodeAddTrelloCard",
    new: false,
    premium: true,
  },
  {
    icon: <RiTrelloLine className="text-red-400 w-8" size={31} />,
    name: "Remover card no Trello",
    description: "Remove um card da lista do Trello",
    type: "NodeRemoveTrelloCard",
    new: false,
    premium: true,
  },
  {
    icon: <RiTrelloLine className="text-blue-400 w-8" size={31} />,
    name: "Atualizar card no Trello",
    description: "Atualiza card do Trello",
    type: "NodeUpdateTrelloCard",
    new: false,
    premium: true,
  },
  {
    icon: <RiTrelloLine className="text-yellow-400 w-8" size={31} />,
    name: "Mover card no Trello",
    description: "Mova um card do Trello",
    type: "NodeMoveTrelloCard",
    new: false,
    premium: true,
  },
  {
    icon: <RiTrelloLine className="text-white w-8" size={31} />,
    name: "Webhook card do Trello",
    description: "Escuta mudanças de lista do card",
    type: "NodeWebhookTrelloCard",
    new: false,
    premium: true,
  },
  {
    icon: <TbTextSize className="text-red-600" size={31} />,
    name: "Deletar mensagem",
    description: "Deleta mensagem em grupo ou privado",
    type: "NodeDeleteMessage",
    new: false,
  },
  {
    icon: <FaRandom className="text-purple-400" size={31} />,
    name: "Node Distribuidor",
    description: "Distribui aleatoriamente",
    type: "NodeDistribute",
    new: false,
  },
  {
    icon: <VscDebugStop className="text-zinc-100 w-8" size={31} />,
    name: "Finaliza fluxo",
    description: "Encerra o fluxo de atendimento",
    type: "NodeFinish",
  },
];
