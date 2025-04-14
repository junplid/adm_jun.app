import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  DialogFooter,
  DialogActionTrigger,
} from "@components/ui/dialog";
import moment from "moment";
import { JSX } from "react";
import { CloseButton } from "@components/ui/close-button";
import { Button, Spinner } from "@chakra-ui/react";
import { ModalDeleteBusiness } from "./delete";
import { useGetBusinessDetails } from "../../../hooks/business";
import { useDialogModal } from "../../../hooks/dialog.modal";

interface IProps {
  id: number;
  close: () => void;
}

function Content({ id, close }: { id: number; close: () => void }) {
  const { data, isFetching, status } = useGetBusinessDetails(id);
  const { dialog, onOpen } = useDialogModal({});

  const footer = (
    <DialogFooter>
      <DialogActionTrigger>
        <Button colorPalette={"red"}>Fechar</Button>
      </DialogActionTrigger>
      {id && (
        <Button
          loading={isFetching}
          disabled={!data?.name}
          variant="outline"
          onClick={() => {
            onOpen({
              content: (
                <ModalDeleteBusiness
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
          {data.description && (
            <div className="flex items-start gap-3">
              <strong>Descrição:</strong>
              <span>{data.description}</span>
            </div>
          )}
          <div className="flex items-start gap-3">
            <strong>Data de criação:</strong>
            <div className="flex items-center gap-2">
              <span>{moment(data.createAt).format("DD/MM/YYYY")}</span>
              <span className="text-xs text-white/50">
                {moment(data.createAt).format("HH:mm")}
              </span>
            </div>
          </div>
          {data.createAt !== data.updateAt && (
            <div className="flex items-start gap-3">
              <strong>Ultima atualização:</strong>
              <div className="flex items-center gap-2">
                <span>{moment(data.updateAt).format("DD/MM/YYYY")}</span>
                <span className="text-xs text-white/50">
                  {moment(data.updateAt).format("HH:mm")}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogBody>
      {footer}
    </>
  );
}

export const ModalViewBusiness: React.FC<IProps> = ({
  id,
  close,
}): JSX.Element => {
  return (
    <DialogContent w={"410px"} minH={"400px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Vizualizar detalhes da empresa</DialogTitle>
      </DialogHeader>
      <Content id={id} close={close} />
      <DialogCloseTrigger>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
