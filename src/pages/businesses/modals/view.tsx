import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import moment from "moment";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useCookies } from "react-cookie";
import { Business } from "..";
import { AlertDialogComponent } from "../../../components/AlertDialog";
import LoadSpinnerComponent from "../../../components/LoadSpinner";
import { api } from "../../../services/api";
import { toast } from "react-toastify";

interface DataInfo {
  name: string;
  connections: number;
  audiences: number;
  campaigns: number;
  description: string | null;
  updateAt: Date;
  createAt: Date;
  id: number;
}

interface IProps {
  id: number | null;
  setBusiness: Dispatch<SetStateAction<Business[]>>;
  buttonJSX: (open: () => void) => JSX.Element;
  onClose?(): void;
}

export const ModalView: React.FC<IProps> = ({ id, ...props }): JSX.Element => {
  const [load, setLoad] = useState<boolean>(false);
  const [cookies] = useCookies(["auth"]);
  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);

  const { onClose, onOpen, isOpen } = useDisclosure({
    onClose: props.onClose,
    onOpen: async () => {
      try {
        const token = cookies.auth;
        const { data } = await api.get(`/private/business/${id}`, {
          headers: { authorization: token },
        });
        setDataInfo(data.business);
        setLoad(true);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            alert("Não autorizado");
          }
        }
      }
    },
  });

  const onDelete = useCallback(
    async (dat: { id: number | null }): Promise<void> => {
      try {
        await toast.promise(
          api.delete(`/private/business/${dat.id}`, {
            headers: { authorization: cookies.auth },
          }),
          {
            success: "Negócio deletado com sucesso!",
            pending: "Deletando negócio, aguarde...",
          }
        );
        props.setBusiness((business) =>
          business.filter((b) => b.id !== dat.id)
        );
        await new Promise((res) => setTimeout(res, 100));
        onClose();
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            alert("Não autorizado");
          }
        }
      }
    },
    [props.setBusiness, onClose, cookies.auth]
  );

  return (
    <>
      {props.buttonJSX(onOpen)}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay
          bg="#01060aa3"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent background={"#0e171d"}>
          <ModalHeader className="text-white">Vizualizar negócio</ModalHeader>
          <ModalCloseButton color={"red.400"} />
          <ModalBody className="text-white">
            {!load || !dataInfo ? (
              <div className="flex h-72 items-center justify-center">
                <LoadSpinnerComponent />
              </div>
            ) : (
              <div className="grid gap-y-1">
                <div className="flex items-start gap-3">
                  <strong>ID:</strong>
                  <span>{id}</span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Nome:</strong>
                  <span>{dataInfo.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Descrição:</strong>
                  <span>{dataInfo.description}</span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Conexões WA:</strong>
                  <span>{dataInfo.connections}</span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Publicos:</strong>
                  <span>{dataInfo.audiences}</span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Campanhas:</strong>
                  <span>{dataInfo.campaigns}</span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Data de criação:</strong>
                  <span>{moment(dataInfo.createAt).format("DD/MM/YYYY")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Ultima atualização:</strong>
                  <span>{moment(dataInfo.updateAt).format("DD/MM/YYYY")}</span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <AlertDialogComponent
              buttonJSX={(onOpen) => (
                <Button colorScheme="red" onClick={onOpen}>
                  Deletar negócio
                </Button>
              )}
              colorThemeButtonSubmit="red"
              labelButton="Deletar"
              labelButtonSubmit="Deletar"
              labelHeader="Deletar negócio"
              textBody="Tem certeza que deseja deletar este negócio?"
              onSubmit={onDelete}
              data={{ id }}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
