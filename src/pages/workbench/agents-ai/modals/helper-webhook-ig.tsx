import { Badge, Button, Clipboard, IconButton } from "@chakra-ui/react";
import { AuthContext } from "@contexts/auth.context";
import clsx from "clsx";
import { useContext } from "react";
import { MdOutlineSettings } from "react-icons/md";

interface Props {
  onGetAccounts(): void;
}

export const HelperSetupWebhook = (props: Props) => {
  const {
    account: { hash },
    clientMeta,
  } = useContext(AuthContext);

  const WEBHOOK_URL =
    "https://api.junplid.com.br/webhookasaaasasasas/asasasasas/asasas";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MdOutlineSettings className="w-5 h-5" />
          <h3 className="font-bold">Dados para o Webhook da Meta</h3>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <div>
            <label className="text-[10px] font-bold text-white uppercase tracking-wider">
              Callback URL
            </label>
            <div className="grid grid-cols-[1fr_32px] items-center gap-2 mt-0.5">
              <code className="text-nowrap overflow-hidden p-2 border border-neutral-700/50 rounded text-xs text-ellipsis grow bg-neutral-700/30 text-white">
                {WEBHOOK_URL}
              </code>

              <Clipboard.Root value={WEBHOOK_URL}>
                <Clipboard.Trigger asChild>
                  <IconButton variant="surface" size="xs">
                    <Clipboard.Indicator />
                  </IconButton>
                </Clipboard.Trigger>
              </Clipboard.Root>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white uppercase tracking-wider">
              Verify Token
            </label>
            <div className="grid grid-cols-[1fr_32px] items-center gap-2 mt-0.5">
              <code className="p-2 border border-neutral-700/50 rounded text-xs overflow-hidden text-ellipsis grow bg-neutral-700/30 text-white">
                {hash}
              </code>
              <Clipboard.Root value={hash}>
                <Clipboard.Trigger asChild>
                  <IconButton variant="surface" size="xs">
                    <Clipboard.Indicator />
                  </IconButton>
                </Clipboard.Trigger>
              </Clipboard.Root>
            </div>
          </div>
        </div>
        <ul className={clientMeta.isMobileLike ? "space-y-2" : "space-y-3"}>
          <li className="flex items-start gap-3 text-gray-200">
            <span className="shrink-0 w-6 h-6 bg-blue-100 text-black rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>
              Cole o <Badge size={"xs"}>CALLBACK URL</Badge> e o{" "}
              <Badge size={"xs"}>VERIFY TOKEN</Badge> nas configurações do
              Webhook e clique em{" "}
              <i className="font-medium">"verificar e salvar"</i>.
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-2 pt-4 flex items-center gap-x-2 justify-center">
        <Button
          colorPalette={"teal"}
          onClick={props.onGetAccounts}
          type={"button"}
          className={clsx(
            "px-6 py-2 rounded-lg font-medium shadow-md active:scale-95 transition-all",
          )}
        >
          Buscar contas
        </Button>
      </div>
    </div>
  );
};
