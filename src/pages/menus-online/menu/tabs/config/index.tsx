import { useDialogModal } from "../../../../../hooks/dialog.modal";
import { JSX, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Field } from "@components/ui/field";
import { Button, Input } from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import {
  useGetMenuOnline,
  useUpdateMenuOnline,
} from "../../../../../hooks/menu-online";
import TextareaAutosize from "react-textarea-autosize";
import { MdOutlineImage } from "react-icons/md";
import { Avatar } from "@components/ui/avatar";
import { api } from "../../../../../services/api";
import { SectionCategoriesMenuOnlineConfig } from "./categories";
import { ModalEditMenuStatus } from "./modals/update-status";
import SelectConnectionsWA from "@components/SelectConnectionsWA";
import { FormConfigInfoComponent } from "./info";
import { FormConfigOperatingDaysComponent } from "./operating-days";
import { ImageCropModal } from "../items/modals/ImageCropModal";

const FormSchemaConfig = z.object({
  identifier: z
    .string()
    .min(4, { message: "Precisa conter no minimo 4 caracter" }),
  img: z.instanceof(File).optional(),
  titlePage: z.string().nullable(),
  desc: z.string().nullable(),
  bg_primary: z.string().nullable(),
  bg_secondary: z.string().nullable(),
  bg_tertiary: z.string().nullable(),
  bg_capa: z.string().nullable(),
  connectionWAId: z.number({ message: "Conexão é obrigatória!" }),
});

type ConfigFields = z.infer<typeof FormSchemaConfig>;

function FormConfigComponent({ uuid }: { uuid: string }) {
  const { data, isError, isFetching, isLoading } = useGetMenuOnline({ uuid });
  const imgProfileRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    reset,
    watch,
    setError,
    setValue,
    control,
  } = useForm<ConfigFields>({
    resolver: zodResolver(FormSchemaConfig),
  });
  const { mutateAsync: updateMenu, isPending } = useUpdateMenuOnline({
    setError,
  });
  const edit = useCallback(async (fields: ConfigFields): Promise<void> => {
    if (!data?.id) return;
    try {
      await updateMenu({ id: data.id, body: fields });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  useEffect(() => {
    if (data) {
      const {
        helperTextOpening,
        statusMenu,
        info,
        statusNow,
        id,
        uuid,
        ...restD
      } = data;
      reset({ ...restD, bg_capa: "#e5e5e5" });
    }
  }, [data]);

  const fileImage = watch("img");
  const bg_primary = watch("bg_primary");

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) return URL.createObjectURL(fileImage);
    if (data?.logoImg) return api.getUri() + `/public/images/${data?.logoImg}`;
  }, [fileImage, data?.logoImg]);

  return (
    <form
      onSubmit={handleSubmit(edit)}
      className="flex flex-col gap-y-2 px-1.5"
    >
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onFinish={(file: any) => {
            setValue(`img`, file, { shouldDirty: true })
            setCropFile(null);
          }}
        />
      )}

      <Field
        errorText={errors.titlePage?.message}
        invalid={!!errors.titlePage}
        label="Título da página"
        disabled={isFetching || isLoading || isError}
      >
        <Input {...register("titlePage")} autoComplete="off" />
      </Field>

      <div className="flex items-center w-full gap-x-2">
        <div
          className="relative cursor-pointer border-2 p-0.5"
          onClick={() => imgProfileRef.current?.click()}
          style={{
            borderColor: !!errors.img ? "#e77171" : "transparent",
          }}
        >
          <input
            type="file"
            ref={imgProfileRef}
            hidden
            className="hidden"
            max={1}
            accept="image/jpeg, image/png, image/jpg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setCropFile(file);
            }}

          />
          <Avatar
            bg={imgPreviewUrl ? bg_primary || "#fff" : "#ffffff2c"}
            size={"2xl"}
            width={"60px"}
            height={"60px"}
            src={imgPreviewUrl}
            icon={<MdOutlineImage />}
            rounded={"none"}
          />
        </div>
        <Field
          errorText={errors.identifier?.message}
          invalid={!!errors.identifier}
          label="Identificador único"
          disabled={isFetching || isLoading || isError}
        >
          <Input
            {...register("identifier")}
            autoComplete="off"
            placeholder="Digite o identificador do cardápio"
          />
        </Field>
      </div>




      <Field
        errorText={errors.desc?.message}
        invalid={!!errors.desc}
        label="Descrição"
        disabled={isFetching || isLoading || isError}
      >
        <TextareaAutosize
          placeholder=""
          style={{ resize: "none" }}
          minRows={1}
          maxRows={2}
          className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
          {...register("desc")}
        />
      </Field>

      <div className="flex items-center w-full gap-x-2">
        <Field
          errorText={errors.bg_capa?.message}
          invalid={!!errors.bg_capa}
          label="Cor da capa"
          disabled={isFetching || isLoading || isError}
        >
          <Input  {...register("bg_capa")} autoComplete="off" />
        </Field>
        <Field
          errorText={errors.bg_primary?.message}
          invalid={!!errors.bg_primary}
          label="BG Primária"
          disabled={isFetching || isLoading || isError}
        >
          <Input {...register("bg_primary")} autoComplete="off" />
        </Field>
        <Field
          errorText={errors.bg_secondary?.message}
          invalid={!!errors.bg_secondary}
          label="Cor Secundária"
          disabled={isFetching || isLoading || isError}
        >
          <Input {...register("bg_secondary")} autoComplete="off" />
        </Field>

        <Field
          errorText={errors.bg_tertiary?.message}
          invalid={!!errors.bg_tertiary}
          label="Cor terciária"
          disabled={isFetching || isLoading || isError}
        >
          <Input {...register("bg_tertiary")} autoComplete="off" />
        </Field>
      </div>

      <Controller
        name="connectionWAId"
        control={control}
        render={({ field }) => (
          <Field
            errorText={errors.connectionWAId?.message}
            invalid={!!errors.connectionWAId}
            label="Conexão WhatsApp"
            helperText={
              'Ao finalizar o pedido, o usuário será redirecionado para o número de WhatsApp configurado nesta conexão ou para o WhatsApp definido em “Informações da Loja > Contato WhatsApp”, com a mensagem automática: “Confirmando meu pedido #99999”. Você poderá capturar o código do pedido presente na mensagem para utilizá-lo em sua automação.'
            }
          >
            <SelectConnectionsWA
              name={field.name}
              isMulti={false}
              isSearchable={false}
              onBlur={field.onBlur}
              onChange={(e: any) => field.onChange(e?.value || null)}
              value={field.value}
            />
          </Field>
        )}
      />
      <div className="flex gap-x-1.5 ml-auto mt-3">
        <Button
          type="button"
          disabled={isPending || !isDirty}
          variant="outline"
        >
          Cancelar
        </Button>
        <Button type="submit" loading={isPending} disabled={!isDirty}>
          Atualizar
        </Button>
      </div>
    </form>
  );
}

const TabConfig_ = ({ uuid }: { uuid: string }): JSX.Element => {
  const { data } = useGetMenuOnline({
    uuid,
  });

  const {
    dialog: DialogModal,
    close: _close,
    onOpen: onOpen,
  } = useDialogModal({});

  return (
    <div className="flex-1 pt-0! px-2 flex flex-col scroll-auto overflow-y-scroll h-[calc(100svh-250px)] gap-x-2">
      <section className="space-y-3">
        <h3 className="text-lg font-bold">Configurações de site</h3>
        <FormConfigComponent uuid={uuid} />
      </section>
      <hr className="text-neutral-600 my-10" />

      <section className="space-y-3">
        <h3 className="text-lg font-bold">Informações da Loja</h3>
        <FormConfigInfoComponent uuid={uuid} />
      </section>
      <hr className="text-neutral-600 my-10" />
      <section className="space-y-3">
        <h3 className="text-lg font-bold">Dias de funcionamento</h3>
        <FormConfigOperatingDaysComponent uuid={uuid} />
      </section>



      <hr className="text-neutral-600 my-10" />
      <SectionCategoriesMenuOnlineConfig bg_primary="" />
      <hr className="text-neutral-600 my-10" />

      <div className="flex flex-col items-baseline mb-1.5">
        <Button
          size={"2xs"}
          px={4}
          colorPalette={data?.statusMenu ? "red" : "green"}
          onClick={() => {
            onOpen({
              size: "sm",
              content: (
                <ModalEditMenuStatus
                  close={_close}
                  status={!data?.statusMenu}
                  uuid={uuid}
                />
              ),
            });
          }}
        >
          {data?.statusMenu ? "Desativar cardápio" : "Ativar cardápio"}
        </Button>
      </div>

      {DialogModal}
    </div>
  );
};

export const TabConfig = memo(TabConfig_);
