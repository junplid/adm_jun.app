import { JSX, useCallback, useContext, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Portal,
  parseDate,
  VStack,
  Switch,
  AspectRatio,
  Presence,
  Editable,
} from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { ItemRow } from "..";
import { AxiosError } from "axios";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextareaAutosize from "react-textarea-autosize";
import { useHookFormMask } from "use-mask-input";
import clsx from "clsx";
import { LuCalendar } from "react-icons/lu";
import { createMenuOnlineItem } from "../../../../../../services/api/MenuOnline";
import { uploadImage } from "../../../../../../services/api/Account";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import SelectMenuOnlineCategories from "@components/SelectMenuOnlineCategories";
import moment from "moment-timezone";
import { useSearchParams } from "react-router-dom";
import { ImageCropModal } from "./ImageCropModal";
import { TbShoppingBagPlus } from "react-icons/tb";
import { SectionsItems } from "./SectionsItem";
import { RiErrorWarningFill } from "react-icons/ri";

interface IProps {
  onCreate(business: ItemRow): void;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
  menuUuid: string;
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

  before_additional_price: z.string().nullable(),
  after_additional_price: z.string().nullable(),
  maxLength: z.number().nullable(),
  status: z.boolean().nullable(),
});

const SectionSchema = z
  .object({
    uuid: z.string(),
    title: z
      .string({ message: "Campo obrigatório." })
      .min(1, "Campo obrigatório."),
    helpText: z.string().nullable(),

    required: z.boolean().optional(),

    minOptions: z.number().nullable(),
    maxOptions: z.number().nullable(),

    subItems: z.array(SubItemSchema).min(1, "Adicione pelo menos uma opção"),
  })
  .refine(
    (data) =>
      data.maxOptions === null ||
      data.minOptions === null ||
      data.maxOptions >= data.minOptions,
    {
      message: `Qnt. mínima não pode ser > que Qnt. máxima.`,
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
    fileNameImage: z
      .instanceof(File, { message: "Imagem é obrigatória." })
      .optional(),
    qnt: z.number().nullish(),
    categoriesUuid: z.array(z.string()),
    date_validity: z.date().nullish(),
    sections: z.array(SectionSchema).nullish(),
    send_to_category_uuid: z.string().nullish(),
  })
  .superRefine((data, ctx) => {
    const hasBasePrice = !!data.afterPrice?.trim();
    const sections = data.sections ?? [];

    // REGRA 1
    if (!hasBasePrice && sections.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Defina o preço "por" ou adicione um acompanhamento obrigatório com preço definido em todas as suas opções.',
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
            'Defina o preço "por" ou adicione um acompanhamento obrigatório com preço definido em todas as suas opções.',
          path: ["afterPrice"],
        });
        return;
      }

      const existeSectionObrigatoriaOndeTodasOpcoesTemPreco =
        requiredSections.some((section) => {
          const todosAsOpcoesComPreco = section.subItems.every((sub) => {
            if (
              !sub.after_additional_price ||
              sub.after_additional_price === null
            )
              return false;
            const price = Number(sub.after_additional_price.replace(/\D/g, ""));
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
                  message: `Obrigatório.`,
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
                message: `As opções abaixo devem ter o preço "por" definido.`,
                path: ["sections", index, "root"],
              });
            }
          }
        }
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Produto sem preço "por" precisa de ao menos 1 acompanhamento obrigatório com preço "por" em todas as suas opções.`,
          path: ["sections", "root"],
        });
      }
    }
  });

export type Fields = z.infer<typeof FormSchema>;

export function ModalCreateProduct({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const { logout, clientMeta } = useContext(AuthContext);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    control,
    watch,
    trigger,
    getValues,
    setValue,
    setError,
  } = useForm<Fields>({
    shouldFocusError: true,
    resolver: zodResolver(FormSchema),
    defaultValues: { categoriesUuid: [], sections: [], qnt: 1 },
    mode: "onSubmit",
  });
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [collapsibles, setCollapsibles] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const registerWithMask = useHookFormMask(register);

  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  const create = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        if (!fields.fileNameImage) {
          setError("fileNameImage", { message: "Imagem é obrigatória." });
          return;
        }
        setLoad(true);
        const upload = await uploadImage(fields.fileNameImage);
        if (!upload.filename) {
          setError("fileNameImage", {
            message: "Não foi possivel salvar imagem.",
          });
        } else {
          // @ts-expect-error
          fields.fileNameImage = upload.filename;
        }

        if (fields.sections?.length) {
          // @ts-expect-error
          fields.sections = await Promise.all(
            fields.sections.map(async ({ uuid, ...section }) => {
              section.subItems = await Promise.all(
                section.subItems.map(
                  async ({ uuid, previewImage, ...item }: any) => {
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
                  },
                ),
              );
              return section;
            }),
          );
        }

        // @ts-expect-error
        const newItem = await createMenuOnlineItem(props.menuUuid, fields);
        setLoad(false);
        reset({});
        reset({ sections: [] });
        setOpen(false);
        props.onCreate?.({
          afterPrice: fields.afterPrice || null,
          beforePrice: fields.beforePrice || null,
          desc: fields.desc || null,
          id: newItem.id,
          uuid: newItem.uuid,
          img: upload.filename!,
          name: fields.name,
          qnt: fields.qnt || 9999,
          categories: newItem.categories,
          stateWarn: newItem.stateWarn,
          view: newItem.view,
        });
      } catch (error) {
        setLoad(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast?.length)
              dataError.toast.forEach(toaster.create);
            if (dataError.input?.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError?.(path, { message: text }),
              );
            }
          }
        }
      }
    },
    [props.menuUuid],
  );

  const fileImage = watch("fileNameImage");
  const watchAfterPrice = watch("afterPrice");
  const watchBeforePrice = watch("beforePrice");

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) {
      return URL.createObjectURL(fileImage);
    }
  }, [fileImage]);

  const handleErrors = (err: FieldErrors<Fields>) => {
    const errorKeys = Object.keys(err);

    if (errorKeys.length === 1 && err.sections?.length) {
      const next = new URLSearchParams(searchParams);
      next.set("s", "open");
      setSearchParams(next);
    }
  };

  const discount: number | null = useMemo(() => {
    function toNumber(v: string | undefined | null) {
      const n = Number(v?.replace(/\D/g, ""));
      return isNaN(n) ? null : Number(n.toFixed(2));
    }
    const b = toNumber(watchBeforePrice);
    const a = toNumber(watchAfterPrice);

    return b && a ? Math.round(((b - a) / b) * 100) : null;
  }, [watchAfterPrice, watchBeforePrice]);

  return (
    <>
      <DialogRoot
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        motionPreset="slide-in-bottom"
        lazyMount
        scrollBehavior={"outside"}
        unmountOnExit={false}
        preventScroll={false}
        closeOnInteractOutside={false}
        closeOnEscape={false}
        trapFocus={false}
      >
        <DialogTrigger asChild>{props.trigger}</DialogTrigger>
        <DialogContent
          backdrop
          as={"form"}
          onSubmit={handleSubmit(create, handleErrors)}
          w={clientMeta.isMobileLike ? undefined : "398px"}
          mx={2}
        >
          <DialogHeader flexDirection={"column"} gap={0}>
            <DialogTitle>Criando novo produto</DialogTitle>
          </DialogHeader>
          <DialogBody
            mt={clientMeta.isMobileLike ? "-15px" : "-5px"}
            px={clientMeta.isMobileLike ? 5 : undefined}
          >
            <VStack gap={4}>
              <Controller
                control={control}
                name="qnt"
                render={({ field: qnt }) => {
                  return (
                    <article
                      className={clsx(
                        "rounded-xl p-1 text-black h-full grid grid-cols-[1fr_100px] select-none items-start w-full relative",
                        !qnt.value ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                      style={{
                        background: "#fff",
                        boxShadow: "inset 0px 0px 10px #888888",
                      }}
                    >
                      <div className="pl-1 flex flex-col gap-y-2 py-1.5 justify-between">
                        <div className="flex flex-col gap-y-1">
                          <Controller
                            name="name"
                            control={control}
                            render={({
                              field: name,
                              fieldState: { error, invalid },
                            }) => {
                              return (
                                <>
                                  <Editable.Root
                                    value={name.value || ""}
                                    onBlur={name.onBlur}
                                    ref={name.ref}
                                    disabled={name.disabled}
                                    onValueChange={(e) =>
                                      name.onChange(e.value)
                                    }
                                    size={"sm"}
                                  >
                                    <Editable.Preview
                                      minH="25px"
                                      width="full"
                                      className="line-clamp-2! py-0! my-0! w-full text-lg leading-5 font-normal"
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
                                      {name.value || "<Título>"}
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
                          <Controller
                            name="desc"
                            control={control}
                            render={({ field: desc }) => {
                              return (
                                <Editable.Root
                                  size={"sm"}
                                  value={desc.value || undefined}
                                  onBlur={desc.onBlur}
                                  ref={desc.ref}
                                  disabled={desc.disabled}
                                  onValueChange={(e) => desc.onChange(e.value)}
                                >
                                  <Editable.Preview
                                    minH="25px"
                                    bg={desc.value ? "transparent" : "#f0f0f0"}
                                    className="line-clamp-2! overflow-hidden text-sm leading-4 font-light text-neutral-500"
                                    alignItems="flex-start"
                                    width="full"
                                  >
                                    {desc.value || "<Descrição>"}
                                  </Editable.Preview>

                                  <Editable.Textarea
                                    as={TextareaAutosize}
                                    placeholder=""
                                    minH="25px"
                                    style={{ resize: "none" }}
                                    // @ts-expect-error
                                    minRows={1}
                                    maxRows={2}
                                    className="p-3 py-0!rounded-sm w-full border-white/10 border"
                                  />
                                </Editable.Root>
                              );
                            }}
                          />
                        </div>
                        <div className="mb-1">
                          <div className="w-full flex items-center gap-x-3">
                            <Controller
                              name="beforePrice"
                              control={control}
                              render={({
                                field: beforePrice,
                                fieldState: { invalid },
                              }) => {
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
                                      style={{
                                        border: invalid
                                          ? "1.5px solid red"
                                          : "1.5px solid transparent",
                                      }}
                                      bg={
                                        invalid
                                          ? "#fae9e9"
                                          : beforePrice.value
                                            ? "transparent"
                                            : "#f0f0f0"
                                      }
                                      className="text-neutral-300 font-medium line-through text-sm"
                                    >
                                      {beforePrice.value
                                        ? `R$ ${beforePrice.value}`
                                        : null}
                                    </Editable.Preview>
                                    <Editable.Input
                                      autoComplete="off"
                                      minH="25px"
                                      style={{ width: "ch" }}
                                      className="font-medium line-through w-fit min-w-0"
                                      {...registerWithMask("beforePrice", [
                                        "9",
                                        "99",
                                        "9,99",
                                        "99,99",
                                        "999,99",
                                        "9.999,99",
                                      ])}
                                      onInput={(e) => {
                                        setValue(
                                          "beforePrice",
                                          e.currentTarget.value.replace(
                                            /\D/g,
                                            "",
                                          ),
                                          { shouldDirty: true },
                                        );
                                      }}
                                    />
                                  </Editable.Root>
                                );
                              }}
                            />
                            <Controller
                              name="afterPrice"
                              control={control}
                              render={({
                                field: afterPrice,
                                fieldState: { invalid },
                              }) => {
                                return (
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
                                      {afterPrice.value
                                        ? `R$ ${afterPrice.value}`
                                        : null}
                                    </Editable.Preview>
                                    <Editable.Input
                                      autoComplete="off"
                                      minH="25px"
                                      style={{ width: "ch" }}
                                      className="font-normal w-fit min-w-0"
                                      {...registerWithMask("afterPrice", [
                                        "9",
                                        "99",
                                        "9,99",
                                        "99,99",
                                        "999,99",
                                        "9.999,99",
                                      ])}
                                      onInput={(e) => {
                                        setValue(
                                          "afterPrice",
                                          e.currentTarget.value.replace(
                                            /\D/g,
                                            "",
                                          ),
                                          { shouldDirty: true },
                                        );
                                      }}
                                    />
                                  </Editable.Root>
                                );
                              }}
                            />

                            {discount && discount > 0 ? (
                              <span className="bg-green-600 text-nowrap items-center text-white text-xs font-medium p-1.5 py-0 rounded-full">
                                -{discount}%
                              </span>
                            ) : (
                              <span className="w-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={clsx("relative")}>
                        {!qnt.value && (
                          <div className="bg-neutral-600 rotate-12 absolute z-20 px-1 py-0.5 left-1/2 -translate-x-1/2 top-1/5 translate-y-1/2">
                            <span className="text-white font-semibold border-y-2 text-sm">
                              ESGOTADO
                            </span>
                          </div>
                        )}
                        <Controller
                          control={control}
                          name="fileNameImage"
                          render={({ field }) => {
                            return (
                              <label className="relative cursor-pointer">
                                <input
                                  ref={field.ref}
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
                                <AspectRatio
                                  ratio={1}
                                  w={"100px"}
                                  className={clsx(
                                    !qnt.value ? "opacity-35" : "",
                                  )}
                                >
                                  <img
                                    src={imgPreviewUrl || undefined}
                                    alt={"Adicione imagem"}
                                    className="p-1 text-center pointer-events-none rounded-xl overflow-hidden w-full h-auto"
                                    style={{
                                      color: errors.fileNameImage?.message
                                        ? "red"
                                        : "",
                                    }}
                                    draggable={false}
                                  />
                                </AspectRatio>
                              </label>
                            );
                          }}
                        />

                        {cropFile && (
                          <ImageCropModal
                            file={cropFile}
                            onFinish={(file: any) => {
                              setValue("fileNameImage", file, {
                                shouldDirty: true,
                              });
                              trigger("fileNameImage");
                              setCropFile(null);
                            }}
                          />
                        )}
                        <Presence
                          animationName={{
                            _open: "slide-from-top, fade-in",
                            _closed: "slide-to-bottom, fade-out",
                          }}
                          animationDuration="moderate"
                          // present={!!keyPresence}
                          className="absolute left-1 border-2 top-1 rounded-lg p-0.5"
                          style={{
                            background: "#fff",
                            // color: bg_capa || "oklch(62.7% 0.194 149.214)",
                            // borderColor: bg_capa || "oklch(62.7% 0.194 149.214)"
                          }}
                        >
                          <TbShoppingBagPlus size={22} />
                        </Presence>
                      </div>
                    </article>
                  );
                }}
              />

              <div className="flex gap-y-1 -mt-2 flex-col">
                {errors.fileNameImage?.message && (
                  <span className="text-red-300 grid grid-cols-[20px_1fr] items-start gap-x-1.5">
                    <RiErrorWarningFill size={20} />{" "}
                    {errors.fileNameImage?.message}
                  </span>
                )}

                {errors.afterPrice?.message && (
                  <span className="text-red-300 grid grid-cols-[20px_1fr] items-start gap-x-1.5">
                    <RiErrorWarningFill size={20} />{" "}
                    {errors.afterPrice?.message}
                  </span>
                )}
              </div>

              <div className="flex items-start w-full gap-x-3">
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
                          ? [
                              parseDate(
                                moment(field.value).format("YYYY-MM-DD"),
                              ),
                            ]
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
                            : undefined,
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
                              onClick={() => field.onChange(undefined)}
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
                      <span className="text-neutral-400">
                        {!field.value
                          ? "Sem validade, será mostrado sempre."
                          : "Será mostrado até a data setada acima."}
                      </span>
                    </DatePicker.Root>
                  )}
                />
                <Controller
                  name={`qnt`}
                  control={control}
                  render={({ field }) => (
                    <Switch.Root
                      checked={!!field.value}
                      onCheckedChange={(e) => field.onChange(Number(e.checked))}
                      className="flex flex-col space-y-2.5"
                    >
                      <Switch.Label>Status</Switch.Label>
                      <Switch.HiddenInput />
                      <Switch.Control
                        className={clsx(
                          field.value ? "bg-blue-300!" : "bg-red-400!",
                        )}
                      />
                    </Switch.Root>
                  )}
                />
              </div>

              <Field
                errorText={errors.categoriesUuid?.message}
                invalid={!!errors.categoriesUuid}
              >
                <Controller
                  name="categoriesUuid"
                  control={control}
                  render={({ field }) => (
                    <>
                      <SelectMenuOnlineCategories
                        uuid={props.menuUuid}
                        name={field.name}
                        isMulti
                        ref={field.ref}
                        isSearchable={false}
                        onBlur={field.onBlur}
                        onChange={(e: any) => {
                          field.onChange(e.map((item: any) => item.value));
                        }}
                        value={field.value}
                      />
                      {!field.value?.length && (
                        <span className="text-neutral-400">
                          Produto sem categoria(s) não aparece no cardápio.
                        </span>
                      )}
                    </>
                  )}
                />
              </Field>

              <div
                onClick={() => {
                  const sectionsL = !!getValues("sections")?.length;
                  if (!sectionsL) {
                    setValue(
                      "sections",
                      [
                        {
                          maxOptions: null,
                          minOptions: null,
                          title: "",
                          subItems: [],
                          uuid: "ss",
                          helpText: null,
                        },
                      ],
                      { shouldDirty: true },
                    );
                  }
                  if (errors?.afterPrice) {
                    trigger("afterPrice");
                  }
                  if (errors?.fileNameImage) {
                    trigger("fileNameImage");
                  }
                  setTimeout(() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("s", "open");
                    setSearchParams(next);
                  }, 300);
                }}
                className="rounded-md w-full hover:bg-blue-200/5 duration-200 flex cursor-pointer items-center bg-blue-200/4 py-3 justify-center gap-x-1"
              >
                <span className="font-medium text-blue-200">
                  Acompanhamentos
                </span>
              </div>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogActionTrigger>
            <Button type="submit" loading={load}>
              Criar
            </Button>
          </DialogFooter>
          <DialogCloseTrigger asChild>
            <CloseButton size="sm" />
          </DialogCloseTrigger>
        </DialogContent>
      </DialogRoot>
      <SectionsItems
        reset={reset}
        collapsibles={collapsibles}
        errors={errors}
        control={control}
        trigger={trigger}
        setValue={setValue}
        register={register}
        setCollapsibles={setCollapsibles}
      />
    </>
  );
}
