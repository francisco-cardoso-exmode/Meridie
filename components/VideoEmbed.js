"use client";

import { videoSrc } from "@/lib/format";
import { useT } from "@/components/LangProvider";

export default function VideoEmbed({ url }) {
  const { t, tf } = useT();
  const v = videoSrc(url);
  if (!v) return null;
  if (v.tipo === "file") {
    return <video className="video-embed" src={v.src} controls />;
  }
  return (
    <iframe
      className="video-embed"
      src={v.src}
      title={t("Vídeo do empreendimento")}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}
