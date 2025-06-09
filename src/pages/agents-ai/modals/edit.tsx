import {
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCookies } from "react-cookie";
import { api } from "../../../services/api";
import { AxiosError } from "axios";
import { AuthorizationContext } from "../../../contexts/authorization.context";
import { toast } from "react-toastify";
import { AttendantsAI } from "..";
import SelectComponent from "../../../components/Select";
import { areArraysDifferent } from "../../../utils/areArraysDifferent";
import TextareaAutosize from "react-textarea-autosize";
import deepEqual from "fast-deep-equal";
import { v4 } from "uuid";
import { IoClose } from "react-icons/io5";
import { ErrorResponse_I } from "../../../entities/ErrorResponse";
import { ModalFormComponent } from "../../../components/ModalForm";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

interface Props {
  id: number;
  buttonJSX: (onOpen: () => void) => JSX.Element;
  setAIs: Dispatch<SetStateAction<AttendantsAI[]>>;
}

interface Option {
  id: number;
  name: string;
}

export const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  description: z
    .string()
    .transform((value) => value.trim() || undefined)
    .optional(),
  businessIds: z
    .array(z.number(), {
      message: "Campo obrigatório",
    })
    .min(1, { message: "Campo obrigatório" }),
  aiId: z.number().min(1, { message: "Campo obrigatório" }),
  personality: z
    .string()
    .transform((value) => value.trim() || undefined)
    .optional(),
  briefing: z
    .string()
    .transform((value) => value.trim() || undefined)
    .optional(),
  knowledgeBase: z
    .string()
    .transform((value) => value.trim() || undefined)
    .optional(),
});

export type Fields = z.infer<typeof FormSchema>;

type oldFilesList = { id: number; originalname: string }[];
type newFilesList = { key: string; file: File }[];

export function ModalEdit(props: Props): JSX.Element {
  const { handleLogout } = useContext(AuthorizationContext);
  const [{ auth }] = useCookies(["auth"]);

  const [fieldsDraft, setFieldsDraft] = useState<Fields>({} as Fields);

  const [optionsBusiness, setOptionsBusiness] = useState<Option[]>([]);
  const [loadCreateBusiness, setLoadCreateBusiness] = useState(false);
  const [loadOptBusiness, setLoadOptBusiness] = useState<boolean>(false);
  const [optionsIntegration, setOptionsIntegration] = useState<Option[]>([]);
  const [loadOptIntegration, setLoadOptIntegration] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<newFilesList>([]);
  const [oldFiles, setOldFiles] = useState<oldFilesList>([]);

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setError,
    reset,
    setValue,
    control,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });

  const edit = useCallback(
    async (fields: Fields, close: () => void): Promise<void> => {
      try {
        const { businessIds, ...rest } = { ...fields, id: props.id };
        const newValues: Fields = Object.entries(rest).reduce(
          (ac: any, [key, value]) => {
            // @ts-expect-error
            if (fieldsDraft[key] !== value && value) ac[key] = value;
            return ac;
          },
          {}
        );
        const isDiffBusiness = areArraysDifferent(
          fields.businessIds,
          fieldsDraft.businessIds
        );

        const dataFields = new FormData();

        Object.entries(newValues).forEach(([key, value]) => {
          dataFields.append(key, String(value));
        });

        if (isDiffBusiness) {
          fields.businessIds.forEach((value) => {
            dataFields.append("businessIds", String(value));
          });
        }

        if (newFiles.length) {
          newFiles.forEach(({ file }) => {
            dataFields.append("files", file);
          });
        }

        const { data } = await toast.promise(
          api.put(`/private/attendant-ai`, dataFields, {
            headers: {
              authorization: auth,
              "Content-Type": "multipart/form-data",
            },
          }),
          {
            pending: "Editando, aguarde...",
            success: "Atendente IA editado com sucesso!",
          }
        );

        props.setAIs((AIs) => {
          return AIs.map((sup) => {
            if (sup.id === props.id) {
              if (rest.name) sup.name = rest.name;
              if (isDiffBusiness) {
                sup.business = data.attendantAI.business;
              }
            }
            return sup;
          });
        });
        close();
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            handleLogout();
          }
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) {
              dataError.toast.forEach(({ text, ...rest }) => toast(text, rest));
            }
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError(path, { message: text })
              );
            }
          }
        }
      }
    },
    [fieldsDraft, newFiles, props.id]
  );

  const onCreateBusiness = useCallback(async (name: string) => {
    try {
      setLoadCreateBusiness(false);
      const { data } = await toast.promise(
        api.post(
          "/private/business",
          { name },
          { headers: { authorization: auth } }
        ),
        {
          pending: "Criando négocio, aguarde...",
          success: "Négocio criado com sucesso!",
        }
      );
      setOptionsBusiness((buss) => [data.business, ...buss]);
      setLoadCreateBusiness(true);
    } catch (error) {
      setLoadCreateBusiness(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          handleLogout();
        }
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) {
            dataError.toast.forEach(({ text, ...rest }) => toast(text, rest));
          }
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              setError(path, { message: text })
            );
          }
        }
      }
    }
  }, []);

  const fields = watch();

  useEffect(() => {
    if (!fields.businessIds?.length) {
      setLoadOptIntegration(false);
      reset({ aiId: 0 });
      return;
    }
    (async () => {
      try {
        setLoadOptIntegration(true);
        const { data } = await api.get("/private/integration-ai-options", {
          headers: { authorization: auth },
          params: { businessIds: fields.businessIds.join("-") },
        });
        setOptionsIntegration(data.integrationsAI);
        setLoadOptIntegration(false);
      } catch (error) {
        setLoadOptIntegration(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            alert("Não autorizado");
          }
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) {
              dataError.toast.forEach(({ text, ...rest }) => toast(text, rest));
            }
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
  }, [fields.businessIds]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setNewFiles(
          Array.from(event.target.files).map((f) => ({
            key: v4(),
            file: f,
          }))
        );
      }
    },
    []
  );

  const onDeleteFile = useCallback(
    async (id: number): Promise<void> => {
      try {
        await toast.promise(
          api.delete(`/private/static-file/${id}?attendantAIId=${props.id}`, {
            headers: { authorization: auth },
          }),
          {
            pending: "Apagando, aguarde...",
            success: "Arquivo apagado com sucesso!",
          }
        );
        setOldFiles((ff) => ff?.filter((f) => f.id !== id));
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            handleLogout();
          }
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) {
              dataError.toast.forEach(({ text, ...rest }) => toast(text, rest));
            }
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError(path, { message: text })
              );
            }
          }
        }
      }
    },
    [props.id]
  );

  const isSave: boolean = useMemo(() => {
    return !deepEqual(fields, fieldsDraft) || !!newFiles.length;
  }, [fields, fieldsDraft, newFiles.length]);

  return (
    <ModalFormComponent
      buttonJSX={props.buttonJSX}
      title="Editar atendente IA"
      size="2xl"
      textButtonClose="Cancelar"
      textButtonSubmit={loadOptBusiness && isSave ? "Salvar" : undefined}
      onSubmit={(event, onClose) =>
        handleSubmit((d) => edit(d, onClose))(event)
      }
      onClose={() => {
        setFieldsDraft({} as Fields);
        reset();
      }}
      onOpen={async () => {
        try {
          const [{ data: dbus }, { data: dSup }] = await Promise.all([
            api.get(`/private/business-options`, {
              headers: { authorization: auth },
            }),
            api.get(`/private/attendant-ai/${props.id}`, {
              headers: { authorization: auth },
            }),
          ]);
          const { files, ...rest } = dSup.attendantAI;
          setOptionsBusiness(dbus.business);
          Object.entries(structuredClone(rest as Fields)).forEach(
            ([key, value]) => {
              if (value) {
                // @ts-expect-error
                setValue(key, value);
              }
            }
          );
          const nextObj = Object.entries(structuredClone(rest)).reduce(
            (ac, [key, value]) => {
              // @ts-expect-error
              ac[key] = value || "";
              return ac;
            },
            {}
          );
          setFieldsDraft(nextObj as Fields);
          setOldFiles(files);
          setLoadOptBusiness(true);
        } catch (error) {
          setLoadOptBusiness(true);
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              handleLogout();
            }
          }
        }
      }}
    >
      {() => (
        <div className="grid grid-cols-2 gap-x-5">
          <div className="flex flex-col gap-y-2 text-white">
            <FormControl isInvalid={!!errors.businessIds}>
              <Controller
                name="businessIds"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    value={
                      field?.value?.length
                        ? field.value.map((s) => {
                            return {
                              label:
                                optionsBusiness.find((dd) => dd.id === s)
                                  ?.name ?? "",
                              value: s,
                            };
                          })
                        : undefined
                    }
                    ref={field.ref}
                    name={field.name}
                    isMulti={true}
                    onChange={(p) =>
                      field.onChange(p.map((s) => Number(s.value)))
                    }
                    options={optionsBusiness.map((b) => ({
                      label: b.name,
                      value: b.id,
                    }))}
                    buttonEmpityOnSubmitNewItem={({ value }) => (
                      <Button
                        type="button"
                        colorScheme="green"
                        onClick={() => onCreateBusiness(value)}
                        isLoading={loadCreateBusiness}
                      >
                        Criar novo negócio
                      </Button>
                    )}
                    noOptionsMessage="Nem um negócio encontrado"
                    placeholder="Selecione os négocios*"
                    isLoading={!loadOptBusiness}
                  />
                )}
              />
              <FormErrorMessage mt={"3px"}>
                {errors.businessIds?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.aiId}>
              <Controller
                control={control}
                name="aiId"
                render={({ field }) => (
                  <SelectComponent
                    ref={field.ref}
                    name={field.name}
                    isMulti={false}
                    onChange={(propsV) => field.onChange(Number(propsV.value))}
                    options={optionsIntegration.map((b) => ({
                      label: b.name,
                      value: b.id,
                    }))}
                    noOptionsMessage="Nenhuma integração ia encontrada"
                    placeholder="Selecione a integração*"
                    isLoading={loadOptIntegration}
                    value={
                      field.value
                        ? {
                            value: field.value,
                            label:
                              optionsIntegration.find(
                                (s) => s.id === field.value
                              )?.name ?? "",
                          }
                        : null
                    }
                  />
                )}
              />
              <FormErrorMessage mt={"3px"}>
                {errors.aiId?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.name}>
              <Input
                focusBorderColor="#f6bb0b"
                borderColor={"#3c3747"}
                placeholder="Nome do atendente*"
                autoComplete="off"
                {...register("name")}
              />
              <FormErrorMessage mt={"3px"}>
                {errors.name?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.description}>
              <Textarea
                as={TextareaAutosize}
                focusBorderColor="#f6bb0b"
                borderColor={"#3c3747"}
                resize="none"
                placeholder="Descrição do atendente"
                maxRows={5}
                {...register("description")}
              />
              <FormErrorMessage mt={"3px"}>
                {errors.description?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.personality}>
              <FormLabel>Personalidade</FormLabel>
              <Textarea
                as={TextareaAutosize}
                focusBorderColor="#f6bb0b"
                borderColor={"#3c3747"}
                resize="none"
                className="placeholder:text-sm"
                p={2}
                placeholder="Define a persona do agente, incluindo sua personalidade, profissão, cargo, idade, nome..."
                minRows={4}
                maxRows={5}
                {...register("personality")}
              />
              <FormErrorMessage mt={"3px"}>
                {errors.personality?.message}
              </FormErrorMessage>
            </FormControl>
          </div>
          <div className="flex flex-col gap-y-2.5 text-white">
            <FormControl isInvalid={!!errors.briefing}>
              <FormLabel>Instruções</FormLabel>
              <Textarea
                as={TextareaAutosize}
                focusBorderColor="#f6bb0b"
                borderColor={"#3c3747"}
                resize="none"
                className="placeholder:text-sm"
                p={2}
                placeholder="Define a sequência de ações do agente, como perguntar o nome, cidade e avançar apenas após obter as respostas"
                minRows={9}
                maxRows={12}
                {...register("briefing")}
              />
              <FormErrorMessage mt={"3px"}>
                {errors.briefing?.message}
              </FormErrorMessage>
            </FormControl>
            <div className="rounded-md bg-slate-100/5 p-3 shadow-md">
              <FormControl isInvalid={!!errors.knowledgeBase}>
                <FormLabel>Base de conhecimento</FormLabel>
                <Textarea
                  as={TextareaAutosize}
                  focusBorderColor="#f6bb0b"
                  borderColor={"#3c3747"}
                  resize="none"
                  className="placeholder:text-sm"
                  p={2}
                  placeholder="Texto"
                  maxRows={3}
                  {...register("knowledgeBase")}
                />
                <FormErrorMessage mt={"3px"}>
                  {errors.knowledgeBase?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
                <input
                  type="file"
                  accept=".txt"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mt-2">
                  <ul className="mt-1">
                    {oldFiles?.map(({ id, originalname }) => (
                      <li
                        key={id}
                        className="mt-1 flex items-center justify-between gap-1 text-sm"
                      >
                        <span>{originalname}</span>
                        <a
                          title="Remover"
                          className="cursor-pointer text-red-500 hover:bg-red-500/20"
                          onClick={() => onDeleteFile(id)}
                        >
                          <IoClose size={20} />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {!!newFiles.length && (
                    <>
                      <Divider
                        borderColor={"gray.600"}
                        my={2}
                        border={"1px solid #7c7c7c"}
                      />
                      <ul className="mt-1">
                        {newFiles?.map(({ file, key }) => (
                          <li
                            key={key}
                            className="mt-1 flex items-center justify-between gap-1 text-sm"
                          >
                            <span>{file.name}</span>
                            <a
                              title="Remover"
                              className="cursor-pointer text-red-500 hover:bg-red-500/20"
                              onClick={() => {
                                setNewFiles(
                                  () => newFiles?.filter((f) => f.key !== key)
                                );
                              }}
                            >
                              <IoClose size={20} />
                            </a>
                            {/* <span>
                          {file.name} - {(file.size / 1024).toFixed(2)} KB
                        </span> */}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      colorScheme="blackAlpha"
                      size={"sm"}
                      className="mt-2"
                    >
                      Selecionar novos arquivos
                    </Button>
                  </div>
                </div>
              </FormControl>
            </div>
          </div>
        </div>
      )}
    </ModalFormComponent>
  );
}
