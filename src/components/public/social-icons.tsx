import { cn } from "@/lib/utils";

type IconProps = React.SVGProps<SVGSVGElement>;

/* lucide-react v1 không có icon thương hiệu nên dùng SVG inline */

export function FacebookIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cn("size-5", className)} {...props}>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

export function YoutubeIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cn("size-5", className)} {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
    </svg>
  );
}

export function TiktokIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cn("size-5", className)} {...props}>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function MessengerIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cn("size-5", className)} {...props}>
      <path d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.43 6.52 3.77 8.6.2.18.31.43.32.7l.07 2.13a.96.96 0 0 0 1.35.85l2.38-1.05c.2-.09.43-.1.64-.05 1.09.3 2.26.46 3.47.46 6.76 0 12-4.95 12-11.64S18.76 0 12 0zm7.2 8.96l-3.52 5.59a1.8 1.8 0 0 1-2.6.48l-2.8-2.1a.72.72 0 0 0-.87 0l-3.79 2.87c-.5.38-1.16-.22-.82-.76l3.52-5.59a1.8 1.8 0 0 1 2.6-.48l2.8 2.1a.72.72 0 0 0 .87 0l3.79-2.87c.5-.38 1.16.22.82.76z" />
    </svg>
  );
}

/** Biểu tượng Zalo dạng chữ trong vòng tròn viền (lucide không có icon chính thức) */
export function ZaloIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-5", className)} {...props}>
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <text
        x="24"
        y="29.5"
        textAnchor="middle"
        fontFamily="Be Vietnam Pro, Arial, sans-serif"
        fontSize="15"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        Zalo
      </text>
    </svg>
  );
}

export type SocialLinksProps = {
  facebook?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  zalo?: string | null;
  messenger?: string | null;
  className?: string;
  itemClassName?: string;
};

/** Hàng icon mạng xã hội – tự ẩn mục không có dữ liệu */
export function SocialLinks({ facebook, youtube, tiktok, zalo, messenger, className, itemClassName }: SocialLinksProps) {
  const items = [
    { href: facebook, label: "Facebook", Icon: FacebookIcon },
    { href: youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: tiktok, label: "TikTok", Icon: TiktokIcon },
    { href: zalo, label: "Zalo", Icon: ZaloIcon },
    { href: messenger, label: "Messenger", Icon: MessengerIcon },
  ].filter((i) => Boolean(i.href));
  if (items.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href as string}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-current transition-colors hover:bg-cta hover:text-cta-foreground",
            itemClassName
          )}
        >
          <Icon className="size-5" />
        </a>
      ))}
    </div>
  );
}
