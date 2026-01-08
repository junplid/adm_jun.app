import { JSX, useCallback, useContext, useEffect, useState } from "react";
import { CloseButton } from "@components/ui/close-button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
  DialogDescription,
} from "@components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LuChevronRight } from "react-icons/lu";
import { Button, Input, InputGroup, Spinner } from "@chakra-ui/react";
import { useHookFormMask } from "use-mask-input";
import { Field } from "@components/ui/field";
import { PinInput } from "@components/ui/pin-input";
import { SocketContext } from "@contexts/socket.context";
import ReactQRCode from "react-qr-code";

interface IProps {
  close: () => void;
  id: number;
}

const FormSchema = z.object({
  number: z
    .string()
    .min(1, "Campo obrigatório")
    .transform((s) => "+55" + s),
  // .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Número inválido"),
});

type Fields = z.infer<typeof FormSchema>;

function QRCode(props: {
  changeType: () => void;
  connectionId: number;
}): JSX.Element {
  const { socket } = useContext(SocketContext);
  const [qrCode, setQrCode] = useState<{ v: string; valid: boolean } | null>(
    null
  );

  const requestQRcode = useCallback(() => {
    setQrCode(null);
    socket.emit("revoke-session", { connectionWhatsId: props.connectionId });
    setTimeout(() => {
      socket.emit("create-session", { connectionWhatsId: props.connectionId });
    }, 3000);
  }, [socket, props.connectionId]);

  useEffect(() => {
    requestQRcode();
    socket.on(`qr-code-${props.connectionId}`, (data: string) =>
      setQrCode({ v: data, valid: true })
    );

    return () => {
      socket.off(`qr-code-${props.connectionId}`);
    };
  }, [socket]);

  return (
    <div className="grid items-start grid-cols-[1fr_300px] gap-x-1.5">
      <div className="w-full flex items-baseline flex-col gap-y-5">
        <ul className="flex flex-col gap-y-3 text-white/75">
          <li className="flex items-baseline gap-x-3">
            <span>1.</span>
            <p>Abra o WhatsApp no seu celular.</p>
          </li>
          <li className="flex items-baseline gap-x-3">
            <span>2.</span>
            <p className="">
              Toque em Mais opções no Android{" "}
              <span
                className="inline-block rounded-md border border-white/25 p-0.5"
                data-icon="menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  height="18"
                  width="16"
                  preserveAspectRatio="xMidYMid meet"
                  version="1.1"
                  x="0px"
                  y="0px"
                  enable-background="new 0 0 24 24"
                >
                  <title>menu</title>
                  <path
                    fill="currentColor"
                    d="M12,7c1.104,0,2-0.896,2-2c0-1.105-0.895-2-2-2c-1.104,0-2,0.894-2,2 C10,6.105,10.895,7,12,7z M12,9c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,9.895,13.104,9,12,9z M12,15 c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,15.894,13.104,15,12,15z"
                  ></path>
                </svg>
              </span>{" "}
              ou em Configurações{" "}
              <span
                aria-hidden="true"
                className="inline-block rounded-md border border-white/25 p-0.5"
                data-icon="settings-iphone"
              >
                <svg
                  viewBox="0 0 20 20"
                  height="16"
                  width="16"
                  preserveAspectRatio="xMidYMid meet"
                  fill="none"
                >
                  <title>settings-iphone</title>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10.6288 18.226L10.6289 18.226L10.6818 18.2213L11.1525 19.1073C11.2424 19.3011 11.4155 19.391 11.6508 19.3564C11.8723 19.3218 12.0038 19.1765 12.0315 18.955L12.1769 17.9652C12.6129 17.8475 13.0421 17.6814 13.4574 17.5014L14.1911 18.1521C14.3503 18.3113 14.5441 18.332 14.7587 18.2213C14.9386 18.1175 15.0078 17.9375 14.9732 17.7091L14.7656 16.7331C15.1324 16.477 15.4923 16.1863 15.8177 15.861L16.7244 16.2417C16.9321 16.3317 17.1189 16.2901 17.2851 16.0963C17.4304 15.9371 17.4443 15.7364 17.3197 15.5495L16.7936 14.6982C17.0566 14.3313 17.2712 13.9298 17.465 13.5145L18.4687 13.563C18.6902 13.5768 18.8632 13.4661 18.9324 13.2515C19.0016 13.0439 18.9393 12.8501 18.7663 12.7116L17.9911 12.0956C18.1018 11.6665 18.1918 11.2165 18.2264 10.7459L19.1678 10.4482C19.3823 10.3721 19.5 10.2198 19.5 9.99141C19.5 9.76992 19.3823 9.61764 19.1678 9.5415L18.2264 9.24387C18.1918 8.7732 18.1018 8.33021 17.9911 7.89414L18.7663 7.27119C18.9393 7.1466 18.9947 6.95972 18.9324 6.74515C18.8632 6.5375 18.6902 6.41983 18.4687 6.43367L17.465 6.4752C17.2712 6.05298 17.0566 5.65844 16.7936 5.29159L17.3197 4.44023C17.4443 4.26026 17.4304 4.05954 17.2851 3.90034C17.1189 3.70653 16.9321 3.665 16.7244 3.75498L15.8177 4.12875C15.4923 3.81036 15.1324 3.51272 14.7656 3.25662L14.9732 2.29451C15.0078 2.05917 14.9386 1.87229 14.7587 1.77538C14.5679 1.67079 14.3936 1.67557 14.2454 1.78974L13.4574 2.48832C13.0421 2.30143 12.6129 2.14915 12.1769 2.03149L12.0315 1.04861C12.0038 0.820192 11.8654 0.674837 11.6508 0.640228C11.4155 0.612542 11.2424 0.695602 11.1525 0.875565L10.6818 1.76846L10.2265 1.74488C10.1511 1.74231 10.075 1.74077 9.99654 1.74077C9.79063 1.74077 9.59596 1.75203 9.38212 1.76438L9.31129 1.76846L8.84754 0.875565C8.75756 0.695602 8.5776 0.612542 8.34226 0.640228C8.12769 0.674837 7.98925 0.820192 7.96157 1.04861L7.82313 2.02456C7.38015 2.14915 6.951 2.29451 6.5357 2.48832L5.80893 1.8446C5.64281 1.6854 5.449 1.66464 5.24135 1.77538C5.05446 1.87229 4.98525 2.05917 5.02678 2.29451L5.23443 3.25662C4.86066 3.51272 4.50073 3.81036 4.18233 4.12875L3.26867 3.75498C3.06794 3.665 2.88106 3.70653 2.71494 3.90034C2.56958 4.05954 2.55574 4.26026 2.67341 4.44023L3.20638 5.29159C2.94335 5.65844 2.72878 6.05298 2.52805 6.4752L1.53133 6.43367C1.30984 6.41983 1.13679 6.5375 1.06758 6.74515C0.991439 6.95972 1.04681 7.1466 1.2337 7.27119L2.00893 7.89414C1.89818 8.33021 1.8082 8.7732 1.78051 9.23695L0.83224 9.5415C0.610747 9.61764 0.5 9.763 0.5 9.99141C0.5 10.2198 0.610747 10.3721 0.83224 10.4482L1.78051 10.7459C1.8082 11.2165 1.89126 11.6665 2.00893 12.0956L1.2337 12.7116C1.05373 12.8431 0.998361 13.0369 1.06758 13.2515C1.13679 13.4661 1.30984 13.5768 1.53133 13.563L2.52805 13.5145C2.72186 13.9298 2.94335 14.3313 3.19945 14.6982L2.67341 15.5495C2.54882 15.7364 2.56266 15.9371 2.71494 16.0963C2.88106 16.2901 3.06794 16.3317 3.26867 16.2417L4.18233 15.861C4.50073 16.1863 4.86066 16.477 5.23443 16.7331L5.02678 17.7091C4.98525 17.9375 5.05446 18.1175 5.24135 18.2282C5.45592 18.332 5.64281 18.3113 5.80893 18.1521L6.5357 17.5014C6.951 17.6814 7.38015 17.8475 7.82313 17.9652L7.96157 18.955C7.98925 19.1765 8.12769 19.3218 8.34918 19.3634C8.5776 19.391 8.75756 19.3011 8.84754 19.1073L9.31129 18.2213C9.53971 18.242 9.76812 18.2628 9.99654 18.2628C10.2141 18.2628 10.4139 18.2451 10.6288 18.226ZM12.0869 9.48613C11.7408 8.4548 10.9448 7.85262 9.9827 7.85262C9.81658 7.85262 9.64353 7.87338 9.38051 7.9426L6.86794 3.63039C7.80237 3.16664 8.86138 2.90362 9.99654 2.90362C13.7689 2.90362 16.7313 5.78303 16.9805 9.48613H12.0869ZM5.95428 4.17721C4.15464 5.45772 3.00565 7.57575 3.00565 9.99833C3.00565 12.4071 4.1408 14.5113 5.91967 15.7918L8.50146 11.5557C8.03078 11.092 7.80929 10.5867 7.80929 10.0329C7.80929 9.47229 8.0377 8.95316 8.48761 8.50325L5.95428 4.17721ZM8.90291 10.026C8.90291 9.42384 9.4082 8.94624 9.98962 8.94624C10.5987 8.94624 11.0971 9.42384 11.0971 10.026C11.0971 10.6282 10.5987 11.1196 9.98962 11.1196C9.41512 11.1196 8.90291 10.6282 8.90291 10.026ZM6.83333 16.3455C7.77468 16.8231 8.84754 17.0931 9.99654 17.0931C13.7619 17.0931 16.7175 14.2206 16.9805 10.5244H12.0869C11.7546 11.5834 10.9587 12.2133 9.9827 12.2133C9.81658 12.2133 9.64353 12.1925 9.39435 12.1302L6.83333 16.3455Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </span>{" "}
              no iPhone
            </p>
          </li>
          <li className="flex items-baseline gap-x-3">
            <span>3.</span>
            <p>
              Toque em Dispositivos conectados e, em seguida, em Conectar
              dispositivo.
            </p>
          </li>
          <li className="flex items-baseline gap-x-3">
            <span>4.</span>
            <p>Aponte seu celular para esta tela para escanear o QR code.</p>
          </li>
        </ul>
        <button
          onClick={props.changeType}
          className="flex select-none opacity-25 items-center gap-x-1"
        >
          <a className="underline underline-offset-2 decoration-green-400/60">
            Entrar com o número de telefone
          </a>
          <LuChevronRight size={20} />
        </button>
      </div>
      <div className="mb-10">
        {!qrCode && (
          <div
            className="flex select-none flex-row-reverse bg-white/5 items-center justify-center gap-x-2 text-white"
            style={{ width: "300px", height: "300px" }}
          >
            <Spinner size={"md"} color={"#b1b1b187"} />
            <span className="text-base ">Gerando QR Code</span>
          </div>
        )}
        {qrCode && (
          <div className="relative p-1.5 bg-white">
            {!qrCode.valid && (
              <div
                onClick={requestQRcode}
                className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center bg-black/80 backdrop-blur-xs duration-200 hover:bg-black/75"
              >
                <p className="p-1 px-7 text-white">O QR Code expirou</p>
                <span className="text-white/70">Clique para gerar um novo</span>
              </div>
            )}
            <ReactQRCode value={qrCode.v} size={288} />
          </div>
        )}
      </div>
    </div>
  );
}

function PIN(props: {
  changeType: () => void;
  connectionId: number;
}): JSX.Element {
  const [pairingCode, setPairingCode] = useState<[string, string] | null>(null);
  const [load, setLoad] = useState<boolean>(false);
  const { socket } = useContext(SocketContext);

  const {
    handleSubmit,
    register,
    formState: { errors },
    getValues,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });
  const registerWithMask = useHookFormMask(register);

  const onClickChange = useCallback(() => {
    reset();
    props.changeType();
  }, []);

  const requestPairingCode = useCallback(
    (fields: Fields) => {
      setLoad(true);
      socket.emit("create-session", {
        connectionWhatsId: props.connectionId,
        ...fields,
      });
    },
    [socket, props.connectionId]
  );

  useEffect(() => {
    socket.emit("revoke-session", { connectionWhatsId: props.connectionId });
    socket.on(
      `pairing-code-${props.connectionId}`,
      (data: [string, string]) => {
        setLoad(false);
        setPairingCode(data);
      }
    );

    return () => {
      setLoad(false);
      socket.off("pairing-code");
      socket.off("revoke-session");
    };
  }, [socket]);

  if (pairingCode !== null) {
    return (
      <div className="w-full flex items-baseline flex-col gap-y-5">
        <div>
          <h2 className="text-white text-xl">Insira o código no seu celular</h2>
          <p className="text-white/75">
            Connectando a conta WhatsApp{" "}
            <strong className="font-semibold text-white">
              {getValues("number")}
            </strong>
          </p>
        </div>
        <div className="bg-[#645e580f] rounded-md p-5 w-full flex justify-center">
          <div className="flex items-center gap-x-2">
            <PinInput
              count={4}
              type="alphanumeric"
              disabled
              value={pairingCode[0].split("")}
              backgroundInput={"#ffffff31"}
              colorInput="#ffffff"
            />
            <span className="text-white">-</span>
            <PinInput
              count={4}
              type="alphanumeric"
              disabled
              value={pairingCode[1].split("")}
              backgroundInput={"#ffffff31"}
              colorInput="#ffffff"
            />
          </div>
        </div>
        <ul className="flex flex-col gap-y-3 text-white/75">
          <li className="flex items-baseline gap-x-3">
            <span>1.</span>
            <p>Abra o WhatsApp no seu celular.</p>
          </li>
          <li className="flex -mt-2 items-baseline gap-x-3">
            <span>2.</span>
            <p className="">
              Toque em Mais opções no Android{" "}
              <span
                className="inline-block rounded-md border border-white/25 p-0.5"
                data-icon="menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  height="18"
                  width="16"
                  preserveAspectRatio="xMidYMid meet"
                  version="1.1"
                  x="0px"
                  y="0px"
                  enable-background="new 0 0 24 24"
                >
                  <title>menu</title>
                  <path
                    fill="currentColor"
                    d="M12,7c1.104,0,2-0.896,2-2c0-1.105-0.895-2-2-2c-1.104,0-2,0.894-2,2 C10,6.105,10.895,7,12,7z M12,9c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,9.895,13.104,9,12,9z M12,15 c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,15.894,13.104,15,12,15z"
                  ></path>
                </svg>
              </span>{" "}
              ou em Configurações{" "}
              <span
                aria-hidden="true"
                className="inline-block rounded-md border border-white/25 p-0.5"
                data-icon="settings-iphone"
              >
                <svg
                  viewBox="0 0 20 20"
                  height="16"
                  width="16"
                  preserveAspectRatio="xMidYMid meet"
                  fill="none"
                >
                  <title>settings-iphone</title>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10.6288 18.226L10.6289 18.226L10.6818 18.2213L11.1525 19.1073C11.2424 19.3011 11.4155 19.391 11.6508 19.3564C11.8723 19.3218 12.0038 19.1765 12.0315 18.955L12.1769 17.9652C12.6129 17.8475 13.0421 17.6814 13.4574 17.5014L14.1911 18.1521C14.3503 18.3113 14.5441 18.332 14.7587 18.2213C14.9386 18.1175 15.0078 17.9375 14.9732 17.7091L14.7656 16.7331C15.1324 16.477 15.4923 16.1863 15.8177 15.861L16.7244 16.2417C16.9321 16.3317 17.1189 16.2901 17.2851 16.0963C17.4304 15.9371 17.4443 15.7364 17.3197 15.5495L16.7936 14.6982C17.0566 14.3313 17.2712 13.9298 17.465 13.5145L18.4687 13.563C18.6902 13.5768 18.8632 13.4661 18.9324 13.2515C19.0016 13.0439 18.9393 12.8501 18.7663 12.7116L17.9911 12.0956C18.1018 11.6665 18.1918 11.2165 18.2264 10.7459L19.1678 10.4482C19.3823 10.3721 19.5 10.2198 19.5 9.99141C19.5 9.76992 19.3823 9.61764 19.1678 9.5415L18.2264 9.24387C18.1918 8.7732 18.1018 8.33021 17.9911 7.89414L18.7663 7.27119C18.9393 7.1466 18.9947 6.95972 18.9324 6.74515C18.8632 6.5375 18.6902 6.41983 18.4687 6.43367L17.465 6.4752C17.2712 6.05298 17.0566 5.65844 16.7936 5.29159L17.3197 4.44023C17.4443 4.26026 17.4304 4.05954 17.2851 3.90034C17.1189 3.70653 16.9321 3.665 16.7244 3.75498L15.8177 4.12875C15.4923 3.81036 15.1324 3.51272 14.7656 3.25662L14.9732 2.29451C15.0078 2.05917 14.9386 1.87229 14.7587 1.77538C14.5679 1.67079 14.3936 1.67557 14.2454 1.78974L13.4574 2.48832C13.0421 2.30143 12.6129 2.14915 12.1769 2.03149L12.0315 1.04861C12.0038 0.820192 11.8654 0.674837 11.6508 0.640228C11.4155 0.612542 11.2424 0.695602 11.1525 0.875565L10.6818 1.76846L10.2265 1.74488C10.1511 1.74231 10.075 1.74077 9.99654 1.74077C9.79063 1.74077 9.59596 1.75203 9.38212 1.76438L9.31129 1.76846L8.84754 0.875565C8.75756 0.695602 8.5776 0.612542 8.34226 0.640228C8.12769 0.674837 7.98925 0.820192 7.96157 1.04861L7.82313 2.02456C7.38015 2.14915 6.951 2.29451 6.5357 2.48832L5.80893 1.8446C5.64281 1.6854 5.449 1.66464 5.24135 1.77538C5.05446 1.87229 4.98525 2.05917 5.02678 2.29451L5.23443 3.25662C4.86066 3.51272 4.50073 3.81036 4.18233 4.12875L3.26867 3.75498C3.06794 3.665 2.88106 3.70653 2.71494 3.90034C2.56958 4.05954 2.55574 4.26026 2.67341 4.44023L3.20638 5.29159C2.94335 5.65844 2.72878 6.05298 2.52805 6.4752L1.53133 6.43367C1.30984 6.41983 1.13679 6.5375 1.06758 6.74515C0.991439 6.95972 1.04681 7.1466 1.2337 7.27119L2.00893 7.89414C1.89818 8.33021 1.8082 8.7732 1.78051 9.23695L0.83224 9.5415C0.610747 9.61764 0.5 9.763 0.5 9.99141C0.5 10.2198 0.610747 10.3721 0.83224 10.4482L1.78051 10.7459C1.8082 11.2165 1.89126 11.6665 2.00893 12.0956L1.2337 12.7116C1.05373 12.8431 0.998361 13.0369 1.06758 13.2515C1.13679 13.4661 1.30984 13.5768 1.53133 13.563L2.52805 13.5145C2.72186 13.9298 2.94335 14.3313 3.19945 14.6982L2.67341 15.5495C2.54882 15.7364 2.56266 15.9371 2.71494 16.0963C2.88106 16.2901 3.06794 16.3317 3.26867 16.2417L4.18233 15.861C4.50073 16.1863 4.86066 16.477 5.23443 16.7331L5.02678 17.7091C4.98525 17.9375 5.05446 18.1175 5.24135 18.2282C5.45592 18.332 5.64281 18.3113 5.80893 18.1521L6.5357 17.5014C6.951 17.6814 7.38015 17.8475 7.82313 17.9652L7.96157 18.955C7.98925 19.1765 8.12769 19.3218 8.34918 19.3634C8.5776 19.391 8.75756 19.3011 8.84754 19.1073L9.31129 18.2213C9.53971 18.242 9.76812 18.2628 9.99654 18.2628C10.2141 18.2628 10.4139 18.2451 10.6288 18.226ZM12.0869 9.48613C11.7408 8.4548 10.9448 7.85262 9.9827 7.85262C9.81658 7.85262 9.64353 7.87338 9.38051 7.9426L6.86794 3.63039C7.80237 3.16664 8.86138 2.90362 9.99654 2.90362C13.7689 2.90362 16.7313 5.78303 16.9805 9.48613H12.0869ZM5.95428 4.17721C4.15464 5.45772 3.00565 7.57575 3.00565 9.99833C3.00565 12.4071 4.1408 14.5113 5.91967 15.7918L8.50146 11.5557C8.03078 11.092 7.80929 10.5867 7.80929 10.0329C7.80929 9.47229 8.0377 8.95316 8.48761 8.50325L5.95428 4.17721ZM8.90291 10.026C8.90291 9.42384 9.4082 8.94624 9.98962 8.94624C10.5987 8.94624 11.0971 9.42384 11.0971 10.026C11.0971 10.6282 10.5987 11.1196 9.98962 11.1196C9.41512 11.1196 8.90291 10.6282 8.90291 10.026ZM6.83333 16.3455C7.77468 16.8231 8.84754 17.0931 9.99654 17.0931C13.7619 17.0931 16.7175 14.2206 16.9805 10.5244H12.0869C11.7546 11.5834 10.9587 12.2133 9.9827 12.2133C9.81658 12.2133 9.64353 12.1925 9.39435 12.1302L6.83333 16.3455Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </span>{" "}
              no iPhone
            </p>
          </li>
          <li className="flex items-baseline gap-x-3">
            <span>3.</span>
            <p>
              Toque em Dispositivos conectados e, em seguida, em Conectar
              dispositivo.
            </p>
          </li>
          <li className="flex items-baseline gap-x-3">
            <span>4.</span>
            <p>
              Toque em Conectar com número de telefone e insira o código exibido
              no seu celular.
            </p>
          </li>
        </ul>
        <button
          onClick={onClickChange}
          className="flex select-none items-center gap-x-1 hover:text-green-300/60 cursor-pointer"
        >
          <a className="underline underline-offset-2 decoration-green-400/60">
            Entrar com o QR code
          </a>
          <LuChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-10 justify-center items-center">
      <form
        onSubmit={handleSubmit(requestPairingCode)}
        className="flex flex-col gap-y-5 justify-center items-center"
      >
        <h2 className="font-semibold text-white text-xl">
          Insira o número de telefone
        </h2>
        <div>
          <Field invalid={!!errors.number} errorText={errors.number?.message}>
            <InputGroup startElement="+55">
              <Input
                {...registerWithMask("number", [
                  "(99) 9999-9999",
                  "(99) 99999-9999",
                ])}
                autoComplete="nope"
                type="text"
              />
            </InputGroup>
          </Field>
        </div>
        <Button
          type="submit"
          rounded={"full"}
          px="30px"
          size={"sm"}
          colorPalette={"teal"}
          loading={load}
          loadingText="Aguarde..."
        >
          Avançar
        </Button>
      </form>
      <button
        onClick={() => (!load ? onClickChange() : undefined)}
        className="flex select-none items-center gap-x-1 hover:text-green-300/60 cursor-pointer"
      >
        <a className="underline underline-offset-2 decoration-green-400/60">
          Entrar com o QR code
        </a>
        <LuChevronRight size={20} />
      </button>
    </div>
  );
}

export function ModalConnectConnectionWA({ ...props }: IProps): JSX.Element {
  const { socket } = useContext(SocketContext);
  const [typeConnection, setTypeConnection] = useState<"QRCODE" | "PIN">(
    "QRCODE"
  );

  useEffect(() => {
    socket.on(`status-session-${props.id}`, (state?: "open" | "connecting") => {
      if (state && state === "open") props.close();
    });

    return () => {
      socket.off(`status-session-${props.id}`);
    };
  }, [socket]);

  return (
    <DialogContent backdrop>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Conectar Whatsapp</DialogTitle>
        <DialogDescription>
          Escale suas vendas e fortaleça o relacionamento com seus clientes no
          WhatsApp, com rapidez e eficiência.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        {typeConnection === "QRCODE" && (
          <QRCode changeType={() => undefined} connectionId={props.id} />
        )}
        {typeConnection === "PIN" && (
          <PIN
            changeType={() => setTypeConnection("QRCODE")}
            connectionId={props.id}
          />
        )}
      </DialogBody>
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
