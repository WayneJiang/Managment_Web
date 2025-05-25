<template>
  <div class="w-full">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">教練管理介面</h1>
      <div v-if="refCoach" class="badge badge-primary badge-lg mt-2 md:mt-0">
        {{ refCoach.name }}
      </div>
    </div>

    <LoadingState :loading="refLoading" :error="refError" />

    <div v-if="!refLoading && !refError" class="w-full">
      <TraineeList
        :trainees="refTrainees"
        @update="navigateToUpdate"
        @adjust="navigateToAdjust"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCoachStore } from "../stores/coach";
import TraineeList from "../components/TraineeList.vue";
import LoadingState from "../components/LoadingState.vue";
import type { Coach } from "../services/coach";
import type { Trainee } from "../services/trainee";

const route = useRoute();
const router = useRouter();
const coachStore = useCoachStore();

const refCoach = ref<Coach | null>(null);
const refTrainees = ref<Trainee[]>([]);
const refLoading = ref<boolean>(false);
const refError = ref<string>("");

onMounted(async (): Promise<void> => {
  refLoading.value = true;

  try {
    const id = Number(route.params.id as string);

    const coach = await coachStore.fetchById(id);
    if (!coach) {
      throw new Error("無法獲取教練資料");
    }
    refCoach.value = coach;

    const trainees: Trainee[] = await coachStore.fetchAll();
    refTrainees.value = trainees;
  } catch (err: unknown) {
    const errorMessage: string =
      err instanceof Error ? err.message : "發生錯誤，請稍後再試";
    refError.value = errorMessage;
  } finally {
    refLoading.value = false;
  }
});

const navigateToUpdate = (trainee: Trainee): void => {
  router.push(`/trainee/info/${trainee.id}?coach=true&register=false`);
};

const navigateToAdjust = (trainee: Trainee): void => {
  if (!refCoach.value) return;
  router.push(`/plan/${refCoach.value.id}/${trainee.id}`);
};
</script>
