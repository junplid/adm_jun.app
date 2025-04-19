import { JSX, useCallback, useState } from "react";
import {
  Button,
  Center,
  Grid,
  GridItem,
  HStack,
  Input,
  SegmentGroup,
  Text,
  VStack,
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
  DialogDescription,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import { ConnectionWARow } from "..";
import { AxiosError } from "axios";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SelectBusinesses from "@components/SelectBusinesses";
import { useCreateVariable } from "../../../hooks/variable";
import TextareaAutosize from "react-textarea-autosize";
import {
  TabsList,
  TabsRoot,
  TabsTrigger,
  TabsContent,
} from "@components/ui/tabs";
import { Avatar } from "@components/ui/avatar";
import { Tooltip } from "@components/ui/tooltip";
import { MdOutlineModeEdit } from "react-icons/md";

interface IProps {
  onCreate?(business: ConnectionWARow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  type: z.enum(["chatbot", "marketing"], {
    message: "Campo obrigatório.",
  }),
  businessIds: z.array(z.number()).optional(),
  value: z.string().optional(),
});

type Fields = z.infer<typeof FormSchema>;

const optionsType = [
  { label: "Mutável", value: "dynamics" },
  { label: "Imutável", value: "constant" },
];

export function ModalCreateFlow({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    setError,
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const [open, setOpen] = useState(false);

  const { mutateAsync: createVariable, isPending } = useCreateVariable({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      // const flow = await createVariable(fields);
      const { businessIds, ...rest } = fields;
      reset();
      props.onCreate?.({ ...flow, ...rest });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  const type = watch("type");

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit
      preventScroll
      size={"md"}
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent
        w={"470px"}
        backdrop
        as={"form"}
        onSubmit={handleSubmit(create)}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar conexão WA</DialogTitle>
          <DialogDescription>
            80% das empresas usam WhatsApp para o marketing e vendas.
          </DialogDescription>
        </DialogHeader>
        <DialogBody mt={"-5px"}>
          <TabsRoot
            lazyMount
            unmountOnExit
            variant={"enclosed"}
            defaultValue={"integration"}
          >
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
                <TabsTrigger
                  _selected={{ bg: "bg.subtle", color: "#fff" }}
                  color={"#757575"}
                  value="connection"
                >
                  Conectar
                </TabsTrigger>
              </TabsList>
            </Center>
            <TabsContent value="integration">
              <VStack gap={4}>
                <Field label="Anexe a empresa" required className="w-full">
                  <Controller
                    name="businessIds"
                    control={control}
                    render={({ field }) => (
                      <SelectBusinesses
                        name={field.name}
                        isMulti={false}
                        onBlur={field.onBlur}
                        onChange={(e: any) => {
                          field.onChange(e.map((item: any) => item.value));
                        }}
                        onCreate={(business) => {
                          setValue("businessIds", [
                            ...(getValues("businessIds") || []),
                            business.id,
                          ]);
                        }}
                        value={field.value}
                      />
                    )}
                  />
                </Field>
                <Field
                  errorText={errors.name?.message}
                  invalid={!!errors.name}
                  label="Nome"
                  helperText="Não é o nome que será exibido no perfil do WhatsApp."
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
                  errorText={errors.type?.message}
                  invalid={!!errors.type}
                  className="w-full"
                >
                  <TextareaAutosize
                    placeholder=""
                    style={{ resize: "none" }}
                    minRows={2}
                    maxRows={6}
                    className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                    // {...register("description")}
                  />
                </Field>
              </VStack>
            </TabsContent>
            <TabsContent value="config">
              <VStack gap={4}>
                <HStack w={"full"} mb={2} gap={3}>
                  <Tooltip
                    positioning={{ placement: "bottom-start" }}
                    content="Atualizar foto de perfil"
                  >
                    <div className="relative cursor-pointer">
                      <Avatar
                        size={"2xl"}
                        width={"90px"}
                        height={"90px"}
                        opacity={0.6}
                        transition={"0.2s"}
                        _hover={{ opacity: 1 }}
                      >
                        <Center className="absolute -bottom-0.5 right-0.5 w-8 h-8 rounded-full bg-emerald-800">
                          <MdOutlineModeEdit size={17} />
                        </Center>
                      </Avatar>
                    </div>
                  </Tooltip>
                  <VStack w={"full"} gap={2}>
                    <Field
                      errorText={errors.name?.message}
                      invalid={!!errors.name}
                      w={"full"}
                    >
                      <Input
                        w={"full"}
                        {...register("name", {
                          onChange(event) {
                            setValue("name", event.target.value);
                          },
                        })}
                        autoComplete="off"
                        placeholder="Nome do perfil"
                      />
                    </Field>
                    <Field
                      errorText={errors.name?.message}
                      invalid={!!errors.name}
                      w={"full"}
                    >
                      <Input
                        w={"full"}
                        {...register("name", {
                          onChange(event) {
                            setValue("name", event.target.value);
                          },
                        })}
                        autoComplete="off"
                        placeholder="Recado"
                      />
                    </Field>
                  </VStack>
                </HStack>
                <Text fontWeight={"medium"}>Privacidade</Text>
                <HStack>
                  <Field
                    errorText={errors.name?.message}
                    invalid={!!errors.name}
                    label="Visto por último"
                    disabled
                  >
                    <Input
                      {...register("name", {
                        onChange(event) {
                          setValue("name", event.target.value);
                        },
                      })}
                      autoComplete="off"
                      placeholder="Digite o nome da conexão"
                    />
                  </Field>
                  <Field
                    errorText={errors.name?.message}
                    invalid={!!errors.name}
                    label="Online"
                    disabled
                  >
                    <Input
                      {...register("name", {
                        onChange(event) {
                          setValue("name", event.target.value);
                        },
                      })}
                      autoComplete="off"
                      placeholder="Digite o nome da conexão"
                    />
                  </Field>
                </HStack>
                <HStack>
                  <Field
                    errorText={errors.name?.message}
                    invalid={!!errors.name}
                    label="Foto do perfil"
                  >
                    <Input
                      {...register("name", {
                        onChange(event) {
                          setValue("name", event.target.value);
                        },
                      })}
                      autoComplete="off"
                      placeholder="Digite o nome da conexão"
                    />
                  </Field>
                  <Field
                    errorText={errors.name?.message}
                    invalid={!!errors.name}
                    label="Status"
                    disabled
                  >
                    <Input
                      {...register("name", {
                        onChange(event) {
                          setValue("name", event.target.value);
                        },
                      })}
                      autoComplete="off"
                      placeholder="Digite o nome da conexão"
                    />
                  </Field>
                </HStack>
                <HStack>
                  <Field
                    errorText={errors.name?.message}
                    invalid={!!errors.name}
                    label="Adicionar aos grupos"
                  >
                    <Input
                      {...register("name", {
                        onChange(event) {
                          setValue("name", event.target.value);
                        },
                      })}
                      autoComplete="off"
                      placeholder="Digite o nome da conexão"
                    />
                  </Field>
                  <Field
                    errorText={errors.name?.message}
                    invalid={!!errors.name}
                    label="Confirmação de leitura"
                    disabled
                  >
                    <Input
                      {...register("name", {
                        onChange(event) {
                          setValue("name", event.target.value);
                        },
                      })}
                      autoComplete="off"
                      placeholder="Digite o nome da conexão"
                    />
                  </Field>
                </HStack>
              </VStack>
            </TabsContent>
          </TabsRoot>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" disabled={isPending} variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={isPending}>
            Criar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
