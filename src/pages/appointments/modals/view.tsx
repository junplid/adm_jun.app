import moment from "moment";
import { FC, JSX, useContext, useEffect, useState } from "react";
import { Button, Input, Spinner } from "@chakra-ui/react";
import { PopoverBody } from "@components/ui/popover";

import { useDialogModal } from "../../../hooks/dialog.modal";
import { ModalDeleteAppaintment } from "./delete";
import {
  AppointmentDetails,
  getAppointmentDetails,
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
import { ModalChatPlayer } from "../../inboxes/departments/modals/Player/modalChat";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@components/ui/field";
import TextareaAutosize from "react-textarea-autosize";
import { useHookFormMask } from "use-mask-input";

interface IProps {
  id: number;
  close: () => void;
}

const FormSchema = z.object({
  title: z.string().min(1, "Campo obrigatório."),
  desc: z.string().transform((value) => value.trim() || undefined),
  dateAt: z.string().min(1, "Campo obrigatório."),
  timeAt: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Hora inválida (use HH:mm no formato 24h)"
    ),
});

type Fields = z.infer<typeof FormSchema>;

const EditForm: FC<
  Fields & {
    update: (f: Fields) => Promise<void>;
    cancel: () => void;
    isEditing: boolean;
  }
> = ({ update, isEditing, cancel, ...values }) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    reset,
  } = useForm<Fields>({
    resolver: zodResolver(FormSchema),
  });

  const registerWithMask = useHookFormMask(register);

  useEffect(() => {
    reset(values);
  }, []);

  return (
    <form onSubmit={handleSubmit(update)} className="flex flex-col gap-y-3">
      <Field
        errorText={errors.title?.message}
        invalid={!!errors.title}
        label="Titulo do evento"
      >
        <Input
          {...register("title")}
          autoComplete="off"
          placeholder="Digite o nome do projeto"
        />
      </Field>
      <Field
        errorText={errors.dateAt?.message}
        invalid={!!errors.dateAt}
        label="Data do evento"
      >
        <Input
          type="date"
          {...register("dateAt")}
          min={moment().format("YYYY-MM-DD")}
        />
      </Field>
      <Field
        errorText={errors.timeAt?.message}
        invalid={!!errors.timeAt}
        label="Horario do evento"
      >
        <Input {...registerWithMask("timeAt", "99:99")} placeholder="HH:mm" />
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
          className="p-3 py-2.5 rounded-sm w-full border-black/10 dark:border-white/10 border"
          {...register("desc")}
        />
      </Field>

      <div className="flex gap-x-2">
        <Button type="button" disabled={isEditing} variant="outline">
          Cancelar
        </Button>
        <Button
          type="submit"
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

function Content({ id }: { id: number; close: () => void }) {
  const { logout } = useContext(AuthContext);
  const [status, setStatus] = useState<"error" | "success" | "pending">(
    "pending"
  );
  const [isFetching, setIsFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState<AppointmentDetails | null>(null);
  const {
    dialog: dialogModal,
    close: closeModal,
    onOpen: openModal,
  } = useDialogModal({});

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
      await updateAppointment(id, { ...fields, startAt: nextStartAt });
      setIsEdit(false);
      setData((state) => (state ? { ...state, ...fields } : null));
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
          <span className="text-red-500">Compromisso não encontrado</span>
        </div>
      </PopoverBody>
    );
  }

  return (
    <>
      <PopoverBody className="relative scroll-hidden rounded-b-xl overflow-y-scroll duration-300">
        {!isEdit && (
          <div className="-mb-3 flex justify-end gap-x-3">
            <button
              onClick={() => {
                openModal({
                  content: (
                    <ModalDeleteAppaintment
                      close={close}
                      data={
                        data
                          ? {
                              id,
                              name: `${data.title} - ${moment(data.startAt).format("DD/MM/YYYY HH:mm")}`,
                            }
                          : null
                      }
                    />
                  ),
                });
              }}
              className="cursor-pointer z-10 p-2 border border-[#d63c3c53] bg-[#eb606022] rounded-md hover:bg-[#eb606028]"
            >
              <MdDeleteOutline size={18} color={"#D14141"} />
            </button>
            <button
              onClick={() => setIsEdit(true)}
              className="cursor-pointer z-10 p-2 border border-[#1c9bb183] bg-[#30c9e41e] rounded-md hover:bg-[#30c9e422]"
            >
              <MdEdit size={18} color={"#76ABE8"} />
            </button>
          </div>
        )}
        {!isEdit && (
          <div className="flex flex-col">
            <span className="text-gray-200">#{data.n_appointment}</span>

            <div className="flex flex-col">
              <span className="font-medium text-base">{data.title}</span>
              <span className="text-xs">
                {moment(data.startAt).format("dddd, D [de] MMMM YYYY")}
              </span>
            </div>
            <div className="mb-1 text-gray-200">
              {data.desc && <span>{data.desc}</span>}
            </div>
            <div className="flex items-center gap-x-1">
              <BiUserCircle size={20} />
              <span>{data.contactName}</span>
            </div>
            <div className="mt-2"></div>

            <span>
              Lembretes enviados: {data.reminders.sent}/
              {3 - (data.reminders.failed || 0)}
            </span>
            {data.reminders.failed > 0 && (
              <span>Lembretes falhados: {data.reminders.failed}</span>
            )}
            <span>Projeto: {data.business.name}</span>
            <span>Status: {data.status}</span>
            <div className="flex items-start gap-2">
              <span>Criado em:</span>
              <div className="flex items-center gap-2">
                <span>{moment(data.createAt).format("DD/MM/YYYY")}</span>
                <span className="text-white/50">
                  {moment(data.createAt).format("HH:mm")}
                </span>
              </div>
            </div>
            {!isEdit &&
              data.ticket.map((tk) => (
                <div
                  key={tk.id}
                  style={{
                    background:
                      tk.status === "OPEN"
                        ? "linear-gradient(143deg,rgba(88, 172, 245, 0.04) 0%, rgba(52, 126, 191, 0.12) 100%)"
                        : "linear-gradient(143deg,rgba(235, 203, 175, 0.07) 0%, rgba(219, 155, 99, 0.09) 100%)",
                  }}
                  className="cursor-pointer p-2 pr-2.5 rounded-md flex items-center justify-between w-full gap-x-1.5"
                  onClick={() => {
                    openModal({
                      size: "xl",
                      content: (
                        <ModalChatPlayer
                          orderId={id}
                          close={closeModal}
                          data={{
                            businessId: data.business.id,
                            id: tk.id,
                            name: `#${data.n_appointment} / ${data.contactName}`,
                          }}
                        />
                      ),
                    });
                  }}
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
        )}
        {isEdit && (
          <EditForm
            update={update}
            cancel={() => setIsEdit(false)}
            title={data.title}
            desc={data.desc || undefined}
            dateAt={moment(data.startAt).format("YYYY-MM-DD")}
            timeAt={moment(data.startAt).format("HH:mm")}
            isEditing={isEditing}
          />
        )}
        {dialogModal}
      </PopoverBody>
    </>
  );
}

export const PopoverViewAppointment: React.FC<IProps> = ({
  id,
  close,
}): JSX.Element => {
  return <Content id={id} close={close} />;
};
