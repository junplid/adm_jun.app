import { Button, Input, InputGroup } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { JSX, useCallback } from "react";
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

const FormSchema = z.object({
  name: z.string().min(6, "Campo nome completo inválido."),
  cpfCnpj: z.string().min(1, "Esse campo é obrigatório."),
  number: z.string().min(1, "Esse campo é obrigatório."),
  email: z.string().email({
    message: "Campo de e-mail inválido.",
  }),
  password: z.string().min(1, "Esse campo é obrigatório."),
});

type Fields = z.infer<typeof FormSchema>;

export const SignupPage: React.FC = (): JSX.Element => {
  const [_cookies, setCookies] = useCookies(["auth"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    <div className="m-auto flex flex-col w-full max-w-sm flex-1 my-10 gap-y-5">
      <span className="text-2xl font-semibold text-center select-none">
        Junplid
      </span>
      <div className="min-h-full w-full rounded-sm bg-[#f5f5f5] dark:bg-[#181616c5] shadow-xl border border-black/5 dark:border-none">
        <div className="flex h-full w-full flex-1 items-center p-6 py-8">
          <div className="w-full flex-col flex gap-y-3">
            <h3 className="text-xl font-semibold text-black dark:text-white">
              Criar conta{" "}
              <span className="text-green-300/70 text-sm">free</span>
            </h3>
            <form
              onSubmit={handleSubmit(signup)}
              className="w-full space-y-4 flex flex-col"
            >
              <div className="flex flex-col space-y-5">
                <div className="flex w-full flex-col gap-y-4">
                  <Field
                    invalid={!!errors.name}
                    label="Nome completo"
                    errorText={errors.name?.message}
                  >
                    <Input
                      {...register("name")}
                      autoComplete="nope"
                      type="text"
                    />
                  </Field>

                  <Field
                    invalid={!!errors.cpfCnpj}
                    label="CPF ou CNPJ"
                    errorText={errors.cpfCnpj?.message}
                    helperText="Usado para identificação unica da conta"
                  >
                    <Input
                      {...registerWithMask("cpfCnpj", [
                        "999.999.999-99",
                        "99.999.999/9999-99",
                      ])}
                      autoComplete="nope"
                      type="text"
                    />
                  </Field>

                  <Field
                    invalid={!!errors.number}
                    label="Número whatsapp"
                    errorText={errors.number?.message}
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
                    invalid={!!errors.email}
                    label="E-mail de acesso"
                    errorText={errors.email?.message}
                  >
                    <Input
                      {...register("email")}
                      autoComplete="nope"
                      type="text"
                      placeholder="me@exemple.com"
                    />
                  </Field>

                  <Field
                    invalid={!!errors.password}
                    label="Senha de acesso"
                    errorText={errors.password?.message}
                  >
                    <Input
                      {...register("password")}
                      autoComplete="nope"
                      type="password"
                    />
                  </Field>
                </div>
                <span className="text-white">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <Link to={"/"} className="text-blue-400">
                    Termos de Serviço
                  </Link>{" "}
                  e{" "}
                  <Link to={"/"} className="text-blue-400">
                    Política de Privacidade
                  </Link>
                  . Utilizamos cookies essenciais e tecnologias similares para
                  oferecer uma melhor experiência.
                </span>
                <Button
                  loadingText="Aguarde..."
                  loading={isSubmitting}
                  type="submit"
                >
                  Criar conta
                </Button>
              </div>

              <Button
                variant={"outline"}
                borderStyle={"dashed"}
                borderWidth={"2px"}
                as={Link}
                // @ts-expect-error
                to={`/login?${searchParams.toString()}`}
                className="w-full"
              >
                Acesse uma conta existente
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
