import { DialogContent, DialogBody, DialogRoot } from "@components/ui/dialog";
import { JSX, useState } from "react";
import { Button } from "@chakra-ui/react";

interface IProps {
  onClose: () => void;
}

export const ModalOnboarded: React.FC<IProps> = ({ onClose }): JSX.Element => {
  const [open, setOpen] = useState(true);

  return (
    <DialogRoot
      open={open}
      defaultOpen={true}
      placement={"center"}
      motionPreset={"scale"}
      closeOnInteractOutside={false}
      closeOnEscape={false}
      // size={dialog?.size}
    >
      <DialogContent
        bgGradient="linear-gradient(134deg,#121212 0%, #181818 50%)"
        boxShadow={"0 0 20px rgba(0, 0, 0, 0.393)"}
        w={"410px"}
        minH={"400px"}
      >
        <DialogBody className="flex mt-7">
          <div className="py-7 flex flex-col rounded-md justify-center items-center px-6">
            <div className="text-center max-w-xl">
              <h1 className="text-4xl font-bold mb-6">Bem-vindo</h1>
              <p className="text-lg mb-12 text-gray-300">
                Transforme conexões em resultados. Descubra como nossa
                ferramenta pode simplificar suas operações e impulsionar suas
                vendas e estratégias de marketing.
              </p>
            </div>

            <div className="w-full flex justify-center">
              <Button
                onClick={() => {
                  setOpen(false);
                  onClose();
                }}
                variant={"outline"}
                rounded={"full"}
                size={"xl"}
              >
                Começar 🚀
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};
