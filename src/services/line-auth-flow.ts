import { useViewerStore } from "../stores/viewer";
import { useTraineeStore } from "../stores/trainee";
import { useCoachStore } from "../stores/coach";
import { useNavigationStore } from "../stores/navigation";
import {
  clearPendingIfStateMatches,
  consumePendingLineLogin,
} from "../utils/line-state";
import { getLineRedirectUri } from "./line-login";
import { api } from "./api";

export const LINE_AUTH_MESSAGE_TYPE = "line-auth-callback";
export const LINE_LOGIN_POPUP_NAME = "lineLoginPopup";

export interface LineAuthMessage {
  type: typeof LINE_AUTH_MESSAGE_TYPE;
  code?: string;
  state?: string;
  error?: string;
}

/** popup 被偵測為關閉後，等待已排入佇列的 message 事件的寬限時間 */
export const POPUP_CLOSED_GRACE_MS = 500;

export const STATE_FAILED_MESSAGE = "登入狀態驗證失敗，請重新登入";
export const LOGIN_CANCELLED_MESSAGE = "您已取消 LINE 登入授權";
export const LOGIN_ERROR_MESSAGE = "LINE 登入過程中發生錯誤，請重新登入";

/**
 * 處理 LINE 回傳的 OAuth error：只看 error 代碼，絕不顯示 URL 上的任何文字。
 * 只有 callback 的 state 與 pending 相符時才清除 pending；不符則保留並回報狀態驗證失敗。
 * @returns 要顯示的固定訊息
 */
export const resolveLineAuthError = (
  errorCode: string | null | undefined,
  state: string | null | undefined
): string => {
  if (!clearPendingIfStateMatches(state ?? null)) {
    return STATE_FAILED_MESSAGE;
  }
  return errorCode === "access_denied"
    ? LOGIN_CANCELLED_MESSAGE
    : LOGIN_ERROR_MESSAGE;
};

export const openLineLoginPopup = (loginUrl: string): Window | null => {
  const width = 500;
  const height = 700;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
  const features = `popup=yes,width=${width},height=${height},left=${left},top=${top}`;
  return window.open(loginUrl, LINE_LOGIN_POPUP_NAME, features);
};

const handleBindCoach = async (
  socialId: string,
  coachId: number
): Promise<void> => {
  const coachStore = useCoachStore();
  const coach = await coachStore.fetchCoachById(coachId);
  if (!coach) {
    throw new Error("未找到教練資料");
  }

  const success = await coachStore.updateCoach({
    id: coachId,
    name: coach.name,
    coachType: coach.coachType || "Team",
    socialId,
  });

  if (!success) {
    throw new Error("綁定失敗，請稍後再試");
  }

  const navStore = useNavigationStore();
  navStore.setViewer(coachId);
  navStore.setCoachNav(coachId);
  window.location.replace("/coach");
};

/**
 * 用授權碼完成 LINE 登入：由後端交換授權碼並取得使用者資料、依角色更新 store 並導向。
 * 在 popup 流程中由主視窗呼叫；fallback 整頁流程則由 LineCallback 直接呼叫。
 */
export const processLineAuthCode = async (
  code: string,
  stateStr: string | null
): Promise<void> => {
  // 一次性驗證 state（先刪除紀錄）；失敗時不呼叫後端
  const pending = consumePendingLineLogin(stateStr);
  if (!pending) {
    throw new Error(STATE_FAILED_MESSAGE);
  }

  const redirectUri = getLineRedirectUri();
  const profile = await api.lineLogin(code, redirectUri, pending.nonce);

  const socialId = profile?.userId?.trim();
  const note = profile?.displayName ?? "";

  // sub 為空時後端會被打成 GET /view/ 而回 404，錯誤會被誤判成「查無使用者」
  if (!socialId) {
    throw new Error("LINE 授權未回傳使用者識別碼，請重新登入");
  }

  if (pending.purpose === "bind-coach") {
    // bind-coach 紀錄必須帶有效的 coachId，否則不得退化成一般登入
    const coachId = pending.data?.coachId;
    if (!Number.isInteger(coachId) || (coachId as number) <= 0) {
      throw new Error(STATE_FAILED_MESSAGE);
    }
    await handleBindCoach(socialId, coachId as number);
    return;
  }

  const viewerStore = useViewerStore();
  viewerStore.setSocialId(socialId);
  // null 代表請求失敗；0 是後端「查無此 socialId」的哨兵值，屬於正常的未註冊流程
  const userId = await viewerStore.fetchBySocialId(socialId);
  if (userId === null) {
    throw new Error(viewerStore.error || "無法連線至伺服器，請稍後再試");
  }

  const isRegistered = userId !== 0;
  const navStore = useNavigationStore();
  if (isRegistered && viewerStore.isTrainee) {
    const traineeStore = useTraineeStore();
    const trainee = await traineeStore.fetchTraineeById(userId);
    if (trainee) {
      await traineeStore.updateTrainee(userId, {
        name: trainee.name,
        gender: trainee.gender,
        phone: trainee.phone,
        note: `Line 顯示名稱：${note}`,
      });
    }
    navStore.setViewer(userId);
    navStore.setTraineeNav(userId);
    window.location.replace("/trainee/info");
  } else if (isRegistered && viewerStore.isCoach) {
    navStore.setViewer(userId);
    navStore.setCoachNav(userId);
    window.location.replace("/coach");
  } else {
    navStore.setViewer(viewerStore.socialId);
    navStore.setTraineeNav(viewerStore.socialId, {
      register: true,
      note: `Line 顯示名稱：${note}`,
    });
    window.location.replace("/trainee/info");
  }
};
