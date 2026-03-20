import { Button } from "@chakra-ui/react";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@components/ui/popover";
import TextareaAutosize from "react-textarea-autosize";
import { JSX } from "react";

export function FeedbackComponent(): JSX.Element {
  return (
    <PopoverRoot positioning={{ placement: "bottom-end" }}>
      <PopoverTrigger as={"div"}>
        <Button
          className="bg-white/10 hover:bg-white/20!"
          pointerEvents={"all"}
          size="sm"
          variant="outline"
        >
          Feedback
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader
          position={"sticky"}
          top={0}
          paddingTop={"15px"}
          paddingBottom={"5px"}
          className="bg-[#111111]! z-10 border border-white/5 rounded-md rounded-b-none border-b-0"
        >
          <PopoverTitle className="font-bold text-base">Feedback</PopoverTitle>
          <PopoverDescription className="text-white/60">
            Compartilhe suas sugestões, reclamações ou reporte bugs aqui!
          </PopoverDescription>
        </PopoverHeader>
        <PopoverBody mt={"-10px"}>
          <TextareaAutosize
            placeholder="Digite sua mensagem aqui"
            style={{ resize: "none" }}
            minRows={3}
            maxRows={12}
            className="p-3 py-2.5 rounded-sm w-full border-white/10 border"
            // value={msg.text}
          />

          <div className="flex justify-end">
            <Button size="sm" mt={"4"}>
              Enviar
            </Button>
          </div>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
}
