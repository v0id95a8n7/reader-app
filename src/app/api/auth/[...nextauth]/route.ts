import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";

// В NextAuth v4 типы для App Router еще не полностью поддерживаются
// Поэтому используем прямой экспорт функций из NextAuth
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const { GET, POST } = NextAuth(authOptions);