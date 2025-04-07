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
import { useCallback, useState, JSX } from "react";
import { Button } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import { useDeleteFlow } from "../../../hooks/flow";

interface PropsModalDelete {
  data: { id: number; name: string } | null;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

export const ModalDeleteFlow: React.FC<PropsModalDelete> = ({
  placement = "bottom",
  ...props
}): JSX.Element => {
  const [open, setOpen] = useState(false);

  const { mutateAsync: deleteFlow, isPending } = useDeleteFlow({
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const onDelete = useCallback(async (): Promise<void> => {
    try {
      if (props.data?.id) await deleteFlow(props.data?.id);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
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
          <DialogTitle>Deletar construtor de fluxo</DialogTitle>
          <DialogDescription color={"#f86363"}>
            Essa ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-y-1.5">
            <p className="">
              Tem certeza de que deseja deletar o construtor{" "}
              <strong className="font-semibold text-lg">
                {props.data?.name}
              </strong>
              ?
            </p>
            <p>
              Construtor será deletado permanentemente e não poderá ser
              recuperado.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger>
            <Button colorPalette={"red"} disabled={isPending}>
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button
            onClick={onDelete}
            loading={isPending}
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
