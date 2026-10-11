import { createHash } from "crypto";
import { Request, Response } from "express";
import { EncryptJWT, jwtDecrypt, JWTPayload } from "jose";

// Keep the complete Cookie header below common reverse proxies' 8 KiB limit.
const CHUNK_SIZE = 3000;
const CHUNKS = 2;

export class AuthCookies {
  private keys: { id: string; bytes: Buffer }[];
  private prefix: string;

  constructor(keys: string[], private origin: string, private secure: boolean) {
    if (!keys.length)
      throw new Error("At least one auth cookie key is required");
    this.keys = keys.map((key) => {
      const bytes = Buffer.from(key, "base64");
      if (bytes.length !== 32 || bytes.toString("base64") !== key) {
        throw new Error(
          "Auth cookie keys must be canonical base64-encoded 32-byte keys"
        );
      }
      return {
        bytes,
        id: createHash("sha256").update(bytes).digest("hex").slice(0, 16),
      };
    });
    this.prefix = secure ? "__Host-lani" : "lani-local";
  }

  private options(maxAge: number) {
    return {
      httpOnly: true,
      secure: this.secure,
      sameSite: "lax" as const,
      path: "/",
      maxAge,
    };
  }

  private name(kind: string, index: number) {
    return `${this.prefix}-${kind}.${index}`;
  }

  async read(req: Request, kind: string): Promise<JWTPayload | undefined> {
    const cookies = new Map(
      (req.headers.cookie || "").split(";").map((part) => {
        const at = part.indexOf("=");
        return [part.slice(0, at).trim(), part.slice(at + 1)] as [
          string,
          string
        ];
      })
    );
    const value = Array.from(
      { length: CHUNKS },
      (_, i) => cookies.get(this.name(kind, i)) || ""
    ).join("");
    if (!value || value.length > CHUNK_SIZE * CHUNKS) return;
    try {
      const { payload } = await jwtDecrypt(
        value,
        (header) => {
          const key = this.keys.find((item) => item.id === header.kid);
          if (!key) throw new Error("Unknown cookie key");
          return key.bytes;
        },
        {
          issuer: this.origin,
          audience: `lani:${kind}`,
          keyManagementAlgorithms: ["dir"],
          contentEncryptionAlgorithms: ["A256GCM"],
        }
      );
      return payload;
    } catch {
      return;
    }
  }

  async write(
    res: Response,
    kind: string,
    payload: JWTPayload,
    expiresAt: number
  ) {
    const key = this.keys[0];
    const value = await new EncryptJWT(payload)
      .setProtectedHeader({ alg: "dir", enc: "A256GCM", kid: key.id })
      .setIssuer(this.origin)
      .setAudience(`lani:${kind}`)
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .encrypt(key.bytes);
    if (value.length > CHUNK_SIZE * CHUNKS)
      throw new Error("Auth credentials exceed cookie size limit");
    for (let i = 0; i < CHUNKS; i++) {
      const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      if (chunk)
        res.cookie(
          this.name(kind, i),
          chunk,
          this.options(Math.max(0, expiresAt * 1000 - Date.now()))
        );
      else res.clearCookie(this.name(kind, i), this.options(0));
    }
  }

  clear(res: Response, kind: string) {
    for (let i = 0; i < CHUNKS; i++)
      res.clearCookie(this.name(kind, i), this.options(0));
  }
}
