import {
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
} from "@components/ui/dialog";
import { JSX } from "react";
import { useGetCampaignDetails } from "../../../hooks/campaign";
import { Button, Spinner } from "@chakra-ui/react";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { ModalDeleteCampaign } from "./delete";
import moment from "moment";

interface IProps {
  id: number;
  close: () => void;
}

export const ModalViewCampaign: React.FC<IProps> = ({
  id,
  close,
}): JSX.Element => {
  const { data, isFetching, status } = useGetCampaignDetails(id);
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
                <ModalDeleteCampaign
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
              <strong>Última atualização:</strong>
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
};
