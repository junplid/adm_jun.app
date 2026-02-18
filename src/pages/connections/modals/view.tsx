import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  DialogFooter,
  DialogActionTrigger,
} from "@components/ui/dialog";
import { JSX } from "react";
import { CloseButton } from "@components/ui/close-button";
import { Button, Spinner } from "@chakra-ui/react";
import { ModalDeleteConnectionWA } from "./delete";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { useGetConnectionWADetails } from "../../../hooks/connectionWA";

interface IProps {
  id: number;
  close: () => void;
}

function Content({ id, close }: IProps) {
  const { data, isFetching, status } = useGetConnectionWADetails(id);
  const { dialog, onOpen } = useDialogModal({});

  const footer = (
    <DialogFooter>
      <DialogActionTrigger>
        <Button colorPalette={"red"}>Fechar</Button>
      </DialogActionTrigger>
      {id && (
        <Button
          loading={isFetching}
          variant="outline"
          onClick={() => {
            onOpen({
              content: (
                <ModalDeleteConnectionWA
                  close={close}
                  data={data ? { id, name: data.name, type: "msg" } : null}
                />
              ),
            });
          }}
        >
          Deletar
        </Button>
      )}
      {dialog}
    </DialogFooter>
  );

  if (isFetching) {
    return (
      <>
        <DialogBody className="flex">
          <div className="flex w-full items-center justify-center">
            <Spinner size={"lg"} />
          </div>
        </DialogBody>
        {footer}
      </>
    );
  }

  if (!data || status === "error") {
    return (
      <>
        <DialogBody className="flex">
          <div className="flex w-full items-center justify-center">
            <span className="text-red-500">Nenhum dado encontrado.</span>
          </div>
        </DialogBody>
        {footer}
      </>
    );
  }

  return (
    <>
      <DialogBody className="flex">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-start gap-3">
            <strong>ID:</strong>
            <span>{id}</span>
          </div>
          <div className="flex items-start gap-3">
            <strong>Nome:</strong>
            <span>{data.name}</span>
          </div>
          {/* {data.type && (
            <div className="flex items-start gap-3">
              <strong>type:</strong>
              <span>{data.type}</span>
            </div>
          )} */}
        </div>
      </DialogBody>
      {footer}
    </>
  );
}

export const ModalViewConnectionWA: React.FC<IProps> = ({
  id,
  close,
}): JSX.Element => {
  return (
    <DialogContent w={"410px"} minH={"400px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Visualizar detalhes da conexão</DialogTitle>
      </DialogHeader>
      <Content id={id} close={close} />
      <DialogCloseTrigger>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
