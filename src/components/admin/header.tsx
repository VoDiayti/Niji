"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { ROLE_LABELS } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth-guard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdminNav, SidebarBrand } from "@/components/admin/sidebar";

export function AdminHeader({ user, companyName }: { user: SessionUser; companyName: string }) {
  const [open, setOpen] = useState(false);
  const initials = (user.name ?? user.email ?? "A").split(" ").map((s) => s[0]).join("").slice(-2).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      {/* Menu di động */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Mở menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground">
          <SheetTitle className="sr-only">Menu quản trị</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarBrand companyName={companyName} />
            <AdminNav role={user.role} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
        <Link href="/" target="_blank"><ExternalLink /> Xem website</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2" aria-label="Tài khoản">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-left md:block">
              <span className="block text-sm font-medium leading-tight">{user.name}</span>
              <span className="block text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/admin/tai-khoan/doi-mat-khau">Đổi mật khẩu</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/" target="_blank">Xem website</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => void logoutAction()}>
            <LogOut /> Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
