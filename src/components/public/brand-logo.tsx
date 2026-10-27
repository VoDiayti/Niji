import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  logo?: string | null;
  companyName: string;
  shortName?: string | null;
  /** Hiện tên công ty bên cạnh logo */
  showName?: boolean;
  tone?: "default" | "light";
  className?: string;
  onClick?: () => void;
};

/** Logo + tên công ty, dẫn về trang chủ */
export function BrandLogo({ logo, companyName, shortName, showName = true, tone = "default", className, onClick }: BrandLogoProps) {
  return (
    <Link href="/" onClick={onClick} className={cn("flex items-center gap-3", className)} aria-label={`${shortName || companyName} – Trang chủ`}>
      {logo ? (
        // Cao cố định, rộng theo tỉ lệ ảnh (logo tròn hay logo ngang đều không bị chừa khoảng trống)
        <Image
          src={logo}
          alt={shortName || companyName}
          width={160}
          height={160}
          priority
          className="h-10 w-auto max-w-32 shrink-0 object-contain object-left sm:h-11 sm:max-w-36 2xl:max-w-40"
        />
      ) : (
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground">
          {(shortName || companyName).slice(0, 2).toUpperCase()}
        </span>
      )}
      {showName && (
        <span className={cn("hidden w-44 max-w-[14rem] text-xs font-semibold leading-snug md:block lg:hidden", tone === "light" ? "text-white/90" : "text-brand-dark")}>
          {companyName}
        </span>
      )}
    </Link>
  );
}
