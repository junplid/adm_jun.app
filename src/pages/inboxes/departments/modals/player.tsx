import { Box, Button, Circle, SegmentGroup, Spinner } from "@chakra-ui/react";
import { format } from "@flasd/whatsapp-formatting";
import parse from "html-react-parser";
import { Avatar } from "@components/ui/avatar";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@components/ui/dialog";
import moment, { Moment } from "moment";
import { FC, JSX, useEffect, useMemo, useRef, useState } from "react";
import { LuBriefcaseBusiness } from "react-icons/lu";
import TextareaAutosize from "react-textarea-autosize";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { api } from "../../../../services/api";
import AudioSpeekPlayerWA from "@components/AudioSpeekPlayerWA";
import { RiDownload2Line } from "react-icons/ri";
import useDownloader from "react-use-downloader";

const background = {
  system: "#5c3600cd",
  contact: "#202024",
  user: "#30573c",
};

interface PropsModalPlayer {
  data: { id: number; name: string } | null;
  close: () => void;
}

const bgIndicator: { [x: string]: string } = {
  Todos: "#70707060",
  Aguardando: "#774c2965",
  Atendendo: "#305b7e5e",
  Resolvidos: "#2e692e63",
};

const txColor: { [x: string]: string } = {
  Todos: "#c5c5c5",
  Aguardando: "#ebcbaf",
  Atendendo: "#b9d9f3",
  Resolvidos: "#b9f8b9",
};

export const ModalPlayerInboxDepartment: React.FC<PropsModalPlayer> = ({
  ...props
}): JSX.Element => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [filter, setFilter] = useState<string>("Todos");

  return (
    <DialogContent w={"1270px"} h={"calc(100vh - 70px)"} m={"20px"}>
      <DialogHeader mt={"-5px"} flexDirection={"column"} gap={0}>
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2 text-zinc-300">
            <LuBriefcaseBusiness size={22} />
            <DialogTitle className="line-clamp-1">
              {props.data?.name}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-x-2">
            <SegmentGroup.Root
              value={filter}
              onValueChange={(e) => setFilter(e.value || "Todos")}
              bg={"#1c1c1c"}
            >
              <SegmentGroup.Indicator bg={bgIndicator[filter]} />
              <SegmentGroup.Items
                items={[
                  {
                    value: "Todos",
                    label: (
                      <span
                        style={{
                          color: filter === "Todos" ? "#fff" : txColor.Todos,
                        }}
                        className="font-medium"
                      >
                        Todos
                      </span>
                    ),
                  },
                  {
                    value: "Aguardando",
                    label: (
                      <span
                        style={{
                          color:
                            filter === "Aguardando"
                              ? "#fff"
                              : txColor.Aguardando,
                        }}
                        className="font-medium flex relative"
                      >
                        Aguardando{" "}
                        <Circle
                          w={5}
                          h={5}
                          bg={"#f7d9d9"}
                          fontWeight={"semibold"}
                          color={"red"}
                          ml={2}
                          className="shadown absolute -top-5 -right-3"
                          fontSize={"11px"}
                        >
                          +9
                        </Circle>
                      </span>
                    ),
                  },
                  {
                    value: "Atendendo",
                    label: (
                      <span
                        style={{
                          color:
                            filter === "Atendendo" ? "#fff" : txColor.Atendendo,
                        }}
                        className="font-medium"
                      >
                        Atendendo
                      </span>
                    ),
                  },
                  {
                    value: "Resolvidos",
                    label: (
                      <span
                        style={{
                          color:
                            filter === "Resolvidos"
                              ? "#fff"
                              : txColor.Resolvidos,
                        }}
                        className="font-medium"
                      >
                        Resolvidos
                      </span>
                    ),
                  },
                ]}
              />
            </SegmentGroup.Root>
          </div>
        </div>
        {/* <DialogDescription>
          Essa ação não poderá ser desfeita.
        </DialogDescription> */}
      </DialogHeader>
      <DialogBody>
        <div className="grid grid-cols-[200px_1fr] h-full">
          <div>lista</div>
          <div className="h-full grid grid-rows-[48px_1fr_minmax(48px,auto)] gap-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-x-2">
                <Avatar size={"sm"} width={"40px"} height={"40px"} />
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
                  data={[1, 2]}
                  className="scroll-custom-table"
                  followOutput="smooth"
                  itemContent={(_, msg) => {
                    return (
                      <FileBubbleComponent
                        fileName={`file-${msg}.txt`}
                        caption={`Caption do arquivo ${msg}`}
                        isArrow={msg === 1 ? true : false}
                        createAt={moment("2023-10-01T12:00:00Z")}
                        sentBy="contact"
                      />
                    );
                  }}
                />
              </div>
            </Box>
            <div className="">
              <TextareaAutosize
                placeholder="Digite {{ para variaveis abrir menu de variaveis"
                style={{ resize: "none" }}
                minRows={1}
                maxRows={8}
                className="p-3 py-2.5 rounded-sm w-full outline-none border-black/10 dark:border-white/10 border"
              />
            </div>
          </div>
        </div>
      </DialogBody>
    </DialogContent>
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
      style={{ marginTop: isArrow ? 15 : 3 }}
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
      style={{ marginTop: isArrow ? 15 : 3 }}
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
            <i className="text-sm font-semibold mb-1">
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
              <p className="text-sm px-1 pb-1">{parse(format(caption))}</p>
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
      style={{ marginTop: isArrow ? 15 : 5 }}
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
      style={{ marginTop: isArrow ? 15 : 3 }}
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
        <div className="flex flex-col min-w-64">
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
            className="bg-black/10 hover:bg-black/20 cursor-pointer duration-200 rounded-sm p-2 flex items-center gap-2"
          >
            <p className="line-clamp-2 text-start w-full">{fileName}</p>
            {isInProgress ? (
              <Spinner />
            ) : (
              <a className="p-1">
                <RiDownload2Line size={22} />
              </a>
            )}
          </button>
          {caption && <p className="p-1 pb-0">{parse(format(caption))}</p>}
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
