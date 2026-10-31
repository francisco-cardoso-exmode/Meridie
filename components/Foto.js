import Image from "next/image";
import { fotoOtimizavel } from "@/components/fotoHosts.mjs";

/**
 * <Image> do Next quando o URL é de um host permitido (ver fotoHosts.mjs) ou
 * um ficheiro local; senão um <img> simples com os mesmos atributos.
 * Os dados vêm da BD (e o comparador lê do localStorage), por isso um URL de
 * outro host não pode rebentar a página com "hostname is not configured".
 * Aceita as props do next/image (fill, sizes, priority, width, height, ...).
 */
export default function Foto({ src, alt = "", fill, sizes, priority, quality, style, ...rest }) {
  if (fotoOtimizavel(src)) {
    return (
      <Image src={src} alt={alt} fill={fill} sizes={sizes} priority={priority} quality={quality} style={style} {...rest} />
    );
  }
  // Fallback: imita o que o next/image faria com fill / priority.
  const estilo = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : style;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={estilo}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      {...rest}
    />
  );
}
