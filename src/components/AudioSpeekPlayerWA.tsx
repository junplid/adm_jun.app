import AudioPlayer from "react-h5-audio-player";
import { RiPauseFill, RiPlayFill } from "react-icons/ri";
import "react-h5-audio-player/lib/styles.css";
import { Avatar } from "@components/ui/avatar";
import { ImMic } from "react-icons/im";
import { JSX } from "react";

export default function AudioSpeekPlayerWA({
  src,
}: {
  src: string;
}): JSX.Element {
  return (
    <div
      className={
        "flex w-full gap-0.5 p-2 px-1 bg-zinc-800/70 rounded-md items-center"
      }
    >
      <div className="relative ml-2">
        <Avatar colorPalette={"purple"} />
        <ImMic
          size={16}
          className="absolute bottom-0 -right-1.5 text-[#0dacd4]"
        />
      </div>
      {/* @ts-expect-error */}
      <AudioPlayer
        src={src}
        preload="metadata"
        showJumpControls={false}
        showDownloadProgress={false}
        showFilledProgress
        customAdditionalControls={[]}
        customProgressBarSection={["DURATION", "PROGRESS_BAR"]}
        customVolumeControls={[]}
        customIcons={{
          play: <RiPlayFill size={20} />,
          pause: <RiPauseFill size={20} />,
        }}
        layout="horizontal-reverse"
      />
    </div>
  );
}
