import { Button, Image } from "@chakra-ui/react";
import { useState, JSX, useMemo } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogDescription,
  DialogRoot,
  DialogTrigger,
} from "@components/ui/dialog";
import { CloseButton } from "@components/ui/close-button";
import { IoMdImage } from "react-icons/io";
import { useGetStorageFilesOptions } from "../../hooks/storage-file";
import { api } from "../../services/api";
import {
  PiFileAudioFill,
  PiFileFill,
  PiFilePdfFill,
  PiFileTextFill,
  PiFileVideoFill,
} from "react-icons/pi";
import { VirtuosoGrid } from "react-virtuoso";

interface PropsModalEdit {
  onSelected: (
    selecteds: {
      id: number;
      originalName: string;
      mimetype: string | null;
      fileName?: string | null;
    }[]
  ) => void;
  mimetype?: "image/" | "video/" | "audio/" | "application/pdf" | "text/";
  isMult?: boolean;
  children: React.ReactNode;
}

const IconPreviewFile = (p: { mimetype: string }): JSX.Element => {
  if (/^image\//.test(p.mimetype)) {
    return <IoMdImage color="#6daebe" size={24} />;
  }
  if (/^video\//.test(p.mimetype)) {
    return <PiFileVideoFill color="#8eb87a" size={24} />;
  }
  if (/^audio\//.test(p.mimetype)) {
    return <PiFileAudioFill color="#d4b663" size={24} />;
  }
  if (p.mimetype === "application/pdf") {
    return <PiFilePdfFill color="#db8c8c" size={24} />;
  }
  if (/^text\//.test(p.mimetype)) {
    return <PiFileTextFill color="#ffffff" size={24} />;
  }
  return <PiFileFill color="#808080" size={24} />;
};

function Content(
  p: Omit<PropsModalEdit, "children"> & { close: () => void }
): JSX.Element {
  const { data, isFetching, isPending } = useGetStorageFilesOptions();
  const [selecteds, setSelecteds] = useState<number[]>([]);

  const nextData = useMemo(() => {
    if (!data?.length) return [];
    if (!p.mimetype) return data;
    return data.filter((file) => file.mimetype?.startsWith(p.mimetype!));
  }, [data]);

  return (
    <div className="-mt-3">
      <DialogBody as={"div"}>
        {isFetching || isPending ? (
          <div className="flex items-center justify-center w-full h-20">
            <span className="text-sm text-gray-500">Carregando...</span>
          </div>
        ) : (
          <>
            {!!!nextData?.length && (
              <div className="flex items-center justify-center w-full h-20">
                <span className="text-sm text-gray-500">
                  Nenhum arquivo encontrado.
                </span>
              </div>
            )}
            {!!nextData?.length && (
              <VirtuosoGrid
                style={{ height: 400 }}
                totalCount={nextData.length}
                listClassName="grid w-full grid-cols-4 auto-rows-[126px] pr-1.5"
                className="scroll-custom-table "
                overscan={400}
                itemContent={(index) => {
                  const file = nextData[index];
                  const selected = selecteds.includes(file.id);
                  return (
                    <article
                      key={file.id}
                      className="cursor-pointer p-1 h-full flex flex-col select-none items-center w-full gap-1"
                      style={{
                        ...(selected
                          ? {
                              borderStyle: "solid",
                              borderWidth: 2,
                              borderColor: "#ffffff",
                            }
                          : { borderWidth: 2, borderColor: "transparent" }),
                      }}
                      onClick={() => {
                        if (selected) {
                          setSelecteds((prev) =>
                            prev.filter((id) => id !== file.id)
                          );
                        } else {
                          if (p.isMult) {
                            setSelecteds((prev) => [...prev, file.id]);
                          } else {
                            p.onSelected([
                              {
                                id: file.id,
                                originalName: file.originalName,
                                mimetype: file.mimetype,
                                fileName: file.fileName,
                              },
                            ]);
                            p.close();
                          }
                        }
                      }}
                    >
                      <div
                        style={{
                          borderColor: selecteds.includes(file.id)
                            ? "transparent"
                            : "#272727",
                          border: "2px solid transparent",
                        }}
                        className="cursor-pointer w-full h-20 overflow-hidden object-center origin-center bg-center flex items-center justify-center rounded-sm"
                      >
                        {/^image\//.test(file.mimetype || "") ? (
                          <Image
                            w="100%"
                            h="auto"
                            src={
                              api.getUri() + "/public/storage/" + file.fileName
                            }
                            fetchPriority="low"
                          />
                        ) : (
                          <IconPreviewFile mimetype={file.mimetype || ""} />
                        )}
                      </div>
                      <span className="line-clamp-2 text-xs text-center font-light">
                        {file.originalName}
                      </span>
                    </article>
                  );
                }}
              />
            )}
          </>
        )}
      </DialogBody>
      <DialogFooter>
        {p.isMult && (
          <Button
            type="button"
            colorPalette={"white"}
            size={"sm"}
            disabled={!selecteds.length || isFetching || !nextData?.length}
            onClick={() => {
              if (selecteds.length) {
                const selectedFiles =
                  nextData
                    ?.filter((file) => selecteds.includes(file.id))
                    .map(({ id, originalName, mimetype, fileName }) => ({
                      id,
                      originalName,
                      mimetype,
                      fileName,
                    })) || [];
                p.onSelected(selectedFiles);
                p.close();
              }
            }}
          >
            Selecionar os arquivos
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}

export const ModalStorageFiles: React.FC<PropsModalEdit> = ({
  isMult = true,
  ...props
}): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <DialogRoot
      defaultOpen={false}
      open={open}
      onOpenChange={(change) => setOpen(change.open)}
      placement={"center"}
      lazyMount
      unmountOnExit
      size={"lg"}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent zIndex={9} position={"relative"} w={"590px"}>
        <DialogHeader flexDirection={"column"} mt={"-5px"} gap={0}>
          <DialogTitle>Storage</DialogTitle>
          <DialogDescription>
            Aqui está a lista integral dos seus arquivos armazenados.
          </DialogDescription>
        </DialogHeader>
        <Content {...props} isMult={isMult} close={() => setOpen(false)} />
        <DialogCloseTrigger asChild>
          <CloseButton size="sm" />
        </DialogCloseTrigger>
      </DialogContent>
    </DialogRoot>
  );
};
