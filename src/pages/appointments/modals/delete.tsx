import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogDescription,
} from "@components/ui/dialog";
import { AxiosError } from "axios";
import { useCallback, JSX, useState, useContext } from "react";
import { Button } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import { deleteAppointment } from "../../../services/api/Appointments";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";

interface PropsModalDelete {
  data: { id: number; name: string } | null;
  close: () => void;
}
export const ModalDeleteAppaintment: React.FC<PropsModalDelete> = ({
  ...props
}): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const [load, setLoad] = useState(false);

  const onDelete = useCallback(async (): Promise<void> => {
    try {
      if (props.data?.id) {
        setLoad(true);
        await deleteAppointment(props.data.id);
        setLoad(true);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
      } else {
        console.log("Error-Client", error);
      }
    }
  }, [props.data?.id]);

  return (
    <DialogContent w={"370px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Deletar compromisso</DialogTitle>
        <DialogDescription color={"#f86363"}>
          Essa ação não poderá ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-y-1.5">
          <p className="">
            Tem certeza de que deseja deletar o compromisso{" "}
            <strong className="font-semibold text-lg">
              {props.data?.name}
            </strong>
            ?
          </p>
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger>
          <Button colorPalette={"red"} disabled={load}>
            Cancelar
          </Button>
        </DialogActionTrigger>
        <Button
          onClick={onDelete}
          loading={load}
          loadingText={"Deletando, aguarde..."}
          variant="outline"
        >
          Deletar permanentemente.
        </Button>
      </DialogFooter>
      <DialogCloseTrigger>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
