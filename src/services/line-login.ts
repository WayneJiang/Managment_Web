/**
 * LINE LOGIN 相關類型定義和服務
 * 提供 LINE 登入功能的完整實作，包括 OAuth 2.0 授權流程
 */

/** 通用的登入失敗訊息（各處共用，避免文字不一致） */
export const LOGIN_FAILED_MESSAGE = "LINE 登入失敗，請稍後再試";

/**
 * LINE 登入配置介面
 */
export interface LineLoginConfig {
  /** LINE Channel ID，用於識別應用程式 */
  channelId: string;
  /** 重定向 URI，授權完成後的回調地址 */
  redirectUri: string;
}

/**
 * LINE LOGIN 服務類別
 * 提供 LINE 授權 URL 的生成
 */
export class LineLoginService {
  /** LINE 登入配置 */
  private readonly config: LineLoginConfig;

  /**
   * 建構函式
   * @param config LINE 登入配置物件
   */
  constructor(config: LineLoginConfig) {
    this.config = config;
  }

  /**
   * 生成 LINE 登入 URL
   * 建立包含必要參數的 LINE 授權 URL，用於重定向使用者進行登入
   * @param state 防 CSRF 的 state（必填）
   * @param nonce 綁定 id_token 的 nonce（必填）
   * @returns 完整的 LINE 授權 URL
   */
  generateLoginUrl(state: string, nonce: string): string {
    const baseUrl = "https://access.line.me/oauth2/v2.1/authorize";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.channelId,
      redirect_uri: this.config.redirectUri,
      state,
      nonce,
      scope: "profile openid",
    });

    return `${baseUrl}?${params.toString()}`;
  }
}

/**
 * LINE 授權完成後的回調地址（授權 URL 與後端交換授權碼必須使用同一個值）
 */
export const getLineRedirectUri = (): string =>
  `${window.location.origin}/line-callback`;

/**
 * 建立 LINE LOGIN 服務實例
 * 使用環境變數和預設配置建立 LineLoginService 實例
 * @returns 配置完成的 LineLoginService 實例
 */
export const createLineLoginService = (): LineLoginService => {
  const config: LineLoginConfig = {
    channelId: import.meta.env.VITE_LINE_LOGIN_CHANNEL_ID || "",
    redirectUri: getLineRedirectUri(),
  };

  return new LineLoginService(config);
};
