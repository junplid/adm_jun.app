import { useContext, useEffect, useState } from "react";
import { Button, Spinner } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "@contexts/auth.context";
import { GrConnectivity } from "react-icons/gr";
import { ModalPairCodeAppAgent } from "./pair-modal";
import { unpairMenuOnlineCodeDevice } from "../../../../../../services/api/MenuOnline";

export function SectionPairCodeAgentMenuOnlineConfig(props: {
  status_device: boolean;
}) {
  const { logout } = useContext(AuthContext);
  const { uuid } = useParams<{ uuid: string }>();
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [isPair, setIsPair] = useState<boolean>(false);

  const unpair = () => {
    if (!uuid) return;
    (async () => {
      try {
        setIsLoad(true);
        await unpairMenuOnlineCodeDevice(uuid);
        setIsLoad(false);
      } catch (error) {
        setIsLoad(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          // if (error.response?.status === 400) {
          //   const dataError = error.response?.data as ErrorResponse_I;
          //   if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          //   if (dataError.input.length) {
          //     dataError.input.forEach(({ text, path }) =>
          //       // @ts-expect-error
          //       props?.setError?.(path, { message: text })
          //     );
          //   }
          // }
        }
      }
    })();
  };

  //

  return (
    <section className="space-y-3">
      <div className="flex gap-x-2 items-center">
        <h3 className="text-lg font-bold">Dispositivo</h3>
        {isLoad && <Spinner />}
        {!props.status_device ? (
          <ModalPairCodeAppAgent
            onCreate={() => {}}
            menuUuid={uuid!}
            trigger={
              <Button colorPalette={"green"} size={"xs"}>
                <GrConnectivity />
              </Button>
            }
          />
        ) : (
          <>
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-green-300">Conectado</span>
            <Button colorPalette={"red"} size={"xs"} variant={"outline"}>
              <GrConnectivity />
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
