import moment from "moment";
import { FC, JSX, useContext, useEffect, useState } from "react";
import { Button, Input, Spinner } from "@chakra-ui/react";
import { PopoverBody } from "@components/ui/popover";
import {
  AppointmentDetails,
  deleteAppointment,
  getAppointmentDetails,
  // TypeStatusAppointment,
  updateAppointment,
} from "../../../services/api/Appointments";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { ImConnection } from "react-icons/im";
import {
  MdDeleteOutline,
  MdEdit,
  MdSignalWifiConnectedNoInternet0,
  MdSupportAgent,
} from "react-icons/md";
import { BiTimeFive, BiUserCircle } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@components/ui/field";
import TextareaAutosize from "react-textarea-autosize";
import { useHookFormMask } from "use-mask-input";
import clsx from "clsx";
import { IoClose } from "react-icons/io5";
import { SocketContext } from "@contexts/socket.context";
// import SelectComponent from "@components/Select";

interface IProps {
  id: number;
  close: () => void;
  closeAndOpenTicket(id: number): void;
  closeAndDelete(id: number): void;
}

// const optionsStatus: { label: string; value: TypeStatusAppointment }[] = [
//   // { label: "Sugerido", value: "suggested" },
//   { label: "Agendado", value: "pending_confirmation" },
//   { label: "Confirmado", value: "confirmed" },
//   { label: "Concluído", value: "completed" },
//   { label: "Cancelado", value: "canceled" },
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

type EndAtType = z.infer<typeof endAtSchema>;

const FormSchema = z.object({
  title: z.string().min(1, "Campo obrigatório."),
  desc: z.string().transform((value) => value.trim() || undefined),
  dateAt: z.string().min(1, "Campo obrigatório."),
  // status: z.enum(
  //   [
  //     "confirmed",
  //     "completed",
  //     "pending_confirmation",
  //     "canceled",
  //     "suggested",
  //     "expired",
  //   ],
  //   { message: "Campo obrigatório." }
  // ),
  timeAt: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Hora inválida (use HH:mm no formato 24h)",
    ),
  endAt: endAtSchema,
});

type Fields = z.infer<typeof FormSchema>;

const EditForm: FC<
  Omit<Fields, "endAt"> & {
    endAt: Date;
    update: (f: Fields) => Promise<void>;
    cancel: () => void;
    isEditing: boolean;
  }
> = ({ update, isEditing, cancel, ...values }) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    setValue,
    reset,
    watch,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });
  const endAt = watch("endAt");
  const registerWithMask = useHookFormMask(register);

  useEffect(() => {
    const start = moment(
      `${values.dateAt} ${values.timeAt}`,
      "YYYY-MM-DD HH:mm",
    );
    const end = moment(values.endAt);
    let endAt: EndAtType = "1h";
    const diffMinutes = end.diff(start, "minutes");
    if (diffMinutes === 10) {
      endAt = "10min";
    } else if (diffMinutes === 30) {
      endAt = "30min";
    } else if (diffMinutes === 60) {
      endAt = "1h";
    } else if (diffMinutes === 90) {
      endAt = "1h e 30min";
    } else if (diffMinutes === 120) {
      endAt = "2h";
    } else if (diffMinutes === 180) {
      endAt = "3h";
    } else if (diffMinutes === 240) {
      endAt = "4h";
    } else if (diffMinutes === 300) {
      endAt = "5h";
    } else if (diffMinutes === 600) {
      endAt = "10h";
    } else if (diffMinutes === 900) {
      endAt = "15h";
    } else if (diffMinutes === 1440) {
      endAt = "1d";
    } else if (diffMinutes === 2880) {
      endAt = "2d";
    }
    reset({ ...values, endAt });
  }, []);

  return (
    <form onSubmit={handleSubmit(update)} className="flex flex-col gap-y-3">
      <Field
        errorText={errors.title?.message}
        invalid={!!errors.title}
        label="Título do agendamento"
      >
        <Input
          {...register("title")}
          autoComplete="off"
          size={"sm"}
          placeholder="Digite o título do agendamento"
        />
      </Field>
      <Field
        errorText={errors.desc?.message}
        invalid={!!errors.desc}
        label="Descrição"
      >
        <TextareaAutosize
          placeholder=""
          style={{ resize: "none" }}
          minRows={4}
          maxRows={10}
          className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
          {...register("desc")}
        />
      </Field>
      <div className="flex flex-col">
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2 justify-between mb-1">
            <span>Começa</span>
            <div className="grid grid-cols-[70px_1fr] w-full items-end gap-x-2 mb-1">
              <Field invalid={!!errors.timeAt}>
                <Input
                  size={"sm"}
                  {...registerWithMask("timeAt", "99:99")}
                  placeholder="HH:mm"
                />
              </Field>
              <Field invalid={!!errors.dateAt}>
                <Input
                  type="date"
                  size={"sm"}
                  {...register("dateAt")}
                  min={moment().format("YYYY-MM-DD")}
                />
              </Field>
            </div>
          </div>
          {!!errors.timeAt && (
            <span className="text-xs block text-center w-full text-red-400">
              {errors.timeAt.message}
            </span>
          )}
          {!!errors.dateAt && (
            <span className="text-xs block text-center w-full text-red-400">
              {errors.dateAt.message}
            </span>
          )}
        </div>
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
              onClick={() => setValue("endAt", "10min", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "30min", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "1h", { shouldDirty: true })}
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
              onClick={() =>
                setValue("endAt", "1h e 30min", { shouldDirty: true })
              }
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
              onClick={() => setValue("endAt", "2h", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "3h", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "4h", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "5h", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "10h", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "15h", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "1d", { shouldDirty: true })}
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
              onClick={() => setValue("endAt", "2d", { shouldDirty: true })}
            >
              2 dias
            </button>
          </div>
        </div>
      </div>

      {/* <Field
        label="Situação"
        errorText={errors.status?.message}
        invalid={!!errors.status}
      >
        <Controller
          name={`status`}
          control={control}
          render={({ field }) => (
            <SelectComponent
              isClearable={false}
              value={
                field?.value
                  ? {
                      label:
                        optionsStatus.find((dd) => dd.value === field.value)
                          ?.label ?? "",
                      value: field.value,
                    }
                  : null
              }
              ref={field.ref}
              name={field.name}
              isMulti={false}
              onChange={(p: any) => field.onChange(p.value)}
              options={optionsStatus}
            />
          )}
        />
      </Field> */}

      <div className="flex justify-end gap-x-2 mt-3">
        <Button
          type="button"
          onClick={cancel}
          size={"sm"}
          disabled={isEditing}
          variant="ghost"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size={"sm"}
          colorPalette={"teal"}
          disabled={!isDirty}
          loading={isEditing}
        >
          Salvar
        </Button>
      </div>
    </form>
  );
};

interface DelProps {
  onGoBack(): void;
  onDelete(): void;
  id: number;
}
function ContentDelete(props: DelProps) {
  const { logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [message, setMessage] = useState("");
  const [load, setLoad] = useState(false);

  const onDelete = async () => {
    try {
      setLoad(true);
      await deleteAppointment(props.id, { socketIgnore: socket.id, message });
      setMessage("");
      props.onDelete();
      setLoad(false);
    } catch (error) {
      setLoad(false);
      if (error instanceof AxiosError) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
      } else {
        console.log("Error-Client", error);
      }
    }
  };

  return (
    <PopoverBody className="scroll-hidden overflow-y-scroll duration-300">
      <div className="flex flex-col w-full gap-y-2.5">
        <p className="leading-4 text-sm text-center text-neutral-300">
          O contato será informado que o agendamento foi cancelado
        </p>
        <TextareaAutosize
          placeholder="Adicione uma mensagem(opcional)"
          style={{ resize: "none" }}
          minRows={2}
          maxRows={2}
          value={message}
          onChange={({ target }) => setMessage(target.value)}
          className={clsx(
            "p-3 py-2.5 rounded-sm w-full border-white/10 border",
          )}
          disabled={load}
        />
      </div>
      <div className="flex gap-x-2 justify-end mt-4">
        <Button
          size={"xs"}
          variant={"ghost"}
          rounded={"full"}
          colorPalette={"red"}
          onClick={() => {
            setMessage("");
            props.onGoBack();
          }}
          disabled={load}
        >
          Voltar
        </Button>
        <Button
          onClick={onDelete}
          size={"xs"}
          px={5}
          rounded={"full"}
          colorPalette={"cyan"}
          disabled={load}
        >
          {load ? "Aguarde..." : "Deletar"}
        </Button>
      </div>
    </PopoverBody>
  );
}

const weekDayName: { [s: string]: string } = {
  Sunday: "Domingo",
  Monday: "Segunda-feira",
  Tuesday: "Terça-feira",
  Wednesday: "Quarta-feira",
  Thursday: "Quinta-feira",
  Friday: "Sexta-feira",
  Saturday: "Sábado",
};

function Content({ id, closeAndOpenTicket, close, closeAndDelete }: IProps) {
  const { socket } = useContext(SocketContext);
  const { logout } = useContext(AuthContext);
  const [status, setStatus] = useState<"error" | "success" | "pending">(
    "pending",
  );
  const [isFetching, setIsFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [data, setData] = useState<AppointmentDetails | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { appointment } = await getAppointmentDetails(id);
        setData(appointment);
        setIsFetching(false);
        setStatus("success");
      } catch (error) {
        setIsFetching(false);
        setStatus("error");
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
      }
    })();
  }, [id]);

  const update = async ({ dateAt, timeAt, ...fields }: Fields) => {
    try {
      setIsEditing(true);
      const nextStartAt = moment(`${dateAt}T${timeAt}`).toDate();
      await updateAppointment(id, {
        ...fields,
        startAt: nextStartAt,
        socketIgnore: socket.id,
      });
      setIsEdit(false);
      // setData((state) => (state ? { ...state, ...fields } : null));
      setIsEditing(false);
    } catch (error) {
      setIsEditing(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
        }
      }
    }
  };

  if (isFetching) {
    return (
      <PopoverBody className="scroll-hidden overflow-y-scroll  rounded-b-xl duration-300">
        <div className="flex w-full items-center min-h-64 justify-center">
          <Spinner size={"lg"} />
        </div>
      </PopoverBody>
    );
  }

  if (!data || status === "error") {
    return (
      <PopoverBody className="scroll-hidden overflow-y-scroll duration-300">
        <div className="flex w-full items-center justify-center">
          <span className="text-red-500">Agendamento não encontrado.</span>
        </div>
      </PopoverBody>
    );
  }

  if (isDelete) {
    return (
      <ContentDelete
        onDelete={() => closeAndDelete(id)}
        id={id}
        onGoBack={() => setIsDelete(false)}
      />
    );
  }

  return (
    <>
      <PopoverBody
        p={3}
        className="relative scroll-hidden rounded-b-xl overflow-y-scroll duration-300"
      >
        <div className="flex justify-between items-center -translate-y-1">
          <span className="text-neutral-300 tracking-wide text-xs">
            #{data.n_appointment}
          </span>

          <div className="flex gap-x-0.5">
            {!isEdit && (
              <>
                <button
                  onClick={() => setIsDelete(true)}
                  className="cursor-pointer z-10 p-2 rounded-md hover:bg-[#eb606028]"
                >
                  <MdDeleteOutline size={14} color={"#D14141"} />
                </button>
                <button
                  onClick={() => setIsEdit(true)}
                  className="cursor-pointer z-10 p-2 rounded-md hover:bg-[#2198ad22]"
                >
                  <MdEdit size={14} color={"#76ABE8"} />
                </button>
              </>
            )}
            <button
              onClick={close}
              className="cursor-pointer z-10 p-2 rounded-md hover:bg-[#ffffff17]"
            >
              <IoClose size={14} color={"#fff"} />
            </button>
          </div>
        </div>
        {!isEdit && (
          <>
            <div className="flex flex-col -mt-1">
              <div className="flex flex-col mb-3">
                <span className="font-medium text-base">{data.title}</span>
                <span className="text-xs text-neutral-300">
                  {weekDayName[moment(data.startAt).format("dddd")]},{" "}
                  {moment(data.startAt).format("DD/MM")} às{" "}
                  {moment(data.startAt).format("HH:mm")}
                </span>
              </div>
              <div className="mb-1 flex flex-col text-gray-200">
                <span className="text-xs">Descrição</span>
                {data.desc && (
                  <span className="block bg-neutral-900/50 text-xs p-1">
                    {data.desc}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-x-1 mt-3">
                <BiUserCircle size={20} />
                <span>{data.contactName}</span>
              </div>
              <div className="mt-2"></div>

              <span className="text-xs">
                {data.reminders.sent} lembrete enviado
              </span>
              {data.reminders.failed > 0 && (
                <span>Lembretes falhados: {data.reminders.failed}</span>
              )}
              {/* <span>Projeto: {data.business.name}</span> */}
              <span>Status: {data.status}</span>
              <div className="flex text-white/50 items-start gap-1 text-xs mt-2">
                <span>Criado em:</span>
                <div className="flex items-center gap-2">
                  <span>{moment(data.createAt).format("DD/MM/YYYY")}</span>
                  <span className="">
                    {moment(data.createAt).format("HH:mm")}
                  </span>
                </div>
              </div>
              {data.ticket.map((tk) => (
                <div
                  key={tk.id}
                  style={{
                    background:
                      tk.status === "OPEN"
                        ? "linear-gradient(143deg,rgba(88, 172, 245, 0.04) 0%, rgba(52, 126, 191, 0.12) 100%)"
                        : "linear-gradient(143deg,rgba(235, 203, 175, 0.07) 0%, rgba(219, 155, 99, 0.09) 100%)",
                  }}
                  className="cursor-pointer p-2 pr-2.5 rounded-md flex items-center justify-between w-full gap-x-1.5"
                  onClick={() => closeAndOpenTicket(tk.id)}
                >
                  <div className="flex flex-col -space-y-0.5">
                    <div className="flex gap-x-1 items-center">
                      <LuBriefcaseBusiness size={12} />
                      <span className="font-medium text-xs line-clamp-1">
                        {tk.departmentName}
                      </span>
                    </div>
                    <div className="flex gap-x-1 text-xs items-center">
                      {tk.connection.s ? (
                        <ImConnection color={"#7bf1a8e2"} size={12} />
                      ) : (
                        <MdSignalWifiConnectedNoInternet0
                          color={"#f17b7b"}
                          size={12}
                        />
                      )}
                      <span className="text-[#7bf1a892]">
                        {tk.connection.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex relative">
                    {/* {tk.lastMessage === "contact" && (
                                    <div className="absolute -top-0.5 -right-0.5 w-1.5 rounded-full h-1.5 bg-[#22b512]" />
                                  )} */}
                    {tk.status === "OPEN" ? (
                      <MdSupportAgent size={20} color="#58ACF5" />
                    ) : (
                      <BiTimeFive size={20} color="#EDA058" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {isEdit && (
          <EditForm
            // status={data.status}
            update={update}
            endAt={data.endAt}
            cancel={() => setIsEdit(false)}
            title={data.title}
            desc={data.desc || undefined}
            dateAt={moment(data.startAt).format("YYYY-MM-DD")}
            timeAt={moment(data.startAt).format("HH:mm")}
            isEditing={isEditing}
          />
        )}
      </PopoverBody>
    </>
  );
}

export const PopoverViewAppointment: React.FC<IProps> = ({
  id,
  closeAndOpenTicket,
  close,
  closeAndDelete,
}): JSX.Element => {
  return (
    <Content
      id={id}
      closeAndDelete={closeAndDelete}
      closeAndOpenTicket={closeAndOpenTicket}
      close={close}
    />
  );
};
