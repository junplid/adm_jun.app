import { Circle, Presence, SegmentGroup } from "@chakra-ui/react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@components/ui/dialog";
import { FC, JSX, useContext, useEffect, useState } from "react";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { ChatPlayer } from "./chat";
import { ListPlayer } from "./list";
import { PlayerContext } from "./context";
import { countDepartmentTicket } from "../../../../../services/api/InboxDepartment";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { PlayerProvider } from "./provider.context";
import { BiTimeFive } from "react-icons/bi";
import { MdSupportAgent } from "react-icons/md";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useRoomWebSocket } from "../../../../../hooks/roomWebSocket";

interface PropsModalPlayer {
  data: { id: number; name: string };
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

export const PlayerInboxDepartment: React.FC<PropsModalPlayer> = ({
  ...props
}): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const { filter, setFilter, countNew, setCountNew } =
    useContext(PlayerContext);
  const [focusIn, setFocusIn] = useState<"chat" | "list">("list");

  useEffect(() => {
    (async () => {
      try {
        const count = await countDepartmentTicket(props.data.id, "NEW");
        setCountNew(count);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
      }
    })();
  }, [props.data.id]);

  return (
    <>
      <DialogHeader
        mt={"-5px"}
        flexDirection={"column"}
        gap={0}
        className="max-[470px]:p-4!"
      >
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2 text-zinc-300">
            <LuBriefcaseBusiness size={20} />
            <DialogTitle className="line-clamp-1 sm:text-base! text-sm!">
              {props.data?.name}
            </DialogTitle>
          </div>
          <div className="sm:flex hidden items-center gap-x-2">
            <SegmentGroup.Root
              value={filter}
              onValueChange={(e: any) => setFilter(e.value || "Todos")}
              bg={"#1c1c1c"}
            >
              <SegmentGroup.Indicator bg={bgIndicator[filter]} />
              <SegmentGroup.Items
                cursor={"pointer"}
                items={[
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
                        <Presence
                          animationName={{
                            _open: "slide-from-bottom",
                            _closed: "slide-to-bottom, fade-out",
                          }}
                          animationDuration="moderate"
                          present={countNew > 0}
                          position={"absolute"}
                          top={"-20px"}
                          right={"-12px"}
                        >
                          <Circle
                            w={5}
                            h={5}
                            bg={"#f7d9d9"}
                            fontWeight={"semibold"}
                            color={"red"}
                            fontSize={"11px"}
                          >
                            {countNew > 9 ? "9+" : countNew}
                          </Circle>
                        </Presence>
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
      <DialogBody p={{ base: "10px", md: "20px" }}>
        <div className="hidden sm:grid grid-cols-[290px_1fr] h-full gap-x-3">
          <ListPlayer />
          <ChatPlayer />
        </div>

        <div className="sm:hidden flex gap-2.5 flex-col h-full">
          <div className="h-full flex-1">
            {focusIn === "chat" ? (
              <ChatPlayer />
            ) : (
              <ListPlayer clickCard={() => setFocusIn("chat")} />
            )}
          </div>
          <div
            className="mx-auto"
            style={{ opacity: focusIn === "list" ? 1 : 0.5 }}
          >
            <SegmentGroup.Root
              value={filter}
              onValueChange={(e: any) => setFilter(e.value || "Todos")}
              bg={"#1c1c1c"}
              onClick={() => setFocusIn("list")}
            >
              <SegmentGroup.Indicator bg={bgIndicator[filter]} />
              <SegmentGroup.Items
                cursor={"pointer"}
                style={{ height: 40 }}
                className="min-[470px]:p-5! p-3!"
                items={[
                  {
                    value: "Aguardando",
                    label: (
                      <div
                        style={{
                          color:
                            filter === "Aguardando"
                              ? "#fff"
                              : txColor.Aguardando,
                        }}
                        className="font-medium flex relative"
                      >
                        <div className="min-[470px]:text-sm text-xs flex items-center min-[470px]:gap-2 gap-1">
                          <BiTimeFive size={17} />
                          Aguardando
                        </div>
                        <Presence
                          animationName={{
                            _open: "slide-from-bottom",
                            _closed: "slide-to-bottom, fade-out",
                          }}
                          animationDuration="moderate"
                          present={countNew > 0}
                          position={"absolute"}
                          top={"-20px"}
                          right={"-12px"}
                        >
                          <Circle
                            w={5}
                            h={5}
                            bg={"#f7d9d9"}
                            fontWeight={"semibold"}
                            color={"red"}
                            fontSize={"11px"}
                          >
                            {countNew > 9 ? "9+" : countNew}
                          </Circle>
                        </Presence>
                      </div>
                    ),
                  },
                  {
                    value: "Atendendo",
                    label: (
                      <div
                        style={{
                          color:
                            filter === "Atendendo" ? "#fff" : txColor.Atendendo,
                        }}
                        className="font-medium"
                      >
                        <div className="min-[470px]:text-sm text-xs flex items-center min-[470px]:gap-2 gap-1">
                          <MdSupportAgent size={20} />
                          Atendendo
                        </div>
                      </div>
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
                        <div className="min-[470px]:text-sm text-xs flex items-center min-[470px]:gap-2 gap-1">
                          <AiOutlineCheckCircle size={20} />
                          Resolvido
                        </div>
                      </span>
                    ),
                  },
                ]}
              />
            </SegmentGroup.Root>
          </div>
        </div>
      </DialogBody>
    </>
  );
};

export const ModalPlayerInboxDepartment: FC<PropsModalPlayer> = (p) => {
  useRoomWebSocket("player_department", { id: p.data.id });

  return (
    <DialogContent
      zIndex={1}
      maxH={"700px"}
      m={{ md: "20px", base: "7px" }}
      className="sm:h-[calc(100vh-50px)] h-[calc(100svh-20px)]"
    >
      <PlayerProvider>
        <PlayerInboxDepartment {...p} />
      </PlayerProvider>
      <div className="md:hidden block">
        <DialogCloseTrigger className="-translate-y-2 translate-x-2" />
      </div>
    </DialogContent>
  );
};
