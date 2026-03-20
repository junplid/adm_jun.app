import { Circle, Float } from "@chakra-ui/react";
import { JSX } from "@emotion/react/jsx-runtime";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

interface Props {
  placement?:
    | "bottom-end"
    | "bottom-start"
    | "top-end"
    | "top-start"
    | "bottom-center"
    | "top-center"
    | "middle-center"
    | "middle-end"
    | "middle-start";
  channel: "baileys" | "instagram";
  offset?: [number, number];
}

export function FloatChannelComponent({
  placement = "top-start",
  ...props
}: Props): JSX.Element {
  return (
    <Float
      offsetX={props.offset?.[0]}
      offsetY={props.offset?.[1]}
      placement={placement}
    >
      {props.channel === "baileys" && (
        <Circle size="5" bg="green.600">
          <FaWhatsapp size={14} className="text-white" />
        </Circle>
      )}
      {props.channel === "instagram" && (
        <Circle
          size="5"
          className="bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600"
        >
          <FaInstagram size={14} className="text-white" />
        </Circle>
      )}
    </Float>
  );
}
