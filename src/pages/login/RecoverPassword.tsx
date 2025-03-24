import {
  Button,
  Input,
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
import { useCallback, useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { api } from "../../services/api";

interface PropsRecoverPasswordComponent_I {}

interface IFieldsErrors {
  email: string | null;
  password: string | null;
}

export default function RecoverPasswordComponent(
  _props: PropsRecoverPasswordComponent_I
): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [fieldsErrors, setFieldsErrors] = useState<IFieldsErrors>(
    {} as IFieldsErrors
  );
  const [sucess, setSucess] = useState<"OK" | "ERROR" | "OFF">("OFF");
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      setEmail("");
      setFieldsErrors({} as IFieldsErrors);
    },
  });

  const [load, setLoad] = useState(false);

  const submit = useCallback(async () => {
    try {
      setLoad(true);
      const { data } = await api.post("/public/send-password-recovery-email", {
        email,
      });
      setSucess(data.sucess);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      if (error instanceof AxiosError) {
        console.log(error);
      }
    }
  }, [email]);

  return (
    <>
      <a
        className="cursor-pointer text-base text-slate-50 duration-300 hover:text-yellow-400"
        onClick={onOpen}
      >
        Esqueci minha senha
      </a>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay
          bg="#01060aa3"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent background={"#0e171d"}>
          <ModalHeader className="text-white">Recuperar senha</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {sucess === "OK" && (
              <div className="space-y-2 text-white">
                <FaRegCheckCircle size={35} />
                <p className="text-lg">
                  Link de recurepação enviado para o e-mail:{" "}
                  <strong className="font-medium text-blue-400">{email}</strong>
                </p>
              </div>
            )}
            {sucess === "OFF" && (
              <div className="space-y-3 text-white">
                <span className="text-white/50">
                  Enviaremos um e-mail com instruções para redefinir sua senha.
                  Verifique também sua <strong>lixeira e caixa de spam</strong>.
                </span>
                <label className="flex flex-col gap-y-2">
                  <p className="text-lg">Digite o e-mail</p>
                  <Input
                    focusBorderColor="#f6bb0b"
                    borderColor={fieldsErrors.password ? "#ee0808" : "#3c3747"}
                    borderWidth={fieldsErrors.password ? 2 : 1}
                    autoComplete="off"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="flex gap-x-3">
              <Button type="button" colorScheme="red" onClick={onClose}>
                Fechar
              </Button>
              {sucess === "OFF" && email && (
                <Button
                  onClick={() => {
                    if (!load) submit();
                  }}
                  type="submit"
                  isLoading={load}
                  colorScheme="blue"
                >
                  Recuperar
                </Button>
              )}
              {sucess === "OK" && (
                <Button
                  type="button"
                  colorScheme="blue"
                  onClick={() => {
                    setSucess("OFF");
                    setEmail("");
                  }}
                >
                  Enviar novamente
                </Button>
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
