import { Badge, Button } from "@chakra-ui/react";
import { JSX, useContext, useEffect, useMemo } from "react";
import { Column, TableComponent } from "../../components/Table";
import { ModalCreateCampaign } from "./modals/create";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalDeleteCampaign } from "./modals/delete";
import { ModalEditCampaign } from "./modals/edit";
import { LuEye } from "react-icons/lu";
import { ModalViewCampaign } from "./modals/view";
import moment from "moment";
import { SocketContext } from "../../contexts/socket.context";
import { IoAdd } from "react-icons/io5";
import { useDialogModal } from "../../hooks/dialog.modal";
import { TypeStatusCampaign } from "../../services/api/Campaign";
import { useGetCampaigns } from "../../hooks/campaign";
import { queryClient } from "../../main";
import {
  ProgressCircleRing,
  ProgressCircleRoot,
  ProgressCircleValueText,
} from "@components/ui/progress-circle";
import { FaCrown } from "react-icons/fa";
import { Tooltip } from "@components/ui/tooltip";
import { AuthContext } from "@contexts/auth.context";

export type TranslateType = {
  [x in TypeStatusCampaign]: { value: string; cb: string; ct: string };
};
export const translateType: TranslateType = {
  finished: { value: "Encerrada", cb: "#5a5a5a47", ct: "#cacaca" },
  stopped: { value: "Parada", cb: "#8a580c54", ct: "#ffebd4" },
  paused: { value: "Pausada", cb: "#10cee739", ct: "#e9ffff" },
  running: { value: "Em Execução", cb: "#80f16923", ct: "#ecffe6" },
  processing: { value: "Processando...", cb: "#f8e80926", ct: "#fdffda" },
};

export interface CampaignRow {
  id: number;
  name: string;
  createAt: Date;
  totalFlows: number;
  sentPercentage: number;
  finishPercentage: number;
  status: TypeStatusCampaign;
  businesses: { id: number; name: string }[];
}

interface SocketPropsUpdateCampaign {
  id: number;
  status: TypeStatusCampaign;
}

export const CampaignsPage: React.FC = (): JSX.Element => {
  const {
    account: { isPremium },
  } = useContext(AuthContext);
  const { data: campaigns, isFetching, isPending } = useGetCampaigns();
  const { socket } = useContext(SocketContext);
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  useEffect(() => {
    const handleStatus = (data: SocketPropsUpdateCampaign) => {
      queryClient.setQueryData<any[]>(["campaigns", null], (old) =>
        old
          ? old.map((c) =>
              c.id === data.id ? { ...c, status: data.status } : c
            )
          : old
      );
    };

    socket.on("status-campaign", handleStatus);
  }, [socket]);

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "id",
        name: "ID",
        styles: { width: 40 },
      },
      {
        key: "name",
        name: "Nome",
      },
      {
        key: "totalFlows",
        name: "Contatos",
        styles: { width: 90 },
        render: ({ totalFlows }) => {
          return (
            <div className="flex items-center justify-center">
              <span>{totalFlows}</span>
            </div>
          );
        },
      },
      {
        key: "sentPercentage",
        name: "Entregue",
        styles: { width: 90 },
        render: ({ sentPercentage }) => {
          return (
            <div className="flex items-center justify-center">
              <ProgressCircleRoot
                value={sentPercentage}
                colorPalette={"green"}
                size={"sm"}
                pr={0}
                opacity={sentPercentage === 100 ? 0.7 : 1}
              >
                <ProgressCircleRing css={{ "--thickness": "3px" }} />
                <ProgressCircleValueText fontSize={"10px"} />
              </ProgressCircleRoot>
            </div>
          );
        },
      },
      // {
      //   key: "finishPercentage",
      //   name: "Finalizada",
      //   styles: { width: 90 },
      //   render: ({ finishPercentage }) => {
      //     return (
      //       <div className="flex items-center justify-center">
      //         <ProgressCircleRoot
      //           value={finishPercentage}
      //           colorPalette={"green"}
      //           size={"sm"}
      //           pr={0}
      //           opacity={finishPercentage === 100 ? 0.7 : 1}
      //         >
      //           <ProgressCircleRing css={{ "--thickness": "3px" }} />
      //           <ProgressCircleValueText fontSize={"10px"} />
      //         </ProgressCircleRoot>
      //       </div>
      //     );
      //   },
      // },
      {
        key: "status",
        name: "Status",
        styles: { width: 135 },
        render: ({ status }) => {
          const sts: TypeStatusCampaign = status;
          return (
            <div className="flex items-center">
              <span
                style={{
                  background: translateType[sts].cb,
                  color: translateType[sts].ct,
                  fontWeight: sts === "running" ? 600 : 400,
                }}
                className="p-1 px-2 text-sm rounded-sm border border-white/10"
              >
                {translateType[sts].value}
              </span>
            </div>
          );
        },
      },
      // {
      //   key: "business",
      //   name: "Negócio",
      //   styles: { width: 220 },
      // },
      {
        key: "createAt",
        name: "Data de criação",
        styles: { width: 135 },
        render(row) {
          return moment(row.createAt).format("DD/MM/YYYY");
        },
      },
      {
        key: "actions",
        name: "Ações",
        styles: { width: 43 * 3 },
        render(row) {
          return (
            <div className="flex h-full items-center gap-x-1.5">
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    content: <ModalViewCampaign close={close} id={row.id} />,
                  })
                }
              >
                <LuEye color={"#dbdbdb"} />
              </Button>
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    content: <ModalEditCampaign close={close} id={row.id} />,
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
                      <ModalDeleteCampaign
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

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold flex items-center gap-x-2">
            {!isPremium && (
              <Tooltip
                content="Disponível apenas para usuários Premium."
                positioning={{ placement: "right" }}
                contentProps={{
                  color: "#e2a011",
                  background: "#2e2c2c",
                  fontSize: "14px",
                }}
              >
                <Badge bg={"#cac0393c"} color={"#ffc444"} p={"7px"}>
                  <FaCrown size={20} />
                </Badge>
              </Tooltip>
            )}
            Campanhas
          </h1>
          <ModalCreateCampaign
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Gerenciar, automatizar e escalar disparos de campanhas de forma
          eficiente.
        </p>
      </div>
      <div style={{ maxHeight: "calc(100vh - 180px)" }} className="grid flex-1">
        <TableComponent
          rows={campaigns || []}
          columns={renderColumns}
          textEmpity="Suas campanha aparecerão aqui."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
