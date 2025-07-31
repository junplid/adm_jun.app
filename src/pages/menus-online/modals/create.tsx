import { JSX, useCallback, useMemo, useRef, useState } from "react";
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
import { VariableRow } from "../menu";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextareaAutosize from "react-textarea-autosize";
import { Avatar } from "@components/ui/avatar";
import { MdOutlineImage } from "react-icons/md";
import { useCreateMenuOnline } from "../../../hooks/menu-online";

interface IProps {
  onCreate?(business: VariableRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

const FormSchema = z.object({
  identifier: z.string().min(1, "Campo obrigatório."),
  desc: z.string().optional(),
  img: z.instanceof(File, { message: "Campo obrigatório." }),
});

type Fields = z.infer<typeof FormSchema>;

export function ModalCreateMenuOnline({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    setValue,
    watch,
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const [open, setOpen] = useState(false);
  const imgProfileRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createMenu, isPending } = useCreateMenuOnline({
    setError,
    async onSuccess() {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 220));
    },
  });

  const create = useCallback(async (fields: Fields): Promise<void> => {
    try {
      await createMenu(fields);
      reset();
      // const { businessIds, ...rest } = fields;
      // props.onCreate?.({ ...menu, ...rest });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Error-API", error);
      } else {
        console.log("Error-Client", error);
      }
    }
  }, []);

  const fileImage = watch("img");

  const imgPreviewUrl = useMemo(() => {
    if (fileImage) {
      return URL.createObjectURL(fileImage);
    }
  }, [fileImage]);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      motionPreset="slide-in-bottom"
      lazyMount
      scrollBehavior={"outside"}
      unmountOnExit
      preventScroll
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent
        backdrop
        as={"form"}
        onSubmit={handleSubmit(create)}
        w={"348px"}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Criar cardápio on-line</DialogTitle>
          <DialogDescription>
            Guarde e personalize informações dos seus contatos.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <div className="flex items-center w-full gap-x-4">
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
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setValue("img", file);
                  }}
                />
                <Avatar
                  bg={imgPreviewUrl ? "#fff" : "#ffffff2c"}
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
                label="Nome"
              >
                <Input
                  {...register("identifier")}
                  autoFocus
                  autoComplete="off"
                  placeholder="Digite o nome do cardápio"
                />
              </Field>
            </div>
            <Field
              errorText={errors.desc?.message}
              invalid={!!errors.desc}
              label="Descrição"
            >
              <TextareaAutosize
                placeholder=""
                style={{ resize: "none" }}
                minRows={1}
                maxRows={2}
                className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
                {...register("desc")}
              />
            </Field>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" disabled={isPending} variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" loading={isPending}>
            Criar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
