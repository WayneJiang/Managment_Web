import { useViewerStore } from "../stores/viewer";
import { useTraineeStore } from "../stores/trainee";
import { useCoachStore } from "../stores/coach";
import { useNavigationStore } from "../stores/navigation";
import { decodeLineState } from "../utils/line-state";
import { lineApi } from "./api-line";

export const LINE_AUTH_MESSAGE_TYPE = "line-auth-callback";
export const LINE_LOGIN_POPUP_NAME = "lineLoginPopup";

export interface LineAuthMessage {
  type: typeof LINE_AUTH_MESSAGE_TYPE;
  code?: string;
  state?: string;
  error?: string;
}

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
 * 用授權碼完成 LINE 登入：交換 token、抓使用者資料、依角色更新 store 並導向。
 * 在 popup 流程中由主視窗呼叫；fallback 整頁流程則由 LineCallback 直接呼叫。
 */
export const processLineAuthCode = async (
  code: string,
  stateStr: string | null
): Promise<void> => {
  const redirectUri = `${window.location.origin}/line-callback`;
  const tokenResponse = await lineApi.exchangeLineCodeForToken(code, redirectUri);
  const userProfile = await lineApi.getLineUserInfo(tokenResponse.access_token);

  const socialId = userProfile.sub;
  const note = userProfile.name;

  const lineState = stateStr ? decodeLineState(stateStr) : null;
  if (lineState?.purpose === "bind-coach" && lineState.data?.coachId) {
    await handleBindCoach(socialId, lineState.data.coachId);
    return;
  }

  const viewerStore = useViewerStore();
  viewerStore.setSocialId(socialId);
  const userId = await viewerStore.fetchBySocialId(socialId);
  if (userId === null) {
    throw new Error("無法獲取用戶資料，請確認您已註冊");
  }

  const navStore = useNavigationStore();
  if (viewerStore.isTrainee) {
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
  } else if (viewerStore.isCoach) {
    navStore.setViewer(userId);
    navStore.setCoachNav(userId);
    window.location.replace("/coach");
  } else if (viewerStore.socialId) {
    navStore.setViewer(viewerStore.socialId);
    navStore.setTraineeNav(viewerStore.socialId, {
      register: true,
      note: `Line 顯示名稱：${note}`,
    });
    window.location.replace("/trainee/info");
  }
};
