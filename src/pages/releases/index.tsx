import { JSX } from "react";
import { Badge } from "@chakra-ui/react";

export const ReleasesPage: React.FC = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-semibold text-xl">Releases</h1>

      <div className="flex flex-col gap-1">
        <h3>
          <Badge colorPalette={"blue"}>Atual</Badge> Versão v0.1.00-alpha - 25
          mai 2025{" "}
        </h3>
        <div>
          <p className="text-green-200">
            + Sistema de autenticação 100 % reativo.
          </p>
          <p className="text-red-200">
            - Endpoints antigos de <code>/v1/access</code> foram removidos; use
            o novo padrão <code>/v2/auth</code>
          </p>
          <p className="text-orange-200">
            * Corrigido bug de reconexão Baileys em redes instáveis.
          </p>
        </div>
      </div>
    </div>
  );
};
