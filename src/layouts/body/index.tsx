import { IoIosAdd } from "react-icons/io";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { ModalComponent } from "../../components/Modal";
import { JSX } from "react";

type SizeModal =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "xs"
  | "full"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl";

interface PropsChildren {
  onOpen(): void;
  onClose(): void;
  isOpen: boolean;
}

interface PropsLayoutBodyComponent_I {
  title: string;
  description?: string;
  right?: JSX.Element;
  children: JSX.Element;
  buttonModalAdd?: {
    sizeModal?: SizeModal;
    title: string;
    children: (props: PropsChildren) => JSX.Element;
    onOpen?(): void;
    onClose?(): void;
    onSubmit(closeModal: () => void): Promise<void>;
    footer?: boolean;
    scrollBehavior?: "inside" | "outside";
  };
  buttonModalDell?: {
    sizeModal?: SizeModal;
    title: string;
    children: (props: PropsChildren) => JSX.Element;
    onOpen?(): void;
    onClose?(): void;
    onSubmit(closeModal: () => void): Promise<void>;
    visible: boolean;
  };
}

export default function LayoutBodyComponent(
  props: PropsLayoutBodyComponent_I
): JSX.Element {
  return (
    <div className="bg-primary flex w-full flex-col pb-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{props.title}</h1>
          {props.description && (
            <p className="text-lg text-slate-300">{props.description}</p>
          )}
        </div>
        {props.right}
      </div>
      <div className="h-full">{props.children}</div>
      {props.buttonModalDell && (
        <ModalComponent
          size={props.buttonModalDell.sizeModal}
          buttonJSX={(onOpen) => (
            <div
              className={`${
                props.buttonModalDell?.visible
                  ? "opacity-1 bottom-0"
                  : "-bottom-28 opacity-0"
              } fixed right-20 flex -translate-x-12 -translate-y-10 gap-4 duration-300`}
            >
              <button
                onClick={onOpen}
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-red-700 shadow-xl duration-300 hover:bg-red-600`}
              >
                <MdOutlineDeleteOutline size={32} />
              </button>
            </div>
          )}
          title={props.buttonModalDell.title}
          onSubmit={props.buttonModalDell?.onSubmit}
          children={props.buttonModalDell.children}
          textButtonClose="Cancelar"
          textButtonSubmit="Deletar"
        />
      )}
      {props.buttonModalAdd && (
        <ModalComponent
          scrollBehavior={props.buttonModalAdd.scrollBehavior}
          size={props.buttonModalAdd.sizeModal}
          buttonJSX={(onOpen) => (
            <div className="fixed bottom-0 right-0 flex -translate-x-12 -translate-y-10 gap-4">
              <button
                onClick={onOpen}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 shadow-xl duration-300 hover:bg-blue-800"
                {...(props.buttonModalAdd && {
                  title: props.buttonModalAdd.title,
                })}
              >
                <IoIosAdd size={40} />
              </button>
            </div>
          )}
          title={props.buttonModalAdd.title}
          onSubmit={props.buttonModalAdd?.onSubmit}
          children={props.buttonModalAdd.children}
          onClose={props.buttonModalAdd.onClose}
          textButtonClose="Cancelar"
          textButtonSubmit="Criar"
          footer={props.buttonModalAdd.footer}
        />
      )}
    </div>
  );
}
