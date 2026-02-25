import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@components/ui/dialog";
import { useCallback, JSX, useContext, useState, useEffect, FC } from "react";
import { Skeleton } from "@chakra-ui/react";
import { CloseButton } from "@components/ui/close-button";
import { ImInsertTemplate } from "react-icons/im";
import { AuthContext } from "@contexts/auth.context";
import { useGetAgentTemplates } from "../../hooks/agentTemplate";
import { DigitizingChatComponent } from "@components/DigitizingChat";
import clsx from "clsx";

interface PropsModalDelete {
  onClick(props: { id: number; title: string }): void;
}

export const ModalListAgentTemplates: FC<PropsModalDelete> = (
  props,
): JSX.Element => {
  const { clientMeta } = useContext(AuthContext);
  const { data, isPending, isFetching, isLoading } = useGetAgentTemplates({});
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [execNow, setExecNow] = useState<number | null>(null);

  const handleVisibilityChange = useCallback(
    (index: number, inView: boolean) => {
      setVisibleItems((prev) => {
        if (inView) {
          return [...prev, index].sort((a, b) => a - b);
        } else {
          return prev.filter((i) => i !== index);
        }
      });
    },
    [],
  );

  useEffect(() => {
    setExecNow(visibleItems[0]);
  }, [visibleItems]);

  return (
    <DialogContent
      w={clientMeta.isMobileLike ? undefined : "1260px"}
      mx={2}
      backdrop
    >
      <DialogHeader flexDirection={"column"} gap={0}>
        <DialogTitle>
          <div className="flex items-center gap-x-2">
            <ImInsertTemplate size={20} />
            <span className="text-lg font-light">Templates disponíveis</span>
          </div>
        </DialogTitle>
      </DialogHeader>
      <DialogBody
        mt={clientMeta.isMobileLike ? "-15px" : "-5px"}
        px={clientMeta.isMobileLike ? 2 : undefined}
      >
        <div className="h-[calc(100vh-240px)] overflow-y-scroll!">
          <ul className="mt-3 w-full gap-1 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
            {(isPending || isFetching || isLoading) && [
              <Skeleton w="full" h={"251px"} />,
              <Skeleton w="full" h={"251px"} />,
              <Skeleton w="full" h={"251px"} />,
            ]}
            {!(isPending || isFetching || isLoading) &&
              data?.length &&
              data.map((template, index) => (
                <div
                  onMouseEnter={() => {
                    if (!clientMeta.isMobileLike) {
                      setExecNow(index);
                    }
                  }}
                  key={template.id}
                  className="pt-10 w-full"
                  onClick={() => {
                    props.onClick({ id: template.id, title: template.title });
                  }}
                >
                  <li
                    className={clsx(
                      "flex select-none w-full cursor-pointer group relative flex-col h-52.75 items-end justify-end hover:bg-neutral-200/7 p-3 rounded-2xl",
                      index === execNow
                        ? "border border-neutral-600 bg-neutral-200/7"
                        : "border border-transparent bg-neutral-200/5",
                    )}
                  >
                    <div className="absolute -top-8  left-0 w-full">
                      <DigitizingChatComponent
                        ismodal
                        active={index === execNow}
                        onVisibilityChange={(inView) =>
                          handleVisibilityChange(index, inView)
                        }
                        onPreview={() => setExecNow(index)}
                        nextCard={() => {
                          const isLast = index === data.length - 1;
                          if (isLast) {
                            setExecNow(0);
                          } else {
                            setExecNow(index + 1);
                          }
                        }}
                        list={template.chat_demo}
                      />
                    </div>
                    <h4 className="font-extrabold sm:text-xl line-clamp-2 text-center text-[16px]">
                      {template.title}
                    </h4>
                    <span className="text-center mt-1 line-clamp-2 leading-5 text-neutral-400">
                      {template.card_desc}
                    </span>
                    <span className="text-sm mt-1 font-medium">
                      por: {template.created_by}
                    </span>
                  </li>
                </div>
              ))}
          </ul>
          {!(isPending || isFetching || isLoading) && data?.length && (
            <div className="mt-5">
              <span className="text-center text-neutral-500 leading-5 block px-4">
                Isso é tudo, escolha a que melhor se adapta às suas necessidades
                e personalize-a como quiser.
              </span>
              <span className="text-center text-neutral-600 leading-5 block text-lg">
                ...
              </span>
            </div>
          )}
          {!(isPending || isFetching || isLoading) && !data?.length && (
            <div>
              <span>Nenhum template encontrado</span>
            </div>
          )}
        </div>
      </DialogBody>
      <DialogCloseTrigger>
        <CloseButton size="sm" />
      </DialogCloseTrigger>
    </DialogContent>
  );
};
