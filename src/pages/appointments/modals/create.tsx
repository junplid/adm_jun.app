import { JSX, useCallback, useContext, useState } from "react";
import { Button, Input } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@components/ui/dialog";
import { Field } from "@components/ui/field";
import TextareaAutosize from "react-textarea-autosize";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAppointment } from "../../../services/api/Appointments";
import { useHookFormMask } from "use-mask-input";
import moment from "moment";
import clsx from "clsx";
import { Appointment } from "..";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { toast } from "sonner";
import { SocketContext } from "@contexts/socket.context";

interface IProps {
  onCreate(appointment: Appointment): void;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

// const optionsStatus: { label: string; value: TypeStatusAppointment }[] = [
//   // { label: "Sugerido", value: "suggested" },
//   // { label: "Agendado", value: "pending_confirmation" },
//   { label: "Confirmado", value: "confirmed" },
//   { label: "Concluído", value: "completed" },
//   // { label: "Cancelado", value: "canceled" },
// ];

const endAtSchema = z.enum([
  "10min",
  "30min",
  "1h",
  "1h e 30min",
  "2h",
  "3h",
  "4h",
  "5h",
  "10h",
  "15h",
  "1d",
  "2d",
]);

const FormSchema = z.object({
  title: z.string().min(1, "Campo obrigatório."),
  desc: z.string().transform((value) => value.trim() || undefined),
  dateStartAt: z.string().min(1, "A data é obrigatória."),
  timeStartAt: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Hora inválida (use HH:mm no formato 24h)",
    ),
  endAt: endAtSchema,
});

type Fields = z.infer<typeof FormSchema>;

function Content(props: {
  onCreate(appointment: Appointment): void;
  onClose(): void;
}) {
  const {
    logout,
    clientMeta: { isMobileLike },
  } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    reset,
    setValue,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
    async defaultValues() {
      const momento = moment();
      return {
        dateStartAt: momento.format("YYYY-MM-DD"),
        timeStartAt: momento.format("HH:mm"),
        endAt: "1h",
        title: "",
      };
    },
  });
  const endAt = watch("endAt");

  const registerWithMask = useHookFormMask(register);

  const create = useCallback(
    async (fields: Fields): Promise<void> => {
      try {
        const appointment = await createAppointment({
          ...fields,
          socketIgnore: socket.id,
        });
        reset();
        props.onCreate?.({
          title: fields.title,
          channel: null,
          desc: null,
          ...appointment,
        });
        const toastId = toast(
          <div
            onClick={() => toast.dismiss(toastId)}
            className="border-0 w-56 jusce"
          >
            <div className="p-2 bg-zinc-300 select-none w-full mx-auto items-center border border-white rounded-sm flex gap-x-2 text-neutral-800">
              <div className="h-4 w-4 rounded-full bg-green-300"></div>
              <span className="text-xs">Adicionado com sucesso</span>
            </div>
          </div>,
          {
            classNames: {
              default: "border-0!",
              content: "w-full border-0! flex items-center justify-center",
            },
            duration: 1000 * 2,
            unstyled: true,
            ...(isMobileLike && { style: { bottom: 70 } }),
          },
        );
        props.onClose();
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) logout();
            if (error.response?.status === 400) {
              const dataError = error.response?.data as ErrorResponse_I;
              if (dataError.toast.length)
                dataError.toast.forEach(toaster.create);
              if (dataError.input.length) {
                dataError.input.forEach(({ text, path }) =>
                  // @ts-expect-error
                  setError(path, { message: text }),
                );
              }
            }
          }
        }
      }
    },
    [socket.id],
  );

  return (
    <DialogBody p={2}>
      <form onSubmit={handleSubmit(create)} className="flex flex-col gap-y-3">
        <Field
          errorText={errors.title?.message}
          invalid={!!errors.title}
          label="Título do agendamento"
        >
          <Input {...register("title")} autoComplete="off" size={"sm"} />
        </Field>
        <Field
          errorText={errors.desc?.message}
          invalid={!!errors.desc}
          label="Descrição"
        >
          <TextareaAutosize
            placeholder=""
            style={{ resize: "none" }}
            minRows={2}
            maxRows={4}
            className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
            {...register("desc")}
          />
        </Field>
        <div className="flex flex-col">
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-x-2 justify-between mb-1">
              <span>Começa</span>
              <div className="grid w-full grid-cols-[70px_1fr] items-end gap-x-2">
                <Field invalid={!!errors.timeStartAt}>
                  <Input
                    size={"sm"}
                    {...registerWithMask("timeStartAt", "99:99")}
                    placeholder="HH:mm"
                  />
                </Field>
                <Field invalid={!!errors.dateStartAt}>
                  <Input
                    type="date"
                    size={"sm"}
                    {...register("dateStartAt")}
                    min={moment().format("YYYY-MM-DD")}
                  />
                </Field>
              </div>
            </div>
            {!!errors.timeStartAt && (
              <span className="text-xs block text-center w-full text-red-400">
                {errors.timeStartAt.message}
              </span>
            )}
            {!!errors.dateStartAt && (
              <span className="text-xs block text-center w-full text-red-400">
                {errors.dateStartAt.message}
              </span>
            )}
          </div>

          {/* {customEndAt ? (
                <div className="flex flex-col">
                  <span>
                    Termina{" "}
                    <span className="text-xs text-neutral-400">
                      (Em 1 hora)
                    </span>
                  </span>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-[70px_1fr] items-end gap-x-2 mb-1">
                      <Field invalid={!!errors.timeEndAt}>
                        <Input
                          size={"sm"}
                          {...registerWithMask("timeEndAt", "99:99")}
                          placeholder="HH:mm"
                        />
                      </Field>
                      <Field invalid={!!errors.dateEndAt}>
                        <Input
                          type="date"
                          size={"sm"}
                          {...register("dateEndAt")}
                          min={moment().format("YYYY-MM-DD")}
                        />
                      </Field>
                    </div>
                    {!!errors.timeEndAt && (
                      <span className="text-xs block text-center w-full text-red-400">
                        {errors.timeEndAt.message}
                      </span>
                    )}
                    {!!errors.dateEndAt && (
                      <span className="text-xs block text-center w-full text-red-400">
                        {errors.dateEndAt.message}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
              )} */}
          <div className="flex flex-col gap-y-1 mt-1">
            <span className="block">Termina em</span>
            <div className="grid w-full grid-cols-4 gap-1.5">
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "10min"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "10min")}
              >
                10 min
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "30min"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "30min")}
              >
                30 min
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "1h"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "1h")}
              >
                1h
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "1h e 30min"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "1h e 30min")}
              >
                1h e meia
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "2h"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "2h")}
              >
                2 horas
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "3h"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "3h")}
              >
                3 horas
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "4h"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "4h")}
              >
                4 horas
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "5h"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "5h")}
              >
                5 horas
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "10h"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "10h")}
              >
                10 horas
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "15h"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "15h")}
              >
                15 horas
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "1d"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "1d")}
              >
                1 dia
              </button>
              <button
                type="button"
                className={clsx(
                  "cursor-pointer font-light p-1 rounded-sm",
                  endAt === "2d"
                    ? "text-white bg-neutral-700/60"
                    : "text-neutral-400 bg-neutral-700/10",
                )}
                onClick={() => setValue("endAt", "2d")}
              >
                2 dias
              </button>
            </div>
          </div>
        </div>

        {/* <Field
              label="Situação"
              // errorText={errors.status?.message}
              // invalid={!!errors.status}
            >
              <Controller
                name={`name`}
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    className="-mt-0.5"
                    isClearable
                    placeholder="Selecione o status"
                    value={
                      optionsStatus.find((dd) => dd.value === field.value) ||
                      null
                    }
                    ref={field.ref}
                    isSearchable={false}
                    name={field.name}
                    isMulti={false}
                    onChange={(p: any) => field.onChange(p?.value || undefined)}
                    options={optionsStatus}
                  />
                )}
              />
            </Field> */}

        <div className="flex justify-end gap-x-2 mt-3">
          <Button
            type="button"
            onClick={props.onClose}
            // disabled={isEditing}
            size={"sm"}
            variant="ghost"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size={"sm"}
            colorPalette={"teal"}
            // disabled={!isDirty}
            // loading={isEditing}
          >
            Salvar
          </Button>
        </div>
      </form>
    </DialogBody>
  );
}

export function ModalCreateAppointment({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement={placement}
      motionPreset="slide-in-top"
      lazyMount
      unmountOnExit
    >
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent mx={3} w={"370px"} p={2}>
        <DialogHeader p={2} flexDirection={"column"} gap={0}>
          <DialogTitle>Adicionar compromisso</DialogTitle>
        </DialogHeader>
        <Content onCreate={props.onCreate} onClose={() => setOpen(false)} />
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
