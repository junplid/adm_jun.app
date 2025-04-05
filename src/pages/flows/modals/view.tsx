import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  DialogFooter,
  DialogActionTrigger,
} from "@components/ui/dialog";
import { AxiosError } from "axios";
import moment from "moment";
import {
  Dispatch,
  SetStateAction,
  useState,
  JSX,
  useEffect,
  useContext,
} from "react";
import { FlowRow } from "..";
import { api } from "../../../services/api";
import { CloseButton } from "@components/ui/close-button";
import { AuthContext } from "@contexts/auth.context";
import { Button, Spinner } from "@chakra-ui/react";
import { ModalDeleteBusiness } from "./delete";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";

interface DataInfo {
  name: string;
  updateAt: Date;
  createAt: Date;
  id: number;
  description: string | null;
}

interface IProps {
  id: number | null;
  setBusinesses: Dispatch<SetStateAction<FlowRow[]>>;
  trigger: JSX.Element;
}

export const ModalViewBusiness: React.FC<IProps> = ({
  id,
  ...props
}): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setLoad(false);
        setDataInfo(null);
      }, 250);
      return;
    }
    (async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 220));
        const { data } = await api.get(`/private/businesses/${id}/details`);
        setDataInfo(data.business);
        setLoad(true);
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
    })();
  }, [open]);

  return (
    <>
      <DialogRoot
        onOpenChange={(details) => setOpen(details.open)}
        defaultOpen={false}
        placement={"bottom"}
        motionPreset="slide-in-bottom"
        lazyMount
        unmountOnExit
      >
        <DialogTrigger asChild>{props.trigger}</DialogTrigger>
        <DialogContent w={"410px"} minH={"400px"}>
          <DialogHeader flexDirection={"column"} gap={0}>
            <DialogTitle>Vizualizar detalhes da empresa</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex">
            {!load || !dataInfo ? (
              <div className="flex w-full items-center justify-center">
                <Spinner size={"lg"} />
              </div>
            ) : (
              <div className="flex flex-col gap-y-1">
                <div className="flex items-start gap-3">
                  <strong>ID:</strong>
                  <span>{id}</span>
                </div>
                <div className="flex items-start gap-3">
                  <strong>Nome:</strong>
                  <span>{dataInfo.name}</span>
                </div>
                {dataInfo.description && (
                  <div className="flex items-start gap-3">
                    <strong>Descrição:</strong>
                    <span>{dataInfo.description}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <strong>Data de criação:</strong>
                  <div className="flex items-center gap-2">
                    <span>
                      {moment(dataInfo.createAt).format("DD/MM/YYYY")}
                    </span>
                    <span className="text-xs text-white/50">
                      {moment(dataInfo.createAt).format("HH:mm")}
                    </span>
                  </div>
                </div>
                {dataInfo.createAt !== dataInfo.updateAt && (
                  <div className="flex items-start gap-3">
                    <strong>Ultima atualização:</strong>
                    <div className="flex items-center gap-2">
                      <span>
                        {moment(dataInfo.updateAt).format("DD/MM/YYYY")}
                      </span>
                      <span className="text-xs text-white/50">
                        {moment(dataInfo.updateAt).format("HH:mm")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger>
              <Button colorPalette={"red"}>Fechar</Button>
            </DialogActionTrigger>
            {dataInfo?.name && id && (
              <ModalDeleteBusiness
                setBusinesses={props.setBusinesses}
                data={{ id, name: dataInfo?.name }}
                trigger={<Button variant="outline">Deletar</Button>}
                placement="top"
              />
            )}
          </DialogFooter>
          <DialogCloseTrigger>
            <CloseButton size="sm" />
          </DialogCloseTrigger>
        </DialogContent>
      </DialogRoot>
    </>
  );
};
