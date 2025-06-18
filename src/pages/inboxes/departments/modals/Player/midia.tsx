import { IconButton } from "@chakra-ui/react";
import { ModalStorageFiles } from "@components/Modals/StorageFiles";
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@components/ui/popover";
import { useState } from "react";
import { IoMdImage } from "react-icons/io";
import { MdOutlinePermMedia } from "react-icons/md";
import { PiFileFill } from "react-icons/pi";
import { TbHeadphones } from "react-icons/tb";

interface Props {
  isDisabled?: boolean;
  onSelected: (
    selecteds: {
      id: number;
      originalName: string;
      mimetype: string | null;
      fileName?: string | null;
      type: "image/video" | "audio" | "document";
    }[]
  ) => void;
}

export function MidiaComponent(p: Props) {
  const [open, setOpen] = useState(false);
  return (
    <PopoverRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      // closeOnInteractOutside={false}
      positioning={{ placement: "top-start" }}
      portalled={false}
    >
      <PopoverTrigger>
        <IconButton
          disabled={p.isDisabled}
          bg={open ? "#1d2022a7" : undefined}
          type="button"
          variant="ghost"
        >
          <MdOutlinePermMedia color="#66909b" />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        portalled={false}
        w={"180px"}
        p={0}
        className="select-none"
        shadow={"0px 7px 5px #00000037"}
        bg={"#151617"}
      >
        <PopoverBody paddingTop={"18px"} p={1.5}>
          <ModalStorageFiles
            onSelected={(s) => {
              p.onSelected(s.map((file) => ({ ...file, type: "document" })));
            }}
            isMult={true}
          >
            <a className="flex text-[#808080] cursor-pointer hover:text-[#c5c5c5] items-center gap-x-2 p-2 hover:bg-white/5 duration-200 rounded-md">
              <PiFileFill size={20} />
              <span className="text-sm">Documentos</span>
            </a>
          </ModalStorageFiles>
          <ModalStorageFiles
            onSelected={(s) => {
              p.onSelected(s.map((file) => ({ ...file, type: "image/video" })));
            }}
            isMult={true}
            mimetype={["image/", "video/"]}
          >
            <a className="flex items-center text-[#6daebe] cursor-pointer hover:text-[#80dcf3] gap-x-2 p-2 hover:bg-white/5 duration-200 rounded-md">
              <IoMdImage size={20} />
              <span>Fotos e vídeos</span>
            </a>
          </ModalStorageFiles>
          <ModalStorageFiles
            onSelected={(s) => {
              p.onSelected(s.map((file) => ({ ...file, type: "audio" })));
            }}
            isMult={false}
            mimetype={["audio/"]}
          >
            <a className="flex items-center text-[#daa557] cursor-pointer hover:text-[#ffc978] gap-x-2 p-2  hover:bg-white/5 duration-200 rounded-md">
              <TbHeadphones size={20} />
              <span>Áudio</span>
            </a>
          </ModalStorageFiles>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
}
