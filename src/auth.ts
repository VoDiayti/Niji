// Auth.js v5 – đăng nhập admin bằng email + mật khẩu (PBKDF2 qua WebCrypto)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { db, users } from "@/db";
import { getAuthSecret } from "@/lib/auth-secret";
import { getHashIterations, hashPassword, PASSWORD_ITERATIONS, verifyPassword } from "@/lib/password";

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

        const email = parsed.data.email.trim().toLowerCase();
        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user || !user.isActive) return null;

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        // Nâng cấp hash nếu số vòng PBKDF2 cấu hình khác với hash đang lưu (vd. đổi PASSWORD_HASH_ITERATIONS)
        const rehash = getHashIterations(user.passwordHash) !== PASSWORD_ITERATIONS ? { passwordHash: await hashPassword(parsed.data.password) } : {};
        await db.update(users).set({ lastLoginAt: new Date(), ...rehash }).where(eq(users.id, user.id));

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
}));
