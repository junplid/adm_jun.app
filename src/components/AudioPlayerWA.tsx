import AudioPlayer from "react-h5-audio-player";
import { RiPauseFill, RiPlayFill } from "react-icons/ri";
import "react-h5-audio-player/lib/styles.css";
import { Avatar } from "@components/ui/avatar";
import { JSX } from "react";
import { TbHeadphonesFilled } from "react-icons/tb";

export default function AudioPlayerWA({ src }: { src: string }): JSX.Element {
  return (
    <div
      className={
        "flex w-full gap-0.5 p-2 px-1 bg-zinc-800/70 rounded-md items-center"
      }
    >
      <Avatar
        icon={<TbHeadphonesFilled color="#fff5ca" size={20} />}
        bg={"#c49807"}
        className="ml-2"
      />

      <AudioPlayer
        src={src}
        preload="metadata"
        showJumpControls={false}
        showDownloadProgress={false}
        showFilledProgress
        customAdditionalControls={[]}
        // @ts-expect-error
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
