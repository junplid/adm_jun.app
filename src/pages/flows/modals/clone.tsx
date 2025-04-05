import {
  Button,
  Modal,
  Checkbox,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
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
import { Business } from "..";
import LoadSpinnerComponent from "../../../components/LoadSpinner";
import { api } from "../../../services/api";
import { AuthorizationContext } from "../../../contexts/authorization.context";
import { toast } from "react-toastify";
import { ErrorResponse_I } from "../../../entities/ErrorResponse";

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

interface Fields {
  flow?: boolean; // quando diz pra clonar fluxo, já quer dizer clonar tags, variaveis, checkpoints, links, numberos e endereços de geo localização
  kanban?: boolean; //
  sector?: boolean; //
  connection?: boolean;
  audience?: boolean; //
  receptiveService?: boolean; // aqui quer dizer que é o atendimento receptivo
}

export const ModalClone: React.FC<IProps> = ({ id, ...props }): JSX.Element => {
  const { handleLogout } = useContext(AuthorizationContext);
  const [load, setLoad] = useState<boolean>(false);
  const [loadClone, setLoadClone] = useState<boolean>(false);

  const [cookies] = useCookies(["auth"]);
  const { onClose, onOpen, isOpen } = useDisclosure({
    onClose: props.onClose,
    async onOpen() {
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
            handleLogout();
          }
        }
      }
    },
  });
  const [fields, setFields] = useState<Fields>({} as Fields);

  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);

  const handleChange = (field: keyof Fields) => {
    setFields((prevFields) => ({
      ...prevFields,
      [field]: !prevFields[field],
    }));
  };

  const clone = useCallback(
    async (fields: Fields) => {
      try {
        setLoadClone(true);
        const { data } = await toast.promise(
          api.post(`/private/clone-business/${id}`, fields, {
            headers: { authorization: cookies.auth },
          }),
          {
            success: "Negócio clonado com sucesso!",
            pending: "Clonando negócio, aguarde...",
          }
        );

        props.setBusiness((businesss) => [data.business, ...businesss]);
        await new Promise((res) => setTimeout(res, 200));
        onClose();
      } catch (error) {
        setLoadClone(false);
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
    [id]
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
          <ModalHeader className="text-white">Clonar negócio</ModalHeader>
          <ModalCloseButton color={"red.400"} />
          <ModalBody className="text-white">
            {!load || !dataInfo ? (
              <div className="flex h-72 items-center justify-center">
                <LoadSpinnerComponent />
              </div>
            ) : (
              <VStack p={0} gap={3} alignItems={"start"}>
                <h3>Selecione os recursos que serão clonados</h3>
                <VStack align="start" gap={1}>
                  <Checkbox
                    isChecked={fields.flow}
                    onChange={() => handleChange("flow")}
                    opacity={fields.flow ? 1 : 0.5}
                  >
                    <span className="text-sm">
                      Clonar fluxos (tags, variáveis, checkpoints, etc.)
                    </span>
                  </Checkbox>
                  <Checkbox
                    isChecked={fields.kanban}
                    onChange={() => handleChange("kanban")}
                    opacity={fields.kanban ? 1 : 0.5}
                  >
                    <span className="text-sm">Clonar Kanbans</span>
                  </Checkbox>
                  <Checkbox
                    isChecked={fields.sector}
                    onChange={() => handleChange("sector")}
                    opacity={fields.sector ? 1 : 0.5}
                  >
                    <span className="text-sm">Clonar setores</span>
                  </Checkbox>
                  <Checkbox
                    isChecked={fields.connection}
                    onChange={() => handleChange("connection")}
                    opacity={fields.connection ? 1 : 0.5}
                  >
                    <span className="text-sm">Clonar conexões</span>
                  </Checkbox>
                  <Checkbox
                    isChecked={fields.audience}
                    onChange={() => handleChange("audience")}
                    opacity={fields.audience ? 1 : 0.5}
                  >
                    <span className="text-sm">Clonar públicos</span>
                  </Checkbox>
                  <Checkbox
                    isChecked={fields.receptiveService}
                    onChange={() => handleChange("receptiveService")}
                    opacity={fields.receptiveService ? 1 : 0.5}
                  >
                    <span className="text-sm">
                      Clonar atendimento receptivo
                    </span>
                  </Checkbox>
                </VStack>
              </VStack>
            )}
            <p className="mt-3 text-sm text-white/75">
              <strong className="text-orange-400">Atenção</strong>: Se o limite
              de recursos do seu <strong>plano + recursos-extras</strong> for
              atingido (como conexões, públicos setores, etc...), não será
              possível clonar novos recursos desse tipo.
            </p>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button isDisabled={loadClone} colorScheme="red" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              isDisabled={loadClone}
              colorScheme="green"
              onClick={() => {
                if (loadClone) return;
                clone(fields);
              }}
            >
              Clonar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
