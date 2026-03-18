import {
  Dispatch,
  JSX,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CloseButton } from "@components/ui/close-button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { AxiosError } from "axios";
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  UseFieldArrayRemove,
  useForm,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormTrigger,
  useWatch,
} from "react-hook-form";
import { ErrorResponse_I } from "../../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { AuthContext } from "@contexts/auth.context";
import { MdOutlineImage, MdDelete } from "react-icons/md";
import SelectMenuOnlineCategories from "@components/SelectMenuOnlineCategories";
import {
  Button,
  Collapsible,
  DatePicker,
  Portal,
  parseDate,
  IconButton,
  Input,
  Spinner,
  VStack,
  RadioGroup,
  Checkbox,
  Switch,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextareaAutosize from "react-textarea-autosize";
import { useHookFormMask } from "use-mask-input";
import { Avatar } from "@components/ui/avatar";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableItem } from "./SortableItems";
import clsx from "clsx";
import { LuCalendar, LuChevronDown } from "react-icons/lu";
import { v4 } from "uuid";
import { formatToBRL } from "brazilian-values";
import {
  getMenuOnlineItem,
  getMenuOnlineSectionsOfItem,
  updateMenuOnlineItem,
} from "../../../../../../services/api/MenuOnline";
import { uploadImage } from "../../../../../../services/api/Account";
import { api } from "../../../../../../services/api";
import { ItemRow } from "..";
import moment from "moment-timezone";
import { IoMdAdd } from "react-icons/io";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { AiFillCheckCircle, AiOutlineImport } from "react-icons/ai";
import { useParams } from "react-router-dom";
import SelectMenuOnlineItems from "@components/SelectMenuOnlineItems";
import { ImageCropModal } from "./ImageCropModal";

interface IProps {
  menuUuid: string;
  uuid: string;
  close: () => void;
  onUpdate(f: Partial<ItemRow>): void;
}

const SubItemSchema = z.object({
  uuid: z.string(),
  image55x55png: z
    .array(z.instanceof(File, { message: "Imagem é obrigatória." }))
    .nullish(),

  previewImage: z.string().nullish(),

  name: z
    .string({ message: "Campo obrigatório." })
    .min(1, "Campo obrigatório."),

  desc: z.string().nullish(),

  before_additional_price: z.string().nullish(),
  after_additional_price: z.string().nullish(),
  maxLength: z.number().nullish(),
  status: z.boolean().nullish(),
});

const SectionSchema = z
  .object({
    uuid: z.string(),
    title: z
      .string({ message: "Campo obrigatório." })
      .min(1, "Campo obrigatório."),
    helpText: z.string().nullish(),

    required: z.boolean().nullish(),

    minOptions: z.number().nullish(),
    maxOptions: z.number().nullish(),

    subItems: z.array(SubItemSchema).min(1, "Adicione pelo menos uma opção"),
  })
  .refine(
    (data) =>
      data.maxOptions === undefined ||
      data.minOptions === undefined ||
      data.maxOptions === null ||
      data.minOptions === null ||
      data.maxOptions >= data.minOptions,
    {
      message: '"Qnt. máxima" não pode ser menor que "Qnt. mínima"',
      path: ["maxOptions"],
    },
  );

const FormSchema = z
  .object({
    name: z
      .string({ message: "Campo obrigatório." })
      .min(1, "Campo obrigatório."),
    desc: z.string().nullish(),
    beforePrice: z.string().nullish(),
    afterPrice: z.string().nullish(),
    fileNameImage: z.instanceof(File).optional(),
    qnt: z.number().nullish(),
    categoriesUuid: z.array(z.string()),
    date_validity: z.date().nullish(),
    sections: z.array(SectionSchema).nullish(),
  })
  .superRefine((data, ctx) => {
    const hasBasePrice = !!data.afterPrice?.trim();
    const sections = data.sections ?? [];

    // REGRA 1
    if (!hasBasePrice && sections.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Defina o preço atual do Item.",
        path: ["afterPrice"],
      });
      return;
    }

    if (!hasBasePrice) {
      const requiredSections = sections.filter(
        (section) => (section.minOptions || 0) > 0,
      );

      if (requiredSections.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Defina o preço atual ou adicione um adicional obrigatório com preço definido em todas as opções.",
          path: ["afterPrice"],
        });
        return;
      }

      const existeSectionObrigatoriaOndeTodasOpcoesTemPreco =
        requiredSections.some((section) => {
          const todosAsOpcoesComPreco = section.subItems.every((sub) => {
            if (!sub.after_additional_price) {
              return !!sub.after_additional_price;
            }
            const price = Number(sub.after_additional_price.replace(/_/g, ""));
            return price > 0;
          });
          return todosAsOpcoesComPreco;
        });

      if (!existeSectionObrigatoriaOndeTodasOpcoesTemPreco) {
        for (let index = 0; index < sections.length; index++) {
          const section = sections[index];

          if ((section.minOptions || 0) > 0) {
            for (let indexS = 0; indexS < section.subItems.length; indexS++) {
              const element = section.subItems[indexS];
              if (
                !element.after_additional_price ||
                Number(element.after_additional_price.replace(/\D/g, "")) === 0
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Defina o preço.`,
                  path: [
                    "sections",
                    index,
                    "subItems",
                    indexS,
                    "after_additional_price",
                  ],
                });
              }
            }

            if (
              section.subItems.some(
                (d) =>
                  !d.after_additional_price ||
                  Number(d.after_additional_price.replace(/\D/g, "")) === 0,
              )
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Todas as opções abaixo devem ter preço atual definido.`,
                path: ["sections", index, "root"],
              });
            }
          }
        }
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Produtos sem preço atual precisam de ao menos um adicional obrigatório ("Qnt. mínima") com preço definido em todas as opções.`,
          path: ["sections", "root"],
        });
      }
    }
  });

type Fields = z.infer<typeof FormSchema>;

function PreviewImage(props: {
  img: File | undefined | string;
  fallback: string;
  width?: string;
  height?: string;
}) {
  const imgPreviewUrl = useMemo(() => {
    if (!props.img) return "";
    if (typeof props.img === "string") {
      return api.getUri() + "/public/images/" + props.img;
    }
    if (props.img) {
      return URL.createObjectURL(props.img);
    }
  }, [props.img]);

  return (
    <img
      src={imgPreviewUrl}
      className="rounded-sm"
      alt="img"
      width={props.width || "30px"}
      height={props.height || "30px"}
    />
  );
}

function PreviewSection(props: { control: Control<Fields>; index: number }) {
  const section = useWatch({
    control: props.control,
    name: `sections.${props.index}`,
  });
  const [stateSub, setStateSub] = useState<Record<string, number>>({});

  const total = useMemo(() => {
    return Object.entries(stateSub).reduce((ac, [_, value]) => {
      ac += value;
      return ac;
    }, 0);
  }, [stateSub]);

  if (!section) return null;

  return (
    <div className="max-h-64 overflow-y-scroll">
      <Collapsible.Root className="w-full! bg-white">
        <Collapsible.Trigger className="w-full sticky top-0 z-50 bg-neutral-100 ">
          <div className="flexjustify-between w-full items-center">
            <div className="sticky min-h-10 w-full px-3 py-2 top-0 z-20 border-y border-neutral-200">
              {section.title && (
                <p className="pl-1 line-clamp-2 font-semibold text-start text-sm text-neutral-700">
                  {section.title}
                </p>
              )}
              {(section.helpText ||
                section.minOptions ||
                section.maxOptions) && (
                  <div className="flex justify-between w-full items-start">
                    <p className="line-clamp-2 text-neutral-500 text-xs text-start">
                      {section.helpText}
                    </p>
                    {(section.minOptions || section.maxOptions) && (
                      <div className="flex gap-x-1 items-center">
                        <span
                          className={clsx(
                            `px-1 py-0.5 text-xs rounded-sm font-medium`,
                            false
                              ? "bg-green-400 text-green-800"
                              : "bg-neutral-700 text-neutral-100",
                          )}
                        >
                          {total}/{section.minOptions || section.maxOptions}
                        </span>
                        {(section.minOptions || 0) > 0 ? (
                          <div className="flex">
                            {total < (section.minOptions || Infinity) && (
                              <span
                                className={clsx(
                                  "text-neutral-100 text-xs font-medium px-1 py-0.5 rounded-sm bg-neutral-700",
                                  // sectionError === section.uuid
                                  //   ? "animate-error"
                                  //   : "bg-neutral-700",
                                )}
                              >
                                OBRIGATÓRIO
                              </span>
                            )}
                            {total >= (section.minOptions || Infinity) && (
                              <span className="bg-green-600 text-xs text-green-100 font-medium px-1 py-0.5 block rounded-sm">
                                <AiFillCheckCircle size={16} />
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            {total === (section.maxOptions || Infinity) && (
                              <span className="bg-green-600 text-xs text-green-100 font-medium px-1 py-0.5 block rounded-sm">
                                <AiFillCheckCircle size={16} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>
            <Collapsible.Indicator
              transition="transform 0.2s"
              _open={{ transform: "rotate(180deg)" }}
              className="absolute top-3.5 left-0.5"
            >
              <LuChevronDown className="text-black " />
            </Collapsible.Indicator>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content className="mt-1">
          <div className="max-w-lg mx-auto scroll-auto space-y-1">
            {section.subItems.map((sub) => {
              const value = stateSub[sub.uuid] || 0;
              let beforePrice: any = sub.before_additional_price?.replace(/\D/g, "");
              if (beforePrice) {
                if (beforePrice.length < 3) { beforePrice = Number(beforePrice) } else { beforePrice = Number(beforePrice) / 100 };
              }
              let afterPrice: any = sub.after_additional_price?.replace(/\D/g, "");
              if (afterPrice) {
                if (afterPrice.length < 3) { afterPrice = Number(afterPrice) } else { afterPrice = Number(afterPrice) / 100 };
              }

              return (
                <div
                  key={sub.uuid}
                  className={clsx(
                    "select-none w-full relative flex-1 px-1",
                    (section.maxOptions === null ||
                      (section.maxOptions || 0) >= 1) &&
                    sub.maxLength === 1 &&
                    "active:scale-[99%] transition-all duration-200",
                  )}
                  onClick={() => {
                    setStateSub((state) => {
                      let newState = { ...(state ?? {}) };
                      const v = stateSub[sub.uuid] || 0;

                      // pode escolher mais de 1
                      if ((section.maxOptions || Infinity) > 1) {
                        if (!sub.maxLength) {
                          // mas item não pode ser escolhido;
                        } else if (sub.maxLength > 1) {
                          // o item pode ser escolhido +1 vez;
                          if (total < (section.maxOptions || Infinity)) {
                            const next = Math.min(
                              v + 1,
                              sub.maxLength,
                              section.maxOptions || Infinity,
                            );
                            newState[sub.uuid] = next;
                          }
                        } else {
                          // o item pode ser escolhido 1 vez;
                          if (v === 1) {
                            newState[sub.uuid] = 0;
                          } else {
                            if (total < (section.maxOptions || Infinity)) {
                              newState[sub.uuid] = 1;
                            }
                          }
                        }
                      } else {
                        // pode apenas 1 item
                        if (!sub.maxLength) {
                          // o item não pode ser escolhido;
                        } else if (sub.maxLength > 1) {
                          // o item pode ser escolhido +1 vez;
                          const next = Math.min(
                            v + 1,
                            sub.maxLength,
                            section.maxOptions || Infinity,
                          );
                          newState[sub.uuid] = next;
                        } else {
                          if (v === 1) {
                            newState[sub.uuid] = 0;
                          } else {
                            // pegar todos os items da seção e tornar zero.
                            // atulizar o atual para 1
                            newState = {};
                            newState[sub.uuid] = 1;

                            // manda para a proxima section
                            // const sections = items.find(
                            //   (s) => s.uuid === openSectionItem,
                            // )?.sections;
                            // if (sections) {
                            //   if (sections[sectionIndex + 1]?.uuid) {
                            //     scrollToSection(
                            //       sections[sectionIndex + 1].uuid,
                            //     );
                            //   }
                            // }
                          }
                        }
                      }

                      return newState;
                    });
                  }}
                >
                  <div className="flex flex-col p-2 gap-y-1.5 rounded-md bg-zinc-50 border border-zinc-100 justify-between">
                    <div className="flex w-full items-center justify-between">
                      <div
                        className={clsx(
                          "flex gap-x-2",
                          !sub.desc ? "items-center" : "items-start",
                        )}
                      >
                        {(!!sub.image55x55png?.length || sub.previewImage) && (
                          <PreviewImage
                            img={
                              sub.image55x55png?.length
                                ? sub.image55x55png?.[0]
                                : sub.previewImage
                                  ? sub.previewImage
                                  : undefined
                            }
                            fallback="55x55"
                          />
                        )}
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-medium leading-3.75`}
                            style={{ color: "#111111" }}
                          >
                            {sub.name}
                          </span>
                          <span
                            className={`text-sm font-light text-neutral-500`}
                          >
                            {sub.desc}
                          </span>
                          <div className="flex items-center gap-x-3 mt-2">
                            {afterPrice && (
                              <span className="text-neutral-800 text-xs font-semibold">
                                + {formatToBRL(afterPrice)}
                              </span>
                            )}
                            {beforePrice && (
                              <span className="text-neutral-600 line-through text-[11px] font-light">
                                {formatToBRL(beforePrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {(section.maxOptions === undefined ||
                        section.maxOptions === null ||
                        section.maxOptions > 1) &&
                        (sub.maxLength === undefined ||
                          sub.maxLength === null ||
                          sub.maxLength > 1) && (
                          <div className="flex gap-x-1">
                            <a
                              className={clsx(
                                "bg-green-200 z-10 duration-100 scale-100 active:scale-95 text-green-600 text-lg leading-0 w-6 h-6 flex items-center justify-center rounded-md",
                                (sub.maxLength || section.maxOptions) ===
                                  value || total === section.maxOptions
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-green-300 duration-200 cursor-pointer",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setStateSub((state) => {
                                  let newState = { ...(state ?? {}) };
                                  const v = stateSub[sub.uuid] || 0;

                                  if (
                                    section.maxOptions === undefined ||
                                    total < section.maxOptions!
                                  ) {
                                    const next = Math.min(
                                      v + 1,
                                      sub.maxLength || Infinity,
                                      section.maxOptions || Infinity,
                                    );
                                    newState[sub.uuid] = next;
                                  }
                                  return newState;
                                });
                              }}
                            >
                              +
                            </a>
                            <span className="bg-white text-neutral-800 border border-zinc-100 text-sm w-6 h-6 flex items-center justify-center rounded-md">
                              {value}
                            </span>
                            <a
                              onClick={(e) => {
                                e.stopPropagation();
                                setStateSub((state) => {
                                  let newState = { ...(state ?? {}) };
                                  const v = stateSub[sub.uuid] || 0;
                                  const next = Math.max(v - 1, 0);
                                  newState[sub.uuid] = next;
                                  return newState;
                                });
                              }}
                              className={clsx(
                                "bg-red-200 duration-100 active:scale-95 transition-all text-red-600 w-6 h-6 text-lg leading-0 flex items-center justify-center rounded-md",
                                value == 0
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-red-300 cursor-pointer",
                              )}
                            >
                              -
                            </a>
                          </div>
                        )}
                      {(section.maxOptions === undefined ||
                        section.maxOptions === null ||
                        section.maxOptions > 1) &&
                        sub.maxLength === 1 && (
                          <Checkbox.Root
                            size={"sm"}
                            colorPalette={"teal"}
                            variant={"solid"}
                            checked={!!stateSub[sub.uuid]}
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                          </Checkbox.Root>
                        )}
                      {section.maxOptions !== undefined &&
                        section.maxOptions === 1 && (
                          <RadioGroup.Root
                            value={value ? "check" : null}
                            colorPalette={"teal"}
                            size={"sm"}
                          >
                            <RadioGroup.Item value={"check"}>
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator />
                            </RadioGroup.Item>
                          </RadioGroup.Root>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}

function WaitCollapseTringer(props: {
  control: Control<Fields>;
  index: number;
  subIndex: number;
  open: boolean;
  uuid: string;
  remove: UseFieldArrayRemove;
}) {
  const name = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subIndex}.name`,
  });
  return (
    <Collapsible.Trigger className={clsx("pl-1 w-full")}>
      <div
        className={clsx(
          "px-2 py-2 w-full font-medium gap-x-1 justify-between bg-white/4 flex items-center",
          props.open ? "text-blue-300" : "text-red-300",
        )}
      >
        <span>
          {props.open
            ? `"${name || "<Sem nome>"}"`
            : `"${name || "<Sem nome>"}"`}
        </span>

        <div className="flex items-center gap-x-4">
          {props.open ? <IoEye size={20} /> : <IoEyeOff size={20} />}

          <button
            onClick={() => props.remove(props.subIndex)}
            className="cursor-pointer"
          >
            <MdDelete size={20} color={"#eb4747"} />
          </button>
        </div>
      </div>
    </Collapsible.Trigger>
  );
}

function WaitImageSubItem(props: {
  control: Control<Fields>;
  index: number;
  subIndex: number;
  setValue: UseFormSetValue<Fields>;
}) {
  const previewImage = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subIndex}.previewImage`,
  });
  const image55x55png = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subIndex}.image55x55png`,
  });
  return (!!image55x55png?.length || previewImage) && (
    <div className="flex flex-col items-center relative">
      <PreviewImage
        img={
          image55x55png?.length
            ? image55x55png?.[0]
            : previewImage
              ? previewImage
              : undefined
        }
        fallback="55x55"
      />
      <span onClick={() => {
        props.setValue(`sections.${props.index}.subItems.${props.subIndex}.image55x55png`, null, { shouldDirty: true });
        props.setValue(`sections.${props.index}.subItems.${props.subIndex}.previewImage`, null, { shouldDirty: true });
      }} className="text-red-400 text-xs text-center font-medium cursor-pointer hover:text-red-500 duration-200">remover</span>
    </div>
  );
}

function SectionSubItems(props: {
  control: Control<Fields>;
  index: number;
  register: UseFormRegister<Fields>;
  errors: FieldErrors<Fields>;
  collapsibles: string[];
  setCollapsibles: Dispatch<SetStateAction<string[]>>;
  setValue: UseFormSetValue<Fields>;
  trigger: UseFormTrigger<Fields>;
}) {
  const { clientMeta } = useContext(AuthContext)
  const [cropFile, setCropFile] = useState<{ file: File; index: number } | null>(null);
  const { fields, move, append, remove } = useFieldArray({
    control: props.control,
    name: `sections.${props.index}.subItems`,
  });

  const registerWithMask = useHookFormMask(props.register);

  const sensors = useSensors(
    useSensor(clientMeta.isMobileLike ? TouchSensor : PointerSensor, clientMeta.isMobileLike ? {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
        distance: 5
      }
    } : { activationConstraint: { distance: 1 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((i) => i.uuid === active.id);
    const newIndex = fields.findIndex((i) => i.uuid === over.id);

    move(oldIndex, newIndex);
  };

  if (!fields.length) {
    return (
      <div
        onClick={() => {
          const kk = v4();
          props.setCollapsibles((state) => [state[0]]);
          append({ image55x55png: [], name: "", uuid: kk, status: true });
          setTimeout(
            () => props.setCollapsibles((state) => [state[0], kk]),
            300,
          );
        }}
        className="rounded-md hover:bg-teal-200/5 duration-200 flex cursor-pointer items-center bg-teal-200/3 py-2 justify-center gap-x-1"
      >
        <IconButton
          type={"button"}
          variant={"ghost"}
          size={"2xs"}
          colorPalette={"teal"}
        >
          <IoMdAdd />
        </IconButton>
        <span className="font-medium text-teal-200">Opção</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3 w-full">
      {cropFile && (
        <ImageCropModal
          file={cropFile.file}
          onFinish={(file: any) => {
            props.setValue(`sections.${props.index}.subItems.${cropFile.index}.image55x55png`, [file], { shouldDirty: true })
            setCropFile(null);
          }}
        />
      )}

      <span className="text-center font-medium uppercase">- Opções -</span>
      {!!props.errors.sections?.[props.index]?.root && (
        <span className="text-red-400 text-center">
          {props.errors.sections?.[props.index]?.root?.message}
        </span>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((i) => i.uuid)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fields.map((item, index) => {
              const isOpen = props.collapsibles.includes(item.uuid);
              return (
                <SortableItem key={item.uuid} id={item.uuid}>
                  <Collapsible.Root
                    open={isOpen}
                    onOpenChange={() => {
                      props.setCollapsibles((state) =>
                        isOpen
                          ? state.filter((s) => s !== item.uuid)
                          : [state[0], item.uuid],
                      );
                    }}
                  >
                    <WaitCollapseTringer
                      control={props.control}
                      index={props.index}
                      open={isOpen}
                      uuid={item.uuid}
                      subIndex={index}
                      remove={remove}
                    />
                    <Collapsible.Content>
                      <div className="relative flex flex-1 mt-2 flex-col gap-y-2 px-2">
                        <div className="flex gap-x-1">
                          <WaitImageSubItem setValue={props.setValue} control={props.control} index={props.index} subIndex={index} />
                          <Field
                            invalid={
                              !!props.errors.sections?.[props.index]?.subItems?.[
                                index
                              ]?.image55x55png
                            }
                            errorText={
                              props.errors.sections?.[props.index]?.subItems?.[
                                index
                              ]?.image55x55png?.message
                            }
                            label="Imagem"
                            helperText="Recomendação: utilize uma imagem 55x55 px com fundo transparente (PNG) para melhor visualização."
                          >
                            <label>
                              <span className="bg-neutral-500/10 p-2 rounded-sm max-w-52 block">Selecionar imagem</span>
                              <input
                                className="hidden"
                                type="file"
                                hidden
                                max={1}
                                accept="image/jpeg, image/png, image/jpg"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  setCropFile({ file, index: index });
                                }}
                              />
                            </label>
                          </Field>
                        </div>

                        <Field
                          invalid={
                            !!props.errors.sections?.[props.index]?.subItems?.[
                              index
                            ]?.name
                          }
                          errorText={
                            props.errors.sections?.[props.index]?.subItems?.[
                              index
                            ]?.name?.message
                          }
                          label={
                            <span>
                              Nome <span className="text-red-300">*</span>
                            </span>
                          }
                        >
                          <Input
                            size={"xs"}
                            {...props.register(
                              `sections.${props.index}.subItems.${index}.name`,
                            )}
                          />
                        </Field>
                        <Field
                          invalid={
                            !!props.errors.sections?.[props.index]?.subItems?.[
                              index
                            ]?.desc
                          }
                          errorText={
                            props.errors.sections?.[props.index]?.subItems?.[
                              index
                            ]?.desc?.message
                          }
                          label="Descrição"
                        >
                          <TextareaAutosize
                            style={{ resize: "none" }}
                            minRows={1}
                            maxRows={2}
                            {...props.register(
                              `sections.${props.index}.subItems.${index}.desc`,
                            )}
                            className="px-2 py-1 rounded-sm w-full border-white/10 border"
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-x-2">
                          <Field
                            errorText={
                              props.errors.sections?.[props.index]?.subItems?.[
                                index
                              ]?.before_additional_price?.message
                            }
                            invalid={
                              !!props.errors.sections?.[props.index]
                                ?.subItems?.[index]?.before_additional_price
                            }
                            label="Preço antigo"
                          >
                            <Input
                              {...registerWithMask(`sections.${props.index}.subItems.${index}.before_additional_price`, ["9", "99", "9,99", "99,99", "999,99", "9.999,99"])}
                              onInput={(e) => {
                                props.setValue(`sections.${props.index}.subItems.${index}.before_additional_price`, e.currentTarget.value.replace(/\D/g, ""), {
                                  shouldDirty: true,
                                });
                              }}
                              size={"xs"}
                              autoComplete="off"
                              placeholder="14.50"
                            />
                          </Field>
                          <Field
                            errorText={
                              props.errors.sections?.[props.index]?.subItems?.[
                                index
                              ]?.after_additional_price?.message
                            }
                            invalid={
                              !!props.errors.sections?.[props.index]
                                ?.subItems?.[index]?.after_additional_price
                            }
                            label="Preço atual"
                          >
                            <Input
                              {...registerWithMask(`sections.${props.index}.subItems.${index}.after_additional_price`, ["9", "99", "9,99", "99,99", "999,99", "9.999,99"])}
                              onInput={(e) => {
                                props.setValue(`sections.${props.index}.subItems.${index}.after_additional_price`, e.currentTarget.value.replace(/\D/g, ""), {
                                  shouldDirty: true,
                                });
                              }}
                              size={"xs"}
                              autoComplete="off"
                              placeholder="9.90"
                            />
                          </Field>
                        </div>
                        <div className="flex gap-x-2 items-center">
                          <Field
                            errorText={
                              props.errors.sections?.[props.index]?.subItems?.[
                                index
                              ]?.maxLength?.message
                            }
                            invalid={
                              !!props.errors.sections?.[props.index]?.subItems?.[
                                index
                              ]?.maxLength
                            }
                            label="Qnt. máxima"
                          >
                            <Input
                              {...props.register(
                                `sections.${props.index}.subItems.${index}.maxLength`,
                                {
                                  setValueAs: (v) =>
                                    v === ""
                                      ? undefined
                                      : Number(v) < 0
                                        ? 0
                                        : Number(v),

                                  onChange(e) {
                                    const v = e.target.value;

                                    props.setValue(
                                      `sections.${props.index}.subItems.${index}.maxLength`,
                                      v === ""
                                        ? undefined
                                        : Number(v) < 0
                                          ? 0
                                          : Number(v),
                                      { shouldDirty: true },
                                    );
                                  },
                                },
                              )}
                              type="number"
                              size={"xs"}
                              autoComplete="off"
                            />
                          </Field>
                          <Controller
                            name={`sections.${props.index}.subItems.${index}.status`}
                            control={props.control}
                            render={({ field }) => (
                              <Switch.Root
                                checked={!!field.value}
                                onCheckedChange={(e) => field.onChange(e.checked)}
                                className="flex flex-col"
                              >
                                <Switch.Label>Status</Switch.Label>
                                <Switch.HiddenInput />
                                <Switch.Control />
                              </Switch.Root>
                            )}
                          />
                        </div>
                        <span className="-mt-1 text-neutral-400">0 = indisponível ou não permite seleção.</span>
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div
        onClick={() => {
          const kk = v4();
          props.setCollapsibles((state) => [state[0]]);
          append({ image55x55png: [], name: "", uuid: kk, status: true });
          setTimeout(
            () => props.setCollapsibles((state) => [state[0], kk]),
            300,
          );
        }}
        className="rounded-md hover:bg-teal-200/5 duration-200 flex cursor-pointer items-center bg-teal-200/3 py-2 justify-center gap-x-1"
      >
        <IconButton
          type={"button"}
          variant={"ghost"}
          size={"2xs"}
          colorPalette={"teal"}
        >
          <IoMdAdd />
        </IconButton>
        <span className="font-medium text-teal-200">Opção</span>
      </div>
    </div>
  );
}

const FormImportSchema = z.object({
  itemUuid: z
    .string({ message: "Campo obrigatório." })
    .min(1, "Campo obrigatório."),
});
type FieldsImport = z.infer<typeof FormImportSchema>;

function Sections(props: {
  control: Control<Fields>;
  register: UseFormRegister<Fields>;
  errors: FieldErrors<Fields>;
  collapsibles: string[];
  setCollapsibles: Dispatch<SetStateAction<string[]>>;
  trigger: UseFormTrigger<Fields>;
  setValue: UseFormSetValue<Fields>;
  reset: UseFormReset<Fields>;
}) {
  const { logout, clientMeta } = useContext(AuthContext);
  const params = useParams<{ uuid: string }>();
  const [message, setMessage] = useState("");

  const {
    handleSubmit,
    formState: { errors, isValid },
    reset,
    control,
    setError,
  } = useForm<FieldsImport>({
    shouldFocusError: true,
    resolver: zodResolver(FormImportSchema),
    mode: "onSubmit",
  });

  const {
    fields: sections,
    move,
    remove,
    append,
  } = useFieldArray({ name: "sections", control: props.control });

  const sensors = useSensors(
    useSensor(clientMeta.isMobileLike ? TouchSensor : PointerSensor, clientMeta.isMobileLike ? {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
        distance: 5
      }
    } : { activationConstraint: { distance: 1 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((i) => i.uuid === active.id);
    const newIndex = sections.findIndex((i) => i.uuid === over.id);

    move(oldIndex, newIndex);
  };

  const getSectionsOfItem = async (fields: FieldsImport) => {
    try {
      const sections = await getMenuOnlineSectionsOfItem({
        uuid: params.uuid!,
        itemUuid: fields.itemUuid,
      });
      if (sections.length) {
        // @ts-expect-error
        props.setValue("sections", sections);
      } else {
        setMessage("O item importado não tinha adicionais.");
      }
      reset({});
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError?.toast?.length) dataError.toast.forEach(toaster.create);
          if (dataError?.input?.length) {
            dataError?.input?.forEach(({ text, path }) =>
              // @ts-expect-error
              setError?.(path, { message: text }),
            );
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-y-3 w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((i) => i.uuid)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sections.map((item, index) => {
              const isOpen = props.collapsibles.includes(item.uuid);
              return (
                <SortableItem key={item.uuid} id={item.uuid}>
                  <div className="group relative flex flex-col gap-x-2 w-full px-2">
                    <PreviewSection control={props.control} index={index} />

                    <Collapsible.Root
                      open={isOpen}
                      onOpenChange={() => {
                        props.setCollapsibles((state) =>
                          isOpen
                            ? state.filter((s) => s !== item.uuid)
                            : [item.uuid],
                        );
                      }}
                      unmountOnExit={true}
                      lazyMount={true}
                    >
                      <Collapsible.Trigger
                        className={clsx(
                          "flex items-center gap-x-1 py-2 bg-white/4 justify-center w-full underline font-medium",
                          isOpen ? "text-red-300" : "text-blue-300",
                        )}
                      >
                        {isOpen ? "Esconder campos" : "Mostrar campos"}
                        {isOpen ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                      </Collapsible.Trigger>
                      <Collapsible.Content>
                        <div className="flex flex-1 mt-2 flex-col gap-y-2">
                          <Field
                            invalid={!!props.errors.sections?.[index]?.title}
                            errorText={
                              props.errors.sections?.[index]?.title?.message
                            }
                            label="Titulo"
                          >
                            <Input
                              size={"xs"}
                              {...props.register(`sections.${index}.title`)}
                            />
                          </Field>
                          <Field
                            invalid={!!props.errors.sections?.[index]?.helpText}
                            errorText={
                              props.errors.sections?.[index]?.helpText?.message
                            }
                            label="Descrição"
                          >
                            <TextareaAutosize
                              style={{ resize: "none" }}
                              minRows={1}
                              maxRows={2}
                              {...props.register(`sections.${index}.helpText`)}
                              className="px-2 py-1 rounded-sm w-full border-white/10 border"
                            />
                          </Field>

                          <Field
                            invalid={
                              !!props.errors.sections?.[index]?.minOptions
                            }
                            errorText={
                              props.errors.sections?.[index]?.minOptions
                                ?.message
                            }
                            label="Qnt. mínima"
                            helperText="Torna obrigatório escolher opções"
                          >
                            <Input
                              type="number"
                              {...props.register(
                                `sections.${index}.minOptions`,
                                {
                                  setValueAs: (v) =>
                                    v === "" ? undefined : Number(v),
                                  onChange(e) {
                                    const value = e.target.value;

                                    props.setValue(
                                      `sections.${index}.minOptions`,
                                      Number(value) <= 0
                                        ? undefined
                                        : Number(value),
                                      { shouldDirty: true },
                                    );
                                  },
                                },
                              )}
                              size={"xs"}
                            />
                          </Field>
                          <Field
                            invalid={
                              !!props.errors.sections?.[index]?.maxOptions
                            }
                            errorText={
                              props.errors.sections?.[index]?.maxOptions
                                ?.message
                            }
                            label="Qnt. máxima"
                            className="mb-4"
                            helperText={
                              'Ex.: Há 2 opções sem "Qnt. máxima". Se o campo acima for 3, o usuário pode escolher 2x de uma opção e 1x de outra, ou 3x da mesma.'
                            }
                          >
                            <Input
                              type="number"
                              {...props.register(
                                `sections.${index}.maxOptions`,
                                {
                                  setValueAs: (v) =>
                                    v === "" ? undefined : Number(v),
                                  onChange(e) {
                                    const value = e.target.value;

                                    props.setValue(
                                      `sections.${index}.maxOptions`,
                                      Number(value) <= 0
                                        ? undefined
                                        : Number(value),
                                      { shouldDirty: true },
                                    );
                                  },
                                },
                              )}
                              size={"xs"}
                            />
                          </Field>

                          <SectionSubItems {...props} index={index} />
                        </div>
                      </Collapsible.Content>
                    </Collapsible.Root>

                    <div
                      onClick={() => remove(index)}
                      className="absolute -top-1 -right-0.5 border-white border rounded-sm"
                    >
                      <IconButton
                        variant={"subtle"}
                        size={"2xs"}
                        zIndex={999}
                        colorPalette={"red"}
                        background={"#d72929"}
                      >
                        <MdDelete size={12} color={"#ffffff"} />
                      </IconButton>
                    </div>
                  </div>
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div
        onClick={() => {
          const sectionUuid = v4();
          const subUuid = v4();
          props.setCollapsibles([]);
          if (props.errors?.afterPrice) {
            props.trigger("afterPrice");
          }
          append({
            uuid: sectionUuid,
            title: "",
            subItems: [{ name: "", uuid: subUuid, status: true }],
          });
          props.setCollapsibles([sectionUuid, subUuid]);
        }}
        className="rounded-md hover:bg-green-200/5 duration-200 flex cursor-pointer items-center bg-green-200/3 py-2 flex-col justify-center gap-y-1"
      >
        <span className="font-medium text-green-200">Adicional</span>
        <IconButton type={"button"} size={"2xs"} colorPalette={"green"} px={3}>
          <IoMdAdd />
        </IconButton>
      </div>

      <div className="rounded-md px-2 grid grid-cols-[1fr_40px] gap-x-2 duration-200 py-2 gap-y-1">
        <Field
          errorText={errors.itemUuid?.message || message}
          invalid={!!errors.itemUuid || !!message}
          label={"Importar adicionais de outro produto"}
        >
          <Controller
            name="itemUuid"
            control={control}
            render={({ field }) => (
              <SelectMenuOnlineItems
                uuid={params.uuid!}
                name={field.name}
                isMulti={false}
                ref={field.ref}
                onBlur={field.onBlur}
                onChange={(e: any) => {
                  field.onChange(e?.value || null);
                }}
                value={field.value}
              />
            )}
          />
        </Field>
        <IconButton
          type={"button"}
          size={"sm"}
          disabled={!isValid}
          colorPalette={"blue"}
          px={3}
          onClick={() => handleSubmit(getSectionsOfItem)()}
          className="mt-6.5"
        >
          <AiOutlineImport />
        </IconButton>
      </div>
    </div>
  );
}

function Content(props: IProps): JSX.Element {
  const { logout, clientMeta } = useContext(AuthContext);
  const [load, setLoad] = useState(true);
  const [loadEdit, setLoadEdit] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string | null>(null);
  const [stateItem, setStateItem] = useState<
    "sucess" | "not_found" | "error" | null
  >(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    setError,
    setValue,
    reset,
    control,
    watch,
    trigger,
  } = useForm<Fields>({
    shouldFocusError: true,
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
  });
  const [collapsibles, setCollapsibles] = useState<string[]>([]);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const registerWithMask = useHookFormMask(register);
  const imgProfileRef = useRef<HTMLInputElement>(null);

  const edit = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        setLoadEdit(true);
        const changedFields = Object.entries(dirtyFields).reduce(
          (acc, [key, value]: any) => {
            if (value) {
              // @ts-expect-error
              acc[key] = fields[key];
            }
            return acc;
          },
          {} as Partial<Fields>,
        );

        let nextFileNameImage: string | undefined = undefined;

        if (changedFields.fileNameImage) {
          const upload = await uploadImage(changedFields.fileNameImage);
          if (!upload.filename) {
            setError("fileNameImage", {
              message: "Não foi possivel salvar imagem.",
            });
          } else {
            nextFileNameImage = upload.filename;
          }
        }

        if (changedFields.sections?.length) {
          const sectionsResolved = await Promise.all(
            changedFields.sections.map(async ({ ...section }) => {
              section.subItems = await Promise.all(
                section.subItems.map(async ({ previewImage, ...item }: any) => {
                  let nextFileNameImage: string | null = null;
                  if (previewImage) {
                    nextFileNameImage = previewImage;
                  } else {
                    if (item.image55x55png?.length) {
                      const imgUp = await uploadImage(item.image55x55png[0]);
                      nextFileNameImage = imgUp.filename || null;
                    }
                  }
                  item.image55x55png = nextFileNameImage;
                  return item;
                }),
              );
              return section;
            }),
          );
          changedFields.sections = sectionsResolved;
        } else {
          if (!changedFields.afterPrice && !fields.afterPrice) {
            setError("afterPrice", { message: "O preço é obrigatório" });
          }
        }

        const updateItem = await updateMenuOnlineItem(
          props.menuUuid,
          props.uuid,
          // @ts-expect-error
          {
            ...changedFields,
            fileNameImage: nextFileNameImage,
          },
        );
        props.close();
        setLoadEdit(false);
        props.onUpdate({
          ...updateItem,
          desc: fields.desc || null,
          ...(nextFileNameImage && {
            img: nextFileNameImage,
          }),
          name: fields.name,
          qnt: fields.qnt || 0,
        });
      } catch (error) {
        setLoadEdit(false);

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
    [props.menuUuid, props.uuid, dirtyFields],
  );

  const fileImage = watch("fileNameImage");

  useEffect(() => {
    if (fileImage) {
      setImgPreviewUrl(URL.createObjectURL(fileImage));
    }
  }, [fileImage]);

  useEffect(() => {
    (async () => {
      try {
        setLoad(true);
        const getItem = await getMenuOnlineItem({
          itemUuid: props.uuid,
          uuid: props.menuUuid,
        });
        if (!getItem) {
          setStateItem("not_found");
        } else {
          const { fileNameImage, ...rest } = getItem;
          setImgPreviewUrl(api.getUri() + "/public/images/" + fileNameImage);
          reset(rest);
          setStateItem("sucess");
        }
        setLoad(false);
      } catch (error) {
        setLoad(false);
        setStateItem("error");
      }
    })();
  }, []);

  if (load) {
    return (
      <div>
        <DialogBody>
          <Spinner size={"lg"} />
        </DialogBody>
      </div>
    );
  }

  if (stateItem === "error") {
    return (
      <div>
        <DialogBody>
          <div className="flex flex-col">
            <span className="text-red-400">Error ao tentar buscar item</span>
            <span className="text-neutral-400">
              Se o erro persistir, entre em contato com o suporte!
            </span>
          </div>
        </DialogBody>
      </div>
    );
  }

  if (stateItem === "not_found") {
    return (
      <div>
        <DialogBody>
          <span className="text-red-400">
            Item não encontrado ou foi deletado!
          </span>
        </DialogBody>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(edit)}>
      <DialogBody
        mt={clientMeta.isMobileLike ? "-15px" : "-5px"}
        px={clientMeta.isMobileLike ? 2 : undefined}
      >
        <VStack gap={4}>
          <Controller
            control={control}
            name="date_validity"
            render={({ field }) => (
              <DatePicker.Root
                min={parseDate(
                  moment.tz("America/Sao_Paulo").format("YYYY-MM-DD"),
                )}
                locale="pt-BR"
                value={
                  field.value
                    ? [parseDate(moment(field.value).format("YYYY-MM-DD"))]
                    : []
                }
                onValueChange={(e) => {
                  const date = e.value?.[0];
                  field.onChange(
                    date
                      ? moment
                        .tz(
                          date.toString(),
                          "YYYY-MM-DD",
                          "America/Sao_Paulo",
                        )
                        .toDate()
                      : null,
                  );
                }}
              >
                <DatePicker.Label>Data de validade</DatePicker.Label>
                <DatePicker.Control>
                  <DatePicker.Input />
                  <DatePicker.IndicatorGroup>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange(null)}
                        style={{ cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    )}
                    <DatePicker.Trigger>
                      <LuCalendar />
                    </DatePicker.Trigger>
                  </DatePicker.IndicatorGroup>
                </DatePicker.Control>
                <Portal>
                  <DatePicker.Positioner>
                    <DatePicker.Content>
                      <DatePicker.View view="day">
                        <DatePicker.Header />
                        <DatePicker.DayTable />
                      </DatePicker.View>
                      <DatePicker.View view="month">
                        <DatePicker.MonthTable />
                      </DatePicker.View>
                    </DatePicker.Content>
                  </DatePicker.Positioner>
                </Portal>
              </DatePicker.Root>
            )}
          />
          <div className="flex items-center w-full gap-x-4">
            <div
              className="relative cursor-pointer"
              onClick={() => imgProfileRef.current?.click()}
            >
              <input
                type="file"
                ref={imgProfileRef}
                hidden
                max={1}
                className="hidden"
                accept="image/jpeg, image/png, image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setCropFile(file);
                }}
              />
              <Avatar
                bg={imgPreviewUrl ? "transparent" : "#ffffff2c"}
                size={"2xl"}
                width={"60px"}
                height={"60px"}
                src={imgPreviewUrl || undefined}
                icon={<MdOutlineImage />}
                classImage="rounded-sm!"
              />
            </div>

            {cropFile && (
              <ImageCropModal
                file={cropFile}
                onFinish={(file: any) => {
                  setValue("fileNameImage", file, { shouldDirty: true })
                  setCropFile(null);
                }}
              />
            )}

            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Nome"
            >
              <Input
                {...register("name")}
                size={"sm"}
                autoComplete="off"
                placeholder="Digite o nome do produto"
              />
            </Field>
          </div>
          <span className="text-neutral-400 text-center">Boas práticas: utilize imagem 1:1 com fundo transparente (PNG) para melhor visualização</span>

          <Field
            errorText={errors.desc?.message}
            invalid={!!errors.desc}
            label="Descrição"
          >
            <TextareaAutosize
              placeholder=""
              style={{ resize: "none" }}
              minRows={1}
              maxRows={2}
              className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
              {...register("desc")}
            />
          </Field>
          <Field
            errorText={errors.categoriesUuid?.message}
            invalid={!!errors.categoriesUuid}
            label={"Categorias"}
          >
            <Controller
              name="categoriesUuid"
              control={control}
              render={({ field }) => (
                <SelectMenuOnlineCategories
                  uuid={props.menuUuid}
                  name={field.name}
                  isMulti
                  isSearchable={false}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(e: any) => {
                    field.onChange(e.map((item: any) => item.value));
                  }}
                  value={field.value}
                />
              )}
            />
          </Field>
          <div className="grid grid-cols-2 gap-x-2">
            <Field
              errorText={errors.beforePrice?.message}
              invalid={!!errors.beforePrice}
              label="Preço antigo"
            >
              <Input
                {...registerWithMask("beforePrice", ["9", "99", "9,99", "99,99", "999,99", "9.999,99"])}
                onInput={(e) => {
                  setValue("beforePrice", e.currentTarget.value.replace(/\D/g, ""), {
                    shouldDirty: true,
                  });
                }}
                autoComplete="off"
                placeholder="0"
              />
            </Field>
            <Field
              errorText={errors.afterPrice?.message}
              invalid={!!errors.afterPrice}
              label="Preço atual"
            >
              <Input
                {...registerWithMask("afterPrice", ["9", "99", "9,99", "99,99", "999,99", "9.999,99"])}
                onInput={(e) => {
                  setValue("afterPrice", e.currentTarget.value.replace(/\D/g, ""), {
                    shouldDirty: true,
                  });
                }}
                autoComplete="off"
                placeholder="0"
              />
            </Field>
          </div>
          <Field
            errorText={errors.qnt?.message}
            invalid={!!errors.qnt}
            label="Estoque"
            required
          >
            <Input
              {...registerWithMask("qnt", ["9", "99", "999", "9999"], {
                valueAsNumber: true,
              })}
              size={"sm"}
              autoComplete="off"
              placeholder="0"
            />
          </Field>
          <Sections
            reset={reset}
            collapsibles={collapsibles}
            errors={errors}
            control={control}
            trigger={trigger}
            setValue={setValue}
            register={register}
            setCollapsibles={setCollapsibles}
          />
          {errors?.sections?.root?.message && (
            <span className="text-red-400">
              {errors?.sections?.root?.message}
            </span>
          )}
        </VStack>
      </DialogBody>
      <DialogFooter>
        <DialogActionTrigger asChild>
          <Button type="button" disabled={isSubmitting} variant="outline">
            Cancelar
          </Button>
        </DialogActionTrigger>
        <Button
          type="submit"
          colorPalette={"teal"}
          disabled={isSubmitting || loadEdit || !isDirty}
          loading={isSubmitting || loadEdit}
        >
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ModalEditProduct(props: IProps): JSX.Element {
  const { clientMeta } = useContext(AuthContext);

  return (
    <DialogContent w={clientMeta.isMobileLike ? undefined : "398px"} mx={2}>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar item</DialogTitle>
      </DialogHeader>
      <Content {...props} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
