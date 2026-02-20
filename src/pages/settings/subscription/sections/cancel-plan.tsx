import { JSX, useContext, useState } from "react";
import { Button, IconButton, Input, InputGroup } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@components/ui/field";
import { AuthContext } from "@contexts/auth.context";
import { Control, Controller, useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { closeAccount } from "../../../../services/api/Account";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

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

const FormSchema = z.object({
  password: z.string({ message: "Campo obrigatório." }),
});

type Fields = z.infer<typeof FormSchema>;

export const SectionCancelPlan = (): JSX.Element => {
  const [is, setIs] = useState(false);
  const { logout } = useContext(AuthContext);
  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
    setError,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
  });
  const navigate = useNavigate();

  const closeaccount = async (fields: Fields) => {
    try {
      await closeAccount(fields);
      navigate("/farewell", { replace: true });
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
    <section className="max-w-xl space-y-1">
      <h3 className="text-lg font-bold">Cancelar plano contratado</h3>
      <p className="text-sm text-white/70">
        Ao solicitar o cancelamento, sua assinatura será encerrada e a renovação
        automática será desativada imediatamente. Você continuará com acesso aos
        recursos do plano até o final do período já pago. Após essa data, sua
        conta perderá o acesso as funcionalidades conforme nossos Termos de Uso.
        Caso deseje reativar futuramente, poderá ser aplicado o valor vigente no
        momento da nova contratação.
      </p>
      <p className="text-sm text-white/70">
        Ao solicitar o cancelamento, sua assinatura será encerrada e a renovação
        automática será desativada imediatamente. O reembolso será efetuado e
        sua conta perderá o acesso as funcionalidades conforme nossos Termos de
        Uso. Caso deseje reativar futuramente, poderá ser aplicado o valor
        vigente no momento da nova contratação.
      </p>
      {is && (
        <form
          onSubmit={handleSubmit(closeaccount)}
          className="flex flex-col sm:flex-row items-end gap-x-2.5 mt-3 gap-y-3"
        >
          <input
            type="password"
            name="fake-password"
            autoComplete="new-password2"
            style={{ display: "none" }}
          />
          <ControllerPassword
            control={control}
            label="Senha de acesso"
            name="password"
          />
          <Button
            type="submit"
            size={"sm"}
            px={6}
            disabled={!isValid}
            loading={isSubmitting}
            variant={"outline"}
            colorPalette={"red"}
            className="mt-2"
          >
            Cancelar plano
          </Button>
        </form>
      )}
      {!is && (
        <div className="flex items-end mt-3 flex-col">
          <button
            onClick={() => setIs(true)}
            className="text-sm cursor-pointer underline text-gray-400 hover:text-red-400 transition-colors"
          >
            Cancelar plano
          </button>
        </div>
      )}
    </section>
  );
};
