import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Center, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogDescription,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import SelectBusinesses from "@components/SelectBusinesses";
import deepEqual from "fast-deep-equal";
import SelectComponent from "@components/Select";
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "@components/ui/tabs";
import TextareaAutosize from "react-textarea-autosize";
import { Tooltip } from "@components/ui/tooltip";
import { Avatar } from "@components/ui/avatar";
import { MdOutlineModeEdit } from "react-icons/md";
import {
  useGetConnectionWA,
  useUpdateConnectionWA,
} from "../../../hooks/connectionWA";
import { api } from "../../../services/api";

interface IProps {
  id: number;
  close: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v || undefined),
  businessId: z.number({ message: "Campo obrigatório." }),
  type: z.enum(["chatbot", "marketing"], {
    message: "Campo obrigatório.",
  }),
  profileName: z.string().min(1, "Campo obrigatório."),
  profileStatus: z.string().min(1, "Campo obrigatório."),
  lastSeenPrivacy: z
    .enum(["all", "contacts", "contact_blacklist", "none"])
    .optional()
    .nullable()
    .transform((v) => v || undefined),
  onlinePrivacy: z
    .enum(["all", "match_last_seen"])
    .optional()
    .nullable()
    .transform((v) => v || undefined),
  imgPerfilPrivacy: z
    .enum(["all", "contacts", "contact_blacklist", "none"])
    .optional()
    .nullable()
    .transform((v) => v || undefined),
  statusPrivacy: z
    .enum(["all", "contacts", "contact_blacklist", "none"])
    .optional()
    .nullable()
    .transform((v) => v || undefined),
  groupsAddPrivacy: z
    .enum(["all", "contacts", "contact_blacklist"])
    .optional()
    .nullable()
    .transform((v) => v || undefined),
  readReceiptsPrivacy: z
    .enum(["all", "none"])
    .optional()
    .nullable()
    .transform((v) => v || undefined),
  fileImage: z
    .instanceof(File)
    .optional()
    .nullable()
    .transform((v) => v || undefined),
});

type Fields = z.infer<typeof FormSchema>;

const optionsPrivacyValue = [
  { label: "Todos", value: "all" },
  { label: "Meus contatos", value: "contacts" },
  // { label: "Todos", value: "contact_blacklist" },
  { label: "Ninguém", value: "none" },
];

const optionsOnlinePrivacy = [
  { label: "Todos", value: "all" },
  { label: 'Mesmo que "visto por último"', value: "match_last_seen" },
];

const optionsPrivacyGroupValue = [
  { label: "Todos", value: "all" },
  { label: "Meus contatos", value: "contacts" },
  // { label: "Todos", value: "contact_blacklist" },
  // { label: "Ninguém", value: "none" },
];

const optionsReadReceiptsValue = [
  { label: "Todos", value: "all" },
  { label: "Ninguém", value: "none" },
];

function Content({
  id,
  ...props
}: {
  id: number;
  onClose: () => void;
}): JSX.Element {
  const [fieldsDraft, setFieldsDraft] = useState<Fields | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null | undefined>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    reset,
    setValue,
    control,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });
  const imgProfileRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: updateConnectionWA, isPending } = useUpdateConnectionWA({
    setError,
    async onSuccess() {
      props.onClose();
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });
  const { data, isFetching } = useGetConnectionWA(id);

  useEffect(() => {
    if (data) {
      const { fileImage, ...restData } = data;
      const nextData = Object.entries(restData).reduce((acc, [key, value]) => {
        // @ts-expect-error
        if (value !== null && value !== undefined) acc[key] = value;
        return acc;
      }, {});
      // @ts-expect-error
      setFieldsDraft(nextData);
      setImgPreview(fileImage);
      Object.entries(restData).forEach(([key, value]) => {
        if (value) {
          setValue(key as keyof Fields, value);
        }
      });
    }
  }, [data]);

  const edit = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        await updateConnectionWA({ id, body: fields });
        reset();
        setFieldsDraft(null);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log("Error-API", error);
        } else {
          console.log("Error-Client", error);
        }
      }
    },
    [fieldsDraft],
  );

  const fields = watch();
  const isSave: boolean = useMemo(() => {
    return !deepEqual(fieldsDraft, fields);
  }, [fields, fieldsDraft]);

  const imgPreviewUrl = useMemo(() => {
    if (fields.fileImage) {
      return URL.createObjectURL(fields.fileImage);
    }
    if (imgPreview) {
      return `${api.getUri()}/public/images/${imgPreview}`;
    }
  }, [fields.fileImage, imgPreview]);

  return (
    <form onSubmit={handleSubmit(edit)}>
      <DialogBody>
        <TabsRoot variant={"enclosed"} defaultValue={"integration"}>
          <Center mb={2}>
            <TabsList bg="#1c1c1c" rounded="l3" p="1.5">
              <TabsTrigger
                _selected={{ bg: "bg.subtle", color: "#fff" }}
                color={"#757575"}
                value="integration"
              >
                Integração
              </TabsTrigger>
              <TabsTrigger
                _selected={{ bg: "bg.subtle", color: "#fff" }}
                color={"#757575"}
                value="config"
              >
                Configurações do perfil
              </TabsTrigger>
            </TabsList>
          </Center>
          <TabsContent value="integration">
            <VStack gap={4}>
              {/* <Field label="Anexe o projeto" required className="w-full">
                <Controller
                  name="businessId"
                  control={control}
                  render={({ field }) => (
                    <SelectBusinesses
                      name={field.name}
                      isMulti={false}
                      onBlur={field.onBlur}
                      onChange={(e: any) => field.onChange(e.value)}
                      onCreate={(business) => {
                        setValue("businessId", business.id);
                      }}
                      value={field.value}
                    />
                  )}
                />
              </Field> */}
              <Field
                errorText={errors.name?.message}
                invalid={!!errors.name}
                label="Nome"
                helperText="Não é o nome que será exibido no perfil do Mensageiro."
              >
                <Input
                  {...register("name", {
                    onChange(event) {
                      setValue("name", event.target.value);
                    },
                  })}
                  autoFocus
                  autoComplete="off"
                  placeholder="Digite o nome da conexão"
                />
              </Field>
              <Field
                label="Descrição"
                errorText={errors.description?.message}
                invalid={!!errors.description}
                className="w-full"
              >
                <TextareaAutosize
                  placeholder=""
                  style={{ resize: "none" }}
                  minRows={2}
                  maxRows={6}
                  className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
                  {...register("description")}
                />
              </Field>
            </VStack>
          </TabsContent>
          <TabsContent value="config">
            <VStack gap={4}>
              <HStack w={"full"} mb={2} gap={3}>
                <Tooltip content="Atualizar foto de perfil">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => imgProfileRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={imgProfileRef}
                      hidden
                      className="hidden"
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setValue("fileImage", file);
                      }}
                    />
                    <Avatar
                      size={"2xl"}
                      width={"90px"}
                      height={"90px"}
                      src={imgPreviewUrl}
                    >
                      <Center className="absolute -bottom-0.5 right-0.5 w-8 h-8 rounded-full bg-emerald-800">
                        <MdOutlineModeEdit size={17} />
                      </Center>
                    </Avatar>
                  </div>
                </Tooltip>
                <VStack w={"full"} gap={2}>
                  <Field
                    errorText={errors.profileName?.message}
                    invalid={!!errors.profileName}
                    w={"full"}
                  >
                    <Input
                      w={"full"}
                      {...register("profileName")}
                      autoComplete="off"
                      placeholder="Nome do perfil"
                    />
                  </Field>
                  <Field
                    errorText={errors.profileStatus?.message}
                    invalid={!!errors.profileStatus}
                    w={"full"}
                  >
                    <Input
                      w={"full"}
                      {...register("profileStatus")}
                      autoComplete="off"
                      placeholder="Recado"
                    />
                  </Field>
                </VStack>
              </HStack>
              <Text fontWeight={"medium"}>Privacidade</Text>
              <HStack w={"full"}>
                <Field
                  errorText={errors.lastSeenPrivacy?.message}
                  invalid={!!errors.lastSeenPrivacy}
                  label="Visto por último"
                  disabled
                >
                  <Controller
                    name="lastSeenPrivacy"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        name={field.name}
                        isMulti={false}
                        isDisabled
                        onBlur={field.onBlur}
                        placeholder="Ninguém"
                        onChange={(e: any) => field.onChange(e.value)}
                        // options={optionsPrivacyValue}
                      />
                    )}
                  />
                </Field>
                <Field
                  errorText={errors.onlinePrivacy?.message}
                  invalid={!!errors.onlinePrivacy}
                  label="Online"
                  disabled
                >
                  <Controller
                    name="onlinePrivacy"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        isDisabled
                        placeholder={'Igual ao "visto por último"'}
                        options={optionsOnlinePrivacy}
                        onChange={(e: any) => field.onChange(e.value)}
                        // value={field.value}
                      />
                    )}
                  />
                </Field>
              </HStack>
              <HStack w={"full"}>
                <Field
                  errorText={errors.imgPerfilPrivacy?.message}
                  invalid={!!errors.imgPerfilPrivacy}
                  label="Foto do perfil"
                >
                  <Controller
                    name="imgPerfilPrivacy"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        name={field.name}
                        isMulti={false}
                        placeholder="Todos"
                        onBlur={field.onBlur}
                        options={optionsPrivacyValue}
                        onChange={(e: any) => field.onChange(e.value)}
                        value={
                          field.value
                            ? {
                                label:
                                  optionsPrivacyValue.find(
                                    (s) => s.value === field.value,
                                  )?.label || "",
                                value: field.value,
                              }
                            : null
                        }
                      />
                    )}
                  />
                </Field>
                <Field
                  errorText={errors.statusPrivacy?.message}
                  invalid={!!errors.statusPrivacy}
                  label="Status"
                  disabled
                >
                  <Controller
                    name="statusPrivacy"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        name={field.name}
                        isMulti={false}
                        isDisabled
                        onBlur={field.onBlur}
                        placeholder="Meus contatos"
                        onChange={(e: any) => field.onChange(e.value)}
                      />
                    )}
                  />
                </Field>
              </HStack>
              <HStack w={"full"}>
                <Field
                  errorText={errors.groupsAddPrivacy?.message}
                  invalid={!!errors.groupsAddPrivacy}
                  label="Adicionar aos grupos"
                >
                  <Controller
                    name="groupsAddPrivacy"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        placeholder="Meus contatos"
                        options={optionsPrivacyGroupValue}
                        onChange={(e: any) => field.onChange(e.value)}
                        value={
                          field.value
                            ? {
                                label:
                                  optionsPrivacyGroupValue.find(
                                    (s) => s.value === field.value,
                                  )?.label || "",
                                value: field.value,
                              }
                            : null
                        }
                      />
                    )}
                  />
                </Field>

                <Field
                  errorText={errors.readReceiptsPrivacy?.message}
                  invalid={!!errors.readReceiptsPrivacy}
                  label="Confirmação de leitura"
                  disabled
                >
                  <Controller
                    name="readReceiptsPrivacy"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        name={field.name}
                        isMulti={false}
                        isDisabled
                        onBlur={field.onBlur}
                        options={optionsReadReceiptsValue}
                        placeholder="Ninguém"
                        onChange={(e: any) => field.onChange(e.value)}
                      />
                    )}
                  />
                </Field>
              </HStack>
            </VStack>
          </TabsContent>
        </TabsRoot>
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
          disabled={isFetching || isPending || !isSave}
          loading={isSubmitting}
        >
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ModalEditConnectionWA({ id, ...props }: IProps): JSX.Element {
  return (
    <DialogContent>
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>Editar conexão</DialogTitle>
        <DialogDescription>
          80% das empresas usam o WhatsApp para vendas.
        </DialogDescription>
      </DialogHeader>
      <Content id={id} onClose={props.close} />
      <DialogCloseTrigger asChild>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
}
