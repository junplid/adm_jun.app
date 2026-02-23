"use client";

import { memo, useContext, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import autoAnimate from "@formkit/auto-animate";
import clsx from "clsx";
import { slideFade } from "./autoAnimation";
import { useInView } from "react-intersection-observer";
import { AuthContext } from "@contexts/auth.context";
import { MdOutlinePlayCircle } from "react-icons/md";
import { Typewriter } from "react-simple-typewriter";
import { RiSendPlane2Line } from "react-icons/ri";
import { AiOutlineAudio } from "react-icons/ai";

interface Props {
  list: (
    | { type: "lead" | "ia"; value: string }
    | { type: "sleep"; sleep: number }
  )[];
  onVisibilityChange?(inView: boolean): void;
  active: boolean;
  nextCard?(): void;
  onPreview?(): void;
  ismodal?: boolean;
}

const TYPE_SPEED = 49;

export const DemoChatComponent = memo(
  ({
    active,
    list,
    onVisibilityChange,
    nextCard,
    ismodal = false,
    onPreview,
  }: Props) => {
    const { clientMeta } = useContext(AuthContext);
    const [input, setInput] = useState<string>("");
    const [clicksend, setClicksend] = useState(false);

    const { ref } = useInView({
      threshold: 1,
      onChange(inView) {
        onVisibilityChange?.(inView);
      },
    });

    const parent = useRef(null);
    const parenttyping = useRef(null);
    const [messages, setMessages] = useState<
      { value: string; by: "ia" | "lead"; key: string }[]
    >([]);
    const [typing, setTyping] = useState(false);

    const executionRef = useRef(0);

    useEffect(() => {
      if (!active) {
        setMessages([]);
        setTyping(false);
        return;
      }

      const executionId = ++executionRef.current;

      async function start() {
        while (executionId === executionRef.current) {
          for (const data of list) {
            if (executionId !== executionRef.current) return;

            if (data.type === "lead") {
              setInput(data.value);
              await sleep(data.value.length * TYPE_SPEED + 200);
              if (executionId !== executionRef.current) return;
              setClicksend(true);
              setInput("");
              await sleep(90);
              if (executionId !== executionRef.current) return;

              setMessages((state) => [
                ...state,
                { by: "lead", key: nanoid(), value: data.value },
              ]);
              setTimeout(() => {
                setClicksend(false);
              }, 200);
            }

            if (data.type === "ia") {
              if (data.value.length > 5) {
                setTyping(true);
                await sleep(data.value.length * TYPE_SPEED + 100);

                if (executionId !== executionRef.current) return;
                setTyping(false);
              }

              setMessages((state) => [
                ...state,
                { by: "ia", key: nanoid(), value: data.value },
              ]);
            }

            if (data.type === "sleep" && data.sleep) {
              await sleep(data.sleep);

              if (executionId !== executionRef.current) return;
            }
          }

          await sleep(8000);

          if (executionId !== executionRef.current) return;

          setMessages([]);
          setTyping(false);
          setClicksend(false);
          setInput("");
          if (nextCard) {
            nextCard();
            return;
          }
        }
      }

      start();

      return () => {
        executionRef.current++;
      };
    }, [active, list]);

    function sleep(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    useEffect(() => {
      parent.current && autoAnimate(parent.current, slideFade);
      parenttyping.current && autoAnimate(parenttyping.current, slideFade);
    }, [parent, parenttyping]);

    return (
      <div
        style={{ overflowAnchor: "none" }}
        className="flex pointer-events-none! relative flex-col justify-end h-96 overflow-hidden z-10"
        ref={ref}
      >
        {ismodal && (
          <div className="bg-[linear-gradient(180deg,#111111_10%,rgba(41,40,40,0)100%)] z-10 absolute top-0 left-0 w-full h-14"></div>
        )}
        {!ismodal && (
          <div className="bg-[linear-gradient(180deg,#151313_10%,rgba(41,40,40,0)100%)] z-10 absolute top-0 left-0 w-full h-14"></div>
        )}

        <div
          ref={parent}
          className="flex-1 z-0 px-3 sm:px-6 flex gap-y-2 flex-col p-3 h-full justify-end overflow-hidden"
        >
          {messages.map((msg, index) => {
            let is = false;
            if (messages[index - 1] !== undefined) {
              is = msg.by === messages[index - 1].by;
            }
            return (
              <div key={msg.key} className="flex items-start gap-x-1.5">
                {msg.by === "ia" && !is && (
                  <div className="h-5 text-xs w-5 bg-[#D1FFED]/50 rounded-full flex items-center justify-center font-bold">
                    IA
                  </div>
                )}
                <div
                  className={clsx(
                    "p-1.5 rounded-xl leading-4 text-sm",
                    msg.by === "lead"
                      ? "bg-[#3d3a3a] max-w-2/3 text-start mx-auto mr-0"
                      : `border border-white/60 bg-[linear-gradient(130deg,rgba(171,200,185,1)17%,rgba(132,189,163,1)100%)] text-black max-w-3/4 ${
                          is ? "ml-7.5 -mt-2" : ""
                        }`,
                  )}
                >
                  <span>{msg.value}</span>
                </div>
              </div>
            );
          })}
          {!active && clientMeta.isMobileLike && (
            <div
              onClick={() => onPreview?.()}
              className="w-full flex items-center text-neutral-400 justify-center"
            >
              <MdOutlinePlayCircle size={33} />
            </div>
          )}
        </div>
        <div className="h-4 relative -mt-2">
          {typing && (
            <span className="text-xs px-3 absolute top-0 text-white/45 animate-typing">
              digitando...
            </span>
          )}
        </div>
        <div className="px-3.5 pb-3.5">
          <div className="border-white/5 border bg-[#3d3a3a] shadow-xl rounded-full flex items-center justify-between gap-2">
            <div className="flex-1 flex items-center pl-4 w-full min-h-14 ">
              {input && <Typewriter words={[input]} typeSpeed={TYPE_SPEED} />}
            </div>
            <div className="flex items-center gap-x-2 pl-2 pr-3.5">
              <RiSendPlane2Line
                size={36}
                className={clsx(
                  "bg-gray-300/15 p-2 rounded-full duration-200",
                  clicksend ? "animate-click bg-gray-300/25" : "",
                )}
              />
              <AiOutlineAudio
                size={36}
                className="bg-gray-300/15 p-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
