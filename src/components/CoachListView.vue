<template>
  <div
    class="card shadow-xl mt-2 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <h2 class="card-title text-2xl">教練列表</h2>

      <!-- 搜尋欄位 -->
      <div class="mt-4 mb-6">
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋教練姓名..."
            class="input input-bordered w-full pl-10 pr-4 py-2"
            :style="{
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)',
            }"
          />
        </div>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 mt-4"
      >
        <div
          v-for="coach in filteredCoaches"
          :key="coach.id"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
          :style="{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }"
        >
          <div class="card-body p-2 sm:p-3">
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <svg
                  class="w-5 h-5 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                <span class="font-semibold text-sm opacity-80">教練姓名</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="text-lg sm:text-xl font-bold">
                  {{ coach.name }}
                </div>
                <div
                  class="badge badge-sm"
                  :class="getCoachTypeClass(coach.coachType)"
                >
                  {{ getCoachTypeLabel(coach) }}
                </div>
              </div>
            </div>

            <div
              class="flex flex-col sm:flex-row gap-2 pt-3 border-t"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <button
                class="btn btn-sm flex-1"
                :style="{
                  backgroundColor: '#f97316',
                  color: '#fff',
                  borderColor: '#f97316',
                }"
                @click="handleViewTrainees(coach)"
              >
                負責學員資訊
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredCoaches.length === 0" class="text-center py-8">
        <svg
          class="w-16 h-16 mx-auto opacity-50 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          ></path>
        </svg>
        <p class="text-lg opacity-70">
          {{ searchQuery ? "找不到符合搜尋條件的教練" : "目前沒有教練紀錄" }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Coach, CoachType } from "../services/coach";

interface Props {
  coaches: Coach[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "viewTrainees", coach: Coach): void;
}>();

/**
 * 搜尋查詢字串
 */
const searchQuery = ref<string>("");

/**
 * 過濾後的教練列表
 */
const filteredCoaches = computed<Coach[]>(() => {
  if (!searchQuery.value.trim()) {
    return props.coaches;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return props.coaches.filter((coach) => {
    const nameMatch = coach.name.toLowerCase().includes(query);
    return nameMatch;
  });
});

/**
 * 獲取教練類型標籤
 */
const getCoachTypeLabel = (coach: Coach): string => {
  if (!coach.coachType) return "未設定";

  // 根據教練 ID 顯示特定標籤
  if (coach.id === 1) return "共同創辦人";
  if (coach.id === 2) return "創辦人";

  // 預設標籤
  const coachTypeMap: Record<CoachType, string> = {
    Founder: "創辦人",
    Partner: "合作教練",
    Team: "旗下教練",
  };

  return coachTypeMap[coach.coachType] || coach.coachType;
};

/**
 * 獲取教練類型的樣式類別
 */
const getCoachTypeClass = (coachType: CoachType | undefined): string => {
  if (!coachType) {
    return "badge-ghost";
  }

  const coachTypeClassMap: Record<CoachType, string> = {
    Founder: "badge-primary",
    Partner: "badge-accent",
    Team: "badge-secondary",
  };

  return coachTypeClassMap[coachType] || "badge-ghost";
};

/**
 * 處理查看學員資訊按鈕點擊
 */
const handleViewTrainees = (coach: Coach): void => {
  emit("viewTrainees", coach);
};
</script>
