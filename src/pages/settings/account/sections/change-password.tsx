import { JSX, useContext, useState } from "react";
import { Control, Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@components/ui/field";
import { Button, IconButton, InputGroup, Presence } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { updateAccount } from "../../../../services/api/Account";

const ControllerPassword = (props: {
  control: Control<any>;
  name: string;
  label: string;
}) => {
  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field, fieldState }) => {
        const [show, setShow] = useState(false);

        const realValue = field.value || "";
        const displayValue = show ? realValue : "•".repeat(realValue.length);

        return (
          <Field
            label={props.label}
            invalid={!!fieldState.error}
            errorText={fieldState.error?.message}
          >
            <InputGroup
              endElement={
                <IconButton
                  type="button"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  variant="ghost"
                  size={"xs"}
                  onClick={() => setShow((prev) => !prev)}
                >
                  {show ? (
                    <FiEyeOff className="size-3.5!" />
                  ) : (
                    <FiEye className="size-3.5!" />
                  )}
                </IconButton>
              }
              endElementProps={{ pr: "4px" }}
              paddingEnd={"1px"}
            >
              <Input
                type="text"
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                value={displayValue}
                size={"sm"}
                bg={field.value ? "whiteAlpha.200" : "whiteAlpha.50"}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (show) {
                    field.onChange(inputValue);
                    return;
                  }
                  if (inputValue.length > realValue.length) {
                    const added = inputValue.slice(realValue.length);
                    field.onChange(realValue + added);
                  } else {
                    field.onChange(realValue.slice(0, inputValue.length));
                  }
                }}
                onBlur={field.onBlur}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text");
                  field.onChange(realValue + pasted);
                }}
              />
            </InputGroup>
          </Field>
        );
      }}
    />
  );
};

const FormSchema = z
  .object({
    current: z
      .string({ message: "Campo obrigatório." })
      .min(8, "Preciso ter no mínimo 8 caracteres."),
    new_password: z
      .string({ message: "Campo obrigatório." })
      .min(8, "Preciso ter no mínimo 8 caracteres."),
    repeat_new_password: z
      .string({ message: "Campo obrigatório." })
      .min(8, "Preciso ter no mínimo 8 caracteres."),
  })
  .superRefine((data, ctx) => {
    if (data.new_password !== data.repeat_new_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não coincidem.",
        path: ["new_password"],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não coincidem.",
        path: ["repeat_new_password"],
      });
    }
  });

type Fields = z.infer<typeof FormSchema>;

export const SectionChangePassword = (): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
    setError,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });
  const [success, setSuccess] = useState(false);

  const change = async (fields: Fields) => {
    try {
      await updateAccount({
        newPassword: fields.new_password,
        currentPassword: fields.current,
        repeatNewPassword: fields.repeat_new_password,
      });
      reset({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 7000);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I<
            keyof Fields
          >;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) => {
              setError(path, { message: text });
            });
          }
        }
      }
    }
  };

  return (
    <section className="max-w-md space-y-3">
      <h3 className="text-lg font-bold">Mudar senha</h3>

      <form
        onSubmit={handleSubmit(change)}
        className="flex flex-col items-baseline gap-y-3"
      >
        <input
          type="password"
          name="fake-password"
          autoComplete="new-password2"
          style={{ display: "none" }}
        />

        <ControllerPassword
          control={control}
          label="Senha atual"
          name="current"
        />
        <ControllerPassword
          control={control}
          label="Nova senha"
          name="new_password"
        />
        <ControllerPassword
          control={control}
          label="Digite a senha novamente"
          name="repeat_new_password"
        />

        <div className="flex items-center gap-x-2">
          <Button
            type="submit"
            disabled={!isValid}
            size={"sm"}
            px={6}
            loading={isSubmitting}
            variant={"outline"}
          >
            Salvar
          </Button>
          <Presence
            animationName={{
              _open: "slide-from-top, fade-in",
              _closed: "slide-to-top, fade-out",
            }}
            animationDuration="moderate"
            present={success}
          >
            <span className="text-green-400 text-sm font-semibold">
              Senha alterada!
            </span>
          </Presence>
        </div>
      </form>
    </section>
  );
};
