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
import { ModalDeleteFlow } from "./delete";
import { useGetVariableDetails } from "../../../hooks/variable";

interface IProps {
  id: number;
}

function Content({ id }: { id: number }) {
  const { data, isFetching, status } = useGetVariableDetails(id);

  const footer = (
    <DialogFooter>
      <DialogActionTrigger>
        <Button colorPalette={"red"}>Fechar</Button>
      </DialogActionTrigger>
      {id && (
        <ModalDeleteFlow
          data={data ? { id, name: data.name } : null}
          trigger={
            <Button
              loading={isFetching}
              disabled={!data?.name}
              variant="outline"
            >
              Deletar
            </Button>
          }
          placement="top"
        />
      )}
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

export const ModalViewFlow: React.FC<IProps> = ({ id }): JSX.Element => {
  return (
    <DialogContent w={"410px"} minH={"400px"}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Vizualizar detalhes da empresa</DialogTitle>
      </DialogHeader>
      <Content id={id} />
      <DialogCloseTrigger>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
