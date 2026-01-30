import { Button, Input } from "@chakra-ui/react";
import { Field } from "@components/ui/field";
import { AxiosError } from "axios";
import React, { JSX, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { queryClient } from "../../main";
import { registerPushToken } from "../../services/push/registerPush";

const FormSchema = z.object({
  email: z.string().min(1, "Esse campo é obrigatório."),
  password: z.string().min(1, "Esse campo é obrigatório."),
});

type Fields = z.infer<typeof FormSchema>;

export const LoginPage: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorContainer, setErrorContainer] = useState<string | null>(null);

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
      const { status } = await api.post("/public/login-account", fields);
      if (status === 200) {
        await registerPushToken();
        navigate("/auth/dashboard", { replace: true });
      }
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
          if (dataError.container) {
            setErrorContainer(dataError.container);
          }
          if (dataError.toast.length) {
            // dataError.toast.forEach(({ text, ...rest }) => toast(text, rest));
          }
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              setError(path, { message: text }),
            );
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    console.log(document.cookie);
    (async () => {
      await api.post("/private/logout");
      queryClient.clear();
      navigate("/login", { replace: true });
    })();
  }, []);

  return (
    <div className="my-10 flex flex-col gap-y-10 px-3 items-center justify-center w-full h-full">
      <img src="/logo.svg" className="max-w-40" alt="Logo" />
      <div className="min-h-full max-w-80 mx-auto w-full rounded-sm flex-col flex gap-y-3 bg-[#111111] p-6 py-8 shadow-xl">
        <div>
          <h3 className="text-xl font-semibold text-white">Acessar conta</h3>
          {errorContainer && (
            <span className="text-red-400 text-sm">{errorContainer}</span>
          )}
        </div>
        <form
          onSubmit={handleSubmit(login)}
          className="w-full space-y-4 flex flex-col"
        >
          <div className="flex w-full flex-col gap-y-3">
            <Field
              invalid={!!errors.email}
              label="Email"
              errorText={errors.email?.message}
            >
              <Input
                {...register("email")}
                autoComplete="nope"
                type="text"
                placeholder="Email de acesso"
              />
            </Field>

            <Field
              invalid={!!errors.password}
              label="Senha"
              errorText={errors.password?.message}
            >
              <Input
                {...register("password")}
                autoComplete="nope"
                type="password"
                placeholder="Senha de acesso"
              />
            </Field>

            <div className="mt-1 flex justify-end">
              {/* <RecoverPasswordComponent /> */}
            </div>
          </div>
          <Button loadingText="Entrando" loading={isSubmitting} type="submit">
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
  );
};
