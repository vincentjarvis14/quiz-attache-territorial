"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  href: string;
  iconSrc: string;
};

export const SidebarItem = ({ label, href, iconSrc }: Props) => {
  const pathname = usePathname();
  const active = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-gradient-to-r from-purple-50 to-purple-100/60 text-purple-700 shadow-sm"
          : "text-slate-500 hover:bg-purple-50/60 hover:text-purple-600"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
        active
          ? "bg-purple-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-400"
      )}>
        <Image src={iconSrc} alt={label} width={18} height={18} className={cn(active && "brightness-0 invert")} />
      </div>
      {label}
    </Link>
  );
};
