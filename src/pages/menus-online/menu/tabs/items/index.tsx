import {
  Column,
  TableComponent,
  TableMobileComponent,
} from "@components/Table";
import { useDialogModal } from "../../../../../hooks/dialog.modal";
import {
  JSX,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Spinner, Switch } from "@chakra-ui/react";
import { ModalEditProduct } from "./modals/edit";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { ModalDeleteItem } from "./modals/delete";
import { ModalCreateProduct } from "./modals/create";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import {
  getMenuOnlineItems,
  updateMenuOnlineItem,
} from "../../../../../services/api/MenuOnline";
import { api } from "../../../../../services/api";
import { formatToBRL } from "brazilian-values";
import clsx from "clsx";
import { GrUpdate } from "react-icons/gr";
import { RiAddLargeLine } from "react-icons/ri";
import { ModalUpdateBulk } from "./modals/update-bulk";
import { IoWarningSharp } from "react-icons/io5";

export type TypeCategory = "pizzas" | "drinks";

export interface ItemRow {
  categories: {
    days_in_the_week_label: string;
    id: number;
    name: string;
    image45x45png?: string | null;
  }[];
  uuid: string;
  id: number;
  name: string;
  desc: string | null;
  img: string;
  qnt: number;
  beforePrice: string | null;
  view: boolean;
  stateWarn: string[];
  afterPrice: string | null;
}

const TabProducts_ = ({ uuid }: { uuid: string }): JSX.Element => {
  const { logout, clientMeta } = useContext(AuthContext);
  const {
    dialog: DialogModal,
    close,
    onOpen,
  } = useDialogModal({
    closeOnEscape: false,
    closeOnInteractOutside: false,
    trapFocus: false,
  });
  const [items, setItems] = useState<ItemRow[]>([]);
  const [load, setLoad] = useState(true);
  const [loadItems, setLoadItems] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMenuOnlineItems({ uuid });
        setItems(data);
        setLoad(false);
      } catch (error) {
        setLoad(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError?.(path, { message: text }),
              );
            }
          }
        }
      }
    })();
  }, []);

  const renderColumns = useMemo(() => {
    const columns: Column[] = [
      {
        key: "name",
        name: "",
        styles: { width: 65 },
        render(row) {
          return (
            <div style={{ opacity: row.view ? 1 : 0.4 }}>
              <img
                src={api.getUri() + "/public/images/" + row.img}
                className="rounded-sm"
                width={"35px"}
                height={"35px"}
              />
            </div>
          );
        },
      },
      {
        key: "name",
        name: "Nome",
        render(row) {
          return (
            <div className="flex flex-col">
              <span style={{ opacity: row.view ? 1 : 0.4 }} title={row.name}>
                {row.name}
              </span>
              {!!row.stateWarn.length && (
                <div className="flex items-start gap-x-1 mt-1">
                  <IoWarningSharp className="text-orange-400 mt-0.5" />
                  <div className="flex flex-col">
                    {row.stateWarn.map((w: string) => (
                      <p className="text-orange-300 text-sm" key={w}>
                        {w}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "qnt",
        name: "Estoque",
        styles: { width: 65 },
        render(row) {
          return <span>{row.qnt}</span>;
        },
      },
      {
        key: "qnt",
        name: "Preço",
        styles: { width: 100 },
        render(row) {
          return (
            <div className="flex flex-col w-full -space-y-1">
              <span className="text-[11px] line-through text-neutral-400">
                {row.beforePrice && formatToBRL(row.beforePrice)}
              </span>
              <span className="font-semibold">
                {row.afterPrice && formatToBRL(row.afterPrice)}
              </span>
            </div>
          );
        },
      },
      {
        key: "categories",
        name: "Categorias",
        styles: { width: 200 },
        render(row) {
          return (
            <div className="flex items-baseline flex-col gap-y-1">
              {row.categories.map((cat: ItemRow["categories"][0]) => (
                <div
                  className={clsx(
                    "flex gap-x-1 bg-amber-50/5 p-1 pr-1! rounded-md",
                    cat.days_in_the_week_label ? "items-start" : "items-center",
                  )}
                >
                  {cat.image45x45png && (
                    <img
                      src={api.getUri() + "/public/images/" + cat.image45x45png}
                      className="rounded-sm"
                      width={"27px"}
                      height={"27px"}
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{cat.name}</span>
                    <span className="text-xs font-light text-neutral-300">
                      {cat.days_in_the_week_label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        key: "actions",
        name: "",
        styles: { width: 43 * 2 },
        render(row) {
          return (
            <div className="flex h-full items-center justify-end gap-x-1.5">
              <Button
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalEditProduct
                        close={close}
                        menuUuid={uuid}
                        uuid={row.uuid}
                        onUpdate={({ id, uuid: uuidUp, ...item }) => {
                          setItems((state) =>
                            state.map((s) => {
                              if (s.id === id) s = { ...s, ...item };
                              return s;
                            }),
                          );
                        }}
                      />
                    ),
                  });
                }}
                size={"sm"}
                bg={"transparent"}
                _hover={{ bg: "#30c9e422" }}
                title={row.name}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
              >
                <MdEdit size={18} color={"#9ec9fa"} />
              </Button>
              <Button
                size={"sm"}
                title={row.name}
                bg={"transparent"}
                _hover={{ bg: "#eb606028" }}
                _icon={{ width: "20px", height: "20px" }}
                disabled={row.type === "system"}
                onClick={() => {
                  onOpen({
                    content: (
                      <ModalDeleteItem
                        data={{ uuid: row.uuid, name: row.name }}
                        close={close}
                        onDelete={() => {
                          setItems((state) =>
                            state.filter((s) => s.uuid !== row.uuid),
                          );
                          close();
                        }}
                      />
                    ),
                  });
                }}
              >
                <MdDeleteOutline color={"#f75050"} />
              </Button>
            </div>
          );
        },
      },
    ];
    return columns;
  }, []);

  const edit = useCallback(
    async (itemUuid: string, status: boolean): Promise<void> => {
      try {
        setLoadItems((s) => [...s, itemUuid]);
        const { stateWarn, view } = await updateMenuOnlineItem(uuid, itemUuid, {
          qnt: Number(status),
        });
        setItems((state) =>
          state.map((s) => {
            if (s.uuid === itemUuid)
              s = { ...s, view, qnt: Number(status), stateWarn };
            return s;
          }),
        );
        setLoadItems((s) => s.filter((d) => d !== itemUuid));
      } catch (error) {
        setLoadItems((s) => s.filter((d) => d !== itemUuid));
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError?.(path, { message: text }),
              );
            }
          }
        }
      }
    },
    [uuid],
  );

  return (
    <div className="flex-1 pt-0! grid grid-cols-[1fr] gap-x-2 h-full">
      <div className="absolute top-2.5 right-5 z-40 flex gap-x-2">
        <ModalUpdateBulk
          onCreate={async () => {
            const data = await getMenuOnlineItems({ uuid });
            setItems(data);
          }}
          menuUuid={uuid}
          trigger={
            <Button
              className="flex gap-x-1"
              colorPalette={"yellow"}
              size={"xs"}
            >
              <GrUpdate />
              Opções
            </Button>
          }
        />
        <ModalCreateProduct
          onCreate={(newItem) => {
            setItems((state) => [newItem, ...state]);
          }}
          menuUuid={uuid}
          trigger={
            <Button className="" colorPalette={"green"} size={"xs"}>
              <RiAddLargeLine />
            </Button>
          }
        />
      </div>
      {clientMeta.isMobileLike ? (
        <div className="h-full flex-1 pb-12.5 grid px-3">
          <TableMobileComponent
            totalCount={items?.length || 0}
            renderItem={(index) => {
              const row = items![index];
              return (
                <div
                  onClick={() => {
                    onOpen({
                      content: (
                        <ModalEditProduct
                          close={close}
                          menuUuid={uuid}
                          uuid={row.uuid}
                          onUpdate={({ id, uuid: uuidUp, ...item }) => {
                            setItems((state) =>
                              state.map((s) => {
                                if (s.id === id) s = { ...s, ...item };
                                return s;
                              }),
                            );
                          }}
                        />
                      ),
                    });
                  }}
                  className="flex flex-col my-2 bg-amber-50/5 p-3! py-2! rounded-md"
                >
                  <div
                    style={{
                      opacity: row.view ? 1 : 0.4,
                    }}
                    className="flex w-full gap-x-1 items-start"
                  >
                    <div className="relative">
                      <img
                        src={api.getUri() + "/public/images/" + row.img}
                        className="rounded-sm bg-white"
                        width={"40px"}
                        height={"40px"}
                      />
                      {loadItems.includes(row.uuid) && (
                        <div className="bg-neutral-700/45 backdrop-blur-sm rounded-sm flex items-center justify-center absolute left-0 top-0 w-full h-full">
                          <Spinner />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-x-1">
                      <span className="text-sm line-clamp-2 font-semibold">
                        {row.name}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {row.beforePrice && (
                          <span className="text-sm line-through text-neutral-400">
                            {row.beforePrice && formatToBRL(row.beforePrice)}
                          </span>
                        )}
                        <span className="font-semibold">
                          {row.afterPrice && formatToBRL(row.afterPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center mt-1 w-full gap-x-1.5 justify-between">
                    <div className="flex gap-1 w-full">
                      {row.categories
                        .slice(0, 2)
                        .map((cat: ItemRow["categories"][0]) => (
                          <div
                            className={clsx(
                              "flex gap-x-1 bg-amber-50/5 p-1! rounded-md",
                              cat.days_in_the_week_label
                                ? "items-start"
                                : "items-center",
                            )}
                          >
                            {cat.image45x45png ? (
                              <img
                                src={
                                  api.getUri() +
                                  "/public/images/" +
                                  cat.image45x45png
                                }
                                className="rounded-sm"
                                width={"20px"}
                                height={"20px"}
                              />
                            ) : (
                              <div className="flex flex-col px-2">
                                <span className="text-sm font-medium line-clamp-1">
                                  {cat.name}
                                </span>
                                <span className="text-xs font-light text-neutral-300">
                                  {cat.days_in_the_week_label}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      {!!(row.categories.length > 2) && (
                        <div
                          className={clsx(
                            "flex gap-x-1 bg-amber-50/5 p-1! pr-2! rounded-md items-center",
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-x-2 items-center">
                      <Switch.Root
                        checked={!!row.qnt}
                        onCheckedChange={(e) => edit(row.uuid, e.checked)}
                        className="flex flex-col space-y-2.5"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control
                          className={clsx(
                            !!row.qnt ? "bg-blue-300!" : "bg-red-400!",
                          )}
                        />
                      </Switch.Root>
                      <Button
                        size={"xs"}
                        bg={"#cf5c5c24"}
                        _hover={{ bg: "#eb606028" }}
                        _icon={{ width: "16px", height: "16px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen({
                            content: (
                              <ModalDeleteItem
                                data={{ uuid: row.uuid, name: row.name }}
                                close={close}
                                onDelete={() => {
                                  setItems((state) =>
                                    state.filter((s) => s.uuid !== row.uuid),
                                  );
                                  close();
                                }}
                              />
                            ),
                          });
                        }}
                      >
                        <MdDeleteOutline color={"#f75050"} />
                      </Button>
                    </div>
                  </div>
                  {!!row.stateWarn.length && (
                    <div className="flex items-start gap-x-1 mt-1">
                      <IoWarningSharp className="text-orange-400 mt-0.5" />
                      <div className="flex flex-col">
                        {row.stateWarn.map((w) => (
                          <p className="text-orange-300 text-sm" key={w}>
                            {w}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
            textEmpity="Seus items aparecerão aqui."
            load={load}
          />
        </div>
      ) : (
        <TableComponent
          rows={items || []}
          columns={renderColumns}
          textEmpity="Seus items aparecerão aqui."
          load={load}
        />
      )}

      {/* <div className="px-3 pt-4 bg-zinc-800/15 flex flex-col gap-y-3 rounded-md">
        <div className="flex items-center justify-between">
          <span className="block font-medium">Categorias</span>
          <ModalCreateProduct
            trigger={
              <Button variant="outline" size={"sm"}>
                <IoAdd /> Adicionar
              </Button>
            }
          />
        </div>
        <div className="relative h-full">
          <GridWithShadows
            items={[1, 2]}
            listClassName="grid w-full pr-1.5 grid-cols-1 !relative justify-start"
            renderItem={() => <ItemCategory />}
          />
        </div>
      </div> */}
      {DialogModal}
    </div>
  );
};

export const TabProducts = memo(TabProducts_);
