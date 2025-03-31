import {
  FormControl,
  FormErrorMessage,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { AxiosError } from "axios";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useCookies } from "react-cookie";
import { Business } from "..";
import { AuthorizationContext } from "../../../contexts/authorization.context";
import { api } from "../../../services/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ErrorResponse_I } from "../../../entities/ErrorResponse";
import deepEqual from "fast-deep-equal";
import { ModalFormComponent } from "../../../components/ModalForm";

interface PropsModalEdit {
  id: number;
  setBusiness: Dispatch<SetStateAction<Business[]>>;
  buttonJSX: (open: () => void) => JSX.Element;
}

const FormSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  description: z.string(),
});

type Fields = z.infer<typeof FormSchema>;

interface FieldCreateBusiness {
  name: string;
  description: string;
}

export const ModalEdit: React.FC<PropsModalEdit> = ({
  id,
  ...props
}): JSX.Element => {
  const { handleLogout } = useContext(AuthorizationContext);
  const [cookies] = useCookies(["auth"]);
  const [fieldsGet, setFieldsGet] = useState<FieldCreateBusiness | null>(null);

  const [loadGet, setLoadGet] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    setValue,
    reset,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });

  const edit = useCallback(
    async (fieldss: Fields): Promise<void> => {
      try {
        await toast.promise(
          api.put(`/private/business/${id}`, undefined, {
            headers: { authorization: cookies.auth },
            params: fieldss,
          }),
          {
            success: "Negócio editado com sucesso!",
            pending: "Editando negócio, aguarde...",
          }
        );
        props.setBusiness((business) => {
          return business.map((b) => {
            if (b.id === id) {
              if (fieldss.description) b.description = fieldss.description;
              if (fieldss.name) b.name = fieldss.name;
            }
            return b;
          });
        });
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            handleLogout();
          }
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) {
              dataError.toast.forEach(({ text, ...rest }) => toast(text, rest));
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
    },
    [fieldsGet]
  );

  const fields = watch();

  const isSave: boolean = useMemo(() => {
    return !deepEqual(fieldsGet, fields);
  }, [fields, fieldsGet]);

  return (
    <ModalFormComponent
      onClose={() => reset()}
      buttonJSX={props.buttonJSX}
      title="Editar negócio"
      onSubmit={async (event, closeModal) => {
        await handleSubmit(edit)(event).then(() => {
          closeModal();
        });
      }}
      textButtonSubmit={isSave && !loadGet ? "Editar" : undefined}
      textButtonClose="Cancelar"
      onOpen={async () => {
        try {
          setLoadGet(true);
          const { data } = await api.get(`/private/business/${id}`, {
            headers: { authorization: cookies.auth },
          });
          setFieldsGet({
            description: data.business.description,
            name: data.business.name,
          });
          if (data.business.description) {
            setValue("description", data.business.description);
          }
          setValue("name", data.business.name);
          setLoadGet(false);
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              handleLogout();
            }
          }
          setLoadGet(false);
        }
      }}
    >
      {() => (
        <div className="grid gap-y-4 text-white">
          <FormControl isInvalid={!!errors.name}>
            <Input
              focusBorderColor="#f6bb0b"
              borderColor={"#3c3747"}
              placeholder="Nome do negócio*"
              type="text"
              autoComplete="off"
              {...register("name")}
            />
            <FormErrorMessage mt={"3px"}>
              {errors.name?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <Textarea
              focusBorderColor="#f6bb0b"
              borderColor={"#3c3747"}
              placeholder="Breve descrição do negócio"
              autoComplete="off"
              rows={3}
              resize={"none"}
              {...register("description")}
            />
            <FormErrorMessage mt={"3px"}>
              {errors.description?.message}
            </FormErrorMessage>
          </FormControl>
        </div>
      )}
    </ModalFormComponent>
  );
};
