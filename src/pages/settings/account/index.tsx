import { JSX, useContext } from "react";
import { LayoutSettingsPageContext } from "../contexts";
import { SectionChangePassword } from "./sections/change-password";
import { SectionCloseAccount } from "./sections/close-account";

export const SettingsAccountPage: React.FC = (): JSX.Element => {
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
      <div className="pl-0.5 grid pr-2 gap-y-5 overflow-y-auto h-[calc(100vh-140px)] pb-7 sm:h-[calc(100vh-175px)] md:h-[calc(100vh-150px)]">
        <SectionChangePassword />
        <div className="bg-white/10 w-full h-px"></div>
        <SectionCloseAccount />
      </div>
    </div>
  );
};
