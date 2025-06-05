import { JSX, useMemo } from "react";
import moment from "moment";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateFlow } from "./modals/create";
import { ModalDeleteFlow } from "./modals/delete";
import { Button, Image } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { IoAdd } from "react-icons/io5";
import { ModalEditFlow } from "./modals/edit";
import { useGetStorageFiles } from "../../hooks/storage-file";
import { useDialogModal } from "../../hooks/dialog.modal";
import { IoMdImage } from "react-icons/io";
import {
  PiFileAudioFill,
  PiFileFill,
  PiFilePdfFill,
  PiFileTextFill,
  PiFileVideoFill,
} from "react-icons/pi";
import { Tooltip } from "@components/ui/tooltip";
import { api } from "../../services/api";

export interface StorageFileRow {
  id: number;
  businesses: { id: number; name: string }[];
  size: string | null;
  originalName: string;
  fileName: string;
  mimetype: string | null;
}

export const StoragePage: React.FC = (): JSX.Element => {
  const { data: storageFiles, isFetching, isPending } = useGetStorageFiles();
  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "mimetype",
        name: "",
        styles: { width: 30 },
        render(row) {
          if (/^image\//.test(row.mimetype)) {
            return <IoMdImage color="#6daebe" size={24} />;
          }
          if (/^video\//.test(row.mimetype)) {
            return <PiFileVideoFill color="#8eb87a" size={24} />;
          }
          if (/^audio\//.test(row.mimetype)) {
            return <PiFileAudioFill color="#d4b663" size={24} />;
          }
          if (row.mimetype === "application/pdf") {
            return <PiFilePdfFill color="#db8c8c" size={24} />;
          }
          if (/^text\//.test(row.mimetype)) {
            return <PiFileTextFill color="#ffffff" size={24} />;
          }
          return <PiFileFill color="#808080" size={24} />;
        },
      },
      {
        key: "originalName",
        name: "Nome do arquivo",
        render(row) {
          if (/^image\//.test(row.mimetype)) {
            return (
              <Tooltip
                positioning={{ placement: "right" }}
                content={
                  <Image
                    src={api.getUri() + "/public/storage/" + row.fileName}
                    alt="Imagem"
                    maxW={200}
                    h={"auto"}
                  />
                }
              >
                <span>{row.originalName}</span>
              </Tooltip>
            );
          }
          return (
            <div className="flex items-center gap-x-2">
              <span>{row.originalName}</span>
            </div>
          );
        },
      },
      {
        key: "size",
        name: "Size",
        styles: { width: 120 },
      },
      {
        key: "createAt",
        name: "Data de criação",
        styles: { width: 200 },
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
        styles: { width: 200 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                size={"sm"}
                bg={"#60d6eb13"}
                _hover={{ bg: "#30c9e422" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() =>
                  onOpen({
                    content: <ModalEditFlow close={close} id={row.id} />,
                  })
                }
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                bg={"#eb606013"}
                _hover={{ bg: "#eb606028" }}
                _icon={{ width: "20px", height: "20px" }}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteFlow
                        data={{ id: row.id, name: row.originalName }}
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
    <div className=" h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold">Storage</h1>
          <ModalCreateFlow
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Armazene e gerencie os arquivos utilizados em seus projetos. Aqui,
          você pode salvar documentos, áudios, vídeos e outros formatos para
          suas operações.
        </p>
      </div>

      <div
        style={{ maxHeight: "calc(100vh - 180px)" }}
        className="relative grid flex-1"
      >
        <TableComponent
          rows={storageFiles || []}
          columns={renderColumns}
          textEmpity="Nenhum arquivo criado."
          load={isFetching || isPending}
        />
      </div>
      {DialogModal}
    </div>
  );
};
