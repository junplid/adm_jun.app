import { HiOutlineShieldCheck, HiOutlineExternalLink } from "react-icons/hi";
import { MdOutlineKey } from "react-icons/md";

interface Props {
  onHasAccessToken(): void;
}

export const HelperSetupSystemUser = (props: Props) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2 pb-4">
        <HiOutlineShieldCheck className="text-blue-600 w-8 h-8" />
        <div>
          <h1 className="font-bold">Gerar token</h1>
          <p className="text-slate-100 text-sm">
            Passos para consegui o AccessToken.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* PASSO 1 */}
        <div className="flex gap-3">
          <div className="shrink-0 w-6 h-6 bg-blue-100 text-black rounded-full flex items-center justify-center text-xs font-bold">
            1
          </div>
          <div className="grow">
            <h3 className="font-semibold flex items-center gap-2">
              Acesse o Explorador da Graph API
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:inline-flex items-center gap-1"
              >
                <HiOutlineExternalLink size={16} />
              </a>
            </h3>
            <p className="text-slate-300 text-sm mt-1">
              Vá em <span className="text-white">Permissões</span> e selecione
              estas permissões obrigatórias:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "pages_show_list",
                "instagram_basic",
                "business_management",
                "instagram_manage_messages",
                "pages_manage_metadata",
              ].map((p) => (
                <span
                  key={p}
                  className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-mono text-slate-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PASSO 3 */}
        <div className="flex gap-4">
          <div className="shrink-0 w-6 h-6 bg-blue-100 text-black rounded-full flex items-center justify-center text-xs font-bold">
            2
          </div>
          <div className="grow">
            <h3 className="font-semibold text-blue-500 flex items-center gap-2">
              <MdOutlineKey size={20} /> Gerar Token temporário
            </h3>
            <p className="text-slate-300 text-sm mt-1">
              Clique em{" "}
              <span className="text-white">Gerar Token de Acesso</span>,
              selecione a Página e Instagram
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-4 flex justify-center">
        <button
          onClick={props.onHasAccessToken}
          type={"button"}
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
        >
          Já copiei meu Token Temporário
        </button>
      </div>
    </div>
  );
};
