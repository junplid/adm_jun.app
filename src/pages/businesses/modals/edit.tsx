import { Button, Input, VStack } from "@chakra-ui/react";
import { AxiosError } from "axios";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
  JSX,
  useEffect,
} from "react";
import { useCookies } from "react-cookie";
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
import { api } from "../../../services/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import deepEqual from "fast-deep-equal";
import { Field } from "@components/ui/field";
import TextareaAutosize from "react-textarea-autosize";
import { BusinessRow } from "..";
import { AuthContext } from "@contexts/auth.context";
import { CloseButton } from "@components/ui/close-button";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";

interface PropsModalEdit {
  id: number;
  setBusinesses: Dispatch<SetStateAction<BusinessRow[]>>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  name: z
    .string()
    .min(1, "Campo obrigatório.")
    .transform((value) => value.trim() || undefined),
  description: z.string().nullable(),
});

type Fields = z.infer<typeof FormSchema>;

interface FieldCreateBusiness {
  name: string;
  description: string;
}

export const ModalEditBusiness: React.FC<PropsModalEdit> = ({
  id,
  placement = "bottom",
  ...props
}): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const [cookies] = useCookies(["auth"]);
  const [fieldsDraft, setFieldsDraft] = useState<FieldCreateBusiness | null>(
    null
  );

  const [load, setLoad] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    reset,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const edit = useCallback(
    async (fieldss: Fields): Promise<void> => {
      try {
        await api.put(`/private/businesses/${id}`, undefined, {
          headers: { authorization: cookies.auth },
          params: fieldss,
        });
        await new Promise((resolve) => setTimeout(resolve, 220));
        props.setBusinesses((business) => {
          return business.map((b) => {
            if (b.id === id) {
              if (fieldss.name) b.name = fieldss.name;
            }
            return b;
          });
        });
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
    },
    [fieldsDraft]
  );

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        reset();
        setLoad(false);
        setFieldsDraft(null);
      }, 250);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/private/businesses/${id}`);
        setFieldsDraft(data.business);
        setValue("name", data.business.name);
        setValue("description", data.business.description);
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

  const fields = watch();
  const isSave: boolean = useMemo(() => {
    return !deepEqual(fieldsDraft, fields);
  }, [fields, fieldsDraft]);

  console.log({ fields, fieldsDraft });

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement={placement}
      motionPreset="slide-in-bottom"
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent as={"form"} onSubmit={handleSubmit(edit)} w={"470px"}>
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Editar empresa</DialogTitle>
          <DialogDescription>
            Edite as informações do seu workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <Field
              errorText={errors.name?.message}
              invalid={!!errors.name}
              label="Identificador"
            >
              <Input
                {...register("name")}
                autoComplete="off"
                placeholder="Digite o nome da empresa"
              />
            </Field>
            <Field
              errorText={errors.description?.message}
              invalid={!!errors.description}
              label="Descrição"
            >
              <TextareaAutosize
                placeholder=""
                style={{ resize: "none" }}
                minRows={3}
                maxRows={10}
                className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                {...register("description")}
              />
            </Field>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button
            type="submit"
            colorPalette={"teal"}
            disabled={!isSave || !load}
            loading={isSubmitting}
          >
            Salvar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
};
