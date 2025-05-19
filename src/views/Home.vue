<template>
  <div class="w-full">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body text-center">
        <h1 class="text-3xl font-bold">管理資訊平台</h1>
        <LoadingState :loading="refLoading" :error="refError" />
        <p v-if="!refLoading && !refError && refSocialId" class="mt-4">
          正在檢查身份...
        </p>
        <p
          v-if="!refLoading && !refError && !refSocialId"
          class="text-error mt-4"
        >
          請透過LINE連結訪問本頁面
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useViewerStore } from "../stores/viewer";
import LoadingState from "../components/LoadingState.vue";

const router = useRouter();
const viewerStore = useViewerStore();

const refSocialId = ref("");
const refLoading = ref(false);
const refError = ref("");

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const socialId = urlParams.get("socialId");

  if (!socialId) {
    refError.value = "請透過LINE連結訪問本頁面";
    return;
  }

  refSocialId.value = socialId;
  refLoading.value = true;

  try {
    const viewer = await viewerStore.fetchBySocialId(socialId);

    if (viewerStore.isTrainee) {
      router.push(`/trainee/info/${viewer}?coach=false`);
    } else if (viewerStore.isCoach) {
      router.push(`/coach/${viewer}?coach=true`);
    } else {
      refError.value = "未知的用戶類型";
    }
  } catch (err) {
    refError.value = err.message || "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
});
</script>
