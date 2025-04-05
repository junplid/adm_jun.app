import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, Input, VStack } from "@chakra-ui/react";
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
import { FlowRow } from "..";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toaster } from "@components/ui/toaster";
import { AuthContext } from "@contexts/auth.context";
import { createFlow } from "../../../services/api/Flows";
import { getOptionsBusinesses } from "../../../services/api/Business";
import SelectComponent from "@components/Select";

interface IProps {
  onCreate(business: FlowRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório."),
  type: z.enum(["marketing", "chatbot", "universal"], {
    message: "Campo obrigatório.",
  }),
  businessIds: z.array(z.number()),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateBusiness({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const { logout } = useContext(AuthContext);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: "chatbot",
    },
  });

  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  const canTriggerCreate = useRef(null);

  const [optBusinesses, setOptBusinesses] = useState<
    { name: string; id: number }[]
  >([]);

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const flow = await createFlow(fields);
      const { name } = fields;
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
      reset();
      props.onCreate({ ...flow, name, type: fields.type });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
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
    if (!open) {
      setTimeout(() => {
        setLoad(false);
        setOptBusinesses([]);
      }, 250);
      return;
    }
    (async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 220));
        const opts = await getOptionsBusinesses({});
        setOptBusinesses(opts);
        setLoad(true);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError(path, { message: text })
              );
            }
          }
        }
      }
    })();
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // if (canTriggerCreate.current && e.ctrlKey && e.key === "Enter") {
      //   e.preventDefault();
      //   alert("Criar empresa completa");
      //   return;
      // }
      if (canTriggerCreate.current && e.key === "Enter") {
        e.preventDefault();
        alert("Criar empresa rápida");
        return;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement={placement}
      motionPreset="slide-in-bottom"
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent as={"form"} onSubmit={handleSubmit(create)} w={"470px"}>
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar construtor de fluxo</DialogTitle>
          <DialogDescription>
            Imagine e construa fluxos de conversa de forma visual e intuitiva.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field
              label="Anexar empresas"
              required
              buttonInBottom={<span>Criar uma nova empresa?</span>}
              className="w-full"
            >
              <SelectComponent
                isMulti
                placeholder={"Selecione as empresas"}
                options={[]}
                value={{
                  label: "EMPRESA 2",
                  value: "as2",
                }}
                noOptionsMessage={({ inputValue }) => {
                  return (
                    <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
                      <span className="text-white/60">
                        Nenhuma empresa {inputValue && `"${inputValue}"`}{" "}
                        encontrada
                      </span>
                      {!inputValue && (
                        <span className="text-sm text-white/80">
                          Digite o nome da empresa que quer adicionar
                        </span>
                      )}
                      {inputValue && (
                        <div
                          ref={canTriggerCreate}
                          className="flex flex-col gap-1 items-center"
                        >
                          <a className="text-xs">
                            <strong className="text-white/80">ENTER</strong>{" "}
                            para adicionar rapidamente
                          </a>
                          {/* <a className="text-xs">
                            <strong className="text-white/80">CTRL</strong> +{" "}
                            <strong className="text-white/80">ENTER</strong>{" "}
                            para adição completa
                          </a> */}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </Field>
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Nome"
            >
              <Input
                {...register("name")}
                autoComplete="off"
                autoFocus
                placeholder="Digite o nome do construtor"
              />
            </Field>
            {/* 
            o tipo padrão atualmente é apenas chatbot, mas futuramente
            será adicionado o tipo marketing e universal
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Tipo do fluxo"
              helperText="Se nenhum tipo for selecionado, o construtor será considerado <Mark>universal</Mark> e estará disponível para todos"
            >
              <Input
                {...register("name")}
                autoComplete="off"
                autoFocus
                placeholder="Digite o nome do construtor"
              />
            </Field> */}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button type="submit" loading={isSubmitting}>
            Criar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
