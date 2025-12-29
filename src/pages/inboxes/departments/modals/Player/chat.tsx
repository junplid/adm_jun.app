import {
  Box,
  Button,
  Highlight,
  IconButton,
  Image,
  Presence,
  Spinner,
} from "@chakra-ui/react";
import { Avatar } from "@components/ui/avatar";
import moment, { Moment } from "moment";
import {
  FC,
  JSX,
  memo,
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
  resolveTicket,
  returnTicket,
  sendTicketMessage,
} from "../../../../../services/api/Ticket";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../../../../services/api/ErrorResponse";
import { AuthContext } from "@contexts/auth.context";
import { toaster } from "@components/ui/toaster";
import dataEmojis from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { TbArrowBack, TbCircleCheck } from "react-icons/tb";
import { MidiaComponent } from "./midia";
import { IoMdImage } from "react-icons/io";
import {
  PiFileAudioFill,
  PiFileFill,
  PiFilePdfFill,
  PiFileTextFill,
  PiFileVideoFill,
} from "react-icons/pi";
import { useColorModeValue } from "@components/ui/color-mode";
import { WithContext as ReactTags, SEPARATORS, Tag } from "react-tag-input";
import {
  useAddTagOnContactWA,
  useCreateTag,
  useDeleteTagOnContactWA,
  useGetTagsOptions,
} from "../../../../../hooks/tag";
import { InViewComponent } from "@components/InView";
import { InView } from "react-intersection-observer";
import { BiTimeFive } from "react-icons/bi";

const background = {
  system: "#5c3600cd",
  contact: "#202024",
  user: "#30573c",
  bot: "#30573c",
};

type MessageType = {
  type: "text";
  text: string;
  id: number;
  createAt: Date;
};

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

interface FileSelected {
  id: number;
  originalName: string;
  mimetype: string | null;
  fileName?: string | null;
  type: "image/video" | "audio" | "document";
}

const IconPreviewFile = (p: { mimetype: string }): JSX.Element => {
  if (/^image\//.test(p.mimetype)) {
    return <IoMdImage color="#6daebe" size={24} />;
  }
  if (/^video\//.test(p.mimetype)) {
    return <PiFileVideoFill color="#8eb87a" size={24} />;
  }
  if (/^audio\//.test(p.mimetype)) {
    return <PiFileAudioFill color="#d4b663" size={24} />;
  }
  if (p.mimetype === "application/pdf") {
    return <PiFilePdfFill color="#db8c8c" size={24} />;
  }
  if (/^text\//.test(p.mimetype)) {
    return <PiFileTextFill color="#ffffff" size={24} />;
  }
  return <PiFileFill color="#808080" size={24} />;
};

export const ChatPlayer: FC = () => {
  const {
    pick,
    currentTicket,
    setDataTicket,
    dataTicket,
    socket,
    loadResolved,
    setLoadReturn,
    setLoadResolved,
    loadData,
    loadReturn,
  } = useContext(PlayerContext);
  const { logout } = useContext(AuthContext);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [loadMsg, setLoadMsg] = useState(false);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [openEmojis, setOpenEmojis] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const caretRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const [filesSelected, setFilesSelected] = useState<FileSelected[]>([]);
  const [errorTags, setErrorTags] = useState<string | undefined>(undefined);
  const colorQuery = useColorModeValue("#000000", "#ffffff");

  const { data: tags } = useGetTagsOptions();
  const { mutateAsync: createTag, status: statusCreateTag } = useCreateTag({});
  const { mutateAsync: addTag } = useAddTagOnContactWA({
    setError: (_, error) => setErrorTags(error.message),
  });
  const { mutateAsync: rmTag } = useDeleteTagOnContactWA({
    setError: (_, error) => setErrorTags(error.message),
  });

  const suggestions = useMemo(() => {
    return tags
      ?.filter((s) => !dataTicket?.contact.tags.some((v) => v.id === s.id))
      .map((s) => ({
        id: String(s.id),
        text: s.name,
        className: "",
      }));
  }, [tags, dataTicket?.contact.tags]);

  const handleAddition = async (tag: Tag) => {
    if (!dataTicket) return;
    const nextName = tag.text.trim().replace(/\s/g, "_");
    const exist = tags?.find((s) => s.name === nextName);

    if (!exist) {
      const tag = await createTag({
        name: nextName,
        businessIds: [dataTicket.businessId],
        type: "contactwa",
      });
      setDataTicket((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          contact: {
            ...prev.contact,
            tags: [
              ...(prev.contact.tags || []),
              { id: tag.id, name: nextName },
            ],
          },
        };
      });
      try {
        await addTag({ id: tag.id, params: { ticketId: dataTicket.id } });
      } catch (error) {
        setDataTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            contact: {
              ...prev.contact,
              tags: prev.contact.tags.filter((t) => t.id !== tag.id),
            },
          };
        });
      }
    } else {
      setDataTicket((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          contact: {
            ...prev.contact,
            tags: [
              ...(prev.contact.tags || []),
              { id: exist.id, name: nextName },
            ],
          },
        };
      });
      console.log("Existente");
      try {
        await addTag({ id: exist.id, params: { ticketId: dataTicket.id } });
      } catch (error) {
        setDataTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            contact: {
              ...prev.contact,
              tags: prev.contact.tags.filter((t) => t.id !== exist.id),
            },
          };
        });
      }
    }
  };

  const handleDelete = async (index: number) => {
    if (!dataTicket) return;
    if (!index && dataTicket.contact.tags.length === 1) {
      try {
        await rmTag({
          id: dataTicket.contact.tags[index].id,
          params: { ticketId: dataTicket.id },
        });
        setDataTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            contact: {
              ...prev.contact,
              tags: prev.contact.tags.filter((_, i) => i !== index),
            },
          };
        });
      } catch (error) {
        console.log("Error ao remover tag:", error);
      }
    } else {
      try {
        await rmTag({
          id: dataTicket.contact.tags[index].id,
          params: { ticketId: dataTicket.id },
        });
        setDataTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            contact: {
              ...prev.contact,
              tags: prev.contact.tags.filter((_, i) => i !== index),
            },
          };
        });
      } catch (error) {
        console.log("Error ao remover tag:", error);
      }
    }
  };

  const rememberCaret = () => {
    const el = textareaRef.current;
    if (!el) return;
    caretRef.current = { start: el.selectionStart, end: el.selectionEnd };
  };
  function insertEmojiAtCaret(emoji: string) {
    const el = textareaRef.current;
    if (!el) return;

    const { selectionStart: start, selectionEnd: end } = el;
    el.setRangeText(emoji, start, end, "end");
    setText(el.value);
    el.focus();
  }
  const [isToEnd, setIsToEnd] = useState(false);

  useEffect(() => {
    if (currentTicket) {
      socket.emit("join-ticket", { id: currentTicket });
      socket.on("message", (data: PropsSocketMessage) => {
        if (data.by === "user") {
          requestAnimationFrame(() => {
            textareaRef.current?.focus();
          });
          textareaRef.current?.focus();
          setLoadMsg(false);
          setText("");
        }
        setDataTicket((prev) => {
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
    } else {
      setIsToEnd(false);
    }

    return () => {
      socket.emit("join-ticket", { id: null });
      socket.off("message");
      setDataTicket(null);
      setText("");
      setLoadMsg(false);
      setOpenEmojis(false);
    };
  }, [currentTicket, socket]);

  const sendMessage = async (message: string) => {
    if (
      !dataTicket ||
      (!message.trim() && !filesSelected.length) ||
      !currentTicket
    ) {
      return;
    }
    setLoadMsg(true);
    setOpenEmojis(false);
    try {
      let type: "text" | "image" | "audio" | "file" = "text";
      if (!filesSelected.length) {
        type = "text";
      } else {
        if (filesSelected.every((file) => file.type === "image/video")) {
          type = "image";
        }
        if (filesSelected.every((file) => file.type === "audio")) {
          type = "audio";
        }
        if (filesSelected.every((file) => file.type === "document")) {
          type = "file";
        }
      }
      const files = filesSelected.map((file) => ({
        id: file.id,
        type: file.type,
      }));
      if (dataTicket.status === "NEW") await pick(dataTicket.id);
      await sendTicketMessage(currentTicket, {
        text: message.trim(),
        files,
        type,
      });
      setText("");
      setFilesSelected([]);
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

  useEffect(() => {
    if (!dataTicket?.messages.length || isToEnd) return;
    virtuosoRef.current?.scrollToIndex({
      index: (dataTicket?.messages.length || 0) - 1,
      align: "end",
      behavior: "auto",
    });
    setTimeout(() => {
      setIsToEnd(true);
    }, 300);
  }, [dataTicket?.messages.length]);

  const handleReturnTicket = async () => {
    if (!currentTicket || !dataTicket) return;
    if (dataTicket.status !== "OPEN") return;
    setLoadReturn(dataTicket.id);
    await returnTicket(dataTicket.id);
  };

  const handleResolvedTicket = async () => {
    if (!currentTicket || !dataTicket) return;
    if (dataTicket.status !== "OPEN") return;
    setLoadResolved(dataTicket.id);
    await resolveTicket(dataTicket.id);
  };

  const isDisabledReturn = useMemo(() => {
    if (!dataTicket) return true;
    if (dataTicket.status !== "OPEN") return true;
    if (!loadReturn) return false;
    if (loadReturn === dataTicket.id) return true;
    return false;
  }, [dataTicket, loadReturn]);

  const isDisabledResolved = useMemo(() => {
    if (!dataTicket) return true;
    if (dataTicket.status !== "OPEN") return true;
    if (!loadResolved) return false;
    if (loadResolved === dataTicket.id) return true;
    return false;
  }, [dataTicket, loadResolved]);

  const isDisabledSend = useMemo(() => {
    if (!dataTicket) return true;
    if (dataTicket.status === "RESOLVED" || dataTicket.status === "DELETED") {
      return true;
    }
    if (!text.trim().length && !filesSelected.length) return true;
    return false;
  }, [dataTicket?.status, text, filesSelected]);

  if (!currentTicket) {
    return (
      <div className="h-full grid place-items-center">
        <span className="text-white/70 text-sm">
          Selecione um ticket para iniciar o atendimento.
        </span>
      </div>
    );
  }

  if (loadData) {
    return (
      <div className="h-full grid place-items-center">
        <span className="text-white/70 text-sm">
          Carregando informações do ticket...
        </span>
      </div>
    );
  }

  if (!dataTicket) {
    return (
      <div className="h-full grid place-items-center">
        <span className="text-red-500/70 text-sm">Ticket não encontrado!</span>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-rows-[minmax(74px,auto)_1fr_minmax(48px,auto)] gap-2">
      <div className="w-full flex flex-col gap-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-2">
            <Avatar size={"sm"} bg={"#555555"} width={"40px"} height={"40px"} />
            <div className="flex flex-col">
              <span className="font-medium">{dataTicket.contact.name}</span>
              <span className="text-xs sm:text-sm text-white/60">
                {dataTicket.contact.completeNumber.includes("@lid")
                  ? "+55-codificado*"
                  : dataTicket.contact.completeNumber}
              </span>
            </div>
          </div>
          <div className="flex gap-x-2">
            <span className="text-xs text-white/30 sm:block hidden">
              Ações:
            </span>
            <Button
              loading={loadReturn === dataTicket.id}
              disabled={isDisabledReturn}
              onClick={handleReturnTicket}
              size={"xs"}
              fontSize={"13px"}
              variant={"outline"}
            >
              <BiTimeFive />
              <TbArrowBack />
              <span className="sm:text-xs hidden">Retornar</span>
            </Button>
            <Button
              size={"xs"}
              fontSize={"13px"}
              colorPalette={"green"}
              variant={"subtle"}
              onClick={handleResolvedTicket}
              loading={loadResolved === dataTicket.id}
              disabled={isDisabledResolved}
            >
              <span className="sm:text-xs hidden">Resolver</span>{" "}
              <TbCircleCheck />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-y-0.5">
          <div className="grid min-[470px]:grid-cols-[1fr_190px] grid-cols-[1fr_125px] w-full items-center gap-x-1 sm:gap-x-3 text-sm">
            {!dataTicket.contact.tags?.length ? (
              <span className="text-white/50 bg-zinc-300/5 py-0.5 text-center w-full text-xs sm:text-sm">
                Etiquetas aparecerão aqui.
              </span>
            ) : (
              <PreviewTags
                list={dataTicket.contact.tags || []}
                onclick={handleDelete}
              />
            )}
            <div className="grid grid-cols-[16px_1fr] items-center gap-x-2 w-full">
              <div>
                {statusCreateTag === "pending" && <Spinner size={"sm"} />}
              </div>
              <ReactTags
                tags={[]}
                suggestions={suggestions || []}
                separators={[SEPARATORS.ENTER]}
                handleAddition={handleAddition}
                placeholder="Add etiqueta"
                allowDragDrop={false}
                autoFocus={false}
                shouldRenderSuggestions={(query) => {
                  return query.length > 0;
                }}
                minQueryLength={0}
                allowAdditionFromPaste={false}
                handleFilterSuggestions={(query, suggestions) => {
                  return suggestions
                    .filter((s) =>
                      s.text.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, 3);
                }}
                renderSuggestion={(item, query) => (
                  <div
                    key={item.id}
                    className="p-2 dark:text-white/50 text-black/40 py-1.5 cursor-pointer"
                    style={{ borderRadius: 20 }}
                  >
                    <Highlight
                      styles={{
                        // px: "0.5",
                        // bg: "#ea5c0a",
                        color: colorQuery,
                        fontWeight: 600,
                      }}
                      query={query}
                    >
                      {item.text}
                    </Highlight>
                  </div>
                )}
                classNames={{
                  selected: `flex flex-wrap border gap-1.5 gap-y-2 w-full border-none`,
                  tagInputField: `p-0.5 pl-2 text-sm rounded-sm w-full border dark:border-white/10 border-black/10`,
                  remove: "hidden",
                  tag: "hover:bg-red-500 duration-300 !cursor-pointer dark:bg-white/15 bg-black/15 px-1",
                  tagInput: "w-full",
                  tags: "w-full relative",
                  suggestions:
                    "absolute z-50 dark:bg-[#111111] bg-white w-full translate-y-2 shadow-xl p-1 border dark:border-white/10 border-black/10 rounded-sm",
                }}
              />
            </div>
          </div>
          {errorTags && (
            <span className="text-red-400/80 w-full text-end text-xs">
              Não foi possível encontrar ticket informado.
            </span>
          )}
        </div>
      </div>
      <Box
        backgroundImage={`linear-gradient(45deg, #111111eb, #111111f2), url('/background-chat.png')`}
        borderRadius={"8px"}
        backgroundSize={"cover"}
      >
        <div className="p-2 h-full flex flex-col relative">
          <Virtuoso
            ref={virtuosoRef}
            data={dataTicket.messages}
            className="scroll-custom-table"
            followOutput="smooth"
            increaseViewportBy={{ bottom: 300, top: 200 }}
            style={{ opacity: isToEnd ? 1 : 0 }}
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
              if (msg.content.type === "image") {
                return (
                  <ImageBubbleComponent
                    createAt={moment(msg.content.createAt)}
                    fileName={msg.content.fileName}
                    sentBy={msg.by}
                    caption={msg.content.caption}
                  />
                );
              }
              if (msg.content.type === "audio") {
                return (
                  <AudioBubbleComponent
                    createAt={moment(msg.content.createAt)}
                    fileName={msg.content.fileName}
                    sentBy={msg.by}
                    isArrow={msg.by === "contact"}
                  />
                );
              }
              if (msg.content.type === "file") {
                return (
                  <FileBubbleComponent
                    createAt={moment(msg.content.createAt)}
                    fileName={msg.content.fileName || ""}
                    caption={msg.content.caption}
                    sentBy={msg.by}
                    fileNameOriginal={msg.content.fileNameOriginal}
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
          {!!filesSelected.length && (
            <div className="absolute justify-between  w-full h-full pb-10 bottom-0 left-0 right-0 flex flex-col gap-y-2 bg-[#141516c5] p-2 rounded-lg backdrop-blur-md">
              <div className="grid grid-cols-4 auto-rows-[126px]">
                {filesSelected.map((file) => (
                  <article
                    key={file.id}
                    className="hover:bg-red-500/70 duration-200 rounded-sm cursor-pointer p-1 h-full flex flex-col select-none items-center w-full gap-1"
                    onClick={() => {
                      textareaRef.current?.focus();
                      setFilesSelected((prev) =>
                        prev.filter((id) => id.id !== file.id)
                      );
                    }}
                  >
                    <div className="cursor-pointer w-full h-20 overflow-hidden object-center origin-center bg-center flex items-center justify-center rounded-sm">
                      {file.type === "image/video" ? (
                        <>
                          {/^image\//.test(file.mimetype || "") ? (
                            <Image
                              w="100%"
                              h="auto"
                              src={
                                api.getUri() +
                                "/public/storage/" +
                                file.fileName
                              }
                              fetchPriority="low"
                            />
                          ) : (
                            <IconPreviewFile mimetype={file.mimetype || ""} />
                          )}
                        </>
                      ) : (
                        <IconPreviewFile mimetype={file.mimetype || ""} />
                      )}
                    </div>
                    <span className="line-clamp-2 text-xs text-center font-light">
                      {file.originalName}
                    </span>
                  </article>
                ))}
              </div>
              <Button
                onClick={() => {
                  setFilesSelected([]);
                  textareaRef.current?.focus();
                }}
                mx={20}
                size={"xs"}
                colorPalette={"red"}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </Box>
      <div className="flex flex-col gap-y-0.5 w-full">
        <form
          className="flex gap-x-2 relative"
          onSubmit={async (event) => {
            event.preventDefault();
            sendMessage(text);
          }}
        >
          <div className="flex items-center gap-x-0.5">
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
            <MidiaComponent
              isDisabled={
                !!filesSelected.length ||
                !(dataTicket.status === "NEW" || dataTicket.status === "OPEN")
              }
              onSelected={(files) => {
                setFilesSelected(files);
                setTimeout(() => {
                  textareaRef.current?.focus();
                }, 100);
              }}
            />

            <IconButton
              ref={btnRef}
              type="button"
              variant="ghost"
              onPointerDown={(e) => e.stopPropagation()} // <- bloqueia o outside-click
              onClick={() => setOpenEmojis(true)}
              disabled={
                !(dataTicket.status === "NEW" || dataTicket.status === "OPEN")
              }
              className="max-[470px]:hidden! flex!"
            >
              <RiEmojiStickerLine color="#bdb216" />
            </IconButton>
          </div>
          <TextareaAutosize
            placeholder="Digite {{ para abrir o menu de variaveis"
            style={{ resize: "none" }}
            minRows={1}
            maxRows={8}
            ref={textareaRef}
            autoFocus
            className="p-3 py-2.5 rounded-sm w-full outline-none border-black/10 dark:border-white/10 border"
            disabled={
              loadMsg ||
              dataTicket.status === "RESOLVED" ||
              dataTicket.status === "DELETED"
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
            disabled={isDisabledSend}
            loading={loadMsg}
          >
            <RiSendPlane2Line />
          </IconButton>
        </form>
        {dataTicket.status === "NEW" && (
          <span className="text-white/80 text-xs text-center sm:text-start sm:text-sm">
            Ticket{" "}
            <strong className="uppercase text-[#f19e55]">aguardando</strong> .
            Ao interagir com ele, você assume o atendimento.
          </span>
        )}
        {dataTicket.status === "DELETED" && (
          <span className="text-white/80">
            Ticket{" "}
            <strong className="uppercase text-[#dd4843]">deletado</strong> .
            Será totalmente removido do sistema em breve.
          </span>
        )}
        {dataTicket.status === "RESOLVED" && (
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

export const ShadowLeftMemoComponent = memo(() => {
  const [showShadowTop, setShowShadowTop] = useState(true);
  const gradient = useColorModeValue(
    "linear-gradient(90deg, rgba(255, 255, 255, 0.797) 0%, rgba(214, 214, 214, 0) 90%)",
    "linear-gradient(90deg, #121111 0%, transparent 90%)"
  );

  return (
    <>
      <InViewComponent onChange={(isTop) => setShowShadowTop(isTop)} />
      <div
        className={`pointer-events-none absolute left-0 top-0 z-30 h-4 w-12`}
        style={{
          background: gradient,
          opacity: Number(!showShadowTop),
        }}
      />
    </>
  );
});

const ShadowRightMemoComponent = memo(() => {
  const [showShadowBottom, setShowShadowBottom] = useState(false);
  const gradient = useColorModeValue(
    "linear-gradient(90deg, rgba(214, 214, 214, 0) 0%,rgba(255, 255, 255, 0.797) 90%)",
    "linear-gradient(90deg, transparent 0%, #121111 90%)"
  );

  return (
    <>
      <div
        className={`pointer-events-none absolute right-0 top-0 z-30 h-4 w-12`}
        style={{
          background: gradient,
          opacity: Number(showShadowBottom),
        }}
      />
      <InView
        rootMargin="0px 50px 0px 0px"
        onChange={(is) => setShowShadowBottom(!is)}
      />
      <div></div>
    </>
  );
});

interface PropsPreviewTags {
  list: { id: number; name: string }[];
  onclick: (index: number) => void;
}
// overflow-hidden
const PreviewTags: FC<PropsPreviewTags> = (props): JSX.Element => {
  return (
    <div className="relative w-full flex overflow-hidden mt-1">
      <div className="flex items-center w-full gap-x-1.5 pb-0.5 overflow-x-scroll scroll-x-custom">
        <ShadowLeftMemoComponent />
        {props.list.map(({ id: idItem, name }, index) => (
          <span
            key={idItem}
            className="hover:text-red-400/70 select-none text-xs hover:bg-transparent bg-white/10 text-white/65 px-1 duration-200 cursor-pointer hover:decoration-dashed hover:line-through flex items-center gap-x-1"
            onClick={() => props.onclick(index)}
          >
            {name}
          </span>
        ))}

        <ShadowRightMemoComponent />
      </div>
    </div>
  );
};

const TextBubbleComponent: FC<{
  message: string;
  createAt: Moment;
  isArrow?: boolean;
  sentBy: "contact" | "user" | "system" | "bot";
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

const ImageBubbleComponent: FC<{
  fileName: string;
  createAt: Moment;
  isArrow?: boolean;
  caption?: string;
  sentBy: "contact" | "user" | "system" | "bot";
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
          <Image
            fetchPriority="low"
            loading="lazy"
            className="max-w-72.5 rounded-md"
            src={`${api.getUri()}/public/storage/${fileName}`}
            alt="Imagem"
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

const AudioBubbleComponent: FC<{
  fileName: string;
  createAt: Moment;
  isArrow?: boolean;
  ptt?: boolean;
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

const FileBubbleComponent: FC<{
  fileName: string;
  caption?: string;
  createAt: Moment;
  isArrow?: boolean;
  fileNameOriginal?: string;
  sentBy: "contact" | "user" | "system";
}> = ({
  fileName,
  caption,
  createAt,
  fileNameOriginal,
  sentBy,
  isArrow,
}): JSX.Element => {
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
              download(
                `${api.getUri()}/public/storage/${fileName}`,
                fileNameOriginal || fileName
              )
            }
            title="Baixar arquivo"
            className="bg-white/5 hover:bg-white/10 cursor-pointer duration-200 rounded-sm p-2 flex items-center gap-2"
          >
            <p className="line-clamp-2 text-xs text-start w-full">
              {fileNameOriginal || fileName}
            </p>
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
