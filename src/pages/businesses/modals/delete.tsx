import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogDescription,
} from "@components/ui/dialog";
import { AxiosError } from "axios";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  JSX,
  useContext,
} from "react";
import { BusinessRow } from "..";
import { toaster } from "@components/ui/toaster";
import { deleteBusiness } from "../../../services/api/Business";
import { Button } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";

interface PropsModalDelete {
  data: { id: number; name: string } | null;
  setBusinesses: Dispatch<SetStateAction<BusinessRow[]>>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

export const ModalDeleteBusiness: React.FC<PropsModalDelete> = ({
  placement = "bottom",
  ...props
}): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const [load, setLoad] = useState(false);
  const [open, setOpen] = useState(false);

  const onDelete = useCallback(async (): Promise<void> => {
    try {
      setLoad(true);
      if (props.data?.id) {
        deleteBusiness(props.data?.id);
        setOpen(false);
        await new Promise((resolve) => setTimeout(resolve, 220));
        props.setBusinesses((business) =>
          business.filter((b) => b.id !== props.data?.id)
        );
      }
      setLoad(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              setError(path, { message: text })
            );
          }
        }
      }
    }
  }, [props.data?.id]);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      defaultOpen={false}
      placement={placement}
      motionPreset="slide-in-bottom"
      lazyMount
      unmountOnExit
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent w={"410px"}>
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Deletar empresa</DialogTitle>
          <DialogDescription color={"#f86363"}>
            Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-y-1.5">
            <p className="">
              Tem certeza de que deseja deletar a empresa{" "}
              <strong className="font-semibold text-lg">
                {props.data?.name}
              </strong>
              ?
            </p>
            <p>
              Todos os dados associados, incluindo conexões, fluxos e
              automações... serão permanentemente removidos. Esta ação é
              irreversível.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger>
            <Button colorPalette={"red"} loading={load}>
              Cancel
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
    </DialogRoot>
  );
};
