/**
 * LINE 登入 state / nonce 管理工具（防 login CSRF）
 *
 * - state 與 nonce 皆為 32 bytes 密碼學亂數的 base64url（不含 padding，43 字元）。
 * - 登入目的與額外資料存在 sessionStorage 的 pending 紀錄中，不再編碼進 state。
 * - callback 時以 consumePendingLineLogin 一次性驗證 state。
 */

export type LineLoginPurpose = "normal" | "bind-coach";

export interface PendingLineLogin {
  state: string;
  nonce: string;
  purpose: LineLoginPurpose;
  data?: { coachId?: number };
  createdAt: number;
}

const PENDING_KEY = "lineLoginPending";
const PENDING_TTL_MS = 10 * 60 * 1000;
/** 容許的時鐘倒退（例如系統時間被校正）*/
const CLOCK_SKEW_MS = 60 * 1000;

export const STORAGE_BLOCKED_MESSAGE =
  "瀏覽器封鎖了工作階段儲存空間，請關閉隱私限制或改用其他瀏覽器後重試";

/** sessionStorage 不可用（例如 SecurityError）時拋出 */
export class SessionStorageUnavailableError extends Error {
  constructor() {
    super(STORAGE_BLOCKED_MESSAGE);
    this.name = "SessionStorageUnavailableError";
  }
}

/** 32 bytes 亂數 -> base64url（不含 padding，43 字元） */
const randomToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const isPurpose = (v: unknown): v is LineLoginPurpose =>
  v === "normal" || v === "bind-coach";

const parsePending = (raw: string | null): PendingLineLogin | null => {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<PendingLineLogin> | null;
    if (
      !p ||
      typeof p.state !== "string" ||
      typeof p.nonce !== "string" ||
      !isPurpose(p.purpose) ||
      typeof p.createdAt !== "number"
    ) {
      return null;
    }
    if (p.purpose === "bind-coach") {
      const coachId = p.data?.coachId;
      if (!Number.isInteger(coachId) || (coachId as number) <= 0) return null;
    }
    return p as PendingLineLogin;
  } catch {
    return null;
  }
};

/**
 * 產生 state / nonce 並寫入 pending 紀錄（必須在 window.open 之前呼叫）。
 * sessionStorage 不可用時拋出 SessionStorageUnavailableError。
 */
export const beginLineLogin = (
  purpose: LineLoginPurpose,
  data?: { coachId?: number }
): { state: string; nonce: string } => {
  const state = randomToken();
  const nonce = randomToken();
  const pending: PendingLineLogin = {
    state,
    nonce,
    purpose,
    data,
    createdAt: Date.now(),
  };
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    throw new SessionStorageUnavailableError();
  }
  return { state, nonce };
};

/**
 * 一次性取出並驗證 pending。
 * - 紀錄不存在或無法解析 -> null（不動儲存）
 * - 已過期 -> 刪除並回傳 null
 * - state 缺少或不符 -> 回傳 null，不刪除（避免被攻擊者的偽造 callback 清掉正在進行的登入）
 * - state 相符 -> 刪除並回傳紀錄（一次性）
 */
export const consumePendingLineLogin = (
  receivedState: string | null
): PendingLineLogin | null => {
  try {
    const pending = parsePending(window.sessionStorage.getItem(PENDING_KEY));
    if (!pending) return null;
    if (!isFresh(pending)) {
      window.sessionStorage.removeItem(PENDING_KEY);
      return null;
    }
    if (!receivedState || pending.state !== receivedState) return null;
    window.sessionStorage.removeItem(PENDING_KEY);
    return pending;
  } catch {
    return null;
  }
};

const isFresh = (pending: PendingLineLogin): boolean => {
  const age = Date.now() - pending.createdAt;
  return age >= -CLOCK_SKEW_MS && age <= PENDING_TTL_MS;
};

/**
 * 只有在 callback 的 state 與 pending 相符（且未過期）時才清除 pending。
 * 不符時保留 pending 不動。回傳是否相符。
 */
export const clearPendingIfStateMatches = (
  receivedState: string | null
): boolean => {
  try {
    const pending = parsePending(window.sessionStorage.getItem(PENDING_KEY));
    if (!pending || !receivedState) return false;
    if (pending.state !== receivedState || !isFresh(pending)) return false;
    window.sessionStorage.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
};

/** 只讀取 purpose / data（不刪除、不驗證 state；但過期的紀錄視為不存在） */
export const peekPendingPurpose = (): {
  purpose: LineLoginPurpose;
  data?: { coachId?: number };
} | null => {
  try {
    const pending = parsePending(window.sessionStorage.getItem(PENDING_KEY));
    return pending && isFresh(pending)
      ? { purpose: pending.purpose, data: pending.data }
      : null;
  } catch {
    return null;
  }
};

export const clearPendingLineLogin = (): void => {
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // sessionStorage 不可用時無事可做
  }
};
