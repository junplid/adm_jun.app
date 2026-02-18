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
import {
  useDeleteConnectionIG,
  useDeleteConnectionWA,
} from "../../../hooks/connectionWA";

interface PropsModalDelete {
  data: { id: number; name: string; type: "msg" | "ig" } | null;
  close: () => void;
}

export const ModalDeleteConnectionWA: React.FC<PropsModalDelete> = ({
  data,
  ...props
}): JSX.Element => {
  const { mutateAsync: deleteConnectionWA, isPending } = useDeleteConnectionWA({
    async onSuccess() {
      props.close();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const { mutateAsync: deleteConnectionIG, isPending: ispendingig } =
    useDeleteConnectionIG({
      async onSuccess() {
        props.close();
        await new Promise((resolve) => setTimeout(resolve, 220));
      },
    });

  const onDelete = useCallback(async (): Promise<void> => {
    try {
      if (data?.id) {
        if (data.type === "msg") await deleteConnectionWA(data.id);
        if (data?.type === "ig") await deleteConnectionIG(data.id);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, [data?.id]);

  return (
    <DialogContent w={"370px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Deletar conexão</DialogTitle>
        <DialogDescription color={"#f86363"}>
          Essa ação não poderá ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-y-1.5">
          <p className="">
            Tem certeza de que deseja deletar a conexão{" "}
            <strong className="font-semibold text-lg">{data?.name}</strong>?
          </p>
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger>
          <Button colorPalette={"red"} disabled={isPending || ispendingig}>
            Cancelar
          </Button>
        </DialogActionTrigger>
        <Button
          onClick={onDelete}
          loading={isPending || ispendingig}
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
