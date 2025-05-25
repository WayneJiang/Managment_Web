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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useViewerStore } from "../stores/viewer";
import LoadingState from "../components/LoadingState.vue";
import type { Router } from "vue-router";

const router: Router = useRouter();
const viewerStore = useViewerStore();

const refSocialId = ref<string>("");
const refLoading = ref<boolean>(false);
const refError = ref<string>("");

onMounted(async (): Promise<void> => {
  const urlParams: URLSearchParams = new URLSearchParams(
    window.location.search
  );
  const socialId: string | null = urlParams.get("socialId");

  if (!socialId) {
    refError.value = "請透過LINE連結訪問本頁面";
    return;
  }

  refSocialId.value = socialId;
  refLoading.value = true;

  try {
    const viewer: number | null = await viewerStore.fetchBySocialId(socialId);

    if (viewerStore.isTrainee) {
      router.push(`/trainee/info/${viewer}?coach=false&register=false`);
    } else if (viewerStore.isCoach) {
      router.push(`/coach/${viewer}?coach=true`);
    } else {
      router.push(`/trainee/info/${socialId}?coach=false&register=true`);
    }
  } catch (err: unknown) {
    refError.value =
      err instanceof Error ? err.message : "發生錯誤，請稍後再試";
  } finally {
    refLoading.value = false;
  }
});
</script>
