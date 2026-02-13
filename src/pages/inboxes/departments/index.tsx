import { JSX, useContext, useEffect, useMemo } from "react";
import { Button } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useDialogModal } from "../../../hooks/dialog.modal";
import {
  Column,
  TableComponent,
  TableMobileComponent,
} from "@components/Table";
import { LayoutInboxesPageContext } from "../contexts";
import { useGetInboxDepartments } from "../../../hooks/inboxDepartment";
import { LuFullscreen } from "react-icons/lu";
import { ModalDeleteInboxDepartment } from "./modals/delete";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalCreateInboxDepartment } from "./modals/create";
import { ModalEditInboxDepartment } from "./modals/edit";
import { ModalPlayerInboxDepartment } from "./modals/Player";
import { AuthContext } from "@contexts/auth.context";
import { useRoomWebSocket } from "../../../hooks/roomWebSocket";
import { SocketContext } from "@contexts/socket.context";
import { queryClient } from "../../../main";

export interface inboxDepartmentRow {
  tickets_open: number;
  tickets_new: number;
  business: { id: number; name: string };
  id: number;
  name: string;
  createAt: Date;
}

interface MathTicketTokenArgs {
  n: number;
  departmentId: number;
}

export const InboxDepartmentsPage: React.FC = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  useRoomWebSocket("departments", undefined);
  const { clientMeta } = useContext(AuthContext);
  const { ToggleMenu } = useContext(LayoutInboxesPageContext);
  const {
    data: inboxDepartments,
    isFetching,
    isPending,
  } = useGetInboxDepartments();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "name",
        name: "Nome",
      },
      {
        key: "tickets",
        name: "",
        styles: { width: 120 },
        render(row) {
          return (
            <div className="flex flex-col gap-y-px">
              <div className="flex w-full gap-x-4">
                <span
                  className="font-semibold"
                  style={{
                    color: row.tickets_new ? "#f7a85e" : "#882f29",
                  }}
                >
                  {row.tickets_new}
                </span>
                <span
                  style={{
                    color: row.tickets_new ? "#f7f7f7" : "#6d6d6d",
                  }}
                >
                  Aguardando
                </span>
              </div>
              <div className="flex w-full gap-x-4">
                <span
                  className="font-semibold"
                  style={{
                    color: row.tickets_open ? "#6faddd" : "#882f29",
                  }}
                >
                  {row.tickets_open}
                </span>
                <span
                  style={{
                    color: row.tickets_open ? "#f7f7f7" : "#6d6d6d",
                  }}
                >
                  Atendendo
                </span>
              </div>
            </div>
          );
        },
      },
      // {
      //   key: "createAt",
      //   name: "Data de criação",
      //   styles: { width: 135 },
      //   render(row) {
      //     return (
      //       <div className="flex flex-col">
      //         <span>{moment(row.createAt).format("D/M/YY")}</span>
      //         <span className="text-xs text-white/50">
      //           {moment(row.createAt).format("HH:mm")}
      //         </span>
      //       </div>
      //     );
      //   },
      // },
      {
        key: "actions",
        name: "",
        styles: { width: 43 * 4 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#aef8be20" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    size: "xl",
                    content: (
                      <ModalPlayerInboxDepartment
                        close={close}
                        data={{
                          id: row.id,
                          name: row.name,
                        }}
                      />
                    ),
                  })
                }
              >
                <LuFullscreen color={"#6eb173"} />
              </Button>
              {/* <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled
              >
                <LuEye color={"#dbdbdb"} />
              </Button> */}
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    content: (
                      <ModalEditInboxDepartment close={close} id={row.id} />
                    ),
                  })
                }
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#eb606028" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteInboxDepartment
                        data={{ id: row.id, name: row.name }}
                        close={close}
                      />
                    ),
                  });
                }}
              >
                <MdDeleteOutline color={"#f75050"} />
              </Button>
            </div>
          );
        },
      },
    ];
    return columns;
  }, []);

  useEffect(() => {
    socket.on("math_open_ticket_count", (data: MathTicketTokenArgs) => {
      if (queryClient.getQueryData<any>(["inbox-departments", null])) {
        queryClient.setQueryData(["inbox-departments", null], (old: any) => {
          if (!old) return old;
          return old.map((s: any) => {
            if (s.id !== data.departmentId) return s;
            return {
              ...s,
              tickets_open: s.tickets_open + data.n,
            };
          });
        });
      }
    });

    socket.on("math_new_ticket_count", (data: MathTicketTokenArgs) => {
      if (queryClient.getQueryData<any>(["inbox-departments", null])) {
        queryClient.setQueryData(["inbox-departments", null], (old: any) => {
          if (!old) return old;
          return old.map((s: any) => {
            if (s.id !== data.departmentId) return s;
            return {
              ...s,
              tickets_new: s.tickets_new + data.n,
            };
          });
        });
      }
    });

    return () => {
      socket.off("math_open_ticket_count");
      socket.off("math_new_ticket_count");
    };
  }, []);

  return (
    <div className="h-full flex-1 gap-y-1 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center w-full justify-between gap-x-5">
          <div className="flex items-center gap-x-2">
            <span className="hidden sm:flex">{ToggleMenu}</span>
            <h1 className="text-base sm:text-lg font-semibold">
              Departamentos
            </h1>
            {/* <p className="text-white/60 font-light">
              para organizar melhor seus atendimentos.
            </p> */}
          </div>
          <ModalCreateInboxDepartment
            trigger={
              <Button variant="outline" size={{ sm: "sm", base: "xs" }}>
                <IoAdd /> <span className="sm:block hidden">Adicionar</span>
              </Button>
            }
          />
        </div>
      </div>
      <div className="flex-1 grid">
        {clientMeta.isMobileLike || clientMeta.isSmallScreen ? (
          <TableMobileComponent
            totalCount={inboxDepartments?.length || 0}
            renderItem={(index) => {
              const row = inboxDepartments![index];
              return (
                <div className="flex flex-col bg-amber-50/5 p-3! py-2! rounded-md">
                  <span className="text-xs font-semibold">{row.name}</span>
                  <div className="flex items-center mt-1 justify-between">
                    <div className="flex flex-col gap-y-0.5 text-xs">
                      <div className="flex gap-x-1.5">
                        <span
                          className="font-semibold"
                          style={{
                            color: row.tickets_new ? "#f7a85e" : "#882f29",
                          }}
                        >
                          {row.tickets_new}
                        </span>
                        <span
                          style={{
                            color: row.tickets_new ? "#f7f7f7" : "#6d6d6d",
                          }}
                        >
                          Aguardando
                        </span>
                      </div>
                      <div className="flex gap-x-1.5">
                        <span
                          className="font-semibold"
                          style={{
                            color: row.tickets_open ? "#6faddd" : "#882f29",
                          }}
                        >
                          {row.tickets_open}
                        </span>
                        <span
                          style={{
                            color: row.tickets_open ? "#f7f7f7" : "#6d6d6d",
                          }}
                        >
                          Atendendo
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-x-1">
                      <Button
                        size={"xs"}
                        bg={"#9cdfab18"}
                        _hover={{ bg: "#aef8be20" }}
                        _icon={{ width: "16px", height: "16px" }}
                        onClick={() =>
                          onOpen({
                            size: "xl",
                            content: (
                              <ModalPlayerInboxDepartment
                                close={close}
                                data={{
                                  id: row.id,
                                  name: row.name,
                                }}
                              />
                            ),
                          })
                        }
                      >
                        <LuFullscreen color={"#6eb173"} />
                      </Button>
                      <Button
                        size={"xs"}
                        bg={"#cf5c5c24"}
                        _hover={{ bg: "#eb606028" }}
                        _icon={{ width: "16px", height: "16px" }}
                        onClick={() => {
                          onOpen({
                            content: (
                              <ModalDeleteInboxDepartment
                                data={{ id: row.id, name: row.name }}
                                close={close}
                              />
                            ),
                          });
                        }}
                      >
                        <MdDeleteOutline color={"#f75050"} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }}
            textEmpity="Seus departamentos aparecerão aqui."
            load={isFetching || isPending}
          />
        ) : (
          <TableComponent
            rows={inboxDepartments || []}
            columns={renderColumns}
            textEmpity="Seus departamentos aparecerão aqui."
            load={isFetching || isPending}
          />
        )}
      </div>
      {DialogModal}
    </div>
  );
};
