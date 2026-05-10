import { useEffect, useMemo } from "react";
import { IoAdd } from "react-icons/io5";
import { Outlet, useNavigate } from "react-router-dom";
import { JSX } from "@emotion/react/jsx-runtime";
import { LayoutWorkbenchPageContext } from "./contexts";
import { ModalCreateMenuOnline } from "./modals/create";
import { Button, Spinner } from "@chakra-ui/react";
import { useGetMenusOnline } from "../../hooks/menu-online";
import { ModalGenerateReportMenuOnline } from "./modals/generateReport";

export function LayoutSitesPageProvider(): JSX.Element {
  const { data: menusOnline, isFetching, isPending } = useGetMenusOnline();
  const navigate = useNavigate();

  const dataValue = useMemo(() => ({}), []);

  useEffect(() => {
    if (menusOnline?.length && menusOnline[0].uuid) {
      navigate(menusOnline[0].uuid, { replace: true });
    }
  }, [menusOnline]);

  return (
    <LayoutWorkbenchPageContext.Provider value={dataValue}>
      <div className="h-full -space-y-1 px-2 flex flex-col">
        {!!menusOnline?.length && (
          <div className="flex flex-col">
            <div className="flex items-center gap-x-5">
              <h1 className="text-lg font-semibold">Cardápio digital</h1>
              <ModalGenerateReportMenuOnline
                uuid={menusOnline[0].uuid}
                trigger={
                  <Button variant="outline" size={"sm"}>
                    Gerar relatório
                  </Button>
                }
              />
            </div>
          </div>
        )}

        {(isFetching || isPending) && (
          <div className="flex w-full h-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {!(isFetching || isPending) && !menusOnline?.length && (
          <div
            style={{ maxHeight: "calc(100vh - 180px)" }}
            className="flex flex-1 items-start gap-x-2 w-full"
          >
            <div className="mt-20 flex flex-col text-sm text-center w-full">
              <span className="dark:text-white font-semibold">
                Nenhum cardápio digital
              </span>
              <span className="dark:text-white/70 text-black/70">
                Seu cardápio digital aparecerá aqui.
              </span>
              <div className="mt-6">
                <ModalCreateMenuOnline
                  trigger={
                    <Button variant="outline" size={"sm"}>
                      <IoAdd /> Adicionar
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        )}
        {!(isFetching || isPending) && !!menusOnline?.length && <Outlet />}
      </div>
    </LayoutWorkbenchPageContext.Provider>
  );
}
