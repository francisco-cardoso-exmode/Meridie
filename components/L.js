"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { caminho } from "@/lib/i18n";

// <Link> que traduz o caminho interno (PT) para o idioma da página:
// <L href="/marcas"> → "/marcas" em PT, "/en/brands" em EN.
export default function L({ href, ...rest }) {
  const lang = useLang();
  return <Link href={caminho(lang, href)} {...rest} />;
}
