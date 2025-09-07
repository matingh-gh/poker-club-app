"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Globe2 } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Nav(){
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const items = [
    { href: "/", label: t("nav.players") },
    { href: "/tournament", label: t("nav.tournament") },
    { href: "/cashgame", label: t("nav.cashgame") },
    { href: "/rankings", label: t("nav.rankings") },
  ];
  return (
    <div className="sticky top-0 z-50 backdrop-blur border-b border-gray-800 bg-black/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
        <div className="flex gap-2">
          {items.map(it => (
            <Link key={it.href} href={it.href} className={clsx("px-3 py-1 rounded-xl hover:bg-gray-800", pathname===it.href && "bg-gray-800")}>{it.label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4" />
          <select className="input" value={locale} onChange={e=>setLocale(e.target.value)}>
            <option value="en">EN</option>
            <option value="fa">FA</option>
          </select>
        </div>
      </div>
    </div>
  );
}
