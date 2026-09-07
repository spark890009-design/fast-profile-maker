import { useEffect, useRef, useState } from "react";
import { Play, Pause, VideoOff } from "lucide-react";
import type { Clip } from "@/lib/clipora/types";
import { useProjects } from "@/lib/clipora/store";
import { getVideoBlob, isDirectVideoUrl, vimeoId, youTubeId } from "@/lib/clipora/videoStore";
import { CAPTION_STYLES } from "@/lib/clipora/constants";
import { cn } from "@/lib/utils";

type Source =
  | { kind: "file"; url: string }
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | { kind: "none" };

interface Props {
  clip: Clip;
  className?: string;
  /** Show the hook caption over the video. */
  showCaption?: boolean;
  /** Start muted + autoplay (used for small cards). */
  preview?: boolean;
}

export default function ClipPlayer({ clip, className, showCaption = true, preview = false }: Props) {
  const { projects } = useProjects();
  const project = projects.find((p) => p.id === clip.projectId);
  const [source, setSource] = useState<Source>({ kind: "none" });
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const style = CAPTION_STYLES.find((s) => s.id === clip.captionStyle) ?? CAPTION_STYLES[0];

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    (async () => {
      if (!project) return setSource({ kind: "none" });
      const { kind, value } = project.source;

      if (kind === "upload") {
        const blob = await getVideoBlob(project.id);
        if (cancelled) return;
        if (!blob) return setSource({ kind: "none" });
        objectUrl = URL.createObjectURL(blob);
        return setSource({ kind: "file", url: objectUrl });
      }

      const yt = youTubeId(value);
      if (yt) return setSource({ kind: "youtube", id: yt });
      const vm = vimeoId(value);
      if (vm) return setSource({ kind: "vimeo", id: vm });
      if (isDirectVideoUrl(value)) return setSource({ kind: "file", url: value });
      setSource({ kind: "none" });
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [project?.id, project?.source.kind, project?.source.value]);

  // Keep native playback inside the clip window.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || source.kind !== "file") return;
    const onLoaded = () => {
      if (Math.abs(v.currentTime - clip.start) > 0.5) v.currentTime = Math.min(clip.start, v.duration - 0.1);
    };
    const onTime = () => {
      if (v.currentTime >= clip.end || v.currentTime < clip.start - 1) v.currentTime = clip.start;
    };
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [source, clip.start, clip.end]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime < clip.start || v.currentTime >= clip.end) v.currentTime = clip.start;
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const gradient = `linear-gradient(160deg, hsl(${clip.thumbnailHue} 90% 55% / .35), hsl(${(clip.thumbnailHue + 80) % 360} 90% 60% / .25))`;

  return (
    <div className={cn("relative overflow-hidden bg-background", className)} style={{ background: gradient }}>
      {source.kind === "file" && (
        <>
          <video
            ref={videoRef}
            src={source.url}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted={preview}
            loop={false}
            autoPlay={preview}
            controls={!preview}
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {preview && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); toggle(); }}
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-background/40"
              aria-label={playing ? "Pause preview" : "Play preview"}
            >
              {playing ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
          )}
        </>
      )}

      {source.kind === "youtube" && (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${source.id}?start=${Math.floor(clip.start)}&end=${Math.ceil(clip.end)}&rel=0&modestbranding=1`}
          title={clip.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}

      {source.kind === "vimeo" && (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://player.vimeo.com/video/${source.id}#t=${Math.floor(clip.start)}s`}
          title={clip.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}

      {source.kind === "none" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <VideoOff className="w-6 h-6 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground leading-snug">
            No playable video for this clip. Upload a file or paste a YouTube, Vimeo or direct .mp4 link.
          </p>
        </div>
      )}

      {showCaption && source.kind !== "file" && (
        <p className={cn(style.className, "absolute inset-x-3 bottom-3 pointer-events-none")}>{clip.hook}</p>
      )}
    </div>
  );
}
