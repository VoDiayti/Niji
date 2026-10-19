// Auth.js v5 – đăng nhập admin bằng email + mật khẩu (PBKDF2 qua WebCrypto)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { getAuthSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// Cấu hình "lười": AUTH_SECRET được đọc theo từng request (bí mật của Cloudflare Workers chỉ có trong env của request)
export const { handlers, signIn, signOut, auth } = NextAuth(async () => ({
  ...authConfig,
  secret: await getAuthSecret(),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.trim().toLowerCase() },
        });
        if (!user || !user.isActive) return null;

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
}));
