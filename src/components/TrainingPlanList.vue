<template>
  <div class="w-full">
    <table class="table table-zebra w-full">
      <thead class="sticky top-0 bg-base-100 z-10">
        <tr>
          <th class="text-center">開始</th>
          <th class="text-center">結束</th>
          <th class="text-center">計畫</th>
          <th class="text-center">教練</th>
          <th class="text-center">額度</th>
          <th class="text-center">已用</th>
          <th class="text-center">編輯</th>
          <th class="text-center">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trainingPlan in trainingPlans" :key="trainingPlan.id">
          <td class="text-center">
            {{ formatDateTime(trainingPlan.planStartedAt) }}
          </td>
          <td class="text-center">
            {{ formatDateTime(trainingPlan.planEndededAt) }}
          </td>
          <td class="text-center">{{ plan(trainingPlan.planType) }}</td>
          <td class="text-center">{{ trainingPlan.coach.name }}</td>
          <td class="text-center">{{ trainingPlan.planQuota }}</td>
          <td class="text-center">{{ trainingPlan.usedQuota }}</td>
          <td class="text-center">{{ trainingPlan.editor.name }}</td>
          <td class="text-center">
            <div class="flex justify-center gap-2">
              <button
                class="btn btn-sm btn-primary"
                @click="handleEdit(trainingPlan)"
                :disabled="trainingPlan.planStartedAt != undefined"
              >
                編輯
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="trainingPlans.length == 0">
          <td colspan="6" class="text-center py-4">尚無訓練計畫</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const props = defineProps({
  trainingPlans: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["edit"]);

const formatDateTime = (timestamp) => {
  return timestamp
    ? dayjs(timestamp).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss")
    : "";
};

const plan = (planType) => {
  switch (planType) {
    case "private":
      return "個人教練";
    case "group":
      return "團體";
  }
};

const handleEdit = (trainingPlan) => {
  emit("edit", trainingPlan);
};
</script>

<style scoped>
.overflow-auto {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--bc) / 0.2) transparent;
}

.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background-color: hsl(var(--bc) / 0.2);
  border-radius: 4px;
}
</style>
