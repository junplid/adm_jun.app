import { Box, Button, IconButton, Presence, Spinner } from "@chakra-ui/react";
import { Avatar } from "@components/ui/avatar";
import moment, { Moment } from "moment";
import {
  FC,
  JSX,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { api } from "../../../../../services/api";
import AudioSpeekPlayerWA from "@components/AudioSpeekPlayerWA";
import {
  RiDownload2Line,
  RiEmojiStickerLine,
  RiSendPlane2Line,
} from "react-icons/ri";
import useDownloader from "react-use-downloader";
import TextareaAutosize from "react-textarea-autosize";
import { format } from "@flasd/whatsapp-formatting";
import parse from "html-react-parser";
import { PlayerContext } from "./context";
import {
  getTicket,
  sendTicketMessage,
} from "../../../../../services/api/Ticket";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../../../../services/api/ErrorResponse";
import { AuthContext } from "@contexts/auth.context";
import { toaster } from "@components/ui/toaster";
import dataEmojis from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const background = {
  system: "#5c3600cd",
  contact: "#202024",
  user: "#30573c",
};

type MessageType = {
  type: "text";
  text: string;
  id: number;
  createAt: Date;
};

interface Ticket {
  id: number;
  inboxDepartmentId: number;
  inboxUserId: number | null;
  status: "NEW" | "OPEN" | "RESOLVED" | "DELETED";
  contact: { name: string; completeNumber: string };
  messages: {
    content: MessageType;
    by: "contact" | "user" | "system";
    // number: string;
    // id: number;
    // createAt: Date;
    // inboxUserId: number | null;
    // name: string;
    // type: string;
    // by: "contact" | "user" | "system";
    // latitude: string;
    // longitude: string;
    // address: string;
    // fileName: string;
    // caption: string;
    // fullName: string;
    // message: string;
    // org: string;
  }[];
}

interface PropsSocketMessage {
  ticketId: number;
  by: "contact" | "user" | "system";
  content: MessageType;
  notifyMsc?: boolean;
  notifyToast?: boolean;
  departmentId: number;
  userId?: number; // caso seja enviado para um usuário.
  lastInteractionDate: Date;
}

export const ChatPlayer: FC = () => {
  const { logout } = useContext(AuthContext);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [data, setData] = useState<Ticket | null>(null);
  const [load, setLoad] = useState(true);
  const [loadMsg, setLoadMsg] = useState(false);
  const [text, setText] = useState("");
  const { pick, currentTicket, socket } = useContext(PlayerContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [openEmojis, setOpenEmojis] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const caretRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const rememberCaret = () => {
    const el = textareaRef.current;
    if (!el) return;
    caretRef.current = { start: el.selectionStart, end: el.selectionEnd };
  };
  function insertEmojiAtCaret(emoji: string) {
    const el = textareaRef.current;
    if (!el) return;

    // 1. Captura a posição atual
    const { selectionStart: start, selectionEnd: end } = el;

    /* 2. Insere o emoji no DOM.
          O quarto argumento diz o que fazer com o caret:
          - "end"      → caret depois do emoji  (o mais comum)
          - "start"    → caret antes do emoji
          - "select"   → emoji fica selecionado
          - "preserve" → caret/seleção ficam onde estavam, só que
                         deslocados pelo tamanho do emoji
     */
    el.setRangeText(emoji, start, end, "end");

    // 3. Atualiza o estado **com o valor já editado**
    setText(el.value);

    // 4. Garante foco (se o picker tirou)
    el.focus();
  }

  useEffect(() => {
    if (currentTicket) {
      (async () => {
        try {
          const ticket = await getTicket(currentTicket);
          setData(ticket);
          setTimeout(() => {
            virtuosoRef.current?.scrollToIndex({
              index: ticket.messages.length - 1,
              align: "end",
              behavior: "auto",
            });
          }, 100);
          setLoad(false);
        } catch (error) {
          if (error instanceof AxiosError) {
            setLoad(false);
            if (error.response?.status === 401) logout();
            if (error.response?.status === 400) {
              const dataError = error.response?.data as ErrorResponse_I;
              if (dataError.toast.length)
                dataError.toast.forEach(toaster.create);
            }
          }
        }
      })();

      socket.on("message", (data: PropsSocketMessage) => {
        if (data.ticketId !== currentTicket) {
          if (data.notifyMsc) {
            // enviar notificação para o usuário
          }
          return;
        }
        if (data.by === "user") {
          requestAnimationFrame(() => {
            textareaRef.current?.focus();
          });
          textareaRef.current?.focus();
          setLoadMsg(false);
          setText("");
        }
        setData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              { by: data.by, content: data.content },
            ],
          };
        });
      });
    }
  }, [currentTicket, socket]);

  const sendMessage = async (message: string) => {
    if (!data || !message.trim() || !currentTicket) return;
    setLoadMsg(true);
    try {
      if (data.status === "NEW") await pick(data.id);
      await sendTicketMessage(currentTicket, { text: message.trim() });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
        }
      }
    }
  };

  if (!currentTicket) {
    return (
      <div className="h-full grid place-items-center">
        <span className="text-white/70 text-sm">
          Selecione um ticket para iniciar o atendimento.
        </span>
      </div>
    );
  }

  if (load) {
    return (
      <div className="h-full grid place-items-center">
        <span className="text-white/70 text-sm">
          Carregando informações do ticket...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full grid place-items-center">
        <span className="text-red-500/70 text-sm">Ticket não encontrado!</span>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-rows-[48px_1fr_minmax(48px,auto)] gap-2">
      <div className="flex justify-between">
        <div className="flex items-center gap-x-2">
          <Avatar size={"sm"} bg={"#555555"} width={"40px"} height={"40px"} />
          <div className="flex flex-col">
            <span className="font-medium">Nome</span>
            <span className="text-sm text-white/60">719999999999</span>
          </div>
        </div>
        <div className="flex gap-x-2">
          <span className="text-xs text-white/30">Ações:</span>
          <Button size={"xs"} variant={"outline"}>
            Devolver para aguardando
          </Button>
          <Button size={"xs"} colorPalette={"green"} variant={"subtle"}>
            Resolver
          </Button>
        </div>
      </div>
      <Box
        backgroundImage={`linear-gradient(45deg, #111111f8, #111111fd), url('/background-chat.png')`}
        borderRadius={"8px"}
        backgroundSize={"cover"}
      >
        <div className="p-2 h-full flex flex-col">
          <Virtuoso
            ref={virtuosoRef}
            data={data.messages}
            className="scroll-custom-table"
            followOutput="smooth"
            itemContent={(_, msg) => {
              if (msg.content.type === "text") {
                return (
                  <TextBubbleComponent
                    message={msg.content.text}
                    createAt={moment(msg.content.createAt)}
                    isArrow={msg.by === "contact"}
                    sentBy={msg.by}
                  />
                );
              }

              return (
                <FileBubbleComponent
                  fileName={`file-${msg}.txt`}
                  caption={`Caption do arquivo ${msg}`}
                  // isArrow={msg === 1 ? true : false}
                  createAt={moment("2023-10-01T12:00:00Z")}
                  sentBy="contact"
                />
              );
            }}
          />
        </div>
      </Box>
      <div className="flex flex-col w-full">
        <form
          className="flex gap-x-2 relative"
          onSubmit={async (event) => {
            event.preventDefault();
            sendMessage(text);
          }}
        >
          <Presence
            animationName={{
              _open: "slide-from-bottom, fade-in",
              _closed: "slide-to-bottom, fade-out",
            }}
            animationDuration="moderate"
            present={openEmojis}
            position={"absolute"}
            top={"-438px"}
          >
            <Picker
              data={dataEmojis}
              onClickOutside={(ev: any) => {
                if (btnRef.current?.contains(ev.target as Node)) return;
                setOpenEmojis(false);
              }}
              onEmojiSelect={(e: any) => e && insertEmojiAtCaret(e.native)}
              perLine={6}
              autoFocus
              locale="pt"
              maxFrequentRows={2}
              emojiSize={16}
              skinTonePosition="search"
              theme="dark"
              previewPosition="none"
            />
          </Presence>
          <IconButton
            ref={btnRef}
            type="button"
            variant="ghost"
            onPointerDown={(e) => e.stopPropagation()} // <- bloqueia o outside-click
            onClick={() => setOpenEmojis(true)}
          >
            <RiEmojiStickerLine />
          </IconButton>
          <TextareaAutosize
            placeholder="Digite {{ para variaveis abrir menu de variaveis"
            style={{ resize: "none" }}
            minRows={1}
            maxRows={8}
            ref={textareaRef}
            autoFocus
            className="p-3 py-2.5 rounded-sm w-full outline-none border-black/10 dark:border-white/10 border"
            disabled={
              loadMsg || data.status === "RESOLVED" || data.status === "DELETED"
            }
            value={text}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(text);
              }
            }}
            onChange={(e) => setText(e.target.value)}
            onKeyUp={rememberCaret}
            onClick={rememberCaret}
            onSelect={rememberCaret}
          />
          <IconButton
            type="submit"
            variant="subtle"
            disabled={data.status === "RESOLVED" || data.status === "DELETED"}
            loading={loadMsg}
          >
            <RiSendPlane2Line />
          </IconButton>
        </form>
        {data.status === "NEW" && (
          <span className="text-white/80">
            Ticket{" "}
            <strong className="uppercase text-[#f19e55]">aguardando</strong> .
            Ao interagir com ele, você assume o atendimento.
          </span>
        )}
        {data.status === "DELETED" && (
          <span className="text-white/80">
            Ticket{" "}
            <strong className="uppercase text-[#dd4843]">deletado</strong> .
            Será totalmente removido do sistema em breve.
          </span>
        )}
        {data.status === "RESOLVED" && (
          <span className="text-white/80 text-[13px]">
            Ticket{" "}
            <strong className="uppercase text-[#6ccf6c]">RESOLVIDO</strong> .
            Estamos trabalhando para possibilitar a retomada do atendimento.
          </span>
        )}
      </div>
    </div>
  );
};

export const TextBubbleComponent: FC<{
  message: string;
  createAt: Moment;
  isArrow?: boolean;
  sentBy: "contact" | "user" | "system";
}> = ({ message, createAt, sentBy, isArrow }): JSX.Element => {
  const time = useMemo(() => {
    if (Math.abs(moment(createAt).diff(moment(), "day")) > 0) {
      return moment(createAt).format("DD/MM/YYYY HH:mm");
    }
    return moment(createAt).format("HH:mm");
  }, [createAt]);

  return (
    <div
      className={`w-full flex ${
        sentBy === "contact" ? "justify-start" : "justify-end"
      }`}
      style={{ paddingTop: isArrow ? 15 : 3 }}
    >
      {sentBy === "contact" && isArrow && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "0px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: `6px solid ${background[sentBy]}`,
          }}
        />
      )}
      <div
        className="shadow-md shadow-black/25 max-w-1/2"
        style={{
          background: background[sentBy],
          padding: "4px 8px",
          ...(sentBy === "contact"
            ? {
                borderRadius: `${isArrow ? "0px" : "5px"} 5px 5px`,
                marginLeft: !isArrow ? 6 : 0,
              }
            : {
                borderRadius: `5px ${isArrow ? "0px" : "5px"} 5px 5px`,
                marginRight: !isArrow ? 6 : 0,
              }),
        }}
      >
        <div className="flex flex-col">
          {sentBy === "system" && (
            <i className="text-xs font-semibold mb-1">
              Mensagem automática do sistema
            </i>
          )}
          <p>{parse(format(message))}</p>
          <small
            className={`pl-5 mt-1 text-white/70 leading-none block text-xs text-end`}
          >
            {time}
          </small>
        </div>
      </div>
      {sentBy !== "contact" && isArrow && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "0px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: `6px solid ${background[sentBy]}`,
          }}
        />
      )}
    </div>
  );
};

export const ImageBubbleComponent: FC<{
  fileName: string;
  createAt: Moment;
  isArrow?: boolean;
  caption?: string;
  sentBy: "contact" | "user" | "system";
}> = ({ fileName, createAt, isArrow, sentBy, caption }): JSX.Element => {
  const time = useMemo(() => {
    if (Math.abs(moment(createAt).diff(moment(), "day")) > 0) {
      return moment(createAt).format("DD/MM/YYYY HH:mm");
    }
    return moment(createAt).format("HH:mm");
  }, [createAt]);

  return (
    <div
      className={`w-full flex ${
        sentBy === "contact" ? "justify-start" : "justify-end"
      }`}
      style={{ paddingTop: isArrow ? 15 : 3 }}
    >
      {sentBy === "contact" && isArrow && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "0px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: `6px solid ${background[sentBy]}`,
          }}
        />
      )}
      <div
        className="shadow-md shadow-black/25 max-w-1/2"
        style={{
          background: background[sentBy],
          padding: "4px 4px 4px",
          ...(sentBy === "contact"
            ? {
                borderRadius: `${isArrow ? "0px" : "6px"} 6px 6px`,
                marginLeft: !isArrow ? 6 : 0,
              }
            : {
                borderRadius: `6px ${isArrow ? "0px" : "6px"} 6px 6px`,
                marginRight: !isArrow ? 6 : 0,
              }),
        }}
      >
        <div className="flex flex-col">
          {sentBy === "system" && (
            <i className="text-xs font-semibold mb-1">
              Mensagem automatica do sistema
            </i>
          )}
          <img
            className="max-w-[290px] rounded-md"
            src={`${api.getUri()}/public/images/${fileName}`}
            alt="imagem"
          />
          <div className="pt-1">
            {caption && (
              <p className="text-xs px-1 pb-1">{parse(format(caption))}</p>
            )}
            <small
              className={`pl-5 pr-1 text-white/70 leading-none block text-xs text-end`}
            >
              {time}
            </small>
          </div>
        </div>
      </div>
      {sentBy !== "contact" && isArrow && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "0px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: `6px solid ${background[sentBy]}`,
          }}
        />
      )}
    </div>
  );
};

export const AudioBubbleComponent: FC<{
  fileName: string;
  createAt: Moment;
  isArrow?: boolean;
  sentBy: "contact" | "user" | "system";
}> = ({ fileName, createAt, sentBy, isArrow }): JSX.Element => {
  const time = useMemo(() => {
    if (Math.abs(moment(createAt).diff(moment(), "day")) > 0) {
      return moment(createAt).format("DD/MM/YYYY HH:mm");
    }
    return moment(createAt).format("HH:mm");
  }, [createAt]);

  return (
    <div
      className={`w-full flex ${
        sentBy === "contact" ? "justify-start" : "justify-end"
      }`}
      style={{ paddingTop: isArrow ? 15 : 5 }}
    >
      <div className="max-w-72 w-full">
        <div className="flex flex-col w-full">
          {sentBy === "system" && (
            <i className="text-xs font-semibold mb-1">
              Mensagem automática do sistema
            </i>
          )}
          <AudioSpeekPlayerWA
            src={api.getUri() + "/public/storage/" + fileName}
          />
          <small
            className={`pl-5 mt-1 text-white/70 leading-none block text-xs text-end`}
          >
            {time}
          </small>
        </div>
      </div>
    </div>
  );
};

export const FileBubbleComponent: FC<{
  fileName: string;
  caption?: string;
  createAt: Moment;
  isArrow?: boolean;
  sentBy: "contact" | "user" | "system";
}> = ({ fileName, caption, createAt, sentBy, isArrow }): JSX.Element => {
  const { download, error, isInProgress } = useDownloader();

  useEffect(() => {
    if (error) {
      // toast("Não foi possível fazer o download!", {
      //   position: "top-right",
      //   autoClose: 4000,
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: false,
      //   draggable: true,
      //   progress: undefined,
      //   type: "error",
      //   theme: "dark",
      // });
    }
  }, [error]);

  const time = useMemo(() => {
    if (Math.abs(moment(createAt).diff(moment(), "day")) > 0) {
      return moment(createAt).format("DD/MM/YYYY HH:mm");
    }
    return moment(createAt).format("HH:mm");
  }, [createAt]);

  return (
    <div
      className={`w-full flex ${
        sentBy === "contact" ? "justify-start" : "justify-end"
      }`}
      style={{ paddingTop: isArrow ? 15 : 3 }}
    >
      {sentBy === "contact" && isArrow && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "0px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: `6px solid ${background[sentBy]}`,
          }}
        />
      )}
      <div
        className="shadow-md shadow-black/25 max-w-1/2"
        style={{
          background: background[sentBy],
          padding: "4px 4px",
          ...(sentBy === "contact"
            ? {
                borderRadius: `${isArrow ? "0px" : "5px"} 5px 5px`,
                marginLeft: !isArrow ? 6 : 0,
              }
            : {
                borderRadius: `5px ${isArrow ? "0px" : "5px"} 5px 5px`,
                marginRight: !isArrow ? 6 : 0,
              }),
        }}
      >
        <div className="flex flex-col min-w-52">
          {sentBy === "system" && (
            <i className="text-xs font-semibold mb-1">
              Mensagem automática do sistema
            </i>
          )}
          <button
            onClick={() =>
              !isInProgress &&
              download(`${api.getUri()}/public/files/${fileName}`, fileName)
            }
            title="Baixar arquivo"
            className="bg-white/5 hover:bg-white/10 cursor-pointer duration-200 rounded-sm p-2 flex items-center gap-2"
          >
            <p className="line-clamp-2 text-xs text-start w-full">{fileName}</p>
            {isInProgress ? (
              <Spinner />
            ) : (
              <a className="p-1">
                <RiDownload2Line size={20} />
              </a>
            )}
          </button>
          {caption && (
            <p className="p-1 pb-0 text-xs">{parse(format(caption))}</p>
          )}
          <small
            className={`pl-5 px-1 leading-none text-white/70 mt-1 block text-xs text-end`}
          >
            {time}
          </small>
        </div>
      </div>
      {sentBy !== "contact" && isArrow && (
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "0px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: `6px solid ${background[sentBy]}`,
          }}
        />
      )}
    </div>
  );
};
