import { Circle, Presence, SegmentGroup } from "@chakra-ui/react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@components/ui/dialog";
import { FC, JSX, useContext, useEffect } from "react";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { ChatPlayer } from "./chat";
import { ListPlayer } from "./list";
import { PlayerContext } from "./context";
import { SocketContext } from "@contexts/socket.context";
import { countDepartmentTicket } from "../../../../../services/api/InboxDepartment";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { PlayerProvider } from "./provider.context";

interface PropsModalPlayer {
  data: { id: number; name: string; businessId: number };
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
  const { setdepartmentOpenId } = useContext(SocketContext);
  const { filter, setFilter, countNew, setCountNew } =
    useContext(PlayerContext);

  useEffect(() => {
    setdepartmentOpenId(props.data.id || null);
    return () => {
      setdepartmentOpenId(null);
    };
  }, []);

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
      <DialogBody>
        <div className="grid grid-cols-[290px_1fr] h-full gap-x-3">
          <ListPlayer />
          <ChatPlayer />
        </div>
      </DialogBody>
    </>
  );
};

export const ModalPlayerInboxDepartment: FC<PropsModalPlayer> = (p) => {
  return (
    <DialogContent
      zIndex={1}
      w={"1270px"}
      h={"calc(100vh - 70px)"}
      maxH={"700px"}
      m={"20px"}
    >
      <PlayerProvider businessId={p.data.businessId}>
        <PlayerInboxDepartment {...p} />
      </PlayerProvider>
    </DialogContent>
  );
};
