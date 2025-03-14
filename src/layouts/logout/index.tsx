import { FC, useContext } from "react";
import { api } from "../../services/api";
import { Link, Outlet } from "react-router-dom";
import { DataConfigContext } from "../../contexts/dataConfig.context";

export const LogoutLayout: FC = (): JSX.Element => {
  const { fileName, labelFooter } = useContext(DataConfigContext);

  return (
    <div className="bg-primary flex min-h-screen flex-col pb-5">
      <div className="mt-14 flex w-full justify-center">
        <img
          style={{ maxWidth: 140 }}
          src={
            fileName
              ? api.defaults.baseURL + "/public/config/" + fileName
              : "/logo-1.png"
          }
        />
      </div>
      <main className="h-full w-full flex-1">
        <Outlet />
      </main>
      <footer className="flex w-full justify-center">
        <div className="flex flex-col space-y-1">
          <div className="flex justify-center space-x-4 font-semibold tracking-wide text-purple-600 underline underline-offset-2">
            <Link to={"/"} target="_blank">
              Privacy Policy
            </Link>
            <Link to={"/"} target="_blank">
              Terms of Use
            </Link>
          </div>
          <small className="text-xs text-white/60">
            {labelFooter ??
              "© 2023 Botstudio Desenvolvimento de Tecnologias para Negócios LTDA 00.000.000/0000-00"}
          </small>
        </div>
      </footer>
    </div>
  );
};
