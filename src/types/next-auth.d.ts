import type { DefaultSession } from "next-auth";
import type { Role } from "@/db/enums";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
  interface User {
    role: Role;
  }
}

// next-auth/jwt chỉ re-export từ @auth/core/jwt nên phải mở rộng ở module gốc
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
