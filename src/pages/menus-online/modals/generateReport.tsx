import { JSX, useState } from "react";
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
import { VariableRow } from "../menu";
// import { AxiosError } from "axios";
// import { z } from "zod";
import DatePicker, { registerLocale, } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { pt } from 'date-fns/locale/pt';
import moment from "moment";
registerLocale('pt', pt)

interface IProps {
  onCreate?(business: VariableRow): Promise<void>;
  trigger: JSX.Element;
  placement?: "top" | "bottom" | "center";
}

// const FormSchema = z.object({
//   identifier: z.string().min(1, "Campo obrigatório."),
//   desc: z.string().optional(),
//   img: z.instanceof(File, { message: "Campo obrigatório." }),
//   connectionWAId: z.number({ message: "Campo obrigatório." }),
// });

// type Fields = z.infer<typeof FormSchema>;

export function ModalGenerateReportMenuOnline({
  placement = "bottom",
  ...props
}: IProps): JSX.Element {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const [open, setOpen] = useState(false);

  // const create = useCallback(async (fields: Fields): Promise<void> => {
  //   try {
  //     // const { uuid } = await createMenu(fields);
  //     // navigate(`/auth/menus-online/${uuid}`);
  //     // reset();
  //     // const { businessIds, ...rest } = fields;
  //     // props.onCreate?.({ ...menu, ...rest });
  //   } catch (error) {
  //     if (error instanceof AxiosError) {
  //       console.log("Error-API", error);
  //     } else {
  //       console.log("Error-Client", error);
  //     }
  //   }
  // }, []);

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
        // onSubmit={handleSubmit(create)}
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
              {endDate && !moment(endDate).isSame(startDate) && [
                "à",
                <span>{moment(endDate).format("DD/MM/YYYY")}</span>
              ]}
            </div>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="button" size={"sm"} disabled={false} variant="outline">
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button type="submit" colorPalette={"blue"} size={"sm"} loading={false}>
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
