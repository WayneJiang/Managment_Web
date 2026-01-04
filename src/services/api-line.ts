/// <reference types="vite/client" />

import axios from "axios";
import { LineLoginResponse, LineUserInfo } from "./line-login";

/**
 * LINE API 客戶端實例
 * 使用 LINE OAuth 2.0 API 的基礎 URL 進行配置
 */
const lineApiClient = axios.create({
  baseURL: "https://api.line.me/oauth2/v2.1",
});

/**
 * LINE API 服務模組
 * 提供與 LINE OAuth 2.0 相關的 API 呼叫功能
 */
export const lineApi = {
  /**
   * 將 LINE 授權碼交換為存取權杖
   *
   * @param code - LINE OAuth 授權碼
   * @param redirectUri - 重定向 URI，必須與 LINE 開發者平台設定的 URI 一致
   * @returns Promise<LineLoginResponse> - 包含存取權杖的登入回應
   * @throws Error - 當 API 呼叫失敗時拋出錯誤
   */
  async exchangeLineCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<LineLoginResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: import.meta.env.VITE_LINE_CHANNEL_ID || "",
        client_secret: import.meta.env.VITE_LINE_CHANNEL_SECRET || "",
      });

      const response = await lineApiClient.post("/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
      const axiosError = error as any;
      throw new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "LINE登入失敗"
      );
    }
  },

  /**
   * 使用存取權杖獲取 LINE 用戶資訊
   *
   * @param accessToken - LINE OAuth 存取權杖
   * @returns Promise<LineUserInfo> - 包含用戶基本資訊的物件
   * @throws Error - 當 API 呼叫失敗或權杖無效時拋出錯誤
   */
  async getLineUserInfo(accessToken: string): Promise<LineUserInfo> {
    try {
      return (
        await lineApiClient.get("/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      ).data;
    } catch (error) {
      const axiosError = error as any;
      throw new Error(
        axiosError.response?.data?.message || "無法獲取LINE用戶資料"
      );
    }
  },
};
