import {
  Box,
  Button,
  ButtonGroup,
  Collapsible,
  Input,
  InputGroup,
  Spinner,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import { JSX, useEffect, useMemo, useState } from "react";
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
import { registerPushToken } from "../../services/push/registerPush";
import {
  StepsContent,
  StepsItem,
  StepsList,
  StepsRoot,
} from "@components/ui/steps";

import { CardBrand, StripeCardNumberElement } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import clsx from "clsx";
import { GoNorthStar } from "react-icons/go";
import { data_plans_signup } from "./data_plans";
import { formatToBRL } from "brazilian-values";
import { TextGradientComponent } from "@components/TextGradient";
import {
  createSetupIntentsStripe,
  createSubscriptionStripe,
} from "../../services/api/Account";

const FormSchema = z.object({
  name: z.string().min(6, "Campo nome completo inválido."),
  number: z.string().min(1, "Campo obrigatório."),
  email: z.string().email({
    message: "Campo de e-mail inválido.",
  }),
  password: z
    .string({ message: "Campo obrigatório." })
    .min(8, "Preciso ter no mínimo 8 caracteres."),

  creditCard: z.object({
    holderName: z
      .string({ message: "Campo obrigatório." })
      .min(1, "Campo obrigatório."),
    postal_code: z
      .string({ message: "Campo obrigatório." })
      .min(1, "CEP invalido."),
  }),
});

type Fields = z.infer<typeof FormSchema>;

export const SignupPage: React.FC = (): JSX.Element => {
  const [stripePromise, setStripePromise] = useState<null | Promise<any>>(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // dynamic import do build 'pure' para evitar side-effects na importação
      const stripeJs = await import("@stripe/stripe-js/pure");
      // opcional: desativa advanced fraud signals (reduz chamadas para m.stripe.com)
      stripeJs.loadStripe.setLoadParameters?.({ advancedFraudSignals: false });
      const promise = stripeJs.loadStripe(
        import.meta.env.VITE_STRIPE_PUBLIC_TOKEN,
      );
      if (mounted) setStripePromise(promise);
      setLoad(false);
    })();

    return () => {
      mounted = false;
      setLoad(true);
    };
  }, []);

  if (!stripePromise) {
    return (
      <div className="m-auto flex flex-col w-full flex-1 my-10 gap-y-5">
        <img src="/logo.svg" alt="Logo" className="max-w-40 mx-auto" />
        <div className="min-h-full w-full max-w-sm mx-auto rounded-sm bg-[#111111] shadow-xl">
          <div className="flex w-full p-6 py-6">
            <div className="flex h-71.75 justify-center w-full items-center">
              {load && <Spinner size={"md"} color={"GrayText"} />}
              {!load && (
                <span>
                  O registro de contas está temporariamente indisponível.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <FormSignup />
    </Elements>
  );
};

export const FormSignup: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isAccount, setIsAccount] = useState(false);
  const [step, setStep] = useState(0);
  const [planSelected, setPlanSelected] = useState<number | null>(null);

  const { data: av, isPending } = useQuery({
    queryKey: ["public-av"],
    queryFn: async () => {
      const { data } = await api.get("/public/av");
      return data.f;
    },
  });

  const stripe = useStripe();
  const elements = useElements();

  const {
    handleSubmit,
    register,
    getValues,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
  });

  const { email, name, number, password } = watch();

  const registerWithMask = useHookFormMask(register);

  const [brand, setBrand] = useState<CardBrand>("unknown");

  const brandIcon = useMemo(() => {
    const maps: Record<CardBrand, string | undefined> = {
      eftpos_au: undefined,
      visa: "/cards/visa.svg",
      mastercard: "/cards/mastercard.svg",
      amex: "/cards/amex.svg",
      diners: "/cards/diners.svg",
      jcb: "/cards/jcb.svg",
      discover: "/cards/discover.svg",
      unionpay: "/cards/unionpay.svg",
      unknown: undefined,
    };
    return maps[brand];
  }, [brand]);

  const createSetupIntents = async () => {
    const { client_secret } = await createSetupIntentsStripe();
    return client_secret;
  };

  const createSubscription = async (
    fields: Fields,
    client_secret: string,
    props: { cardElement: StripeCardNumberElement },
  ) => {
    const cardSetup = await stripe!.confirmCardSetup(client_secret, {
      payment_method: {
        card: props.cardElement,
        billing_details: {
          name: fields.name,
          email: fields.email,
          phone: fields.number,
          address: {
            postal_code: fields.creditCard.postal_code,
            country: "BR",
          },
        },
      },
    });

    if (cardSetup.error) {
      const { type, code, message } = cardSetup.error;

      // 1. ERROS DE VALIDAÇÃO (Digitação/Campos incompletos)
      if (type === "validation_error") {
        setError("creditCard", { message: cardSetup.error.message });
      }

      // 2. ERROS DE CARTÃO (Recusas do Banco/Radar/Saldo)
      else if (type === "card_error") {
        // Aqui usamos o mapeamento que discutimos antes
        const tradução = {
          fraudulent: "Bloqueado por segurança. Tente outro cartão.",
          insufficient_funds: "Saldo insuficiente.",
          card_declined: "Cartão recusado. Entre em contato com seu banco.",
          expired_card: "Cartão vencido.",
          incorrect_cvc: "CVC incorreto.",
        };

        const msg = tradução[code as keyof typeof tradução] || message;
        setError("creditCard", { message: msg });
      }

      // 3. ERROS GENÉRICOS (Rede/API/Limite de taxa)
      else {
        setError("creditCard", {
          message: "Erro ao processar pagamento. Tente novamente.",
        });
      }
      throw cardSetup.error;
    } else {
      const paymentMethodId = cardSetup.setupIntent.payment_method;
      await createSubscriptionStripe({
        paymentMethodId: paymentMethodId as string,
        planId: planSelected!,
      });
    }
  };

  const signup = async (fields: Fields) => {
    try {
      if (!stripe || !elements) return;
      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) return;

      if (!isAccount) {
        const affiliate = searchParams.get("affiliate") || undefined;
        const { data, status } = await api.post("/public/register/account", {
          name: fields.name,
          email: fields.email,
          number: fields.number,
          password: fields.password,
          affiliate,
        });
        if (status === 200) {
          setIsAccount(true);
          if (data.csrfToken) {
            api.defaults.headers.common["X-XSRF-TOKEN"] = data.csrfToken;
          }
        }
      }

      const client_secret = await createSetupIntents();
      await createSubscription(fields, client_secret, { cardElement });
      await registerPushToken();
      navigate("/auth/dashboard", { replace: true });
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
              setError(path, { message: text }),
            );
            const isStep0 = dataError.input.some((s) => {
              return /(email|password|name|number|cpfCnpj)/.test(s.path);
            });
            if (isStep0) setStep(Number(!isStep0));
          }
        }
      }
    }
  };

  function handleErrors(err: any) {
    console.log(err);
    if (err.name || err.number || err.email || err.password) {
      setStep(0);
      return;
    }
    setStep(1);
  }

  return (
    <div className="m-auto flex flex-col w-full flex-1 my-10 gap-y-5">
      <img src="/logo.svg" alt="Logo" className="max-w-40 mx-auto" />
      <div className="min-h-full w-full max-w-sm mx-auto rounded-sm bg-[#111111] shadow-xl">
        <div className="flex h-full w-full flex-1 items-center p-6 py-6">
          <form
            onSubmit={handleSubmit(signup, handleErrors)}
            className="w-full flex-col flex gap-y-4"
          >
            <input
              type="email"
              name="email"
              autoComplete="new-password2"
              style={{ display: "none" }}
            />

            <input
              type="password"
              name="fake-password"
              autoComplete="new-password2"
              style={{ display: "none" }}
            />

            <h3 className="text-xl font-semibold text-center text-white">
              Cadastre-se e automatize já.
            </h3>

            {/* <Collapsible.Root open={open}>
              <Collapsible.Trigger className="w-full pb-2 text-start">
                <Field
                  invalid={!!errors.name}
                  label="Nome completo"
                  errorText={errors.name?.message}
                  disabled={isPending || !av}
                >
                  <Input
                    {...register("name", {
                      onChange() {
                        setOpen(true);
                      },
                    })}
                    autoComplete="nope"
                    type="text"
                  />
                </Field>
              </Collapsible.Trigger>
              <Collapsible.Content className="pt-2 flex flex-col gap-y-4 text-start">
                <Field
                  invalid={!!errors.email}
                  label="E-mail de acesso"
                  errorText={errors.email?.message}
                  disabled={isPending || !av}
                >
                  <Input
                    {...register("email")}
                    autoComplete="off"
                    type="text"
                  />
                </Field>

                <Field
                  invalid={!!errors.number}
                  label="Número WhatsApp"
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

            <div className="flex flex-col gap-y-2 mt-3">
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
            </div>

            <p className="mt-2 text-center text-xs text-slate-400">
              Ao criar sua conta, você concorda com nossos{" "}
              <a className="text-white underline" href="/terms-of-use">
                Termos de Uso
              </a>{" "}
              e{" "}
              <a className="text-white underline" href="/privacy-policy">
                Política de Privacidade
              </a>
              .
            </p>
             */}

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
                      <span>cadastro</span>
                    </div>
                  }
                />
                <StepsItem
                  className="pointer-events-none"
                  index={1}
                  title={
                    <div className="flex flex-col">
                      <span className="text-white/70 font-light">Garantir</span>
                      <span>meu acesso</span>
                    </div>
                  }
                />
              </StepsList>
              <StepsContent index={0}>
                <Collapsible.Root open={open}>
                  <Collapsible.Trigger className="w-full pb-2 text-start">
                    <Field
                      invalid={!!errors.name}
                      label="Nome completo"
                      errorText={errors.name?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...register("name", {
                          onChange() {
                            setOpen(true);
                          },
                        })}
                        autoComplete="nope"
                        type="text"
                      />
                    </Field>
                  </Collapsible.Trigger>
                  <Collapsible.Content className="pt-2 flex flex-col gap-y-4 text-start">
                    <Field
                      invalid={!!errors.email}
                      label="E-mail de acesso"
                      errorText={errors.email?.message}
                      disabled={isPending || !av}
                    >
                      <Input
                        {...register("email")}
                        autoComplete="off"
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
                {!planSelected ? (
                  <>
                    <div className="grid grid-cols-[1fr_1fr] items-end mt-2">
                      {data_plans_signup.map((plan) => (
                        <div
                          className={clsx("flex flex-col rounded-2xl relative")}
                          key={plan.name}
                          style={{
                            boxShadow:
                              plan.name === "Anual"
                                ? "0px 0px 46px 5px #35ef9e47 inset"
                                : undefined,
                          }}
                        >
                          {plan.name === "Anual" && (
                            <>
                              <GoNorthStar
                                color="#32966b"
                                className="absolute top-7 left-16 blur-[1px]"
                              />
                              <GoNorthStar
                                color="#c4fde4"
                                className="absolute top-6 left-4 blur-[0.2px]"
                                size={20}
                              />
                              <GoNorthStar
                                color="#36cb8a"
                                size={17}
                                className="absolute top-20 right-10 blur-[0.5px]"
                              />
                            </>
                          )}
                          <div
                            className={clsx(
                              plan.name === "Anual" &&
                                "rounded-t-2xl border-t-2 border-x-2 border-[#06a15e]",
                              "min-h-14 pt-10 flex-col font-bold flex items-center justify-center pb-2",
                            )}
                          >
                            {plan.name === "Anual" && (
                              <TextGradientComponent className="px-2 text-sm text-center leading-4">
                                Lembra investir em Bitcoins de 2010!
                              </TextGradientComponent>
                            )}
                            <span
                              className={clsx(
                                plan.name === "Anual" && "text-lg",
                              )}
                            >
                              {plan.name}
                            </span>
                            <p
                              className={clsx(
                                plan.name === "Anual"
                                  ? "text-neutral-200 font-medium"
                                  : "text-neutral-500 font-light",
                                "text-center leading-4 mt-3 text-sm",
                              )}
                            >
                              {plan.desc}
                            </p>
                          </div>

                          <div
                            className={clsx(
                              plan.name === "Anual" &&
                                "border-x-2 rounded-b-2xl border-b-2 border-[#06a15e]",
                              "flex flex-col items-center justify-center pb-10 h-34.5 p-3 font-medium gap-y-1",
                            )}
                          >
                            <button
                              className={clsx(
                                plan.name === "Anual"
                                  ? "bg-[#06a15e] hover:bg-[#0cbd70]"
                                  : "bg-[#605e5e] hover:bg-[#737373]",
                                "p-1 w-full rounded-lg py-2 text-sm leading-4 font-bold duration-300 cursor-pointer shadow",
                              )}
                              onClick={() => setPlanSelected(plan.id)}
                            >
                              Adquirir agora
                            </button>
                            <span
                              className={clsx(
                                plan.name === "Anual"
                                  ? "text-[#1eb774]"
                                  : "text-white/50",
                                "text-xs text-center font-medium",
                              )}
                            >
                              {formatToBRL(plan.price)}/
                              {plan.name === "Anual" ? "ano" : "mês"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-neutral-400 text-sm text-justify mt-4">
                      Todos os planos contemplam 1 conexão com WhatsApp(Não
                      oficial com QR Code) e acesso integral a todos os recursos
                      disponíveis, bem como às funcionalidades que venham a ser
                      adicionadas futuramente, sem qualquer acréscimo ou
                      reajuste no valor do plano durante a vigência da
                      assinatura ativa.
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-y-4">
                      <p className="text-sm text-neutral-400">
                        Todas as informações são criptografadas e tratadas
                        conforme os mais rigorosos padrões internacionais de
                        segurança e conformidade (PCI DSS).
                      </p>

                      <Field
                        invalid={!!errors.creditCard?.holderName}
                        label="Nome do cartão"
                        errorText={errors.creditCard?.holderName?.message}
                        disabled={isPending || !av}
                      >
                        <Input
                          {...register("creditCard.holderName")}
                          autoComplete="nope"
                          type="text"
                        />
                      </Field>
                      <Field label="Número do cartão" disabled={isPending}>
                        <Box
                          border="1px solid"
                          borderColor="whiteAlpha.200"
                          borderRadius="sm"
                          px={3}
                          py={2}
                          className="w-full grid grid-cols-[1fr_35px]"
                        >
                          <CardNumberElement
                            onChange={(e) => {
                              setBrand(e.brand);
                            }}
                            options={{
                              style: {
                                base: {
                                  color: "#fff", // texto branco
                                  fontSize: "15px",
                                  "::placeholder": { color: "#9ca3af" },
                                  fontFamily: "inherit",
                                  ":focus": {},
                                },
                                invalid: { color: "#f87171" },
                              },
                              disableLink: true,
                              disabled: isPending,
                            }}
                            className="stripe-input"
                          />
                          {brandIcon && (
                            <img
                              src={brandIcon}
                              alt={brand}
                              style={{ width: 32, marginLeft: 8 }} // ajuste como preferir
                            />
                          )}
                        </Box>
                      </Field>
                      <div className="grid grid-cols-[1fr_70px] items-end gap-x-2">
                        <Field label={"Data de validade"} disabled={isPending}>
                          <Box
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            borderRadius="sm"
                            px={3}
                            py={2}
                            className="w-full"
                          >
                            <CardExpiryElement
                              options={{
                                style: {
                                  base: {
                                    color: "#fff", // texto branco
                                    fontSize: "15px",
                                    "::placeholder": { color: "#9ca3af" },
                                    fontFamily: "inherit",
                                  },
                                  invalid: { color: "#f87171" },
                                },
                                disabled: isPending,
                              }}
                              className="stripe-input"
                            />
                          </Box>
                        </Field>

                        <Field disabled={isPending}>
                          <Box
                            border="1px solid"
                            borderColor={"whiteAlpha.200"}
                            borderRadius="sm"
                            px={3}
                            py={2}
                            className="w-full"
                          >
                            <CardCvcElement
                              options={{
                                style: {
                                  base: {
                                    color: "#fff", // texto branco
                                    fontSize: "15px",
                                    "::placeholder": { color: "#9ca3af" },
                                    fontFamily: "inherit",
                                  },
                                  invalid: { color: "#f87171" },
                                },
                                disabled: isPending || !av,
                              }}
                              className="stripe-input"
                            />
                          </Box>
                        </Field>
                      </div>
                      <Field
                        invalid={!!errors.creditCard?.postal_code}
                        label="Código postal (CEP)"
                        errorText={errors.creditCard?.postal_code?.message}
                        disabled={isPending || !av}
                        className="w-full"
                      >
                        <Input
                          {...registerWithMask(
                            "creditCard.postal_code",
                            "99999-999",
                          )}
                          placeholder="00000-000"
                          autoComplete="nope"
                          type="text"
                        />
                      </Field>
                      <span className="text-red-400 block mb-2 -mt-3 text-sm">
                        {errors.creditCard?.message || ""}
                      </span>
                    </div>

                    <ButtonGroup size="sm" variant="outline">
                      {step && (
                        <Button
                          loadingText="Aguarde..."
                          loading={isSubmitting}
                          type="submit"
                          disabled={isPending}
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
                    {!!step && (
                      <p className="mt-2 text-center text-sm text-neutral-400">
                        Ao criar sua conta, você concorda com nossos{" "}
                        <a
                          className="text-white underline"
                          href="/terms-of-use"
                        >
                          Termos de Uso
                        </a>{" "}
                        e{" "}
                        <a
                          className="text-white underline"
                          href="/privacy-policy"
                        >
                          Política de Privacidade
                        </a>
                        .
                      </p>
                    )}
                  </div>
                )}
              </StepsContent>

              {!step && (
                <Button
                  disabled={!email || !name || !number || !password}
                  onClick={() => {
                    const values = getValues();
                    if (
                      !values.email ||
                      !values.name ||
                      !values.number ||
                      !values.password ||
                      values.password.length < 8
                    )
                      return;
                    setStep(1);
                  }}
                  variant={"solid"}
                  className="w-full"
                  type="button"
                >
                  Continuar
                </Button>
              )}

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
