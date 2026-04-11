import { JSX, useContext, useState } from "react";
import { Button, VStack } from "@chakra-ui/react";
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
} from "@components/ui/dialog";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { pt } from "date-fns/locale/pt";
import moment from "moment";
import { createMenuOnlineReport } from "../../../services/api/MenuOnline";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
registerLocale("pt", pt);

interface IProps {
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
  uuid: string;
}

export function ModalGenerateReportMenuOnline({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext);

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const [open, setOpen] = useState(false);

  const create = async (): Promise<void> => {
    try {
      setLoading(true);
      await createMenuOnlineReport(props.uuid, {
        start: startDate,
        end: endDate,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast?.length) dataError.toast.forEach(toaster.create);
          if (dataError.input?.length) {
            dataError.input.forEach(({ text, path }) =>
              // @ts-expect-error
              setError?.(path, { message: text }),
            );
          }
        }
      }
    }
  };

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
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) {
            create();
          }
        }}
        w={"348px"}
      >
        <DialogHeader flexDirection={"column"} gap={0}>
          <DialogTitle>Gerar relatório</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack gap={4}>
            <DatePicker
              selected={startDate}
              onChange={onChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              locale="pt"
              inline
            />

            <div className="flex gap-x-2 items-center">
              {startDate && (
                <span>{moment(startDate).format("DD/MM/YYYY")}</span>
              )}
              {endDate &&
                !moment(endDate).isSame(startDate) && [
                  "à",
                  <span>{moment(endDate).format("DD/MM/YYYY")}</span>,
                ]}
            </div>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button
              type="button"
              size={"sm"}
              disabled={false}
              variant="outline"
            >
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button
            type="submit"
            colorPalette={"blue"}
            size={"sm"}
            loading={loading}
          >
            Baixar
          </Button>
        </DialogFooter>
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
}
