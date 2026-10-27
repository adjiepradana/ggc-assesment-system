import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getRequestOrigin } from "@/lib/request-origin";
import { resolveBaseUrl } from "@/lib/mail";
import { sanitizeExcelCell, sanitizeExcelRow } from "@/lib/excel-sanitize";

describe("Security Email Link Resolution (F-02)", () => {
  const originalEnv = process.env.NEXTAUTH_URL;

  beforeEach(() => {
    process.env.NEXTAUTH_URL = "https://gogreatcareer.com/";
  });

  afterEach(() => {
    process.env.NEXTAUTH_URL = originalEnv;
  });

  it("getRequestOrigin ignores forged Origin, Referer, X-Forwarded-Host, and Host headers", () => {
    const forgedRequest = new Request("https://gogreatcareer.com/api/auth/forgot-password", {
      method: "POST",
      headers: {
        Origin: "https://evil-attacker.com",
        Referer: "https://evil-attacker.com/phishing",
        "X-Forwarded-Host": "evil-attacker.com",
        Host: "evil-attacker.com",
      },
    });

    expect(getRequestOrigin(forgedRequest)).toBe("https://gogreatcareer.com");
  });

  it("resolveBaseUrl strictly uses NEXTAUTH_URL and ignores any customBaseUrl parameter", () => {
    expect(resolveBaseUrl("https://evil-attacker.com")).toBe("https://gogreatcareer.com");
    expect(resolveBaseUrl()).toBe("https://gogreatcareer.com");
  });
});

describe("Excel Formula Injection Sanitization (DISC-10)", () => {
  it("prefixes strings starting with =, +, -, @, tab, or carriage return with a single quote", () => {
    expect(sanitizeExcelCell("=CMD|' /C calc'!A0")).toBe("'=CMD|' /C calc'!A0");
    expect(sanitizeExcelCell("+SUM(A1:A10)")).toBe("'+SUM(A1:A10)");
    expect(sanitizeExcelCell("-2+3+cmd|' /C calc'!A0")).toBe("'-2+3+cmd|' /C calc'!A0");
    expect(sanitizeExcelCell("@SUM(1+1)")).toBe("'@SUM(1+1)");
    expect(sanitizeExcelCell("\t=1+1")).toBe("'\t=1+1");
    expect(sanitizeExcelCell("\r=1+1")).toBe("'\r=1+1");
  });

  it("leaves safe strings and non-string primitives unmodified", () => {
    expect(sanitizeExcelCell("Budi Santoso")).toBe("Budi Santoso");
    expect(sanitizeExcelCell("SMA Negeri 1 Jakarta")).toBe("SMA Negeri 1 Jakarta");
    expect(sanitizeExcelCell(84)).toBe(84);
    expect(sanitizeExcelCell(null)).toBeNull();
  });

  it("sanitizes all fields in a row object", () => {
    const row = sanitizeExcelRow({
      No: 1,
      "Nama Lengkap": "=HYPERLINK(\"http://evil.com\",\"Click\")",
      Email: "student@example.com",
    });

    expect(row.No).toBe(1);
    expect(row["Nama Lengkap"]).toBe("'=HYPERLINK(\"http://evil.com\",\"Click\")");
    expect(row.Email).toBe("student@example.com");
  });
});
