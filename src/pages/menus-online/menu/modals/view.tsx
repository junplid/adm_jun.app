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
import { ModalDeleteVariable } from "./delete";
import { useGetVariableDetails } from "../../../../hooks/variable";
import { useDialogModal } from "../../../../hooks/dialog.modal";

interface IProps {
  id: number;
  close: () => void;
  isDelete?: boolean;
}

function Content({ id, close, isDelete }: IProps) {
  const { data, isFetching, status } = useGetVariableDetails(id);
  const { dialog, onOpen } = useDialogModal({});

  const footer = (
    <DialogFooter>
      <DialogActionTrigger>
        <Button colorPalette={"red"}>Fechar</Button>
      </DialogActionTrigger>
      {id && (
        <Button
          loading={isFetching}
          disabled={!isDelete}
          variant="outline"
          onClick={() => {
            onOpen({
              content: (
                <ModalDeleteVariable
                  close={close}
                  data={data ? { id, name: data.name } : null}
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
            <span className="text-red-500">Nenhum dado encontrado</span>
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

export const ModalViewVariable: React.FC<IProps> = ({
  id,
  close,
  isDelete = false,
}): JSX.Element => {
  return (
    <DialogContent w={"410px"} minH={"400px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Vizualizar detalhes da variável</DialogTitle>
      </DialogHeader>
      <Content id={id} close={close} isDelete={isDelete} />
      <DialogCloseTrigger>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
