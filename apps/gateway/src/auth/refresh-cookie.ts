import { hkdfSync } from "crypto";
import { Request, Response } from "express";
import { EncryptJWT, jwtDecrypt } from "jose";

export interface RefreshSession {
  sub: string;
  token: string;
  profile: Record<string, string>;
  deadline: number;
  exp: number;
}

// 刷新凭据使用独立用途的密钥与 Cookie，不能作为业务会话使用。
export function createRefreshCookie(
  secrets: string[],
  secure: boolean,
  audience: string
) {
  const name = secure ? "__Host-lani-refresh" : "lani-local-refresh";
  const keys = secrets.map((secret) =>
    Buffer.from(hkdfSync("sha256", secret, "", "lani refresh cookie v1", 32))
  );
  const cookieOptions = {
    secure,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
  };
  return {
    async read(req: Request): Promise<RefreshSession | undefined> {
      const values = (req.headers.cookie || "")
        .split(";")
        .map((part) => part.trim())
        .filter((part) => part.startsWith(`${name}=`));
      if (values.length !== 1) return;
      const value = values[0].slice(name.length + 1);
      if (value.length > 3800) return;
      for (const key of keys) {
        try {
          const { payload } = await jwtDecrypt(value, key, {
            audience,
            keyManagementAlgorithms: ["dir"],
            contentEncryptionAlgorithms: ["A256GCM"],
          });
          if (
            typeof payload.sub === "string" &&
            typeof payload.token === "string" &&
            typeof payload.deadline === "number" &&
            typeof payload.exp === "number" &&
            payload.exp <= payload.deadline &&
            payload.profile &&
            typeof payload.profile === "object"
          )
            return payload as unknown as RefreshSession;
        } catch {
          // 允许滚动轮换密钥；无效、过期 Cookie 只视为不可刷新。
        }
      }
    },
    async encode(session: RefreshSession) {
      const value = await new EncryptJWT({ ...session })
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .setAudience(audience)
        .setIssuedAt()
        .encrypt(keys[0]);
      if (value.length > 3800)
        throw new Error("Refresh session exceeds cookie size limit");
      return value;
    },
    write(res: Response, value: string, expiresAt: number) {
      res.cookie(name, value, {
        ...cookieOptions,
        expires: new Date(expiresAt * 1000),
      });
    },
    clear(res: Response) {
      res.clearCookie(name, cookieOptions);
    },
  };
}
