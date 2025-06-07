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
import { BsChatLeftDots } from "react-icons/bs";
import { IoSearchSharp } from "react-icons/io5";
import {
  PiBracketsCurlyBold,
  PiFile,
  PiFileVideoFill,
  PiFlowArrowBold,
} from "react-icons/pi";
import { TbHeadphones, TbTags, TbTextSize } from "react-icons/tb";
import { TypesNodes } from "..";
import { DnDContext } from "@contexts/DnD.context";
import removeAccents from "remove-accents";
import { LiaHourglassHalfSolid, LiaListSolid } from "react-icons/lia";
import { MdOutlineImage, MdOutlineNotificationsActive } from "react-icons/md";
import { VscMic } from "react-icons/vsc";

export function SearchNodesComponents(): JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);
  const bg = useColorModeValue("#ffffffd8", "#252525d5");
  const [search, setSearch] = useState("");
  const { setType } = useContext(DnDContext);

  const onDragStart = (event: any, nodeType: TypesNodes) => {
    setType(nodeType);
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
                key={node.id}
                className="dndnode flex min-h-[52px] items-center gap-3.5 select-none cursor-grab dark:hover:bg-zinc-700/40 hover:bg-zinc-300/50 p-1.5 rounded-lg px-3"
                onDragStart={(event) => {
                  onDragStart(event, node.type);
                }}
                draggable
              >
                {node.icon}
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
  id: string;
  type: TypesNodes;
  new?: boolean;
}[] = [
  {
    icon: (
      <TbTextSize className="dark:text-teal-400 text-teal-700 w-8" size={31} />
    ),
    name: "Enviar texto",
    description: "Envie vários balões de texto",
    id: "1",
    type: "NodeMessage",
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
    id: "2",
    type: "NodeTimer",
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
    id: "3",
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
    id: "4",
    type: "NodeReply",
  },
  {
    icon: (
      <PiFile className="dark:text-[#999999] text-teal-700 w-8" size={31} />
    ),
    name: "Enviar documentos",
    description: "Envie vários documentos",
    id: "5",
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
    id: "6",
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
    id: "7",
    type: "NodeSendVideos",
    new: true,
  },
  {
    icon: (
      <VscMic className="dark:text-[#0dacd4] text-teal-700 w-8" size={31} />
    ),
    name: "Enviar áudios gravados",
    description: "Envie áudios como se fossem grava...",
    id: "8",
    type: "NodeSendAudiosLive",
    new: true,
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
    id: "9",
    type: "NodeSendAudios",
    new: true,
  },
  {
    icon: (
      <TbTags className="dark:text-green-300 text-green-800 w-8" size={29} />
    ),
    name: "Adicionar etiquetas",
    description: "Adicione várias tags/etiquetas",
    id: "10",
    type: "NodeAddTags",
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
    id: "11",
    type: "NodeAddVariables",
  },
  {
    icon: <TbTags className="dark:text-red-300 text-red-800 w-8" size={29} />,
    name: "Remover etiquetas",
    description: "Remova várias tags/etiquetas",
    id: "12",
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
    id: "13",
    type: "NodeNotifyWA",
    new: true,
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
    id: "14",
    type: "NodeRemoveVariables",
  },
  {
    icon: (
      <PiFlowArrowBold
        className="dark:text-neutral-300 text-neutral-800 w-8"
        size={27}
      />
    ),
    name: "Enviar fluxos",
    description: "Envie outro fluxo de conversa",
    id: "15",
    type: "NodeSendFlow",
  },
  {
    icon: (
      <div className="p-[1px] translate-y-0.5 text-sm w-8 font-bold dark:text-yellow-300 text-yellow-600">
        {"if (..)"}
      </div>
    ),
    name: "Condição lógica",
    description: "Crie condições IF..else 'E' - 'OU'",
    id: "16",
    type: "NodeIF",
  },
];
