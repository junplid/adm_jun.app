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
import { ModalDeleteChatbot } from "./delete";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { useGetChatbotDetails } from "../../../hooks/chatbot";
import { Tooltip } from "@components/ui/tooltip";
import { QrCode } from "@components/ui/qr-code";

interface IProps {
  id: number;
  close: () => void;
}

function Content({ id, close }: IProps) {
  const { data, isFetching, status } = useGetChatbotDetails(id);
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
                <ModalDeleteChatbot
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
      <DialogBody className="flex flex-col gap-y-4">
        <div>
          <div className="grid grid-cols-2 items-center gap-3">
            <Tooltip
              disabled={!data.target}
              contentProps={{ className: "!bg-white" }}
              content={<QrCode size={"lg"} value="askljakjsklasjljaslkasj" />}
            >
              <Button
                disabled={!data.target}
                w={"100%"}
                variant={"ghost"}
                size={"xs"}
              >
                Baixar QR code
              </Button>
            </Tooltip>
            <Button
              disabled={!data.target}
              w={"full"}
              variant={"ghost"}
              size={"xs"}
            >
              Copiar link
            </Button>
          </div>
          {!data.target && (
            <div className="text-white/80 text-center text-xs mt-2">
              QR Code e link aparecem quando a Conexão WA está ativa.
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 gap-y-1">
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

export const ModalViewChatbot: React.FC<IProps> = ({
  id,
  close,
}): JSX.Element => {
  return (
    <DialogContent w={"410px"} minH={"400px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Vizualizar detalhes do bot de recepção</DialogTitle>
      </DialogHeader>
      <Content id={id} close={close} />
      <DialogCloseTrigger>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
