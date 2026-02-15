import { JSX, useContext } from "react";
import { LayoutSettingsPageContext } from "../contexts";
import { AuthContext } from "@contexts/auth.context";
import { SectionChangePassword } from "./sections/change-password";

export const SettingsAccountPage: React.FC = (): JSX.Element => {
  const { clientMeta } = useContext(AuthContext);
  const { ToggleMenu } = useContext(LayoutSettingsPageContext);

  return (
    <div className="h-full flex-1 gap-y-1 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center w-full justify-between gap-x-5">
          <div className="flex items-center gap-x-2">
            <span className="hidden sm:flex">{ToggleMenu}</span>
            <h1 className="text-base sm:text-lg font-semibold">Conta</h1>
          </div>
        </div>
      </div>
      <div className="flex-1 grid">
        {clientMeta.isMobileLike || clientMeta.isSmallScreen ? (
          <div>Mobile</div>
        ) : (
          <div>
            <SectionChangePassword />
            <section>Informações de contato</section>
            <section>Encerrar a Sua Conta</section>
          </div>
        )}
      </div>
    </div>
  );
};
