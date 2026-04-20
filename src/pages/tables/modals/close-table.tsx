import { DialogContent, DialogBody } from "@components/ui/dialog";
import { JSX } from "react";
import clsx from "clsx";

interface IProps {
  close: () => void;
  onClickMethod(value: string): void;
  total: number;
}

const PAYMENT_OPTIONS: { label: string; value: string }[] = [
  { label: "PIX", value: "PIX" },
  { label: "Dinheiro", value: "Dinheiro" },
  { label: "Crédito", value: "Crédito" },
  { label: "Débito", value: "Débito" },
];

function Content({ onClickMethod, close }: IProps) {
  return (
    <DialogBody p={0} py={3} className="flex flex-col select-none!">
      <div className="px-4">
        <h3
          className={clsx(
            "font-semibold text-sm uppercase text-center tracking-wide mb-2 transition-colors text-white",
          )}
        >
          Forma de Pagamento
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {PAYMENT_OPTIONS.map((method) => (
            <button
              key={method.value}
              onClick={() => {
                onClickMethod(method.value);
                close;
              }}
              className={clsx(
                "py-5 px-2 rounded-xl bg-neutral-800/50 text-sm font-medium transition-all",
              )}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>
    </DialogBody>
  );
}

export const ModalCloseTable: React.FC<IProps> = ({
  total,
  onClickMethod,
  close,
}): JSX.Element => {
  return (
    <DialogContent maxW={"270px"} mx={4} p={3}>
      <Content close={close} total={total} onClickMethod={onClickMethod} />
    </DialogContent>
  );
};
