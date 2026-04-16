import { useContext, useEffect, useState } from "react";
import { AspectRatio, Button, IconButton, Spinner } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { MdDelete, MdEdit } from "react-icons/md";
import { api } from "../../../../../../services/api";
import {
  deleteMenuOnlineCategory,
  getMenuOnlineCategories,
  updateMenuOnlineCategorySequence,
} from "../../../../../../services/api/MenuOnline";
import { useParams } from "react-router-dom";
import { AuthContext } from "@contexts/auth.context";
import { IoAdd } from "react-icons/io5";
import { FormCreateCategoriesMenuOnlineConfig } from "./create";
import { FormEditCategoryMenuOnlineConfig } from "./edit";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItems";
import clsx from "clsx";

export interface Category {
  id: number;
  uuid: string;
  name: string;
  image45x45png?: string | null;
  items: number;
  days_in_the_week_label: string;
}

interface Props {
  bg_primary?: string;
}
export function SectionCategoriesMenuOnlineConfig(props: Props) {
  const { logout, clientMeta } = useContext(AuthContext);
  const { uuid } = useParams<{ uuid: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [edit, setEdit] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(
      clientMeta.isMobileLike ? TouchSensor : PointerSensor,
      clientMeta.isMobileLike
        ? {
            activationConstraint: {
              delay: 250,
              tolerance: 8,
              distance: 5,
            },
          }
        : { activationConstraint: { distance: 1 } },
    ),
  );

  useEffect(() => {
    if (!uuid) return;
    (async () => {
      try {
        const data = await getMenuOnlineCategories({ uuid });
        setCategories(data);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          // if (error.response?.status === 400) {
          //   const dataError = error.response?.data as ErrorResponse_I;
          //   if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          //   if (dataError.input.length) {
          //     dataError.input.forEach(({ text, path }) =>
          //       // @ts-expect-error
          //       props?.setError?.(path, { message: text })
          //     );
          //   }
          // }
        }
      }
    })();
  }, [uuid]);

  const [upSeq, setUpSeq] = useState<string[]>([]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((i) => i.uuid === active.id);
    const newIndex = categories.findIndex((i) => i.uuid === over.id);

    const reordered = arrayMove(categories, oldIndex, newIndex);

    setCategories(reordered);
    const newSequence = reordered.map((i) => i.uuid);
    setUpSeq(newSequence);
  };

  useEffect(() => {
    if (!uuid || !upSeq.length) return;
    setIsLoad(true);
    const tt = setTimeout(() => {
      (async () => {
        try {
          await updateMenuOnlineCategorySequence(uuid, { items: upSeq });
          setUpSeq([]);
          setIsLoad(false);
        } catch (error) {
          setIsLoad(false);
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) logout();
            // if (error.response?.status === 400) {
            //   const dataError = error.response?.data as ErrorResponse_I;
            //   if (dataError.toast.length) dataError.toast.forEach(toaster.create);
            //   if (dataError.input.length) {
            //     dataError.input.forEach(({ text, path }) =>
            //       // @ts-expect-error
            //       props?.setError?.(path, { message: text })
            //     );
            //   }
            // }
          }
        }
      })();
    }, 2000);
    return () => {
      clearTimeout(tt);
    };
  }, [upSeq]);

  return (
    <section className="space-y-3">
      <div className="flex gap-x-2">
        <h3 className="text-lg font-bold">Categorias</h3>
        {!isCreate && (
          <Button
            onClick={() => setIsCreate(true)}
            type={"button"}
            variant="outline"
            size={"sm"}
          >
            <IoAdd /> Adicionar
          </Button>
        )}
        {isLoad && <Spinner />}
      </div>

      {!categories.length ? (
        <div
          className={
            "flex items-center justify-center bg-white py-3 border border-neutral-200 gap-x-1 mt-1 px-3"
          }
        >
          <span className="text-neutral-600 text-sm">
            As categorias aparecerão aqui.
          </span>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((i) => i.uuid)}
            strategy={rectSortingStrategy}
          >
            <div
              className={
                "flex flex-wrap bg-white py-2 border border-neutral-200 min-[480px]:grid-cols-[repeat(5,1fr)_50px] items-center gap-x-1 mt-1 px-3"
              }
            >
              {categories.map((cat, index) => {
                const background = `${props.bg_primary || "#dddddd"}${index === 0 ? "90" : "10"}`;
                const textOn = `${props.bg_primary || "#111111"}${index === 0 ? "" : "60"}`;

                return (
                  <SortableItem key={cat.uuid} id={cat.uuid}>
                    <div
                      style={{ background }}
                      className={clsx(
                        "grid rounded-lg px-2 pl-1 gap-x-1 items-center cursor-pointer",
                        cat.image45x45png
                          ? "grid-cols-[45px_1fr_30px_30px]"
                          : "grid-cols-[1fr_30px_30px]",
                      )}
                    >
                      {cat.image45x45png && (
                        <AspectRatio ratio={1} w={"100%"}>
                          <div
                            className={`rounded-xl w-full p-0.5 flex justify-center duration-300 items-center`}
                          >
                            <img
                              src={`${api.getUri()}/public/images/${cat.image45x45png}`}
                              className="w-full h-auto "
                              alt={cat.name}
                            />
                          </div>
                        </AspectRatio>
                      )}

                      <div className="flex flex-col">
                        <span
                          className="text-sm duration-300 font-semibold select-none"
                          style={{ color: textOn }}
                        >
                          {cat.name}
                        </span>
                        <span className="text-xs font-light text-neutral-800">
                          {cat.days_in_the_week_label}
                        </span>
                      </div>

                      <IconButton
                        onClick={() => setEdit(cat.uuid)}
                        variant={"plain"}
                        size={"xs"}
                      >
                        <MdEdit size={12} color={"#286ab6"} />
                      </IconButton>
                      <IconButton
                        onClick={async () => {
                          const state = confirm(
                            `Deseja realmente deletar a categoria "${cat.name}"?`,
                          );
                          if (state && uuid) {
                            await deleteMenuOnlineCategory({
                              uuid,
                              catUuid: cat.uuid,
                            });
                            setCategories((c) =>
                              c.filter((sss) => sss.uuid !== cat.uuid),
                            );
                          }
                        }}
                        variant={"plain"}
                        size={"xs"}
                      >
                        <MdDelete size={12} color={"#b62828"} />
                      </IconButton>
                    </div>
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {isCreate && (
        <FormCreateCategoriesMenuOnlineConfig
          onCreate={(newCategory) => {
            setCategories([...categories, newCategory]);
            setIsCreate(false);
          }}
          cancel={() => setIsCreate(false)}
        />
      )}
      {edit && (
        <FormEditCategoryMenuOnlineConfig
          cancel={() => setEdit(null)}
          catUuid={edit}
          onEdit={(values) => {
            setCategories((ca) =>
              ca.map((c) => {
                if (c.uuid === values.uuid) {
                  c.image45x45png = values.image45x45png;
                  if (values.name) c.name = values.name;
                  c.days_in_the_week_label = values.days_in_the_week_label;
                }
                return c;
              }),
            );
            setEdit(null);
          }}
        />
      )}
    </section>
  );
}
