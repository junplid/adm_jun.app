import { JSX, useContext, useMemo } from "react";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateFlow } from "./modals/create";
import { ModalDeleteFbPixel } from "./modals/delete";
import { Badge, Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditTag } from "./modals/edit";
import { useDialogModal } from "../../hooks/dialog.modal";
import { useGetFbPixels } from "../../hooks/fbPixel";
import moment from "moment";
import { Tooltip } from "@components/ui/tooltip";
import { FaCrown } from "react-icons/fa";
import { AuthContext } from "@contexts/auth.context";

export interface FbPixelRow {
  business: { id: number; name: string } | null;
  pixel_id: string;
  id: number;
  name: string;
}

export const FbPixelsPage: React.FC = (): JSX.Element => {
  const {
    account: { isPremium },
  } = useContext(AuthContext);
  const { data: fbPixels, isFetching, isPending } = useGetFbPixels();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "name",
        name: "Nome do pixel",
      },
      {
        key: "pixel_id",
        name: "ID do pixel",
        styles: { width: 160 },
      },
      {
        key: "createAt",
        name: "Data de criação",
        styles: { width: 135 },
        render(row) {
          return (
            <div className="flex flex-col">
              <span>{moment(row.createAt).format("D/M/YY")}</span>
              <span className="text-xs text-white/50">
                {moment(row.createAt).format("HH:mm")}
              </span>
            </div>
          );
        },
      },
      {
        key: "actions",
        name: "",
        styles: { width: 43 * 3 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                size={"sm"}
                bg={"transparent"}
                disabled
                _hover={{ bg: "#ffffff21" }}
                _icon={{ width: "20px", height: "20px" }}
              >
                <LuEye color={"#dbdbdb"} />
              </Button>
              <Button
                onClick={() => {
                  onOpen({
                    content: <ModalEditTag close={close} id={row.id} />,
                  });
                }}
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#eb606028" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteFbPixel
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
            Pixels do Facebook
          </h1>
          <ModalCreateFlow
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Recurso essencial para otimizar suas campanhas, rastreando cada ação
          dos seus Leads dentro do{" "}
          <strong className="text-white/90 font-semibold">WhatsApp</strong>.
        </p>
      </div>
      <div style={{ maxHeight: "calc(100vh - 180px)" }} className="flex-1 grid">
        <TableComponent
          rows={fbPixels || []}
          columns={renderColumns}
          textEmpity="Seus pixels aparecerão aqui."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
