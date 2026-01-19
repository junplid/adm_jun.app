import { Button, Collapsible, Input, InputGroup } from "@chakra-ui/react";
import { AxiosError } from "axios";
import {
  JSX,
  useCallback,
  // useMemo,
  useState,
} from "react";
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
import { set } from "idb-keyval";

// import { CardBrand, loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   useStripe,
//   useElements,
//   CardNumberElement,
//   CardExpiryElement,
//   CardCvcElement,
// } from "@stripe/react-stripe-js";
// import { StripeCardNumberElement } from "@stripe/stripe-js";

const FormSchema = z.object({
  name: z.string().min(6, "Campo nome completo inválido."),
  number: z.string().min(1, "Este campo é obrigatório."),
  email: z.string().email({
    message: "Campo de e-mail inválido.",
  }),
  password: z
    .string({ message: "Campo obrigatório." })
    .min(8, "Preciso ter no mínimo 8 caracteres."),

  // creditCard: z.object({
  //   holderName: z
  //     .string({ message: "Campo obrigatório." })
  //     .min(1, "Campo obrigatório."),
  // }),
});

type Fields = z.infer<typeof FormSchema>;

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_TOKEN);
export const SignupPage: React.FC = (): JSX.Element => {
  return (
    // <Elements stripe={stripePromise}>
    <FormSignup />
    // </Elements>
  );
};

export const FormSignup: React.FC = (): JSX.Element => {
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

  // const stripe = useStripe();
  // const elements = useElements();

  const {
    handleSubmit,
    register,
    // getValues,
    // watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  // const { email, name, number, password } = watch();

  const registerWithMask = useHookFormMask(register);

  // const [brand, setBrand] = useState<CardBrand>("unknown");

  // const brandIcon = useMemo(() => {
  //   const maps: Record<CardBrand, string | undefined> = {
  //     eftpos_au: undefined,
  //     visa: "/cards/visa.svg",
  //     mastercard: "/cards/mastercard.svg",
  //     amex: "/cards/amex.svg",
  //     diners: "/cards/diners.svg",
  //     jcb: "/cards/jcb.svg",
  //     discover: "/cards/discover.svg",
  //     unionpay: "/cards/unionpay.svg",
  //     unknown: undefined,
  //   };
  //   return maps[brand];
  // }, [brand]);

  const signup = useCallback(async (fields: Fields) => {
    try {
      // if (!stripe || !elements) {
      //   console.log({ stripe, elements });
      //   return;
      // }
      // const cardElement = elements.getElement(CardNumberElement);
      // if (!cardElement) {
      //   alert("AQUI 2");
      //   return;
      // }

      // const { error, paymentMethod } = await stripe.createPaymentMethod({
      //   type: "card",
      //   card: cardElement as StripeCardNumberElement,
      //   billing_details: {
      //     name: fields.creditCard.holderName,
      //     email: fields.email,
      //   },
      // });

      // if (error) {
      //   toaster.create({
      //     type: "error",
      //     title: "Cartão não autorizado",
      //     description: error.message,
      //   });
      //   return;
      // }
      const affiliate = searchParams.get("affiliate") || undefined;
      const { data } = await api.post("/public/register/account", {
        name: fields.name,
        email: fields.email,
        number: fields.number,
        password: fields.password,
        // paymentMethodId: paymentMethod.id,
        affiliate,
      });
      await set("auth_token", `BEARER ${data.token}`);
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
            setStep(Number(!isStep0));
          }
        }
      }
    }
  }, []);

  function handleErrors(err: any) {
    if (err.name || err.number || err.email || err.password) {
      setStep(0);
      return;
    }
    setStep(1);
  }

  return (
    <div className="m-auto flex flex-col w-full flex-1 my-10 gap-y-5">
      <img src="/logo.svg" alt="Logo" className="max-w-40 mx-auto" />
      <div className="min-h-full w-full max-w-sm mx-auto rounded-sm bg-[#f5f5f5] dark:bg-[#111111] shadow-xl border border-black/5 dark:border-none">
        <div className="flex h-full w-full flex-1 items-center p-6 py-6">
          <form
            onSubmit={handleSubmit(signup, handleErrors)}
            className="w-full flex-col flex gap-y-4"
          >
            <h3 className="text-xl font-semibold text-black text-center dark:text-white">
              Cadastre-se e automatize já.
            </h3>

            <Collapsible.Root open={open}>
              <Collapsible.Trigger className="w-full pb-2 text-start">
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
              <Collapsible.Content className="pt-2 flex flex-col gap-y-4 text-start">
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

            {/* <StepsRoot
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
                  <Collapsible.Trigger className="w-full pb-2 text-start">
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
                  <Collapsible.Content className="pt-2 flex flex-col gap-y-4 text-start">
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
                <span></span>
                {/* <p className="text-white/70 leading-5 text-center">
                  Usaremos seu cartão de crédito apenas para confirmar sua
                  identidade .{" "}
                  <strong className="text-green-300 font-medium">
                    Não há cobrança
                  </strong>
                  .
                </p>
                <div className="pt-2 flex flex-col gap-y-4 mt-3">
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
                  <Field label="Número do cartão" disabled={isPending || !av}>
                    <Box
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      borderRadius="sm"
                      px={3}
                      py={2}
                      _focusWithin={{
                        borderColor: "#fff",
                        boxShadow: "0 0 0 1px rgba(6,182,212,0.6)",
                      }}
                      className="w-full flex"
                    >
                      <CardNumberElement
                        onChange={(e) => setBrand(e.brand)}
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
                          disabled: isPending || !av,
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
                    <Field
                      label={"Data de validade"}
                      disabled={isPending || !av}
                    >
                      <Box
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="sm"
                        px={3}
                        py={2}
                        _focusWithin={{
                          borderColor: "#fff",
                          boxShadow: "0 0 0 1px rgba(6,182,212,0.6)",
                        }}
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
                            disabled: isPending || !av,
                          }}
                          className="stripe-input"
                        />
                      </Box>
                    </Field>

                    <Field disabled={isPending || !av}>
                      <Box
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        borderRadius="sm"
                        px={3}
                        py={2}
                        _focusWithin={{
                          borderColor: "#fff",
                          boxShadow: "0 0 0 1px rgba(6,182,212,0.6)",
                        }}
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
                </div>

                <span className="text-red-400 mt-1 block h-13 -mb-2">
                  {errors.creditCard?.message || ""}
                </span>
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
                {/* {!step && (
                  <Button
                    disabled={!email || !name || !number || !password}
                    onClick={() => {
                      const values = getValues();
                      if (
                        !values.email ||
                        !values.name ||
                        !values.number ||
                        !values.password
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
                  to={`/login?${searchParams.toString()}`}
                  className="w-full"
                >
                  Acesse uma conta existente
                </Button>
              )}
            </StepsRoot> */}
          </form>
        </div>
      </div>
    </div>
  );
};
