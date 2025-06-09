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
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCookies } from "react-cookie";
import { AlertDialogComponent } from "../../../components/AlertDialog";
import LoadSpinnerComponent from "../../../components/LoadSpinner";
import { api } from "../../../services/api";
import { toast } from "react-toastify";
import { AuthorizationContext } from "../../../contexts/authorization.context";
import moment from "moment";
import { AttendantsAI } from "..";
import { ErrorResponse_I } from "../../../entities/ErrorResponse";

interface DataInfo {
  business: { name: string; id: number }[];
  name: string;
  description: string | null;
  briefing: string | null;
  personality: string | null;
  role: string | null;
  definitions: string | null;
  knowledgeBase: string | null;
  createAt: Date;
  updateAt: Date;
  ai: { id: number; name: string };
}

interface IProps {
  id: number | null;
  setAttendantsAI: Dispatch<SetStateAction<AttendantsAI[]>>;
  buttonJSX: (open: () => void) => JSX.Element;
  onClose?(): void;
}

export const ModalView: React.FC<IProps> = ({ id, ...props }): JSX.Element => {
  const { handleLogout } = useContext(AuthorizationContext);
  const [load, setLoad] = useState<boolean>(false);
  const [cookies] = useCookies(["auth"]);
  const { onClose, onOpen, isOpen } = useDisclosure({
    onClose: props.onClose,
  });

  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setLoad(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/private/attendant-ai/details/${id}`, {
          headers: { authorization: cookies.auth },
        });
        setDataInfo(data.attendantAI);
        setLoad(true);
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
    })();
  }, [isOpen]);

  const onDelete = useCallback(
    async (dat: { id: number | null }): Promise<void> => {
      try {
        await toast.promise(
          api.delete(`/private/attendant-ai/${dat?.id}`, {
            headers: { authorization: cookies.auth },
          }),
          {
            pending: "Apagando, aguarde...",
            success: "Atendente apagando com sucesso!",
          }
        );
        props.setAttendantsAI((sups) => sups.filter((b) => b.id !== dat.id));
        onClose();
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
    },
    [onClose, cookies.auth]
  );

  return (
    <>
      {props.buttonJSX(onOpen)}

      <Modal isOpen={isOpen} size={"2xl"} onClose={onClose} isCentered>
        <ModalOverlay
          bg="#01060aa3"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent background={"#0e171d"}>
          <ModalHeader className="text-white">
            Vizualizar atendente IA
          </ModalHeader>
          <ModalCloseButton color={"red.400"} />
          <ModalBody className="text-white">
            {!load || !dataInfo ? (
              <div className="flex h-72 items-center justify-center">
                <LoadSpinnerComponent />
              </div>
            ) : (
              <div className="grid gap-y-1.5">
                <div className="flex items-start gap-3">
                  <strong>ID:</strong>
                  <span>
                    {"#"}
                    {id}
                  </span>
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
                  <strong>Negócios:</strong>
                  <ul>
                    {dataInfo.business.map((bus) => (
                      <li key={bus.id}>
                        {"#"}
                        {bus.id} - {bus.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Data de criação:</strong>
                  <span className="p-0.5 px-1 text-sm">
                    {moment(dataInfo.createAt).format("DD/MM/YYYY")}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>útilma atualização:</strong>
                  <span className="p-0.5 px-1 text-sm">
                    {moment(dataInfo.updateAt).format("DD/MM/YYYY")}
                  </span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <AlertDialogComponent
              buttonJSX={(onOpen) => (
                <Button colorScheme="red" onClick={onOpen}>
                  Deletar atendente IA
                </Button>
              )}
              colorThemeButtonSubmit="red"
              labelButton="Deletar"
              labelButtonSubmit="Deletar"
              labelHeader="Deletar atendente IA"
              textBody="Tem certeza que deseja deletar esta atendente IA?"
              onSubmit={onDelete}
              data={{ id }}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
