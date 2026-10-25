"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/components/admin/nav";
import type { Role } from "@/db/enums";

export function AdminNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {ADMIN_NAV.map((group) => {
        const items = group.items.filter((i) => !i.adminOnly || role === "ADMIN");
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{group.title}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function SidebarBrand({ companyName }: { companyName: string }) {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
      <Image src="/logo.svg" alt="" width={36} height={36} className="rounded-lg" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-sidebar-foreground">{companyName}</p>
        <p className="text-[11px] text-sidebar-foreground/60">Trang quản trị</p>
      </div>
    </Link>
  );
}

/** Sidebar cố định (desktop) */
export function AdminSidebar({ role, companyName }: { role: Role; companyName: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarBrand companyName={companyName} />
      <AdminNav role={role} />
    </aside>
  );
}
