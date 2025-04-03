import { AxiosError } from "axios";
import { JSX, useContext, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { TableComponent } from "../../components/Table";
import { Column } from "../../components/Table";
import { ModalCreateBusiness } from "./modals/create";
import { getBusinesses } from "../../services/api/Business";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { ModalDeleteBusiness } from "./modals/delete";
import { Button } from "@chakra-ui/react";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalViewBusiness } from "./modals/view";
import { LuEye } from "react-icons/lu";
import { IoAdd } from "react-icons/io5";
import { ModalEditBusiness } from "./modals/edit";

export interface BusinessRow {
  id: number;
  name: string;
  createAt: Date;
}

export const BusinessesPage: React.FC = (): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const [businesses, setBusinesses] = useState<BusinessRow[]>(
    [] as BusinessRow[]
  );
  const [load, setLoad] = useState<boolean>(false);

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "id",
        name: "ID",
        styles: { width: 170 },
      },
      {
        key: "name",
        name: "Nome",
        styles: { width: 170 },
      },
      {
        key: "createAt",
        name: "Data de criação",
        styles: { width: 200 },
        render(row) {
          return (
            <div className="flex flex-col">
              <span>{moment(row.createAt).format("D/M/YY")}</span>
              <span className="text-xs text-white/50">
                {moment(row.createAt).format("HH:mm")}
              </span>
            </div>
          );
        },
      },
      {
        key: "actions",
        name: "",
        styles: { width: 200 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <ModalViewBusiness
                setBusinesses={setBusinesses}
                id={row.id}
                trigger={
                  <Button
                    size={"sm"}
                    bg={"#f0f0f016"}
                    _hover={{ bg: "#ffffff21" }}
                    _icon={{ width: "20px", height: "20px" }}
                  >
                    <LuEye color={"#dbdbdb"} />
                  </Button>
                }
              />
              {/*  <ModalClone
                setBusiness={setBusiness}
                id={row.id}
                buttonJSX={(open) => (
                  <Button
                    onClick={open}
                    size={"sm"}
                    bg={"#ebaf6039"}
                    _hover={{ bg: "#ebb46062" }}
                  >
                    <FaRegClone size={16} color="#f39d4d" />
                  </Button>
                )}
              />*/}
              <ModalEditBusiness
                id={row.id ?? 0}
                setBusinesses={setBusinesses}
                trigger={
                  <Button
                    size={"sm"}
                    bg={"#60d6eb13"}
                    _hover={{ bg: "#30c9e422" }}
                    _icon={{ width: "20px", height: "20px" }}
                  >
                    <MdEdit size={18} color={"#9ec9fa"} />
                  </Button>
                }
              />
              <ModalDeleteBusiness
                trigger={
                  <Button
                    size={"sm"}
                    bg={"#eb606013"}
                    _hover={{ bg: "#eb606028" }}
                    _icon={{ width: "20px", height: "20px" }}
                  >
                    <MdDeleteOutline color={"#f75050"} />
                  </Button>
                }
                data={{ id: row.id, name: row.name }}
                setBusinesses={setBusinesses}
              />
            </div>
          );
        },
      },
    ];
    return columns;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const businessesList = await getBusinesses();
        setBusinesses(businessesList);
        setLoad(true);
      } catch (error) {
        setLoad(true);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError(path, { message: text })
              );
            }
          }
        }
      }
    })();
  }, []);

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-5">
          <h1 className="text-lg font-semibold">Empresas</h1>
          <ModalCreateBusiness
            onCreate={async (newBusiness) =>
              setBusinesses((s) => [newBusiness, ...s])
            }
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <p className="text-white/60 font-light">
          Workspaces para organizar e gerenciar suas operações de forma
          eficiente.
        </p>
      </div>
      <div
        style={{ maxHeight: "calc(100vh - 180px)" }}
        className="flex flex-col"
      >
        <TableComponent
          rows={businesses}
          columns={renderColumns}
          textEmpity="Nenhum negócio criado."
          load={!load}
        />
      </div>
    </div>
  );
};
