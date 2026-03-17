import crypto from "node:crypto";

type InitDataEntry = {
  key: string;
  value: string;
};

export function parseInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  const authDate = params.get("auth_date");
  const user = params.get("user");

  const entries: InitDataEntry[] = [];

  params.forEach((value, key) => {
    if (key !== "hash") {
      entries.push({ key, value });
    }
  });

  const dataCheckString = entries
    .sort((left, right) => left.key.localeCompare(right.key))
    .map((entry) => `${entry.key}=${entry.value}`)
    .join("\n");

  return {
    authDate,
    dataCheckString,
    hash,
    rawUser: user
  };
}

export function validateTelegramInitData(initData: string, botToken: string) {
  const parsed = parseInitData(initData);

  if (!parsed.hash) {
    return false;
  }

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const generatedHash = crypto.createHmac("sha256", secretKey).update(parsed.dataCheckString).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(parsed.hash));
}

export function parseTelegramUser(rawUser: string | null) {
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  } catch {
    return null;
  }
}
