/**
 * LINE 登入 State 管理工具
 * 用於在 LINE 登入流程中傳遞和驗證狀態資訊
 */

/**
 * LINE 登入目的類型
 */
export type LineLoginPurpose = "normal" | "bind-coach";

/**
 * LINE 登入狀態介面
 */
export interface LineLoginState {
  /** 登入目的 */
  purpose: LineLoginPurpose;
  /** 額外資料（例如：教練 ID） */
  data?: {
    coachId?: number;
    [key: string]: any;
  };
  /** 隨機字串，用於防止 CSRF 攻擊 */
  nonce: string;
}

/**
 * 生成隨機字串
 */
const generateNonce = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

/**
 * 編碼 LINE 登入狀態
 * 將狀態物件轉換為 Base64 字串
 */
export const encodeLineState = (
  purpose: LineLoginPurpose,
  data?: Record<string, any>
): string => {
  const state: LineLoginState = {
    purpose,
    data,
    nonce: generateNonce(),
  };

  const jsonString = JSON.stringify(state);
  return btoa(jsonString);
};

/**
 * 解碼 LINE 登入狀態
 * 將 Base64 字串轉換回狀態物件
 */
export const decodeLineState = (stateString: string): LineLoginState | null => {
  try {
    const jsonString = atob(stateString);
    const state = JSON.parse(jsonString) as LineLoginState;

    // 驗證必要欄位
    if (!state.purpose || !state.nonce) {
      return null;
    }

    return state;
  } catch (error) {
    console.error("Failed to decode LINE state:", error);
    return null;
  }
};

/**
 * 從 URL 參數中獲取並解碼 state
 */
export const getLineStateFromUrl = (): LineLoginState | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const stateString = urlParams.get("state");

  if (!stateString) {
    return null;
  }

  return decodeLineState(stateString);
};
