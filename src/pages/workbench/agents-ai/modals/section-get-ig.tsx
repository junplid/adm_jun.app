import { Input } from "@chakra-ui/react";
import { Field } from "@components/ui/field";
import { useCallback, useContext, useState } from "react";
import { HelperSetupWebhook } from "./helper-webhook-ig";
import { HelperSetupSystemUser } from "./helper-system-token-ig";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../services/api/ErrorResponse";
import { getAccountsIg } from "../../../../services/api/Account";
import { FaCheckCircle, FaInstagram } from "react-icons/fa";
import clsx from "clsx";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { Fields as FCreate } from "./create";

export const FormSchema = z.object({
  access_token: z
    .string({ message: "Campo obrigatório." })
    .min(1, { message: "Campo obrigatório." }),
});

export type Fields = z.infer<typeof FormSchema>;

interface Props {
  onSelectIg(ig_id: string): void;
  control: Control<FCreate>;
}

export function SectionGetIgComponent(props: Props) {
  const { logout } = useContext(AuthContext);
  const [hasAccessToken, setHasAccessToken] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<
    {
      used_by: {
        id: number;
        name: string;
      }[];
      page_id: string;
      page_name: string;
      ig_id: string;
      ig_username: string;
      ig_picture: string;
    }[]
  >([]);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const ig_id = useWatch({
    control: props.control,
    name: "ig_id",
  });

  const getAccounts = useCallback(async (fields: Fields): Promise<void> => {
    try {
      const accountsIg = await getAccountsIg(fields);
      setAccounts(accountsIg);
      reset({});
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.input.length) {
            dataError.input.forEach(({ text, path }) => {
              // @ts-expect-error
              setError?.(path, { message: text });
            });
          }
        }
      }
    }
  }, []);

  if (accounts.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaInstagram className="text-pink-600" /> Selecione o Instagram
        </h2>
        <div className="space-y-3 mb-5 max-h-80 overflow-y-auto pr-2">
          {accounts.map((page) => (
            <div
              key={page.ig_id}
              onClick={() => props.onSelectIg(page.ig_id)}
              className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition-all shadow-md active:scale-95 ${
                ig_id === page.ig_id
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-100/40 bg-white/10 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={page.ig_picture}
                    alt={page.ig_username}
                    className={clsx(
                      ig_id === page.ig_id
                        ? "border-gray-200"
                        : "border-gray-600",
                      "w-12 h-12 rounded-full border",
                    )}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-1 border-2 border-white">
                    <FaInstagram className="text-white text-[8px]" size={14} />
                  </div>
                </div>
                <div>
                  <p
                    className={clsx(
                      ig_id === page.ig_id ? "text-gray-800" : "text-white",
                      "font-semibold ",
                    )}
                  >
                    @{page.ig_username}
                  </p>
                  <p
                    className={clsx(
                      ig_id === page.ig_id ? "text-gray-600" : "text-gray-400",
                      "text-xs",
                    )}
                  >
                    Página: {page.page_name}
                  </p>
                </div>
              </div>

              {ig_id === page.ig_id ? (
                <FaCheckCircle className="text-pink-500 text-xl" />
              ) : (
                <MdOutlineRadioButtonUnchecked className="text-gray-300 text-xl" />
              )}
            </div>
          ))}
        </div>
        <hr className="border-slate-100/10" />
        <div className="mt-4 px-2">
          <p className="mt-4 text-center text-xs leading-relaxed text-slate-400 italic">
            * Caso você não finalize a criação do assistente, todos os dados
            importados nesta sessão serão imediatamente **deletados
            permanentemente** de nossos servidores.
          </p>

          <p className="mt-4 text-center text-xs text-slate-400">
            Após a criação, armazenamos apenas as credenciais estritamente
            necessárias para o gerenciamento da DM, protegida por criptografia
            de nível bancário. Por segurança, não mantemos acesso persistente ao
            seu perfil do Facebook; assim, para gerenciar novas contas no
            futuro, uma nova conexão será solicitada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {hasAccessToken ? (
        <>
          <Field
            errorText={errors.access_token?.message}
            invalid={!!errors.access_token?.message}
            label={"Token Permanente"}
          >
            <Input
              {...register("access_token")}
              placeholder="Cole o token aqui"
            />
          </Field>
          <HelperSetupWebhook
            onGetAccounts={() => handleSubmit(getAccounts)()}
          />
        </>
      ) : (
        <HelperSetupSystemUser
          onHasAccessToken={() => setHasAccessToken(true)}
        />
      )}
    </div>
  );
}
