import { AxiosError } from "axios";
import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import { useCookies } from "react-cookie";
import { AttendantsAI } from "..";
import { api } from "../../../services/api";
import { ModalComponent } from "../../../components/Modal";
import { AuthorizationContext } from "../../../contexts/authorization.context";
import { toast } from "react-toastify";
import { ErrorResponse_I } from "../../../entities/ErrorResponse";

interface PropsModalDelete {
  data?: { id: number; name: string };
  setAttendantsAI: Dispatch<SetStateAction<AttendantsAI[]>>;
  buttonJSX: (onOpen: () => void) => JSX.Element;
}

export const ModalDelete: React.FC<PropsModalDelete> = (props): JSX.Element => {
  const [cookies] = useCookies(["auth"]);
  const { handleLogout } = useContext(AuthorizationContext);

  const onDelete = useCallback(
    async (close: () => void): Promise<void> => {
      try {
        await toast.promise(
          api.delete(`/private/attendant-ai/${props.data?.id}`, {
            headers: { authorization: cookies.auth },
          }),
          {
            pending: "Apagando, aguarde...",
            success: "Atendente apagando com sucesso!",
          }
        );
        props.setAttendantsAI((ias) =>
          ias.filter((b) => b.id !== props.data?.id)
        );
        close();
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
    [props]
  );

  return (
    <ModalComponent
      buttonJSX={props.buttonJSX}
      title="Deletar atendente IA"
      textButtonSubmit="Deletar"
      textButtonClose="Cancelar"
      onSubmit={(close) => onDelete(close)}
    >
      {() => (
        <p className="text-white">
          Esta ação não poderá ser desfeita e apagará a atendente IA{" "}
          <strong className="text-sm text-green-400">
            @{props.data?.name}
          </strong>
        </p>
      )}
    </ModalComponent>
  );
};
