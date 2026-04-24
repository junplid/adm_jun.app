import {
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import "react-spring-bottom-sheet/dist/style.css";
import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";
import {
  MdDelete,
  MdOutlineCheckBoxOutlineBlank,
  MdRadioButtonUnchecked,
} from "react-icons/md";
import {
  AspectRatio,
  Button,
  Editable,
  IconButton,
  Input,
  Switch,
} from "@chakra-ui/react";
import clsx from "clsx";
import { useParams, useSearchParams } from "react-router-dom";
import opacity from "hex-color-opacity";
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
import { Fields } from "./edit";
import { FaCheck } from "react-icons/fa";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AuthContext } from "@contexts/auth.context";
import { SortableItem } from "./SortableItems";
import { v4 } from "uuid";
import { Field } from "@components/ui/field";
import { ImageCropModal } from "./ImageCropModal";
import { api } from "../../../../../../services/api";
import { useHookFormMask } from "use-mask-input";
import { RiErrorWarningFill } from "react-icons/ri";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getMenuOnlineSectionsOfItem } from "../../../../../../services/api/MenuOnline";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import SelectMenuOnlineItems from "@components/SelectMenuOnlineItems";
import { AiOutlineImport } from "react-icons/ai";

interface Props {
  control: Control<Fields>;
  register: UseFormRegister<Fields>;
  errors: FieldErrors<Fields>;
  collapsibles: string[];
  setCollapsibles: Dispatch<SetStateAction<string[]>>;
  trigger: UseFormTrigger<Fields>;
  setValue: UseFormSetValue<Fields>;
  reset: UseFormReset<Fields>;
}

function PreviewInputImgSubSection(
  props: Pick<Props, "control" | "setValue"> & {
    index: number;
    subItemIndex: number;
    watchStatus?: boolean;
    watchMaxLength: number | null | undefined;
  },
) {
  const image55x55png = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subItemIndex}.image55x55png`,
  });
  const previewImage = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subItemIndex}.previewImage`,
  });
  const [cropFile, setCropFile] = useState<File | null>(null);

  const imgPreviewUrl = useMemo(() => {
    if (image55x55png?.length) {
      return URL.createObjectURL(image55x55png[0]);
    }
    if (previewImage) {
      return api.getUri() + "/public/images/" + previewImage;
    }
    return undefined;
  }, [previewImage, image55x55png]);

  return (
    <>
      <label
        className={clsx(
          "relative cursor-pointer",
          (!props.watchStatus || props.watchMaxLength === 0) && "opacity-40",
        )}
      >
        <input
          className="sr-only"
          type="file"
          max={1}
          accept="image/jpeg, image/png, image/jpg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setCropFile(file);
          }}
        />
        <AspectRatio ratio={1} w={"55px"}>
          <img
            src={imgPreviewUrl}
            alt={"IMG"}
            className="pointer-events-none bg-neutral-200/80 rounded-md text-xs overflow-hidden w-full h-auto"
            draggable={false}
            width={"55px"}
            height={"55px"}
          />
        </AspectRatio>
      </label>
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onFinish={(file: any) => {
            props.setValue(
              `sections.${props.index}.subItems.${props.subItemIndex}.image55x55png`,
              [file],
              { shouldDirty: true },
            );
            setCropFile(null);
          }}
        />
      )}
    </>
  );
}

function PreviewDescount(
  props: Pick<Props, "control" | "setValue"> & {
    index: number;
    subItemIndex: number;
  },
) {
  const b = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subItemIndex}.before_additional_price`,
  });
  const a = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subItemIndex}.after_additional_price`,
  });

  const discount: number | null = useMemo(() => {
    function toNumber(v: string | undefined | null) {
      const n = Number(v?.replace(/\D/g, ""));
      return isNaN(n) ? null : Number(n.toFixed(2));
    }
    const bx = toNumber(b);
    const ax = toNumber(a);

    return bx && ax ? Math.round(((bx - ax) / bx) * 100) : null;
  }, [a, b]);

  if (discount && discount > 0) {
    return (
      <span className="bg-green-600 translate-y-1.5 text-nowrap items-center text-white text-xs font-medium p-1.5 py-0 rounded-full">
        -{discount}%
      </span>
    );
  }
  return <span className="w-full"></span>;
}

const FormImportSchema = z.object({
  itemUuid: z
    .string({ message: "Campo obrigatório." })
    .min(1, "Campo obrigatório."),
});
type FieldsImport = z.infer<typeof FormImportSchema>;

export function SectionsItems(props: Props) {
  const [searchParams] = useSearchParams();
  const isOpen = searchParams.get("s");
  const { clientMeta, logout } = useContext(AuthContext);
  const sheetRef = useRef<BottomSheetRef>(null);
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
    move: moveSection,
    remove: removeSection,
    append: appendSection,
  } = useFieldArray({ name: "sections", control: props.control });

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((i) => i.uuid === active.id);
    const newIndex = sections.findIndex((i) => i.uuid === over.id);

    moveSection(oldIndex, newIndex);
  };

  const getSectionsOfItem = async (fields: FieldsImport) => {
    try {
      const sections = await getMenuOnlineSectionsOfItem({
        uuid: params.uuid!,
        itemUuid: fields.itemUuid,
      });
      if (sections.length) {
        props.setValue(
          "sections",
          // @ts-expect-error
          sections.map(({ currentUuid, ...d }) => d),
          { shouldDirty: true },
        );
      } else {
        setMessage("O item importado não tinha adicionais.");
      }
      reset({});
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast?.length) dataError.toast.forEach(toaster.create);
          if (dataError.input?.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              setError?.(path, { message: text }),
            );
          }
        }
      }
    }
  };

  return (
    <BottomSheet
      open={!!isOpen}
      snapPoints={({ maxHeight }) => [maxHeight]}
      ref={sheetRef}
      blocking={false}
      className="text-black"
      header={
        <div className="flex max-w-lg mx-auto top-0 w-full items-start gap-x-2 justify-between">
          <div className={clsx("flex")}>
            <Controller
              control={props.control}
              name="name"
              render={({ field: name, fieldState: { error, invalid } }) => {
                return (
                  <>
                    <Editable.Root
                      value={name.value}
                      onBlur={name.onBlur}
                      ref={name.ref}
                      onValueChange={(e) => name.onChange(e.value)}
                      size={"sm"}
                      defaultValue="Título"
                    >
                      <Editable.Preview
                        minH="0px"
                        width="full"
                        className="line-clamp-2! text-start! py-0! my-0! w-full text-lg leading-5 font-normal"
                        style={{
                          border: invalid
                            ? "1.5px solid red"
                            : "1.5px solid transparent",
                        }}
                        bg={
                          invalid
                            ? "#fae9e9"
                            : name.value
                              ? "transparent"
                              : "#f0f0f0"
                        }
                      />
                      <Editable.Input
                        placeholder=""
                        minH={0}
                        className="py-0.5!  text-start! rounded-sm w-full border-white/10 border"
                      />
                    </Editable.Root>
                    {error?.message && (
                      <span className="text-red-400  text-start! text-xs font-medium">
                        {error?.message}
                      </span>
                    )}
                  </>
                );
              }}
            />
          </div>
          <IconButton
            size={"xs"}
            colorPalette={"teal"}
            type="button"
            onClick={async () => {
              window.history.back();
            }}
          >
            <FaCheck />
          </IconButton>
        </div>
      }
      footer={
        <div className="flex flex-col gap-y-1.5 max-w-lg mx-auto">
          {props.errors.sections?.root?.message && (
            <span className="text-red-500 text-sm grid grid-cols-[20px_1fr] items-start gap-x-1.5">
              <RiErrorWarningFill size={20} />{" "}
              {props.errors.sections?.root?.message}
            </span>
          )}
          <div className="flex justify-between bg-white items-center">
            <Button
              size={"xs"}
              colorPalette={"red"}
              variant={"outline"}
              type="button"
              onClick={async () => {
                removeSection();
                window.history.back();
              }}
            >
              <span className="text-red-500">
                Deletar todos os acompanhamentos
              </span>
            </Button>

            <div></div>
          </div>
        </div>
      }
    >
      <div className="min-h-[calc(100vh-130px)] flex flex-col justify-between">
        <div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((i) => i.uuid)}
              strategy={verticalListSortingStrategy}
            >
              <div className="max-w-lg mx-auto flex flex-col gap-2">
                {sections.map((section, index) => {
                  return (
                    <SortableItem key={section.uuid} id={section.uuid}>
                      <Section
                        {...props}
                        removeSection={removeSection}
                        index={index}
                        uuid={section.uuid}
                      />
                    </SortableItem>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          <div
            className="flex flex-col mt-5 gap-y-0.5 py-0.5"
            onClick={() => {
              appendSection({
                uuid: v4(),
                maxOptions: null,
                minOptions: null,
                subItems: [],
                title: "",
                helpText: null,
              });
            }}
          >
            <span className="text-neutral-400 text-center text-sm">
              Falta acompanhamento?{" "}
              <a className="text-blue-700 underline text-base">Adicionar</a>
            </span>
          </div>
        </div>
        <div className="w-full max-w-lg mx-auto relative px-3 grid grid-cols-[1fr_40px] gap-x-2 duration-200 py-2 gap-y-1">
          <Field
            errorText={errors.itemUuid?.message || message}
            invalid={!!errors.itemUuid || !!message}
            label={"Importar acompanhamentos"}
            className=""
          >
            <Controller
              name="itemUuid"
              control={control}
              render={({ field }) => (
                <SelectMenuOnlineItems
                  singleValueColor={"#363636"}
                  menuPlacement="top"
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
            onClick={() => handleSubmit(getSectionsOfItem)()}
            className="mt-6.5"
          >
            <AiOutlineImport />
          </IconButton>
        </div>
      </div>
    </BottomSheet>
  );
}

type SectionsProps = Props & {
  index: number;
  uuid: string;
  removeSection: UseFieldArrayRemove;
};

function Section(props: SectionsProps) {
  const { clientMeta } = useContext(AuthContext);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const watchMinOptions = useWatch({
    control: props.control,
    name: `sections.${props.index}.minOptions`,
  });
  const watchMaxOptions = useWatch({
    control: props.control,
    name: `sections.${props.index}.maxOptions`,
  });

  const {
    fields: subItems,
    move: moveSubItems,
    remove: removeSubItems,
    append: appendSubItems,
  } = useFieldArray({
    name: `sections.${props.index}.subItems`,
    control: props.control,
  });

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // alert("1");

    if (!over || active.id === over.id) return;
    // alert("2");

    const oldIndex = subItems.findIndex((i) => i.uuid === active.id);
    const newIndex = subItems.findIndex((i) => i.uuid === over.id);

    moveSubItems(oldIndex, newIndex);
  };

  return (
    <div
      className="max-w-lg mx-auto scroll-auto gap-y-2"
      ref={(el) => {
        sectionRefs.current[props.uuid] = el;
      }}
    >
      <div
        className={clsx(
          "sticky px-3 top-0 flex flex-col gap-y-0.5 border-b border-neutral-200 py-2",
        )}
      >
        <Controller
          name={`sections.${props.index}.title`}
          control={props.control}
          render={({ field: name, fieldState: { error, invalid } }) => {
            return (
              <div className="flex items-center w-full">
                <IconButton
                  type="button"
                  onClick={() => {
                    props.removeSection(props.index);
                  }}
                  size={"xs"}
                  color={"red.600"}
                >
                  <MdDelete />
                </IconButton>
                <div className="flex flex-col w-full">
                  <Editable.Root
                    value={name.value}
                    onBlur={name.onBlur}
                    ref={name.ref}
                    disabled={name.disabled}
                    onValueChange={(e) => name.onChange(e.value)}
                    size={"sm"}
                  >
                    <Editable.Preview
                      minH="25px"
                      width="full"
                      className="font-semibold! line-clamp-2! text-start text-neutral-700 py-0! my-0! w-full text-lg"
                      style={{
                        border: invalid
                          ? "1.5px solid red"
                          : "1.5px solid transparent",
                      }}
                      bg={
                        invalid
                          ? "#fae9e9"
                          : name.value
                            ? "transparent"
                            : "#f0f0f0"
                      }
                    >
                      {name.value || "<Título acompanhamento>"}
                    </Editable.Preview>
                    <Editable.Input
                      placeholder=""
                      minH={0}
                      className="py-0.5! rounded-sm w-full border-white/10 border"
                    />
                  </Editable.Root>
                  {error?.message && (
                    <span className="text-red-400 text-xs font-medium">
                      {error?.message}
                    </span>
                  )}
                </div>
              </div>
            );
          }}
        />

        <div className="flex gap-x-1.5 w-full">
          <Controller
            name={`sections.${props.index}.helpText`}
            control={props.control}
            render={({ field: name, fieldState: { error, invalid } }) => {
              return (
                <>
                  <Editable.Root
                    value={name.value || ""}
                    onBlur={name.onBlur}
                    ref={name.ref}
                    disabled={name.disabled}
                    onValueChange={(e) => name.onChange(e.value)}
                    size={"sm"}
                  >
                    <Editable.Preview
                      minH="25px"
                      width="full"
                      className="line-clamp-2! text-neutral-500 font-light text-start py-0! my-0! w-full text-lg leading-5"
                      style={{
                        border: invalid
                          ? "1.5px solid red"
                          : "1.5px solid transparent",
                      }}
                      bg={
                        invalid
                          ? "#fae9e9"
                          : name.value
                            ? "transparent"
                            : "#f0f0f0"
                      }
                    >
                      {name.value || "<Sem descrição>"}
                    </Editable.Preview>
                    <Editable.Input
                      placeholder=""
                      minH={0}
                      className="py-0.5! rounded-sm w-full border-white/10 border"
                    />
                  </Editable.Root>
                  {error?.message && (
                    <span className="text-red-400 text-xs font-medium">
                      {error?.message}
                    </span>
                  )}
                </>
              );
            }}
          />
          {watchMinOptions || watchMaxOptions ? (
            <div className="flex gap-x-1 items-center">
              <span
                className={clsx(
                  `px-1 py-0.5 text-xs text-nowrap rounded-sm font-medium bg-neutral-700 text-neutral-100`,
                )}
              >
                {watchMaxOptions
                  ? `0/${watchMaxOptions}`
                  : `0 (mín. ${watchMinOptions})`}
              </span>
              <div className="flex">
                <span
                  className={clsx(
                    "text-neutral-100 text-xs font-medium px-1 bg-neutral-700 py-0.5 rounded-sm",
                  )}
                >
                  OBRIGATÓRIO
                </span>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex gap-x-3 mt-0.5">
          <Field
            className="flex! flex-row! gap-x-2! items-center!"
            invalid={!!props.errors.sections?.[props.index]?.minOptions}
            label={<span className="text-nowrap">Qnt. mínima</span>}
            // helperText="Torna obrigatório escolher opções"
          >
            <Input
              type="number"
              borderColor={"#e4e4e4"}
              {...props.register(`sections.${props.index}.minOptions`, {
                setValueAs: (v) => {
                  if (v === "" || v === null) return null;

                  const num = Number(v);

                  if (Number.isNaN(num)) return null;

                  return num < 0 ? 0 : num;
                },
              })}
              size={"2xs"}
            />
          </Field>
          <Field
            className="flex! flex-row! gap-x-2! items-center!"
            invalid={!!props.errors.sections?.[props.index]?.maxOptions}
            label={<span className="text-nowrap">Qnt. máxima</span>}
            // helperText={
            //   'Ex.: Há 2 opções sem "Qnt. máxima". Se o campo acima for 3, o usuário pode escolher 2x de uma opção e 1x de outra, ou 3x da mesma.'
            // }
          >
            <Input
              type="number"
              borderColor={"#e4e4e4"}
              {...props.register(`sections.${props.index}.maxOptions`, {
                setValueAs: (v) => {
                  if (v === "" || v === null) return null;

                  const num = Number(v);

                  if (Number.isNaN(num)) return null;

                  return num < 0 ? 0 : num;
                },
              })}
              size={"2xs"}
            />
          </Field>
        </div>

        {props.errors.sections?.[props.index]?.maxOptions?.message && (
          <span className="text-red-500 text-sm items-start gap-x-1.5">
            {props.errors.sections?.[props.index]?.maxOptions?.message}
          </span>
        )}
      </div>
      {props.errors.sections?.[props.index]?.root?.message && (
        <span className="text-red-500 p-2 -mb-2 text-sm grid grid-cols-[16px_1fr] items-start gap-x-1.5">
          <RiErrorWarningFill size={16} />{" "}
          {props.errors.sections?.[props.index]?.root?.message}
        </span>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={subItems.map((i) => i.uuid)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 mt-2 ml-1 flex flex-col">
            {subItems.map((sub, index) => {
              return (
                <SortableItem key={sub.uuid} id={sub.uuid}>
                  <SubSection
                    {...props}
                    key={sub.uuid}
                    removeSubItems={removeSubItems}
                    subIndex={index}
                    watchMinOptions={watchMinOptions}
                    watchMaxOptions={watchMaxOptions}
                  />
                </SortableItem>
              );
            })}

            {props.errors.sections?.[props.index]?.subItems?.message && (
              <span className="text-red-500 flex items-center gap-x-1.5">
                <RiErrorWarningFill />{" "}
                {props.errors.sections?.[props.index]?.subItems?.message}.
              </span>
            )}

            <div className="flex flex-col mt-0.5 items-end gap-y-0.5 py-0.5">
              <div
                onClick={() => {
                  appendSubItems({
                    uuid: v4(),
                    maxLength: null,
                    name: "",
                    status: true,
                    after_additional_price: null,
                    before_additional_price: null,
                  });
                }}
              >
                <span className="text-neutral-400 text-end text-sm mx-3">
                  Falta opção?{" "}
                  <a className="text-teal-700 underline">Adicionar</a>
                </span>
              </div>
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SubSection(
  props: SectionsProps & {
    watchMinOptions: number | null | undefined;
    watchMaxOptions: number | null | undefined;
    subIndex: number;
    removeSubItems: UseFieldArrayRemove;
  },
) {
  const registerWithMask = useHookFormMask(props.register);
  const watchMaxLength = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subIndex}.maxLength`,
  });
  const watchStatus = useWatch({
    control: props.control,
    name: `sections.${props.index}.subItems.${props.subIndex}.status`,
  });

  return (
    <div
      className={clsx(
        "select-none w-full px-2",
        (props.watchMaxOptions === null ||
          props.watchMaxOptions === undefined ||
          props.watchMaxOptions >= 1) &&
          watchMaxLength === 1 &&
          "",
      )}
    >
      <div
        className={clsx(
          "rounded-md border p-3 flex flex-col gap-y-1 border-neutral-100 bg-neutral-50/70",
        )}
      >
        <div className={clsx("flex gap-y-1.5 gap-x-1 items-start")}>
          <div className="flex flex-col gap-y-2">
            <PreviewInputImgSubSection
              watchMaxLength={watchMaxLength}
              watchStatus={!!watchStatus}
              control={props.control}
              index={props.index}
              setValue={props.setValue}
              subItemIndex={props.subIndex}
            />
            <IconButton
              type="button"
              onClick={() => {
                props.removeSubItems(props.subIndex);
              }}
              size={"sm"}
              color={"red.600"}
              gap={0}
              className="flex flex-col"
            >
              <MdDelete />
              <span className="text-xs">opção</span>
            </IconButton>
          </div>
          <div className="flex flex-col gap-y-1 w-full relative items-center">
            <div className={clsx("flex gap-x-2 w-full items-center")}>
              {(!watchStatus || watchMaxLength === 0) && (
                <span className="bg-neutral-500 absolute left-5 rotate-20 text-sm px-2 z-10 shadow py-0.5 rounded-sm text-white">
                  Indisponível
                </span>
              )}
              <div
                className={clsx(
                  "flex flex-col space-y-1 mr-1 w-full",
                  (!watchStatus || watchMaxLength === 0) && "opacity-40",
                )}
              >
                <Controller
                  name={`sections.${props.index}.subItems.${props.subIndex}.name`}
                  control={props.control}
                  render={({ field: name, fieldState: { error, invalid } }) => {
                    return (
                      <div className="flex flex-col w-full">
                        <Editable.Root
                          value={name.value}
                          onBlur={name.onBlur}
                          ref={name.ref}
                          disabled={name.disabled}
                          onValueChange={(e) => name.onChange(e.value)}
                          size={"sm"}
                        >
                          <Editable.Preview
                            minH="25px"
                            width="full"
                            className="text-start text-neutral-700 py-0! my-0! w-full text-lg"
                            style={{
                              border: invalid
                                ? "1.5px solid red"
                                : "1.5px solid transparent",
                            }}
                            bg={invalid ? "#fae9e9" : "transparent"}
                          >
                            {name.value || "<Título opção>"}
                          </Editable.Preview>
                          <Editable.Input
                            placeholder=""
                            minH={0}
                            className="py-0.5! rounded-sm w-full border-white/10 border"
                          />
                        </Editable.Root>
                        {error?.message && (
                          <span className="text-red-400 text-xs font-medium">
                            {error?.message}
                          </span>
                        )}
                      </div>
                    );
                  }}
                />
                <Controller
                  name={`sections.${props.index}.subItems.${props.subIndex}.desc`}
                  control={props.control}
                  render={({ field: name, fieldState: { error, invalid } }) => {
                    return (
                      <div className="flex flex-col w-full">
                        <Editable.Root
                          value={name.value || undefined}
                          onBlur={name.onBlur}
                          ref={name.ref}
                          disabled={name.disabled}
                          onValueChange={(e) => name.onChange(e.value)}
                          size={"sm"}
                        >
                          <Editable.Preview
                            minH="25px"
                            width="full"
                            className="text-start text-neutral-700 py-0! my-0! w-full text-lg"
                            style={{
                              border: invalid
                                ? "1.5px solid red"
                                : "1.5px solid transparent",
                            }}
                            bg={invalid ? "#fae9e9" : "transparent"}
                          >
                            <span style={{ color: opacity("#525252", 0.6) }}>
                              {name.value || "<Sem descrição>"}
                            </span>
                          </Editable.Preview>
                          <Editable.Input
                            placeholder=""
                            minH={0}
                            className="py-0.5! rounded-sm w-full border-white/10 border"
                          />
                        </Editable.Root>
                        {error?.message && (
                          <span className="text-red-400 text-xs font-medium">
                            {error?.message}
                          </span>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
              {((props.watchMaxOptions === null && watchMaxLength === null) ||
                (props.watchMaxOptions &&
                  props.watchMaxOptions > 1 &&
                  (watchMaxLength === null ||
                    watchMaxLength === undefined ||
                    watchMaxLength > 1)) ||
                (props.watchMaxOptions === null &&
                  (watchMaxLength || Infinity) > 1)) && (
                <div
                  className={clsx(
                    "flex gap-x-1",
                    (!watchStatus || watchMaxLength === 0) && "opacity-40",
                  )}
                >
                  <a
                    className={clsx(
                      "bg-green-200 hover:bg-green-300 cursor-pointer z-10 duration-100 scale-100 active:scale-95 text-green-600 text-lg leading-0 w-6 h-6 flex items-center justify-center rounded-md",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!watchStatus) return;
                    }}
                  >
                    +
                  </a>
                  <a
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!watchStatus) return;
                    }}
                    className={clsx(
                      "bg-red-200 hover:bg-red-300 cursor-pointer duration-100 active:scale-95 transition-all text-red-600 w-6 h-6 text-lg leading-0 flex items-center justify-center rounded-md",
                    )}
                  >
                    -
                  </a>
                </div>
              )}
              {((props.watchMaxOptions === null && watchMaxLength === 1) ||
                (props.watchMaxOptions &&
                  props.watchMaxOptions > 1 &&
                  watchMaxLength === 1)) && (
                <button
                  type="button"
                  className={clsx(
                    "flex items-center justify-center",
                    !watchStatus && "opacity-40",
                  )}
                >
                  <MdOutlineCheckBoxOutlineBlank size={22} />
                </button>
              )}
              {((props.watchMaxOptions === 1 && watchMaxLength === null) ||
                (props.watchMaxOptions === 1 &&
                  (watchMaxLength || Infinity) >= 1)) && (
                <button
                  type="button"
                  className={clsx(
                    "flex items-center justify-center",
                    (!watchStatus || watchMaxLength === 0) && "opacity-40",
                  )}
                >
                  <MdRadioButtonUnchecked size={22} />
                </button>
              )}
            </div>
            <div
              className={clsx(
                "w-full flex items-start gap-x-3",
                (!watchStatus || watchMaxLength === 0) && "opacity-40",
              )}
            >
              <Controller
                name={`sections.${props.index}.subItems.${props.subIndex}.after_additional_price`}
                control={props.control}
                render={({
                  field: afterPrice,
                  fieldState: { error, invalid },
                }) => {
                  return (
                    <div className="flex flex-col">
                      <Editable.Root
                        className="inline-flex w-auto max-w-fit"
                        size={"sm"}
                      >
                        {!afterPrice.value && (
                          <Editable.Label>por</Editable.Label>
                        )}
                        <Editable.Preview
                          minW="50px"
                          minH="25px"
                          style={{
                            border: invalid
                              ? "1.5px solid red"
                              : "1.5px solid transparent",
                          }}
                          bg={
                            invalid
                              ? "#fae9e9"
                              : afterPrice.value
                                ? "transparent"
                                : "#f0f0f0"
                          }
                          className="font-normal"
                        >
                          {afterPrice.value ? `R$ ${afterPrice.value}` : null}
                        </Editable.Preview>
                        <Editable.Input
                          autoComplete="off"
                          minH="25px"
                          style={{ width: "ch" }}
                          className="font-normal w-fit min-w-0"
                          {...registerWithMask(
                            `sections.${props.index}.subItems.${props.subIndex}.after_additional_price`,
                            ["9", "99", "9,99", "99,99", "999,99", "9.999,99"],
                          )}
                          onInput={(e) => {
                            props.trigger("sections");
                            props.setValue(
                              `sections.${props.index}.subItems.${props.subIndex}.after_additional_price`,
                              e.currentTarget.value.replace(/\D/g, ""),
                              { shouldDirty: true },
                            );
                          }}
                        />
                      </Editable.Root>
                      {error?.message && (
                        <span className="text-red-400 text-xs font-medium">
                          {error?.message}
                        </span>
                      )}
                    </div>
                  );
                }}
              />
              <Controller
                name={`sections.${props.index}.subItems.${props.subIndex}.before_additional_price`}
                control={props.control}
                render={({ field: beforePrice }) => {
                  return (
                    <Editable.Root
                      size={"sm"}
                      className="inline-flex w-auto text-sm max-w-fit"
                    >
                      {!beforePrice.value && (
                        <Editable.Label>de</Editable.Label>
                      )}
                      <Editable.Preview
                        minW="50px"
                        minH="25px"
                        bg={beforePrice.value ? "transparent" : "#f0f0f0"}
                        className="text-neutral-300 font-medium line-through text-sm"
                      >
                        {beforePrice.value ? `R$ ${beforePrice.value}` : null}
                      </Editable.Preview>
                      <Editable.Input
                        autoComplete="off"
                        minH="25px"
                        style={{ width: "ch" }}
                        className="font-medium line-through w-fit min-w-0"
                        {...registerWithMask(
                          `sections.${props.index}.subItems.${props.subIndex}.before_additional_price`,
                          ["9", "99", "9,99", "99,99", "999,99", "9.999,99"],
                        )}
                        onInput={(e) => {
                          props.setValue(
                            `sections.${props.index}.subItems.${props.subIndex}.before_additional_price`,
                            e.currentTarget.value.replace(/\D/g, ""),
                            { shouldDirty: true },
                          );
                        }}
                      />
                    </Editable.Root>
                  );
                }}
              />

              <PreviewDescount
                control={props.control}
                index={props.index}
                subItemIndex={props.subIndex}
                setValue={props.setValue}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-x-2 items-end -mt-2">
          <Field
            className="flex! flex-row! gap-x-2! items-center!"
            invalid={
              !!props.errors.sections?.[props.index]?.subItems?.[props.subIndex]
                ?.maxLength
            }
            errorText={
              props.errors.sections?.[props.index]?.subItems?.[props.subIndex]
                ?.maxLength?.message
            }
            label={<span className="text-nowrap">Qnt. máxima</span>}
            // helperText="Torna obrigatório escolher opções"
          >
            <Input
              type="number"
              borderColor={"#e4e4e4"}
              {...props.register(
                `sections.${props.index}.subItems.${props.subIndex}.maxLength`,
                {
                  setValueAs: (v) => {
                    if (v === "" || v === null) return null;

                    const num = Number(v);

                    if (Number.isNaN(num)) return null;

                    return num < 0 ? 0 : num;
                  },
                },
              )}
              size={"2xs"}
            />
          </Field>
          <Controller
            name={`sections.${props.index}.subItems.${props.subIndex}.status`}
            control={props.control}
            render={({ field }) => (
              <Switch.Root
                checked={!!field.value}
                onCheckedChange={(e) => field.onChange(e.checked)}
                className="flex flex-col -translate-y-1 -space-y-1"
              >
                <Switch.Label>Status</Switch.Label>
                <Switch.HiddenInput />
                <Switch.Control
                  className={clsx(field.value ? "bg-blue-300!" : "bg-red-400!")}
                />
              </Switch.Root>
            )}
          />
        </div>
      </div>
    </div>
  );
}
