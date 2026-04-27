import { useDialogModal } from "../../../../../hooks/dialog.modal";
import {
  JSX,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Field } from "@components/ui/field";
import { Button, Input, Switch } from "@chakra-ui/react";
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
import { SectionPairCodeAgentMenuOnlineConfig } from "./pair-code-app";
import clsx from "clsx";

const FormSchemaConfig = z.object({
  identifier: z
    .string()
    .min(4, { message: "Precisa conter no minimo 4 caracter" }),
  img: z.instanceof(File).optional(),
  capaimg: z.instanceof(File).optional(),
  titlePage: z.string().nullable(),
  desc: z.string().nullable(),
  bg_primary: z.string().nullable(),
  bg_secondary: z.string().nullable(),
  bg_tertiary: z.string().nullable(),
  bg_capa: z.string().nullable(),
  connectionWAId: z.number({ message: "Conexão é obrigatória!" }),
  is_accepting_motoboys: z.boolean(),
});

type ConfigFields = z.infer<typeof FormSchemaConfig>;

function FormConfigComponent({ uuid }: { uuid: string }) {
  const { data, isError, isFetching, isLoading } = useGetMenuOnline({ uuid });
  const imgProfileRef = useRef<HTMLInputElement>(null);
  const imgCapaRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<{
    file: File;
    name: "img" | "capaimg";
  } | null>(null);

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
      reset(restD);
    }
  }, [data]);

  const fileImage = watch("img");
  const filecapaImage = watch("capaimg");
  const bg_primary = watch("bg_primary");

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) return URL.createObjectURL(fileImage);
    if (data?.logoImg) return api.getUri() + `/public/images/${data?.logoImg}`;
  }, [fileImage, data?.logoImg]);

  const imgcapaPreviewUrl = useMemo(() => {
    if (filecapaImage) return URL.createObjectURL(filecapaImage);
    if (data?.capaImg) return api.getUri() + `/public/images/${data?.capaImg}`;
  }, [filecapaImage, data?.capaImg]);

  return (
    <form
      onSubmit={handleSubmit(edit)}
      className="flex flex-col gap-y-2 px-1.5"
    >
      {cropFile && cropFile.name === "capaimg" && (
        <ImageCropModal
          file={cropFile.file}
          aspect={700 / 200}
          outputWidth={700}
          outputHeight={200}
          onFinish={(file: any) => {
            setValue(cropFile.name, file, { shouldDirty: true });
            setCropFile(null);
          }}
        />
      )}

      {cropFile && cropFile.name === "img" && (
        <ImageCropModal
          file={cropFile.file}
          aspect={1 / 1}
          outputWidth={400}
          outputHeight={400}
          onFinish={(file: any) => {
            setValue(cropFile.name, file, { shouldDirty: true });
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

      <Field
        errorText={errors.titlePage?.message}
        invalid={!!errors.titlePage}
        label="Capa imagem"
        disabled={isFetching || isLoading || isError}
      >
        <div
          className="relative cursor-pointer border-2 p-0.5"
          onClick={() => imgCapaRef.current?.click()}
          style={{
            borderColor: !!errors.capaimg ? "#e77171" : "transparent",
          }}
        >
          <input
            type="file"
            ref={imgCapaRef}
            hidden
            className="hidden"
            max={1}
            accept="image/jpeg, image/png, image/jpg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setCropFile({ file, name: "capaimg" });
            }}
          />
          {!imgcapaPreviewUrl && (
            <button className="bg-white/20">Adicionar imagem</button>
          )}
          {imgcapaPreviewUrl && (
            <img
              src={imgcapaPreviewUrl}
              alt=""
              className="max-w-175 w-full h-auto object-center"
            />
          )}
        </div>
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

              setCropFile({ file, name: "img" });
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
          <Input {...register("bg_capa")} autoComplete="off" />
        </Field>
        {/* <Field
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
        </Field> */}
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
              "Ao finalizar o pedido, o usuário será redirecionado para o número de WhatsApp configurado nesta conexão ou para o WhatsApp definido em “Informações da Loja > Contato WhatsApp”, com a mensagem automática: “Confirmando meu pedido #99999”. Você poderá capturar o código do pedido presente na mensagem para utilizá-lo em sua automação."
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

      <Controller
        name={`is_accepting_motoboys`}
        control={control}
        render={({ field }) => (
          <Switch.Root
            checked={!!field.value}
            onCheckedChange={(e) => field.onChange(Number(e.checked))}
            className="flex flex-col space-y-2.5"
          >
            <Switch.Label>Aceita novos motoboys?</Switch.Label>
            <Switch.HiddenInput />
            <Switch.Control
              className={clsx(field.value ? "bg-blue-300!" : "bg-red-400!")}
            />
          </Switch.Root>
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
      <SectionPairCodeAgentMenuOnlineConfig
        status_device={!!data?.status_device}
      />
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
