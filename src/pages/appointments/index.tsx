import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-dark.scss";

import { JSX, useContext, useEffect, useRef, useState } from "react";
import { Spinner } from "@chakra-ui/react";
import { AuthContext } from "@contexts/auth.context";
import { AxiosError } from "axios";
import { ErrorResponse_I } from "../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { SocketContext } from "@contexts/socket.context";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { clsx } from "clsx";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { usePopoverComponent } from "../../hooks/popover";
import { PopoverViewAppointment } from "./modals/view";
import { getAppointments } from "../../services/api/Appointments";

moment.updateLocale("pt-br", {
  longDateFormat: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D [de] MMMM [de] YYYY",
    LLL: "D [de] MMMM [de] YYYY HH:mm",
    LLLL: "dddd, D [de] MMMM [de] YYYY HH:mm",
  },
});

const localizer = momentLocalizer(moment);

export interface Appointment {
  id: number;
  title: string;
  desc: string | null;
  startAt: Date;
}

const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Não há agendamento neste período.",
  showMore: (total: number) => `Ver +${total}`,
};

const dayName: { [s: string]: string } = {
  Sun: "Dom",
  Mon: "Seg",
  Tue: "Ter",
  Wed: "Qua",
  Thu: "Qui",
  Fri: "Sex",
  Sat: "Sáb",
};

const monthName: { [s: string]: string } = {
  January: "Janeiro",
  February: "Fevereiro",
  March: "Março",
  April: "Abril",
  May: "Maio",
  June: "Junho",
  July: "Julho",
  August: "Agosto",
  September: "Setembro",
  October: "Outubro",
  November: "Novembro",
  December: "Dezembro",
};

const monthName2: { [s: string]: string } = {
  Jan: "Jan",
  Feb: "Fev",
  Mar: "Mar",
  Apr: "Abr",
  May: "Mai",
  Jun: "Jun",
  Jul: "Jul",
  Aug: "Ago",
  Sep: "Set",
  Oct: "Out",
  Nov: "Nov",
  Dec: "Dez",
};

const weekDayName: { [s: string]: string } = {
  Sunday: "Domingo",
  Monday: "Segunda-feira",
  Tuesday: "Terça-feira",
  Wednesday: "Quarta-feira",
  Thursday: "Quinta-feira",
  Friday: "Sexta-feira",
  Saturday: "Sábado",
};

interface IAppointmentEvent {
  id: number;
  color: string;
  title: string;
  desc?: string;
  closePopover: () => void;
  openPopover(props: {
    content: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xs";
    boundingClientRect: any;
  }): void;
}

const AppointmentEvent = ({
  closePopover,
  openPopover,
  ...event
}: IAppointmentEvent) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (!ref.current) return;
    openPopover({
      boundingClientRect: ref.current?.getBoundingClientRect(),
      content: <PopoverViewAppointment close={closePopover} id={event.id} />,
    });
  };

  return (
    <div
      className="rounded-sm w-full h-full px-1"
      style={{ background: event.color }}
      ref={ref}
      onClick={handleClick}
    >
      <p className="font-medium text-xs">{event.title}</p>
      {event.desc && (
        <span className="line-clamp-1 text-white/80 truncate text-wrap text-xs">
          {event.desc}
        </span>
      )}
    </div>
  );
};

export const AppointmentsPage: React.FC = (): JSX.Element => {
  const { socket, onSetFocused } = useContext(SocketContext);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const {
    popover,
    close: closePopover,
    onOpen: openPopover,
  } = usePopoverComponent({ bg: "#545454" });

  const { logout, account } = useContext(AuthContext);
  const [load, setLoad] = useState(true);
  const [_loadOrders, _setLoadOrders] = useState<number[]>([]);

  async function get() {
    try {
      const { appointments: oL } = await getAppointments();
      setAppointments(oL);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
        }
      }
      throw error;
    }
  }

  useEffect(() => {
    get();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on(
        "appointment:new",
        (props: { accountId: number; appointment: Appointment }) => {
          if (props.accountId === account.id) {
            setAppointments((state) => [...state, props.appointment]);
          }
        },
      );
      socket.on(
        "appointment:remove",
        (props: { accountId: number; id: number }) => {
          if (props.accountId === account.id) {
            setAppointments((state) => state.filter((s) => s.id !== props.id));
          }
        },
      );
      socket.on(
        "appointment:update",
        (props: {
          accountId: number;
          data: Partial<Appointment> & { id: number };
        }) => {
          if (props.accountId === account.id) {
            setAppointments((state) => {
              return state.map((a) => {
                if (a.id === props.data.id) a = { ...a, ...props.data };
                return a;
              });
            });
          }
        },
      );
    }

    return () => {
      socket.off("appointment:new");
      socket.off("appointment:remove");
      socket.off("appointment:update");
    };
  }, [socket]);

  useEffect(() => {
    onSetFocused(`page-appointments`);
    return () => {
      onSetFocused(null);
    };
  }, []);

  return (
    <div className="h-full gap-y-2 flex flex-col">
      <div className="flex flex-col sm:pl-0 pl-2">
        <h1 className="text-base sm:text-lg font-semibold">
          Agenda de compromissos
        </h1>
      </div>
      <div className="flex-1 pt-0! grid gap-x-2 h-full rbc-dark">
        {load ? (
          <div className="bg-white/5 sm:m-0 m-2 text-white/70 rounded-md flex flex-col items-center justify-center">
            <span className="">Carregando aguarde...</span>
            <Spinner />
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={appointments.map(({ startAt, ...s }) => ({
              ...s,
              start: new Date(startAt),
              end: new Date(startAt),
              color: "#3B3B3B",
              desc: s.desc || undefined,
            }))}
            startAccessor="start"
            defaultView="month"
            messages={messages}
            dayLayoutAlgorithm="no-overlap"
            culture="pt-BR"
            components={{
              agenda: {
                date: ({ label }) => {
                  const nextLabel = label.split(" ");
                  return (
                    <span>{`${dayName[nextLabel[0]]} ${monthName2[nextLabel[1]]} ${nextLabel[2]}`}</span>
                  );
                },
              },
              header: (props) => {
                const label = props.label.split(" ");
                if (label.length > 1) {
                  const nextLabel = `${label[0]} ${dayName[label[1]]}`;
                  return <span className="font-normal">{nextLabel}</span>;
                } else {
                  return (
                    <span className="font-normal">{dayName[label[0]]}</span>
                  );
                }
              },
              toolbar: (props) => {
                const month = props.label.split(" ");
                let nextLabel: string = "";
                if (month.length === 2) {
                  nextLabel = `${monthName[month[0]]} ${month[1]}`;
                }
                if (month.length === 3) {
                  const dateC = moment(props.date);
                  nextLabel = `${weekDayName[dateC.format("dddd")]} ${moment(props.date).format("DD/MM/YYYY")}`;
                }
                return (
                  <div className="flex flex-wrap mb-2 justify-between">
                    <div className="flex items-center gap-x-2">
                      <button
                        className="p-4 py-1 max-sm:hidden block cursor-pointer hover:bg-gray-300/20 bg-gray-300/10 text-sm rounded-full"
                        onClick={() => props.onNavigate("TODAY")}
                      >
                        Hoje
                      </button>
                      <button
                        className="p-1 cursor-pointer"
                        onClick={() => props.onNavigate("PREV")}
                      >
                        <RxCaretLeft size={24} />
                      </button>
                      <button
                        className="p-1 cursor-pointer"
                        onClick={() => props.onNavigate("NEXT")}
                      >
                        <RxCaretRight size={24} />
                      </button>
                      <span>{nextLabel}</span>
                    </div>
                    <div className="flex items-center gap-x-0.5">
                      <button
                        className={clsx(
                          "p-4 py-1 cursor-pointer text-sm rounded-full",
                          props.view === "month" ? "bg-gray-300/10" : "",
                        )}
                        onClick={() => props.onView("month")}
                      >
                        Mês
                      </button>
                      <button
                        className={clsx(
                          "p-4 py-1 cursor-pointer text-sm rounded-full",
                          props.view === "week" ? "bg-gray-300/10" : "",
                        )}
                        onClick={() => props.onView("week")}
                      >
                        Semana
                      </button>
                      <button
                        className={clsx(
                          "p-4 py-1 cursor-pointer text-sm rounded-full",
                          props.view === "day" ? "bg-gray-300/10" : "",
                        )}
                        onClick={() => props.onView("day")}
                      >
                        Dia
                      </button>
                      <button
                        className={clsx(
                          "p-4 py-1 cursor-pointer text-sm rounded-full max-[620px]:hidden",
                          props.view === "agenda" ? "bg-gray-300/10" : "",
                        )}
                        onClick={() => props.onView("agenda")}
                      >
                        Agenda
                      </button>
                    </div>
                  </div>
                );
              },
              event: ({ event }) => (
                <AppointmentEvent
                  color={event.color}
                  id={event.id}
                  title={event.title}
                  desc={event.desc}
                  closePopover={closePopover}
                  openPopover={openPopover}
                />
              ),
              week: {
                event: ({ event }) => (
                  <AppointmentEvent
                    color={event.color}
                    id={event.id}
                    title={event.title}
                    closePopover={closePopover}
                    openPopover={openPopover}
                  />
                ),
              },
              month: {
                event: ({ event }) => (
                  <AppointmentEvent
                    color={event.color}
                    id={event.id}
                    title={event.title}
                    closePopover={closePopover}
                    openPopover={openPopover}
                  />
                ),
              },
            }}
          />
        )}
      </div>
      {popover}
    </div>
  );
};
