import { videoSrc } from "@/lib/format";

export default function VideoEmbed({ url }) {
  const v = videoSrc(url);
  if (!v) return null;
  if (v.tipo === "file") {
    return <video className="video-embed" src={v.src} controls />;
  }
  return (
    <iframe
      className="video-embed"
      src={v.src}
      title="Vídeo do empreendimento"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}
