import "react-multi-carousel/lib/styles.css";
import { DigitizingChatComponent } from "@components/DigitizingChat";
import { useGetAgentTemplates } from "../../hooks/agentTemplate";
import { ImInsertTemplate } from "react-icons/im";
import Carousel, { ResponsiveType } from "react-multi-carousel";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "@contexts/auth.context";
import { useDialogModal } from "../../hooks/dialog.modal";
import { ModalListAgentTemplates } from "./modal_list";
import clsx from "clsx";
import { ModalAgentTemplate } from "./modal_agent";
import { useQueryClient } from "@tanstack/react-query";

const responsive: ResponsiveType = {
  desktop: {
    breakpoint: { max: 3000, min: 1130 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1130, min: 1040 },
    items: 3,
    partialVisibilityGutter: 30,
  },
  tablet2: {
    breakpoint: { max: 1040, min: 945 },
    items: 3,
    partialVisibilityGutter: 10,
  },
  tablet3: {
    breakpoint: { max: 945, min: 878 },
    items: 2,
    partialVisibilityGutter: 100,
  },
  tablet4: {
    breakpoint: { max: 878, min: 820 },
    items: 2,
    partialVisibilityGutter: 70,
  },
  tablet5: {
    breakpoint: { max: 820, min: 768 },
    items: 2,
    partialVisibilityGutter: 40,
  },
  mobile: {
    breakpoint: { max: 768, min: 665 },
    items: 2,
    partialVisibilityGutter: 40,
  },
  mobile2: {
    breakpoint: { max: 665, min: 640 },
    items: 2,
    partialVisibilityGutter: 20,
  },
  mobile3: {
    breakpoint: { max: 640, min: 608 },
    items: 2,
    partialVisibilityGutter: 50,
  },
  mobile4: {
    breakpoint: { max: 608, min: 560 },
    items: 2,
    partialVisibilityGutter: 20,
  },
  mobile5: {
    breakpoint: { max: 560, min: 540 },
    items: 2,
    partialVisibilityGutter: 10,
  },
  mobile6: {
    breakpoint: { max: 540, min: 500 },
    items: 1,
    partialVisibilityGutter: 220,
  },
  mobile7: {
    breakpoint: { max: 500, min: 430 },
    items: 1,
    partialVisibilityGutter: 160,
  },
  mobile8: {
    breakpoint: { max: 430, min: 0 },
    items: 1,
    partialVisibilityGutter: 120,
  },
};

export function ListOfAgentTemplatesComponent() {
  const { dialog: DialogModal, onOpen, close: onClose } = useDialogModal({});
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [execNow, setExecNow] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const {
    clientMeta: { windowWidth },
  } = useContext(AuthContext);
  const { data, isPending, isFetching, isLoading } = useGetAgentTemplates({
    limit: 4,
  });

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

  if (isPending || isFetching || isLoading || !data || !data.length) {
    return <div></div>;
  }

  return (
    <section className="grid">
      <div className="flex justify-center items-center gap-x-2">
        <ImInsertTemplate size={20} />
        <span className="text-lg font-light">Templates disponíveis</span>
        <a
          onClick={() => {
            onOpen({
              size: "xl",
              content: <ModalListAgentTemplates />,
            });
          }}
          className="text-gray-400 underline text-sm cursor-pointer"
        >
          ver mais
        </a>
      </div>
      {windowWidth > 1220 ? (
        <ul className="mt-3 w-full gap-x-2 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {data.map((template, index) => (
            <div
              key={template.id}
              onMouseEnter={() => setExecNow(index)}
              className="pt-10 w-full"
              onClick={() =>
                onOpen({
                  size: "xl",
                  content: (
                    <ModalAgentTemplate
                      title={template.title}
                      id={template.id}
                      onClose={onClose}
                      onCloseAndFetch={() => {
                        onClose();
                        queryClient.invalidateQueries({
                          queryKey: ["agents-ai"],
                        });
                      }}
                    />
                  ),
                })
              }
            >
              <li
                className={clsx(
                  "flex select-none w-full cursor-pointer group relative flex-col h-52.75 items-end justify-end hover:bg-neutral-200/7 p-3 rounded-2xl",
                  index === execNow
                    ? "border border-neutral-600 bg-neutral-200/7"
                    : "border border-transparent bg-neutral-200/5",
                )}
              >
                <div className="absolute pointer-events-none! -top-8  left-0 w-full">
                  <DigitizingChatComponent
                    active={index === execNow}
                    onVisibilityChange={(inView) =>
                      handleVisibilityChange(index, inView)
                    }
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
                <h4 className="font-extrabold text-xl line-clamp-2 text-center w-full">
                  {template.title}
                </h4>
                <span className="text-center mt-1 line-clamp-2 leading-5 w-full text-neutral-400">
                  {template.card_desc}
                </span>
                <span className="text-sm mt-1 font-medium">
                  por: {template.created_by}
                </span>
              </li>
            </div>
          ))}
        </ul>
      ) : (
        <Carousel
          infinite={false}
          arrows={false}
          partialVisible
          responsive={responsive}
          className="w-full"
        >
          {data.map((template) => (
            <div key={template.id} className="pt-10 w-full px-1">
              <li className="flex select-none w-full cursor-pointer group relative flex-col h-52.75 items-end justify-end  bg-neutral-200/5 hover:bg-neutral-200/7 p-3 rounded-2xl">
                <div className="absolute pointer-events-none! -top-8  left-0 w-full">
                  <DigitizingChatComponent
                    active={true}
                    list={template.chat_demo}
                  />
                </div>
                <h4 className="font-extrabold text-xl line-clamp-2 text-center ">
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
        </Carousel>
      )}
      {DialogModal}
    </section>
  );
}
