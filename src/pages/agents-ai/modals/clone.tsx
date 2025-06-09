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
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";
import { useCookies } from "react-cookie";
import { AttendantsAI } from "..";
import { api } from "../../../services/api";
import { toast } from "react-toastify";
import { AuthorizationContext } from "../../../contexts/authorization.context";
import { ErrorResponse_I } from "../../../entities/ErrorResponse";

interface PropsModalClone {
  data: { id: number; name: string } | null;
  setAIs: Dispatch<SetStateAction<AttendantsAI[]>>;
  onClose?(): void;
  buttonJSX(open: () => void): JSX.Element;
}
export const ModalClone: React.FC<PropsModalClone> = (props): JSX.Element => {
  const { handleLogout } = useContext(AuthorizationContext);
  const [cookies] = useCookies(["auth"]);
  const [load, setLoad] = useState<boolean>(false);
  const { onClose, onOpen, isOpen } = useDisclosure({
    onClose: () => {
      if (props.onClose) props.onClose();
      setLoad(false);
    },
  });

  const clone = useCallback(async () => {
    try {
      setLoad(true);
      if (props.data) {
        const { data } = await toast.promise(
          api.post(`/private/clone-attendant-ai/${props.data.id}`, undefined, {
            headers: { authorization: cookies.auth },
          }),
          {
            pending: "Clonando, aguarde...",
            success: "Atendente clonado com sucesso!",
          }
        );
        props.setAIs((state) => [data.attendantAI, ...state]);
        onClose();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          handleLogout();
        }
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) {
            dataError.toast.forEach(({ text, ...rest }) => toast(text, rest));
          }
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              setError(path, { message: text })
            );
          }
        }
      }
    }
  }, [props.data]);

  return (
    <>
      {props.buttonJSX(onOpen)}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay
          bg="#01060aa3"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent background={"#0e171d"}>
          <ModalHeader className="text-white">
            Clonar atendente IA{" "}
            <small className="text-blue-400">@{props.data?.name}</small>
          </ModalHeader>
          <ModalBody>
            <p className="text-white">
              Esta ação irá clonar o atendente IA {`#${props.data?.id}`} e suas
              propriedades.
            </p>
          </ModalBody>
          <ModalFooter className="gap-x-4">
            <Button
              isDisabled={load}
              type="button"
              colorScheme="red"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              isLoading={load}
              paddingX={"10"}
              opacity={load ? 1 : 0.7}
              type="submit"
              colorScheme="blue"
              onClick={clone}
            >
              Clonar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
