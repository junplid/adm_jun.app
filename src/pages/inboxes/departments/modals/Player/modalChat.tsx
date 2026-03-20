import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@components/ui/dialog";
import { FC, JSX } from "react";
import { OnlyChatPlayer } from "./onlyChat";

interface PropsModalPlayer {
  data: { id: number; name: string };
  close: () => void;
  orderId?: number;
  appointmentId?: number;
}

export const PlayerInboxDepartment: React.FC<PropsModalPlayer> = ({
  ...props
}): JSX.Element => {
  //   const { setdepartmentOpenId } = useContext(SocketContext);

  //   useEffect(() => {
  //     setdepartmentOpenId(props.data.id || null);
  //     return () => {
  //       setdepartmentOpenId(null);
  //     };
  //   }, []);

  return (
    <>
      <DialogHeader
        mt={"-5px"}
        flexDirection={"column"}
        gap={0}
        className="max-[470px]:p-4!  max-[470px]:pb-0!"
      >
        <DialogTitle className="line-clamp-1 sm:text-base! text-sm!">
          {props.data.name}
        </DialogTitle>
      </DialogHeader>
      <DialogBody p={{ base: "10px", md: "20px" }}>
        <div className="h-full">
          <OnlyChatPlayer
            orderId={props.orderId}
            closeModal={props.close}
            id={props.data.id}
          />
        </div>
      </DialogBody>
    </>
  );
};

export const ModalChatPlayer: FC<PropsModalPlayer> = (p) => {
  return (
    <DialogContent
      zIndex={1}
      maxH={"700px"}
      m={{ md: "20px", base: "7px" }}
      className="sm:h-[calc(100vh-50px)] h-[calc(100svh-20px)]"
    >
      <PlayerInboxDepartment {...p} orderId={p.orderId} />
      <div className="md:hidden block">
        <DialogCloseTrigger className="-translate-y-2 translate-x-2" />
      </div>
    </DialogContent>
  );
};
