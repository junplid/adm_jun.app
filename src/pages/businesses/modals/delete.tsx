import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useCookies } from "react-cookie";
import { Business } from "..";
import { api } from "../../../services/api";
import { toast } from "react-toastify";

interface PropsModalDelete {
  data: { id: number; name: string } | null;
  setBusiness: Dispatch<SetStateAction<Business[]>>;
  buttonJSX: (onOpen: () => void) => JSX.Element;
}

export const ModalDelete: React.FC<PropsModalDelete> = (props): JSX.Element => {
  const [cookies] = useCookies(["auth"]);
  const { onClose, onOpen, isOpen } = useDisclosure();
  const [load, setLoad] = useState<boolean>(false);

  const onDelete = useCallback(async (): Promise<void> => {
    try {
      setLoad(true);
      await toast.promise(
        api.delete(`/private/business/${props.data?.id}`, {
          headers: { authorization: cookies.auth },
        }),
        {
          success: "Negócio deletado com sucesso!",
          pending: "Deletando negócio, aguarde...",
        }
      );
      props.setBusiness((business) =>
        business.filter((b) => b.id !== props.data?.id)
      );
      setLoad(false);
      await new Promise((res) => setTimeout(res, 100));
      onClose();
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          alert("Não autorizado");
        }
      }
    }
  }, [props]);

  return (
    <>
      {props.buttonJSX(onOpen)}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay
          bg="#01060aa3"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent background={"#0e171d"}>
          <ModalHeader className="text-white">Deletar negócio</ModalHeader>
          <ModalBody>
            <p className="text-white">
              Esta ação não poderá ser desfeita e apagará todos os dados ligados
              ao negócio{" "}
              <strong className="text-lg text-white">
                @{props.data?.name}
              </strong>
              , incluindo: parâmetros, públicos e campanhas
            </p>
          </ModalBody>
          <ModalFooter className="gap-x-4">
            <Button
              type="button"
              paddingX={"10"}
              colorScheme="green"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              isLoading={load}
              opacity={load ? 1 : 0.7}
              type="submit"
              colorScheme="red"
              onClick={onDelete}
            >
              Deletar permanentemente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
