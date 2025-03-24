import { Checkbox, Input } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { JSX, useCallback, useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import { InputWhatsAppNumberComponent } from "../../components/InputWhatsAppNumber";
import { api } from "../../services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "@components/ui/field";

const FormSchema = z.object({
  email: z.string().min(1, "Esse campo é obrigatório."),
  password: z.string().min(1, "Esse campo é obrigatório."),
  number: z.string().min(1, "Esse campo é obrigatório."),
});

type Fields = z.infer<typeof FormSchema>;

export const SignupPage: React.FC = (): JSX.Element => {
  const [_cookies, setCookies] = useCookies(["auth"]);
  const [fields, setFields] = useState<Fields_I>({} as Fields_I);
  const [load, setLoad] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const navigate = useNavigate();
  const [fieldsErrors, setFieldsErrors] = useState<IFieldsErrors>(
    {} as IFieldsErrors
  );
  const [searchParams] = useSearchParams();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const signup = useCallback(async (fields: Fields) => {
    try {
      setLoad(true);
      const affiliate = searchParams.get("affiliate") || undefined;
      const { data } = await api.post("/public/register-account", {
        ...fields,
        affiliate,
      });
      setCookies("auth", `BEARER ${data.token}`);
      navigate("/auth/system-configuration/plans");
      setLoad(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        setLoad(false);
        setFieldsErrors({
          email:
            error.response?.data.errors.find((e: any) =>
              e.path.includes("email")
            )?.message ?? null,
          password:
            error.response?.data.errors.find((e: any) =>
              e.path.includes("password")
            )?.message ?? null,
          number:
            error.response?.data.errors.find((e: any) =>
              e.path.includes("number")
            )?.message ?? null,
        });
        return;
      }
      console.log(error);
    }
  }, []);

  return (
    <div className="m-auto flex flex-col w-full max-w-sm flex-1 mt-10 gap-y-5">
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
                    invalid={!!errors.email}
                    label="Nome completo"
                    errorText={errors.email?.message}
                  >
                    <Input
                      {...register("email")}
                      autoComplete="nope"
                      type="text"
                      placeholder="me@exemplo.com"
                    />
                  </Field>

                  <Field.Root autoCorrect="off" invalid={!!errors.email}>
                    <Field.Label>Número whatsapp</Field.Label>
                    <Input
                      {...register("number")}
                      autoComplete="nope"
                      type="text"
                      placeholder="Email "
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root autoCorrect="off" invalid={!!errors.email}>
                    <Field.Label>CPF ou CNPJ</Field.Label>
                    <Input
                      {...register("email")}
                      autoComplete="nope"
                      type="text"
                      placeholder="Email de acesso"
                    />
                    <Field.HelperText>
                      Usado para identificação unica da conta
                    </Field.HelperText>
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root autoCorrect="off" invalid={!!errors.email}>
                    <Field.Label>Email de acesso</Field.Label>
                    <Input
                      {...register("email")}
                      autoComplete="nope"
                      type="text"
                      placeholder="Email de acesso"
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password}>
                    <Field.Label>Senha</Field.Label>
                    <Input
                      type="password"
                      autoComplete="nope"
                      placeholder="Senha de acesso"
                      {...register("password")}
                    />
                    <Field.ErrorText>
                      {errors.password?.message}
                    </Field.ErrorText>
                  </Field.Root>
                </div>
                <div>
                  {/* <Checkbox
                    checked={checked}
                    onChange={({ target }) => {
                      setChecked(target.checked);
                    }}
                  >
                    <span className="text-white">
                      Eu concordo com os{" "}
                      <Link to={"/"} className="text-purple-500">
                        Termos de Serviço
                      </Link>{" "}
                      e{" "}
                      <Link to={"/"} className="text-purple-500">
                        Política de Privacidade
                      </Link>
                    </span>
                  </Checkbox> */}
                </div>
                <button
                  disabled={!checked}
                  className={`whitespace-nowrap rounded-sm bg-purple-800 px-10 py-2.5 font-semibold uppercase tracking-wider text-slate-50 duration-200 hover:bg-purple-700 ${
                    checked ? "" : "opacity-25"
                  }`}
                >
                  {load ? "Aguarde..." : "Criar conta"}
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-x-2">
                  <div className="w-full bg-white/60" style={{ height: 1.5 }} />
                  <span className="text-white">OU</span>
                  <div className="w-full bg-white/60" style={{ height: 1.5 }} />
                </div>
                <Link
                  to={`/login?${searchParams.toString()}`}
                  className="block w-full border-2 border-dashed border-white/50 px-5 py-2.5 text-center text-white duration-300 hover:bg-white/5"
                >
                  Acesse uma conta existente
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
