import { JSX, useEffect, useState } from "react";
import { DialogContent, DialogBody } from "@components/ui/dialog";
import { Spinner } from "@chakra-ui/react";
import { useUpdateMenuOnlineStatus } from "../../../../../../hooks/menu-online";

interface IProps {
  uuid: string;
  status: boolean;
  close(): void;
}

function Content({ status, uuid, close }: IProps) {
  const [errors, setErrors] = useState<
    {
      path: string;
      text: string;
    }[]
  >([]);

  const { mutateAsync, isPending, isError, isSuccess } =
    useUpdateMenuOnlineStatus({
      setError: (path, { message }) =>
        setErrors([...errors, { path, text: message! }]),
    });

  useEffect(() => {
    mutateAsync({ uuid, body: { status } });
  }, []);

  useEffect(() => {
    if (isSuccess) close();
  }, [isSuccess]);

  if (isPending) {
    return (
      <DialogBody
        p={10}
        className="flex items-center flex-col gap-y-1 justify-center"
      >
        <Spinner size={"lg"} />
        <span>Validando integridade...</span>
      </DialogBody>
    );
  }

  if (isError) {
    return (
      <DialogBody p={10}>
        <div className="flex flex-col">
          <span className="text-red-400">Servidor respondeu com error:</span>
          {errors.map((error) => (
            <div className="flex flex-col gap-y-1">
              <span className="text-sm text-red-300">{error.text}</span>
              {error.path === "root" && (
                <span className="text-neutral-400">
                  Se o erro persistir, entre em contato com o suporte!
                </span>
              )}
            </div>
          ))}
        </div>
      </DialogBody>
    );
  }

  return null;
}

export function ModalEditMenuStatus(props: IProps): JSX.Element {
  return (
    <DialogContent w={"398px"}>
      <Content {...props} />
    </DialogContent>
  );
}
