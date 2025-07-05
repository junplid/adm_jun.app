import {
  Button,
  ButtonGroup,
  Collapsible,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { JSX, useCallback, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "@components/ui/field";
import { toaster } from "@components/ui/toaster";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { useHookFormMask } from "use-mask-input";
import { useQuery } from "@tanstack/react-query";
import {
  StepsContent,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsRoot,
} from "@components/ui/steps";
import SelectComponent from "@components/Select";

const FormSchema = z.object({
  name: z.string().min(6, "Campo nome completo inválido."),
  number: z.string().min(1, "Esse campo é obrigatório."),
  email: z.string().email({
    message: "Campo de e-mail inválido.",
  }),
  password: z.string().min(1, "Esse campo é obrigatório."),

  creditCard: z.object({
    holderName: z
      .string({ message: "Campo obrigatório." })
      .min(1, "Campo obrigatório."),
    number: z
      .string({ message: "Campo obrigatório." })
      .min(1, "Campo obrigatório."),
    expiryMonth: z.enum(
      ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
      { message: "Campo obrigatório." }
    ),
    expiryYear: z
      .string({ message: "Campo obrigatório." })
      .length(4, "Campo obrigatório."),
    ccv: z
      .string({ message: "Campo obrigatório." })
      .min(3, "Campo obrigatório.")
      .max(4, "Campo obrigatório."),
  }),
});

type Fields = z.infer<typeof FormSchema>;

export const SignupPage: React.FC = (): JSX.Element => {
  const [_cookies, setCookies] = useCookies(["auth"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const { data: av, isPending } = useQuery({
    queryKey: ["public-av"],
    queryFn: async () => {
      const { data } = await api.get("/public/av");
      return data.f;
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const registerWithMask = useHookFormMask(register);

  const signup = useCallback(async (fields: Fields) => {
    try {
      const affiliate = searchParams.get("affiliate") || undefined;
      const { data } = await api.post("/public/register-account", {
        ...fields,
        affiliate,
      });
      setCookies("auth", `BEARER ${data.token}`);
      navigate("/auth/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === "ERR_NETWORK") {
          toaster.create({
            type: "info",
            title: "Servidor ocupado!",
            description: "Por favor, tente novamente mais tarde.",
          });

          return;
        }
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) {
            // dataError.toast.forEach(({ text, ...rest }) => toast(text, rest));
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

  return (
    <div className="m-auto flex flex-col w-full flex-1 my-10 gap-y-5">
      <img src="/logo.svg" alt="Logo" className="max-w-40 mx-auto" />
      <div className="min-h-full w-full max-w-sm mx-auto rounded-sm bg-[#f5f5f5] dark:bg-[#181616c5] shadow-xl border border-black/5 dark:border-none">
        <div className="flex h-full w-full flex-1 items-center p-6 py-6">
          <form className="w-full flex-col flex gap-y-4">
            <h3 className="text-xl font-semibold text-black text-center dark:text-white">
              Cadastre-se e automatize já.
            </h3>
            <StepsRoot
              step={step}
              onStepChange={(e) => setStep(e.step)}
              count={2}
              // size={"sm"}
              px={0}
            >
              <StepsList px={2}>
                <StepsItem
                  className="pointer-events-none"
                  index={0}
                  title={
                    <div className="flex flex-col">
                      <span className="text-white/70 font-light">Dados de</span>
                      <span>acesso</span>
                    </div>
                  }
                />
                <StepsItem
                  className="pointer-events-none"
                  index={1}
                  title={
                    <div className="flex flex-col">
                      <span className="text-white/70 font-light">
                        Confirmar
                      </span>
                      <span>identidade</span>
                    </div>
                  }
                />
              </StepsList>
              <StepsContent index={0}>
                <Collapsible.Root open={open}>
                  <Collapsible.Trigger className="w-full pb-2">
                    <Field
                      invalid={!!errors.email}
                      label="E-mail de acesso"
                      errorText={errors.email?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...register("email", {
                          onChange() {
                            setOpen(true);
                          },
                        })}
                        autoComplete="off"
                        type="text"
                      />
                    </Field>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="pt-2 flex flex-col gap-y-4">
                    <Field
                      invalid={!!errors.name}
                      label="Nome completo"
                      errorText={errors.name?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...register("name")}
                        autoComplete="nope"
                        type="text"
                      />
                    </Field>

                    <Field
                      invalid={!!errors.number}
                      label="Número whatsapp"
                      errorText={errors.number?.message}
                      disabled={isPending || !av}
                    >
                      <InputGroup startElement="+55">
                        <Input
                          {...registerWithMask("number", [
                            "(99) 9999-9999",
                            "(99) 99999-9999",
                          ])}
                          autoComplete="nope"
                          type="text"
                        />
                      </InputGroup>
                    </Field>

                    <Field
                      invalid={!!errors.password}
                      label="Senha de acesso"
                      errorText={errors.password?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...register("password")}
                        autoComplete="nope"
                        type="password"
                      />
                    </Field>
                  </Collapsible.Content>
                </Collapsible.Root>
              </StepsContent>
              <StepsContent index={1}>
                <p className="text-white/70 leading-5 text-center">
                  Usaremos seu cartão apenas para confirmar sua identidade .{" "}
                  <strong className="text-green-300 font-medium">
                    Não há cobrança
                  </strong>
                  .
                </p>
                <div className="pt-2 flex flex-col gap-y-4 mt-3">
                  <Field
                    invalid={!!errors.name}
                    label="Endereço completo do titular"
                    errorText={errors.name?.message}
                    disabled={isPending || !av}
                  >
                    <Input
                      {...register("name")}
                      autoComplete="nope"
                      type="text"
                    />
                  </Field>
                  <div className="grid grid-cols-[1fr_0.7fr] items-end gap-x-2">
                    <Field
                      invalid={!!errors.name}
                      label={
                        <div className="flex flex-col -space-y-1">
                          <span>CEP do</span>
                          <span className="text-white/70 font-light">
                            titular
                          </span>
                        </div>
                      }
                      errorText={errors.name?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...register("name")}
                        autoComplete="nope"
                        type="text"
                      />
                    </Field>
                    <Field
                      invalid={!!errors.name}
                      label={
                        <div className="flex flex-col -space-y-1">
                          <span>Número do</span>
                          <span className="text-white/70 font-light">
                            endereço
                          </span>
                        </div>
                      }
                      errorText={errors.name?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...register("name")}
                        autoComplete="nope"
                        type="text"
                      />
                    </Field>
                  </div>
                </div>
                <div className="border-b border-white/40 my-2 mt-5"></div>
                <div className="pt-2 flex flex-col gap-y-4">
                  <Field
                    invalid={!!errors.name}
                    label="Nome do cartão"
                    errorText={errors.name?.message}
                    disabled={isPending || !av}
                  >
                    <Input
                      {...register("name")}
                      autoComplete="nope"
                      type="text"
                    />
                  </Field>
                  <Field
                    invalid={!!errors.name}
                    label="Número do cartão"
                    errorText={errors.name?.message}
                    disabled={isPending || !av}
                  >
                    <Input
                      {...register("name")}
                      autoComplete="nope"
                      type="text"
                    />
                  </Field>
                  <div className="grid grid-cols-[1fr_0.7fr_60px] items-end gap-x-2">
                    <Field
                      invalid={!!errors.name}
                      label={
                        <div className="flex flex-col -space-y-1">
                          <span>Mês de</span>
                          <span className="text-white/70 font-light">
                            expiração
                          </span>
                        </div>
                      }
                      errorText={errors.name?.message}
                      disabled={isPending || !av}
                    >
                      <SelectComponent
                        isClearable={false}
                        options={optionsMonth}
                        placeholder=""
                      />
                    </Field>
                    <Field
                      invalid={!!errors.name}
                      label={
                        <div className="flex flex-col -space-y-1">
                          <span>Ano de</span>
                          <span className="text-white/70 font-light">
                            expiração
                          </span>
                        </div>
                      }
                      errorText={errors.name?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...registerWithMask("number", ["9999"])}
                        autoComplete="nope"
                        type="text"
                      />
                    </Field>
                    <Field
                      invalid={!!errors.name}
                      label={
                        <div className="flex flex-col">
                          <span>CCV</span>
                        </div>
                      }
                      errorText={errors.name?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...register("name")}
                        autoComplete="nope"
                        type="text"
                      />
                    </Field>
                  </div>
                </div>
              </StepsContent>
              {!!step && (
                <p className="text-white text-sm leading-4">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <Link to={"/terms-of-service"} className="text-blue-400">
                    Termos de Serviço
                  </Link>{" "}
                  e{" "}
                  <Link to={"/privacy-terms"} className="text-blue-400">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              )}
              <ButtonGroup size="sm" variant="outline">
                {!step && (
                  <StepsNextTrigger asChild>
                    <Button variant={"solid"} className="w-full" type="button">
                      Continuar
                    </Button>
                  </StepsNextTrigger>
                )}
                {step && (
                  <Button
                    loadingText="Aguarde..."
                    loading={isSubmitting}
                    type="submit"
                    disabled={isPending || !av}
                    variant={"subtle"}
                    colorPalette={"cyan"}
                    borderStyle={"dashed"}
                    size={"md"}
                    className="w-full"
                  >
                    Criar conta
                  </Button>
                )}
              </ButtonGroup>
              {!step && (
                <Button
                  variant={"outline"}
                  borderStyle={"dashed"}
                  borderWidth={"2px"}
                  type="button"
                  as={Link}
                  // @ts-expect-error
                  to={`/login?${searchParams.toString()}`}
                  className="w-full"
                >
                  Acesse uma conta existente
                </Button>
              )}
            </StepsRoot>
          </form>
        </div>
      </div>
    </div>
  );
};

const optionsMonth = [
  {
    label: (
      <span>
        01 <small className="text-white/70">Janeiro</small>{" "}
      </span>
    ),
    value: "1",
  },
  {
    label: (
      <span>
        02 <small className="text-white/70">Fevereiro</small>{" "}
      </span>
    ),
    value: "2",
  },
  {
    label: (
      <span>
        03 <small className="text-white/70">Março</small>{" "}
      </span>
    ),
    value: "3",
  },
  {
    label: (
      <span>
        04 <small className="text-white/70">Abril</small>{" "}
      </span>
    ),
    value: "4",
  },
  {
    label: (
      <span>
        05 <small className="text-white/70">Maio</small>{" "}
      </span>
    ),
    value: "5",
  },
  {
    label: (
      <span>
        06 <small className="text-white/70">Junho</small>{" "}
      </span>
    ),
    value: "6",
  },
  {
    label: (
      <span>
        07 <small className="text-white/70">Julho</small>{" "}
      </span>
    ),
    value: "7",
  },
  {
    label: (
      <span>
        08 <small className="text-white/70">Agosto</small>{" "}
      </span>
    ),
    value: "8",
  },
  {
    label: (
      <span>
        09 <small className="text-white/70">Setembro</small>{" "}
      </span>
    ),
    value: "9",
  },
  {
    label: (
      <span>
        10 <small className="text-white/70">Outubro</small>{" "}
      </span>
    ),
    value: "10",
  },
  {
    label: (
      <span>
        11 <small className="text-white/70">Novembro</small>{" "}
      </span>
    ),
    value: "11",
  },
  {
    label: (
      <span>
        12 <small className="text-white/70">Dezembro</small>{" "}
      </span>
    ),
    value: "12",
  },
];
