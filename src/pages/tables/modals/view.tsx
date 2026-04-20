import {
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
} from "@components/ui/dialog";
import { JSX, useContext, useMemo, useState } from "react";
import { Button, IconButton, Spinner } from "@chakra-ui/react";
import { useDialogModal } from "../../../hooks/dialog.modal";
import { Table, TableItem } from "..";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { formatToBRL } from "brazilian-values";
import clsx from "clsx";
import { useGetMenuOnlineItems2 } from "../../../hooks/menu-online";
// import { useSearchParams } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import {
  closeTable,
  createTableItems,
  deleteTable,
  deleteTableItem,
  printTableOrder,
} from "../../../services/api/Tables";
import { ModalCloseTable } from "./close-table";

interface IProps {
  close: () => void;
  isDelete?: boolean;
  data: Table;
  menuUuid: string;
  onCreateNewsItems(
    items: TableItem[],
    adjustments: {
      amount: number;
      label: string;
      type: "in" | "out";
    }[],
    tableId: number,
  ): void;
  onDeleteItem(tableId: number, ItemOfOrderId: number): void;
  onCloseTable(tableId: number): void;
  onDeleteTable(tableId: number): void;
}

interface ItemSelected {
  uuid: string;
  qnt: number;
  price: number;
}

function Content({
  data,
  close,
  menuUuid,
  onCreateNewsItems,
  onDeleteItem,
  onCloseTable,
  isDelete,
}: Omit<IProps, "onDeleteTable">) {
  const { logout, clientMeta } = useContext(AuthContext);
  const { dialog, onOpen, close: onCloseDialog } = useDialogModal({});
  // const [load, setLoad] = useState(true);
  // const [searchParams, setSearchParams] = useSearchParams();
  const [isAddItem, setIsAddItem] = useState(false);
  const [itemsSelected, setItemsSelected] = useState<ItemSelected[]>([]);

  const [loadAddItem, setLoadAddItem] = useState(false);
  const [loadPrint, setLoadPrint] = useState(false);
  const [loadClose, setLoadClose] = useState(false);
  const [loadDelItems, setLoadDelItems] = useState<number[]>([]);
  const [dataPreview, setDataPreview] = useState(data);

  const {
    isLoading,
    data: products,
    status,
  } = useGetMenuOnlineItems2({ uuid: menuUuid });

  const total = useMemo(() => {
    return itemsSelected.reduce((ac, cr) => {
      ac += cr.price;
      return ac;
    }, 0);
  }, [itemsSelected]);

  const totalTable = useMemo(() => {
    return (dataPreview.order?.items || []).reduce((ac, cr) => {
      ac += (cr.price || 0) * Number(cr.title.replace(/^(\d*)x.*/, "$1"));
      return ac;
    }, 0);
  }, [dataPreview.order?.items]);

  const addTableItems = async () => {
    try {
      setLoadAddItem(true);
      const newItems = await createTableItems(
        dataPreview.id,
        itemsSelected.map((s) => ({ uuid: s.uuid, qnt: s.qnt })),
      );
      // setDataPreview((stateTables) => {
      //   if (!stateTables.order) {
      //     return {
      //       ...stateTables,
      //       status: "OCCUPIED" as TableStatus,
      //       order: {
      //         items: newItems.items.map(
      //           (s) =>
      //             ({
      //               obs: null,
      //               price: s.price,
      //               side_dishes: null,
      //               title: s.title,
      //               ItemOfOrderId: s.ItemOfOrderId,
      //             }) as TableItem,
      //         ),
      //         adjustments: newItems.adjustments,
      //       },
      //     };
      //   }

      //   return {
      //     ...stateTables,
      //     order: {
      //       ...stateTables.order,
      //       items: [
      //         ...stateTables.order.items,
      //         ...newItems.items.map(
      //           (s) =>
      //             ({
      //               obs: null,
      //               price: s.price,
      //               side_dishes: null,
      //               title: s.title,
      //               ItemOfOrderId: s.ItemOfOrderId,
      //             }) as TableItem,
      //         ),
      //       ],
      //     },
      //   };
      // });
      close();
      onCreateNewsItems(
        newItems.items.map(
          (s) =>
            ({
              obs: null,
              price: s.price,
              side_dishes: null,
              title: s.title,
              ItemOfOrderId: s.ItemOfOrderId,
            }) as TableItem,
        ),
        newItems.adjustments,
        dataPreview.id,
      );
      setItemsSelected([]);
      setIsAddItem(false);
      setLoadAddItem(false);
    } catch (error) {
      setLoadAddItem(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
        }
      }
      throw error;
    }
  };

  const removeTableItem = async (ItemOfOrderId: number) => {
    try {
      setLoadDelItems((s) => [...s, ItemOfOrderId]);
      await deleteTableItem(data.id, ItemOfOrderId);
      setDataPreview((stateTables) => {
        if (!stateTables.order) {
          return {
            ...stateTables,
            // status: "OCCUPIED" as TableStatus,
            // order: { items: newItems, adjustments },
          };
        }

        return {
          ...stateTables,
          order: {
            ...stateTables.order,
            items: [
              ...stateTables.order.items.filter(
                (d) => d.ItemOfOrderId !== ItemOfOrderId,
              ),
            ],
          },
        };
      });
      onDeleteItem(data.id, ItemOfOrderId);
      setLoadDelItems((s) => s.filter((d) => d !== ItemOfOrderId));
    } catch (error) {
      setLoadDelItems((s) => s.filter((d) => d !== ItemOfOrderId));
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
        }
      }
      throw error;
    }
  };

  const handlePrintTableOrder = async () => {
    try {
      setLoadPrint(true);
      await printTableOrder(data.id);
      setLoadPrint(false);
    } catch (error) {
      setLoadPrint(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length)
            dataError.toast.forEach((s) => toaster.create({ ...s }));
        }
      }
      throw error;
    }
  };

  const handleCloseTable = async (method: string) => {
    try {
      setLoadClose(true);
      await closeTable(data.id, method);
      setLoadClose(false);
      onCloseTable(data.id);
      toaster.success({
        title: "Conta fechada",
        description: "Com sucesso.",
        duration: 1400,
      });
      close();
    } catch (error) {
      setLoadClose(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length)
            dataError.toast.forEach((s) => toaster.create({ ...s }));
        }
      }
      throw error;
    }
  };

  const footer = (
    <DialogFooter>
      <Button
        onClick={() => addTableItems()}
        colorPalette={"green"}
        fontWeight={"bold"}
        disabled={!itemsSelected.length}
        loading={loadAddItem}
      >
        {itemsSelected.reduce((ac, cr) => ac + cr.qnt, 0)} Item
        {itemsSelected.length > 1 ? "s" : ""} + {formatToBRL(total)}
      </Button>
      <DialogActionTrigger>
        <Button colorPalette={"red"}>Fechar</Button>
      </DialogActionTrigger>
      {isDelete && (
        <Button
          // loading={isFetching}
          variant="outline"
          onClick={() => {
            // onOpen({
            //   content: (
            //     <ModalDeleteVariable
            //       close={close}
            //       data={data ? { id, name: data.name } : null}
            //     />
            //   ),
            // });
          }}
        >
          Deletar
        </Button>
      )}
    </DialogFooter>
  );

  if (isLoading) {
    return (
      <>
        <DialogBody className="flex">
          <div className="flex w-full items-center justify-center">
            <Spinner size={"lg"} />
          </div>
        </DialogBody>
        {footer}
      </>
    );
  }

  if (!products || status === "error") {
    return (
      <>
        <DialogBody className="flex">
          <div className="flex w-full items-center justify-center">
            <span className="text-red-500">Nenhum produto encontrado.</span>
          </div>
        </DialogBody>
        {footer}
      </>
    );
  }

  if (clientMeta.isMobileLike) {
    return (
      <DialogBody p={0} className="flex flex-col select-none!">
        {!isAddItem ? (
          <div className="flex-1 flex flex-col m-2 border border-neutral-800 bg-neutral-800/20 rounded-xl">
            <div className="grid p-3 pt-2 text-lg grid-cols-[1fr_80px] py-1 font-semibold">
              <span>Item</span>
              <span className="text-center">Subtotal</span>
            </div>
            <div
              style={{ height: "calc(100vh - 318px)" }}
              className="flex flex-col overflow-y-auto border-neutral-800 border-y"
            >
              {(dataPreview.order?.items || []).map((item) => {
                const isLoadDell = loadDelItems.includes(item.ItemOfOrderId);
                return (
                  <div
                    key={item.ItemOfOrderId}
                    className={clsx(
                      "grid grid-cols-[1fr_80px] p-3 border-b last:border-b-0 not-odd:bg-white/2 bg-white/4  border-neutral-800",
                      isLoadDell ? "blur-[2px]" : "",
                    )}
                  >
                    <div className="flex flex-col items-baseline -space-y-1">
                      <span>{item.title}</span>
                      <a
                        onClick={() =>
                          isLoadDell
                            ? undefined
                            : removeTableItem(item.ItemOfOrderId)
                        }
                        className="text-red-500 font-medium underline"
                      >
                        remover
                      </a>
                    </div>
                    <span className="text-end">
                      {formatToBRL(
                        (item.price || 0) *
                          Number(item.title.replace(/^(\d*)x.*/, "$1")),
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={{ height: "calc(100vh - 164px)" }}
            className="relative flex flex-col mt-2 gap-y-1 p-3 overflow-y-auto"
          >
            <div className="h-full flex-1 flex flex-col gap-y-3">
              {products.items_with_category.map((cat) => (
                <div key={cat.uuid} className="space-y-2 flex flex-col">
                  <span className="font-semibold uppercase text-neutral-300">
                    • {cat.name}
                  </span>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] min-w-35 gap-1.5 auto-rows-[85px]">
                    {cat.items.map((item) => {
                      const isSelect = itemsSelected.some(
                        (s) => s.uuid === item.uuid,
                      );
                      const itemSelect = itemsSelected.find(
                        (s) => s.uuid === item.uuid,
                      );
                      return (
                        <div
                          key={item.uuid}
                          onClick={() => {
                            if (!isSelect) {
                              setItemsSelected((state) => [
                                ...state,
                                {
                                  uuid: item.uuid,
                                  qnt: 1,
                                  price: item.afterPrice || 0,
                                },
                              ]);
                            } else {
                              setItemsSelected((state) =>
                                state.map((i) => {
                                  if (i.uuid === item.uuid) {
                                    i.qnt++;
                                    i.price += item.afterPrice || 0;
                                  }
                                  return i;
                                }),
                              );
                            }
                          }}
                          className={clsx(
                            "flex flex-col border-2 p-3! py-2! rounded-md",
                            isSelect
                              ? "bg-green-200/20 border-green-200"
                              : "bg-amber-50/5 border-transparent",
                          )}
                        >
                          <div className="flex w-full gap-x-1 items-start flex-1">
                            <div className="flex flex-col justify-between h-full w-full flex-1 items-start gap-x-1">
                              <span className="text-sm line-clamp-2 font-semibold">
                                {item.name}
                              </span>
                              <div
                                className={clsx(
                                  "flex items-center w-full h-7",
                                  itemSelect
                                    ? "justify-between"
                                    : "justify-end",
                                )}
                              >
                                {itemSelect && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (itemSelect.qnt <= 1) {
                                          setItemsSelected((state) =>
                                            state.filter(
                                              (s) => s.uuid !== item.uuid,
                                            ),
                                          );
                                        } else {
                                          setItemsSelected((state) =>
                                            state.map((i) => {
                                              if (i.uuid === item.uuid) {
                                                i.qnt--;
                                                i.price -= item.afterPrice || 0;
                                              }
                                              return i;
                                            }),
                                          );
                                        }
                                      }}
                                      type="button"
                                      className="flex items-center justify-center text-red-600 bg-red-300 w-7 h-7 font-bold rounded-md"
                                    >
                                      -
                                    </button>
                                    <span className="font-medium text-lg w-4 text-center">
                                      ({itemSelect.qnt})
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-semibold">
                                    {item.afterPrice &&
                                      formatToBRL(item.afterPrice)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t-2 mt-4 border-neutral-800">
                <div className="space-y-2 flex flex-col">
                  <span className="font-semibold uppercase text-neutral-300">
                    • Produtos sem categoria
                  </span>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] min-w-35 gap-1.5 auto-rows-[85px]">
                    {products.items_without_category.map((item) => {
                      const isSelect = itemsSelected.some(
                        (s) => s.uuid === item.uuid,
                      );
                      const itemSelect = itemsSelected.find(
                        (s) => s.uuid === item.uuid,
                      );
                      return (
                        <div
                          key={item.uuid}
                          onClick={() => {
                            if (!isSelect) {
                              setItemsSelected((state) => [
                                ...state,
                                {
                                  uuid: item.uuid,
                                  qnt: 1,
                                  price: item.afterPrice || 0,
                                },
                              ]);
                            } else {
                              setItemsSelected((state) =>
                                state.map((i) => {
                                  if (i.uuid === item.uuid) {
                                    i.qnt++;
                                    i.price += item.afterPrice || 0;
                                  }
                                  return i;
                                }),
                              );
                            }
                          }}
                          className={clsx(
                            "flex flex-col p-3! py-2! border-2 rounded-md",
                            isSelect
                              ? "bg-green-200/20 border-green-200"
                              : "bg-amber-50/5 border-transparent",
                          )}
                        >
                          <div className="flex w-full gap-x-1 items-start flex-1">
                            <div className="flex flex-col justify-between h-full w-full flex-1 items-start gap-x-1">
                              <span className="text-sm line-clamp-2 font-semibold">
                                {item.name}
                              </span>
                              <div
                                className={clsx(
                                  "flex items-center w-full h-7",
                                  itemSelect
                                    ? "justify-between"
                                    : "justify-end",
                                )}
                              >
                                {itemSelect && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (itemSelect.qnt <= 1) {
                                          setItemsSelected((state) =>
                                            state.filter(
                                              (s) => s.uuid !== item.uuid,
                                            ),
                                          );
                                        } else {
                                          setItemsSelected((state) =>
                                            state.map((i) => {
                                              if (i.uuid === item.uuid) {
                                                i.qnt--;
                                                i.price -= item.afterPrice || 0;
                                              }
                                              return i;
                                            }),
                                          );
                                        }
                                      }}
                                      type="button"
                                      className="flex items-center justify-center text-red-600 bg-red-300 w-7 h-7 font-bold rounded-md"
                                    >
                                      -
                                    </button>
                                    <span className="font-medium text-lg w-4 text-center">
                                      ({itemSelect.qnt})
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-semibold">
                                    {item.afterPrice &&
                                      formatToBRL(item.afterPrice)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex mt-3 flex-col pb-3 px-3 gap-y-1.5">
          {!isAddItem
            ? [
                <div className="flex px-2 justify-end items-center font-medium gap-x-1.5 pt-1">
                  <span>Total:</span>
                  <span className="text-white text-lg font-bold">
                    {formatToBRL(totalTable)}
                  </span>
                </div>,
                <Button
                  onClick={() => setIsAddItem(true)}
                  colorPalette={"green"}
                  fontWeight={"bold"}
                >
                  Adicionar Item
                </Button>,
                <Button
                  onClick={handlePrintTableOrder}
                  colorPalette={"blue"}
                  loading={loadPrint}
                  fontWeight={"bold"}
                >
                  Imprimir Conta
                </Button>,
                <Button
                  onClick={() => {
                    onOpen({
                      size: "sm",
                      content: (
                        <ModalCloseTable
                          close={onCloseDialog}
                          total={totalTable}
                          onClickMethod={handleCloseTable}
                        />
                      ),
                    });
                  }}
                  colorPalette={"red"}
                  loading={loadClose}
                  fontWeight={"bold"}
                >
                  Fechar Conta
                </Button>,
              ]
            : [
                <Button
                  onClick={() => addTableItems()}
                  colorPalette={"green"}
                  fontWeight={"bold"}
                  disabled={!itemsSelected.length}
                  loading={loadAddItem}
                >
                  {itemsSelected.reduce((ac, cr) => ac + cr.qnt, 0)} Item
                  {itemsSelected.length > 1 ? "s" : ""} + {formatToBRL(total)}
                </Button>,
                <Button
                  colorPalette={"red"}
                  variant={"ghost"}
                  fontWeight={"bold"}
                  onClick={() => {
                    setIsAddItem(false);
                    setItemsSelected([]);
                  }}
                >
                  Cancelar
                </Button>,
              ]}
        </div>
        {dialog}
      </DialogBody>
    );
  }

  return (
    <>
      <DialogBody className="grid grid-cols-[minmax(210px,410px)_1fr] items-start gap-x-3">
        <div className="flex-1 flex flex-col border border-neutral-800 bg-neutral-800/20 rounded-xl">
          <div className="grid p-3 pt-2 text-lg grid-cols-[1fr_80px] py-1 font-semibold">
            <span>Item</span>
            <span className="text-center">Subtotal</span>
          </div>
          <div
            style={{ height: "calc(100vh - 315px)" }}
            className="flex flex-col overflow-y-auto border-neutral-800 border-y"
          >
            {(dataPreview.order?.items || []).map((item) => {
              const isLoadDell = loadDelItems.includes(item.ItemOfOrderId);
              return (
                <div
                  key={item.ItemOfOrderId}
                  className={clsx(
                    "grid grid-cols-[1fr_80px] p-3 border-b last:border-b-0 not-odd:bg-white/2 bg-white/4  border-neutral-800",
                    isLoadDell ? "blur-[2px]" : "",
                  )}
                >
                  <div className="flex flex-col items-baseline -space-y-1">
                    <span>{item.title}</span>
                    <a
                      onClick={() =>
                        isLoadDell
                          ? undefined
                          : removeTableItem(item.ItemOfOrderId)
                      }
                      className="text-red-500 font-medium underline cursor-pointer"
                    >
                      remover
                    </a>
                  </div>
                  <span className="text-end">
                    {formatToBRL(
                      (item.price || 0) *
                        Number(item.title.replace(/^(\d*)x.*/, "$1")),
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col">
            <div className="flex px-2 justify-end items-center font-medium gap-x-1.5 pt-1">
              <span>Total:</span>
              <span className="text-white text-lg font-bold">
                {formatToBRL(totalTable)}
              </span>
            </div>
            <div className="grid grid-cols-2 p-3 w-full gap-x-3">
              <Button
                onClick={handlePrintTableOrder}
                colorPalette={"blue"}
                loading={loadPrint}
                fontWeight={"bold"}
                w={"1fr"}
              >
                Imprimir Conta
              </Button>
              <Button
                w={"1fr"}
                onClick={() => {
                  onOpen({
                    size: "sm",
                    content: (
                      <ModalCloseTable
                        close={onCloseDialog}
                        total={totalTable}
                        onClickMethod={handleCloseTable}
                      />
                    ),
                  });
                }}
                colorPalette={"red"}
                loading={loadClose}
                fontWeight={"bold"}
              >
                Fechar Conta
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-y-1 h-[calc(100vh-180px)] overflow-y-auto">
          <div className="h-full flex-1 flex flex-col gap-y-3">
            {products.items_with_category.map((cat) => (
              <div key={cat.uuid} className="space-y-2 flex flex-col">
                <span className="font-semibold uppercase text-neutral-300">
                  • {cat.name}
                </span>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] min-w-35 gap-1.5 auto-rows-[85px]">
                  {cat.items.map((item) => {
                    const isSelect = itemsSelected.some(
                      (s) => s.uuid === item.uuid,
                    );
                    const itemSelect = itemsSelected.find(
                      (s) => s.uuid === item.uuid,
                    );
                    return (
                      <div
                        key={item.uuid}
                        onClick={() => {
                          if (!isSelect) {
                            setItemsSelected((state) => [
                              ...state,
                              {
                                uuid: item.uuid,
                                qnt: 1,
                                price: item.afterPrice || 0,
                              },
                            ]);
                          } else {
                            setItemsSelected((state) =>
                              state.map((i) => {
                                if (i.uuid === item.uuid) {
                                  i.qnt++;
                                  i.price += item.afterPrice || 0;
                                }
                                return i;
                              }),
                            );
                          }
                        }}
                        className={clsx(
                          "flex flex-col border-2 p-3! py-2! rounded-md",
                          isSelect
                            ? "bg-green-200/20 border-green-200"
                            : "bg-amber-50/5 border-transparent",
                        )}
                      >
                        <div className="flex w-full gap-x-1 items-start flex-1">
                          <div className="flex flex-col justify-between h-full w-full flex-1 items-start gap-x-1">
                            <span className="text-sm line-clamp-2 font-semibold">
                              {item.name}
                            </span>
                            <div
                              className={clsx(
                                "flex items-center w-full h-7",
                                itemSelect ? "justify-between" : "justify-end",
                              )}
                            >
                              {itemSelect && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (itemSelect.qnt <= 1) {
                                        setItemsSelected((state) =>
                                          state.filter(
                                            (s) => s.uuid !== item.uuid,
                                          ),
                                        );
                                      } else {
                                        setItemsSelected((state) =>
                                          state.map((i) => {
                                            if (i.uuid === item.uuid) {
                                              i.qnt--;
                                              i.price -= item.afterPrice || 0;
                                            }
                                            return i;
                                          }),
                                        );
                                      }
                                    }}
                                    type="button"
                                    className="flex items-center justify-center text-red-600 bg-red-300 w-7 h-7 font-bold rounded-md"
                                  >
                                    -
                                  </button>
                                  <span className="font-medium text-lg w-4 text-center">
                                    ({itemSelect.qnt})
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1.5">
                                <span className="font-semibold">
                                  {item.afterPrice &&
                                    formatToBRL(item.afterPrice)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="pt-4 border-t-2 mt-4 border-neutral-800">
              <div className="space-y-2 flex flex-col">
                <span className="font-semibold uppercase text-neutral-300">
                  • Produtos sem categoria
                </span>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] min-w-35 gap-1.5 auto-rows-[85px]">
                  {products.items_without_category.map((item) => {
                    const isSelect = itemsSelected.some(
                      (s) => s.uuid === item.uuid,
                    );
                    const itemSelect = itemsSelected.find(
                      (s) => s.uuid === item.uuid,
                    );
                    return (
                      <div
                        key={item.uuid}
                        onClick={() => {
                          if (!isSelect) {
                            setItemsSelected((state) => [
                              ...state,
                              {
                                uuid: item.uuid,
                                qnt: 1,
                                price: item.afterPrice || 0,
                              },
                            ]);
                          } else {
                            setItemsSelected((state) =>
                              state.map((i) => {
                                if (i.uuid === item.uuid) {
                                  i.qnt++;
                                  i.price += item.afterPrice || 0;
                                }
                                return i;
                              }),
                            );
                          }
                        }}
                        className={clsx(
                          "flex flex-col p-3! py-2! border-2 rounded-md",
                          isSelect
                            ? "bg-green-200/20 border-green-200"
                            : "bg-amber-50/5 border-transparent",
                        )}
                      >
                        <div className="flex w-full gap-x-1 items-start flex-1">
                          <div className="flex flex-col justify-between h-full w-full flex-1 items-start gap-x-1">
                            <span className="text-sm line-clamp-2 font-semibold">
                              {item.name}
                            </span>
                            <div
                              className={clsx(
                                "flex items-center w-full h-7",
                                itemSelect ? "justify-between" : "justify-end",
                              )}
                            >
                              {itemSelect && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (itemSelect.qnt <= 1) {
                                        setItemsSelected((state) =>
                                          state.filter(
                                            (s) => s.uuid !== item.uuid,
                                          ),
                                        );
                                      } else {
                                        setItemsSelected((state) =>
                                          state.map((i) => {
                                            if (i.uuid === item.uuid) {
                                              i.qnt--;
                                              i.price -= item.afterPrice || 0;
                                            }
                                            return i;
                                          }),
                                        );
                                      }
                                    }}
                                    type="button"
                                    className="flex items-center justify-center text-red-600 bg-red-300 w-7 h-7 font-bold rounded-md"
                                  >
                                    -
                                  </button>
                                  <span className="font-medium text-lg w-4 text-center">
                                    ({itemSelect.qnt})
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1.5">
                                <span className="font-semibold">
                                  {item.afterPrice &&
                                    formatToBRL(item.afterPrice)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        {dialog}
      </DialogBody>
      {footer}
    </>
  );
}

export const ModalViewTable: React.FC<IProps> = ({
  data,
  close,
  menuUuid,
  isDelete = false,
  onCreateNewsItems,
  onDeleteItem,
  onCloseTable,
  onDeleteTable,
}): JSX.Element => {
  const { clientMeta, logout } = useContext(AuthContext);
  const [loadDelete, setLoadDelete] = useState(false);

  const handleDeleteTable = async () => {
    try {
      setLoadDelete(true);
      await deleteTable(data.id);
      setLoadDelete(false);
      onDeleteTable(data.id);
      toaster.success({
        title: "Mesa deletada",
        description: "Com sucesso.",
        duration: 1400,
      });
      close();
    } catch (error) {
      setLoadDelete(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length)
            dataError.toast.forEach((s) => toaster.create({ ...s }));
        }
      }
      throw error;
    }
  };

  return (
    <DialogContent>
      <DialogHeader
        p={clientMeta.isMobileLike ? 0 : undefined}
        px={clientMeta.isMobileLike ? 3 : undefined}
        pt={clientMeta.isMobileLike ? 3 : undefined}
        flexDirection={"column"}
        gap={0}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-x-1.5">
            <IconButton onClick={close} size={"xs"} variant={"subtle"}>
              <FaChevronLeft />
            </IconButton>
            <span>Mesa: {data.name}</span>
          </div>
          <Button
            onClick={() => {
              const state = confirm("Deletar permanentemente?");
              if (state) {
                handleDeleteTable();
              }
            }}
            size={"sm"}
            colorPalette={"red"}
            variant={"ghost"}
            loading={loadDelete}
          >
            Deletar a Mesa
          </Button>
        </div>
      </DialogHeader>
      <Content
        onDeleteItem={onDeleteItem}
        onCreateNewsItems={onCreateNewsItems}
        menuUuid={menuUuid}
        data={data}
        close={close}
        isDelete={isDelete}
        onCloseTable={onCloseTable}
      />
    </DialogContent>
  );
};
