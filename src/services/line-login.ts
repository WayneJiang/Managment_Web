/**
 * LINE LOGIN 相關類型定義和服務
 * 提供 LINE 登入功能的完整實作，包括 OAuth 2.0 授權流程
 */

/**
 * LINE 登入配置介面
 */
export interface LineLoginConfig {
  /** LINE Channel ID，用於識別應用程式 */
  channelId: string;
  /** 重定向 URI，授權完成後的回調地址 */
  redirectUri: string;
  /** 可選的 state 參數，用於防止 CSRF 攻擊 */
  state?: string;
}

/**
 * LINE 登入回應介面
 * 包含從 LINE 授權伺服器獲取的存取令牌資訊
 */
export interface LineLoginResponse {
  /** 存取令牌，用於後續 API 呼叫 */
  access_token: string;
  /** 令牌類型，通常為 "Bearer" */
  token_type: string;
  /** 刷新令牌，用於更新存取令牌 */
  refresh_token: string;
  /** 令牌過期時間（秒） */
  expires_in: number;
  /** 授權範圍 */
  scope: string;
}

/**
 * LINE 使用者資訊介面
 * 包含從 LINE 獲取的基本使用者資訊
 */
export interface LineUserInfo {
  /** 使用者的唯一識別碼 */
  sub: string;
}

/**
 * LINE LOGIN 服務類別
 * 提供完整的 LINE 登入功能，包括 URL 生成、參數提取和驗證
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
   * @param state 可選的 state 參數，用於防止 CSRF 攻擊
   * @returns 完整的 LINE 授權 URL
   */
  generateLoginUrl(state?: string): string {
    const baseUrl = "https://access.line.me/oauth2/v2.1/authorize";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.channelId,
      redirect_uri: this.config.redirectUri,
      state: state || this.config.state || this.generateRandomState(),
      scope: "openid",
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * 從 URL 參數中提取授權碼
   * 在 LINE 授權回調後，從 URL 中提取授權碼用於後續的令牌交換
   * @returns 授權碼，如果不存在則返回 null
   */
  extractAuthorizationCode(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("code");
  }

  /**
   * 從 URL 參數中提取 state 參數
   * 用於驗證授權請求的完整性，防止 CSRF 攻擊
   * @returns state 參數值，如果不存在則返回 null
   */
  extractState(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("state");
  }

  /**
   * 檢查是否有錯誤參數
   * 檢查 URL 中是否包含錯誤參數，表示授權過程中發生錯誤
   * @returns 如果存在錯誤參數則返回 true，否則返回 false
   */
  hasError(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has("error");
  }

  /**
   * 獲取錯誤訊息
   * 從 URL 參數中提取錯誤描述或錯誤代碼
   * @returns 錯誤訊息，如果不存在則返回 null
   */
  getErrorMessage(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("error_description") || urlParams.get("error");
  }

  /**
   * 生成隨機 state 參數
   * 產生一個隨機字串作為 state 參數，用於防止 CSRF 攻擊
   * @returns 隨機生成的 state 字串
   */
  private generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * 驗證 state 參數
   * 比較儲存的 state 和接收到的 state 是否一致，確保授權請求的完整性
   * @param storedState 之前儲存的 state 值
   * @param receivedState 從 URL 中接收到的 state 值
   * @returns 如果兩個 state 值相同則返回 true，否則返回 false
   */
  validateState(storedState: string, receivedState: string): boolean {
    return storedState === receivedState;
  }
}

/**
 * 建立 LINE LOGIN 服務實例
 * 使用環境變數和預設配置建立 LineLoginService 實例
 * @returns 配置完成的 LineLoginService 實例
 */
export const createLineLoginService = (): LineLoginService => {
  const config: LineLoginConfig = {
    channelId: import.meta.env.VITE_LINE_CHANNEL_ID || "",
    redirectUri: `${window.location.origin}/line-callback`,
  };

  return new LineLoginService(config);
};
