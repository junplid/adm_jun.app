import { Button, Field, Input } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React, { JSX, useCallback, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import { api } from "../../services/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";

const FormSchema = z.object({
  email: z.string().min(1, "Esse campo é obrigatório."),
  password: z.string().min(1, "Esse campo é obrigatório."),
});

type Fields = z.infer<typeof FormSchema>;

export const LoginPage: React.FC = (): JSX.Element => {
  const [_, setCookies, removeCookie] = useCookies(["auth"]);
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

  const login = useCallback(async (fields: any) => {
    try {
      const { data } = await api.post("/public/login-account", fields);
      setCookies("auth", `BEARER ${data.token}`, {
        expires: moment().add(3, "year").toDate(),
      });
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

  useEffect(() => {
    removeCookie("auth");
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
              Acessar conta
            </h3>
            <form
              onSubmit={handleSubmit(login)}
              className="w-full space-y-4 flex flex-col"
            >
              <div className="flex w-full flex-col gap-y-3">
                <Field.Root autoCorrect="off" invalid={!!errors.email}>
                  <Field.Label>Email</Field.Label>
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
                  <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>

                <div className="mt-1 flex justify-end">
                  {/* <RecoverPasswordComponent /> */}
                </div>
              </div>
              <Button
                loadingText="Entrando"
                loading={isSubmitting}
                type="submit"
              >
                Entrar
              </Button>
            </form>
            <Button
              variant={"outline"}
              borderStyle={"dashed"}
              borderWidth={"2px"}
              as={Link}
              // @ts-expect-error
              to={`/signup?${searchParams.toString()}`}
              className="w-full"
            >
              Criar conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
