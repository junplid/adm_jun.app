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
import { useCallback, JSX } from "react";
import { Button } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import { useDeleteAgentAI } from "../../../hooks/agentAI";

interface PropsModalDelete {
  data: { id: number; name: string } | null;
  close: () => void;
}

export const ModalDeleteAgentAI: React.FC<PropsModalDelete> = (
  props
): JSX.Element => {
  const { mutateAsync: deleteBusiness, isPending } = useDeleteAgentAI({
    async onSuccess() {
      props.close();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const onDelete = useCallback(async (): Promise<void> => {
    try {
      if (props.data?.id) await deleteBusiness(props.data?.id);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, [props.data?.id]);

  return (
    <DialogContent w={"370px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Deletar agente IA</DialogTitle>
        <DialogDescription color={"#f86363"}>
          Essa ação não poderá ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-y-1.5">
          <p className="">
            Tem certeza de que deseja deletar o agente IA{" "}
            <strong className="font-semibold text-lg">
              {props.data?.name}
            </strong>
            ?
          </p>
          <p>Fluxos de conversa e outras automações poderam falhar.</p>
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
  );
};
