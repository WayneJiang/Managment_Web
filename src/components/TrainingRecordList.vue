<template>
  <div
    class="card shadow-xl mt-2 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <div class="flex justify-between items-start">
        <h2 class="card-title text-2xl">簽到記錄</h2>
        <div class="flex gap-2">
          <button
            v-if="isCoach && canEditRecords"
            type="button"
            class="btn btn-primary"
            :style="{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderColor: 'var(--color-primary)',
            }"
            @click.prevent="handleCreateRecord"
            :disabled="isLoading"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            新增簽到
          </button>
          <button
            type="button"
            class="btn"
            :style="{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderColor: 'var(--color-primary)',
            }"
            @click.prevent="handleExportToPdf"
            :disabled="trainingRecords.length === 0 || isLoading"
          >
            <span
              v-if="isExporting"
              class="loading loading-spinner loading-sm"
            ></span>
            匯出 PDF
          </button>
        </div>
      </div>

      <!-- 日曆列表 -->
      <div class="mt-6 space-y-4">
        <div
          v-for="(dayRecords, date) in groupedRecords"
          :key="date"
          class="card bg-base-100 shadow-lg"
          :style="{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }"
        >
          <div class="card-body p-3 sm:p-4">
            <!-- 日期標題 -->
            <div
              class="flex items-center gap-3 mb-4 pb-3 border-b"
              :style="{ borderColor: 'var(--color-border)' }"
            >
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <h3 class="text-xl font-bold">
                {{ formatDateHeader(date) }}
                <span
                  v-if="dayRecords.some((record) => record.editor)"
                  class="text-sm text-warning ml-2"
                >
                  (編輯者: {{ dayRecords.find((record) => record.editor)?.editor?.name || '未知' }})
                </span>
              </h3>
            </div>

            <!-- 時間段列表 -->
            <div class="space-y-3">
              <div
                v-for="(record, index) in dayRecords"
                :key="index"
                class="flex flex-col gap-3 p-3 rounded-lg text-center"
                :style="{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }"
              >
                <!-- 時間 -->
                <div class="flex items-center justify-center gap-3">
                  <div class="text-lg font-bold text-primary">
                    {{ formatTime(record.createdDate) }}
                  </div>
                  <div
                    class="badge"
                    :class="{
                      'badge-primary':
                        record.trainingPlan?.planType === 'Personal',
                      'badge-success':
                        record.trainingPlan?.planType === 'Block',
                      'badge-warning':
                        record.trainingPlan?.planType === 'Sequential',
                      'badge-secondary':
                        record.trainingPlan?.planType !== 'Personal' &&
                        record.trainingPlan?.planType !== 'Block' &&
                        record.trainingPlan?.planType !== 'Sequential',
                    }"
                  >
                    {{ getPlanTypeLabel(record.trainingPlan?.planType) }}
                  </div>
                </div>

                <!-- 教練資訊 -->
                <div class="flex items-center justify-center gap-2">
                  <svg
                    class="w-4 h-4 opacity-70"
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
                  <span class="text-sm opacity-70">負責教練：</span>
                  <span
                    class="font-medium"
                    :class="{
                      'text-error': !record.trainingPlan?.coach?.name,
                    }"
                  >
                    {{ record.trainingPlan?.coach?.name || "未指定" }}
                  </span>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex items-center justify-center gap-2">
                  <div
                    v-if="isCoach && canEditRecords"
                    class="btn btn-sm btn-outline btn-primary cursor-pointer"
                    @click.stop.prevent="handleEditRecord(record)"
                    :style="{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                    }"
                    role="button"
                    tabindex="0"
                    @keydown.enter="handleEditRecord(record)"
                    @keydown.space.prevent="handleEditRecord(record)"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                    編輯
                  </div>
                  <button
                    v-if="isCoach && canEditRecords"
                    type="button"
                    class="btn btn-sm btn-outline btn-error"
                    @click.stop.prevent="handleDeleteRecord(record)"
                    :style="{
                      borderColor: 'var(--color-error)',
                      color: 'var(--color-error)',
                    }"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                    刪除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="trainingRecords.length === 0" class="text-center py-8">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
        <p class="text-lg opacity-70">目前沒有簽到記錄</p>
      </div>

      <!-- 分頁控制 -->
      <div
        v-if="trainingRecords.length > 0 || currentPage > 0"
        class="flex justify-center items-center gap-4 mt-6"
      >
        <button
          v-if="currentPage > 0"
          type="button"
          class="btn btn-primary"
          :style="{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderColor: 'var(--color-primary)',
          }"
          @click.prevent="handlePreviousPage"
          :disabled="isLoading"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          上一頁
        </button>

        <span class="text-sm opacity-70">第 {{ currentPage + 1 }} 頁</span>

        <button
          v-if="hasMoreRecords"
          type="button"
          class="btn btn-primary"
          :style="{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderColor: 'var(--color-primary)',
          }"
          @click.prevent="handleNextPage"
          :disabled="isLoading"
        >
          下一頁
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 編輯訓練記錄模態框 -->
    <div
      class="modal"
      :class="{ 'modal-open': showEditModal }"
      @click.self="handleCancelEdit"
    >
      <div
        class="modal-box"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
        @click.stop
      >
        <h3 class="font-bold text-lg mb-4">編輯訓練記錄</h3>
        <form @submit.prevent="handleSaveEditRecord" @click.stop>
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-semibold">訓練計畫</span>
            </label>
            <select
              v-model="editingRecord.trainingPlan"
              class="select select-bordered w-full"
              :class="{ 'select-error': validationErrors.trainingPlan }"
              :style="{
                backgroundColor: 'var(--color-input-bg)',
                borderColor: validationErrors.trainingPlan
                  ? 'var(--color-error)'
                  : 'var(--color-input-border)',
                color: 'var(--color-text)',
              }"
            >
              <option
                v-for="trainingPlan in availableTrainingPlans"
                :key="trainingPlan.id"
                :value="trainingPlan.id"
              >
                {{ trainingPlan.coach?.name || "未指定教練" }} -
                {{ getPlanTypeLabel(trainingPlan.planType) }}
                ({{ trainingPlan.quota }}堂，剩餘{{
                  (trainingPlan.quota || 0) -
                  (trainingPlan.trainingRecord?.length || 0)
                }}堂)
              </option>
              <option
                v-if="availableTrainingPlans.length === 0"
                value=""
                disabled
              >
                沒有可用的訓練計畫（所有計畫額度已用完）
              </option>
            </select>
            <label v-if="validationErrors.trainingPlan" class="label">
              <span
                class="label-text-alt"
                :style="{ color: 'var(--color-error)' }"
                >{{ validationErrors.trainingPlan }}</span
              >
            </label>
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-semibold">簽到時間</span>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <!-- 日期選擇 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm opacity-80">日期</span>
                </label>
                <input
                  type="date"
                  v-model="editingDate"
                  class="input input-bordered w-full"
                  :class="{ 'input-error': validationErrors.date }"
                  :style="{
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: validationErrors.date
                      ? 'var(--color-error)'
                      : 'var(--color-input-border)',
                    color: 'var(--color-text)',
                  }"
                />
                <label v-if="validationErrors.date" class="label">
                  <span
                    class="label-text-alt"
                    :style="{ color: 'var(--color-error)' }"
                    >{{ validationErrors.date }}</span
                  >
                </label>
              </div>
              <!-- 時間選擇 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm opacity-80">時間</span>
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <!-- 小時選擇 -->
                  <select
                    v-model="editingHour"
                    class="select select-bordered w-full"
                    :class="{ 'select-error': validationErrors.time }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: validationErrors.time
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                    required
                  >
                    <option
                      v-for="hourOption in hourOptions"
                      :key="hourOption.value"
                      :value="hourOption.value"
                    >
                      {{ hourOption.label }}
                    </option>
                  </select>
                  <!-- 分鐘選擇 -->
                  <select
                    v-model="editingMinute"
                    class="select select-bordered w-full"
                    :class="{ 'select-error': validationErrors.time }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: validationErrors.time
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                    required
                  >
                    <option
                      v-for="minuteOption in minuteOptions"
                      :key="minuteOption.value"
                      :value="minuteOption.value"
                    >
                      {{ minuteOption.label }}
                    </option>
                  </select>
                </div>
                <label v-if="validationErrors.time" class="label">
                  <span
                    class="label-text-alt"
                    :style="{ color: 'var(--color-error)' }"
                    >{{ validationErrors.time }}</span
                  >
                </label>
              </div>
            </div>
          </div>

          <div class="modal-action">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading"
              :style="{
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-primary)',
                color: 'white',
              }"
            >
              <span v-if="isLoading" class="loading loading-spinner"></span>
              儲存
            </button>
            <button
              type="button"
              class="btn btn-ghost"
              @click.prevent="handleCancelEdit"
              :disabled="isLoading"
              :style="{
                backgroundColor: 'var(--color-button-bg)',
                borderColor: 'var(--color-button-border)',
                color: 'var(--color-text)',
              }"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增訓練記錄模態框 -->
    <div
      class="modal"
      :class="{ 'modal-open': showCreateModal }"
      @click.self="handleCancelCreate"
    >
      <div
        class="modal-box"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
        @click.stop
      >
        <h3 class="font-bold text-lg mb-4">新增簽到記錄</h3>
        <form @submit.prevent="handleSaveCreateRecord" @click.stop>
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-semibold">訓練計畫</span>
            </label>
            <select
              v-model="creatingRecord.trainingPlan"
              class="select select-bordered w-full"
              :class="{ 'select-error': validationErrors.trainingPlan }"
              :style="{
                backgroundColor: 'var(--color-input-bg)',
                borderColor: validationErrors.trainingPlan
                  ? 'var(--color-error)'
                  : 'var(--color-input-border)',
                color: 'var(--color-text)',
              }"
            >
              <option
                v-for="trainingPlan in availableTrainingPlans"
                :key="trainingPlan.id"
                :value="trainingPlan.id"
              >
                {{ trainingPlan.coach?.name || "未指定教練" }} -
                {{ getPlanTypeLabel(trainingPlan.planType) }}
                ({{ trainingPlan.quota }}堂，剩餘{{
                  (trainingPlan.quota || 0) -
                  (trainingPlan.trainingRecord?.length || 0)
                }}堂)
              </option>
              <option
                v-if="availableTrainingPlans.length === 0"
                value=""
                disabled
              >
                沒有可用的訓練計畫（所有計畫額度已用完）
              </option>
            </select>
            <label v-if="validationErrors.trainingPlan" class="label">
              <span
                class="label-text-alt"
                :style="{ color: 'var(--color-error)' }"
                >{{ validationErrors.trainingPlan }}</span
              >
            </label>
          </div>

          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-semibold">簽到時間</span>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <!-- 日期選擇 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm opacity-80">日期</span>
                </label>
                <input
                  type="date"
                  v-model="creatingDate"
                  class="input input-bordered w-full"
                  :class="{ 'input-error': validationErrors.date }"
                  :style="{
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: validationErrors.date
                      ? 'var(--color-error)'
                      : 'var(--color-input-border)',
                    color: 'var(--color-text)',
                  }"
                />
                <label v-if="validationErrors.date" class="label">
                  <span
                    class="label-text-alt"
                    :style="{ color: 'var(--color-error)' }"
                    >{{ validationErrors.date }}</span
                  >
                </label>
              </div>
              <!-- 時間選擇 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm opacity-80">時間</span>
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <!-- 小時選擇 -->
                  <select
                    v-model="creatingHour"
                    class="select select-bordered w-full"
                    :class="{ 'select-error': validationErrors.time }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: validationErrors.time
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                    required
                  >
                    <option
                      v-for="hourOption in hourOptions"
                      :key="hourOption.value"
                      :value="hourOption.value"
                    >
                      {{ hourOption.label }}
                    </option>
                  </select>
                  <!-- 分鐘選擇 -->
                  <select
                    v-model="creatingMinute"
                    class="select select-bordered w-full"
                    :class="{ 'select-error': validationErrors.time }"
                    :style="{
                      backgroundColor: 'var(--color-input-bg)',
                      borderColor: validationErrors.time
                        ? 'var(--color-error)'
                        : 'var(--color-input-border)',
                      color: 'var(--color-text)',
                    }"
                    required
                  >
                    <option
                      v-for="minuteOption in minuteOptions"
                      :key="minuteOption.value"
                      :value="minuteOption.value"
                    >
                      {{ minuteOption.label }}
                    </option>
                  </select>
                </div>
                <label v-if="validationErrors.time" class="label">
                  <span
                    class="label-text-alt"
                    :style="{ color: 'var(--color-error)' }"
                    >{{ validationErrors.time }}</span
                  >
                </label>
              </div>
            </div>
          </div>

          <div class="modal-action">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading"
              :style="{
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-primary)',
                color: 'white',
              }"
            >
              <span v-if="isLoading" class="loading loading-spinner"></span>
              新增
            </button>
            <button
              type="button"
              class="btn btn-ghost"
              @click.prevent="handleCancelCreate"
              :disabled="isLoading"
              :style="{
                backgroundColor: 'var(--color-button-bg)',
                borderColor: 'var(--color-button-border)',
                color: 'var(--color-text)',
              }"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 刪除確認模態框 -->
    <div
      class="modal"
      :class="{ 'modal-open': showDeleteModal }"
      @click.self="handleCancelDelete"
    >
      <div
        class="modal-box"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
        @click.stop
      >
        <h3 class="font-bold text-lg mb-4">刪除訓練記錄</h3>
        <p class="mb-4">您確定要刪除這筆訓練記錄嗎？此操作無法復原。</p>

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-error"
            @click.prevent="handleConfirmDeleteRecord"
            :disabled="isLoading"
            :style="{
              backgroundColor: 'var(--color-error)',
              borderColor: 'var(--color-error)',
              color: 'white',
            }"
          >
            <span v-if="isLoading" class="loading loading-spinner"></span>
            確認
          </button>
          <button
            type="button"
            class="btn btn-ghost"
            @click.prevent="handleCancelDelete"
            :disabled="isLoading"
            :style="{
              backgroundColor: 'var(--color-button-bg)',
              borderColor: 'var(--color-button-border)',
              color: 'var(--color-text)',
            }"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, withDefaults } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ElMessage } from "element-plus";
import type {
  TrainingRecord,
  UpdateTrainingRecord,
  CreateTrainingRecord,
} from "../services/training-record";
import type { TrainingPlan } from "../services/training-plan";
import { useTraineeStore } from "../stores/trainee";

const traineeStore = useTraineeStore();

const props = withDefaults(
  defineProps<{
    coachId: number;
    traineeId: number;
    trainingRecords: TrainingRecord[];
    trainingPlans?: TrainingPlan[];
    canEditRecords?: boolean;
  }>(),
  {
    canEditRecords: false,
  }
);

const emit = defineEmits<{
  "update-records": [records: TrainingRecord[]];
}>();

dayjs.extend(utc);
dayjs.extend(timezone);

// 判斷是否為教練模式（根據 coachId 是否有效）
const isCoach = computed(() => props.coachId > 0);

// 本地狀態管理
const isLoading = ref<boolean>(false);
const currentPage = ref<number>(0);
const totalPages = ref<number>(0);
const hasMoreRecords = ref<boolean>(true);
const showEditModal = ref<boolean>(false);
const showCreateModal = ref<boolean>(false);
const showDeleteModal = ref<boolean>(false);
const isExporting = ref<boolean>(false);
const editingRecord = ref<UpdateTrainingRecord>({
  id: 0,
  trainee: 0,
  trainingPlan: 0,
  date: "",
  editor: 0,
});
const creatingRecord = ref<CreateTrainingRecord>({
  trainee: 0,
  trainingPlan: 0,
  date: undefined,
  editor: 0,
});
const deletingRecord = ref<TrainingRecord | null>(null);
const availableTrainingPlans = ref<TrainingPlan[]>([]);
const editingDate = ref<string>("");
const editingTime = ref<string>("");
const editingHour = ref<string>("");
const editingMinute = ref<string>("");
const creatingDate = ref<string>("");
const creatingTime = ref<string>("");
const creatingHour = ref<string>("");
const creatingMinute = ref<string>("");

// 驗證錯誤狀態
const validationErrors = ref({
  trainingPlan: "",
  date: "",
  time: "",
});

/**
 * 初始化預設時間為當下時間
 */
const initializeDefaultTime = (): void => {
  const currentTime = dayjs().tz("Asia/Taipei");
  const formattedTime = currentTime.format("HH:mm");
  editingTime.value = formattedTime;
  editingHour.value = currentTime.format("HH");
  editingMinute.value = "00";
};

/**
 * 小時選項（0-23）
 */
const hourOptions = computed(() => {
  const options: Array<{ value: string; label: string }> = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourString = hour.toString().padStart(2, "0");
    options.push({
      value: hourString,
      label: hourString,
    });
  }
  return options;
});

/**
 * 分鐘選項（10分鐘間隔）
 */
const minuteOptions = computed(() => {
  const options: Array<{ value: string; label: string }> = [];
  for (let minute = 0; minute < 60; minute += 10) {
    const minuteString = minute.toString().padStart(2, "0");
    options.push({
      value: minuteString,
      label: minuteString,
    });
  }
  return options;
});

/**
 * 載入訓練記錄資料
 */
const loadTrainingRecords = async (): Promise<void> => {
  try {
    isLoading.value = true;
    const response = await traineeStore.fetchTrainingRecord(
      props.traineeId,
      currentPage.value
    );

    if (response) {
      emit("update-records", response.data);
      totalPages.value = response.totalPages;
      // 判斷是否有更多記錄：當前頁碼 + 1 < 總頁數
      hasMoreRecords.value = currentPage.value + 1 < response.totalPages;
    }
  } catch (error) {
    console.error("Failed to load training records:", error);
    const errorMessage =
      error instanceof Error ? error.message : "獲取簽到記錄失敗，請稍後再試";
    ElMessage.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 處理上一頁
 */
const handlePreviousPage = async (): Promise<void> => {
  if (currentPage.value > 0) {
    currentPage.value--;
    await loadTrainingRecords();
  }
};

/**
 * 處理下一頁
 */
const handleNextPage = async (): Promise<void> => {
  if (hasMoreRecords.value) {
    currentPage.value++;
    await loadTrainingRecords();
  }
};

/**
 * 按日期分組訓練記錄
 */
const groupedRecords = computed(() => {
  const groups: Record<string, TrainingRecord[]> = {};

  props.trainingRecords.forEach((record) => {
    const date = dayjs(record.createdDate)
      .tz("Asia/Taipei")
      .format("YYYY-MM-DD");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
  });

  Object.keys(groups).forEach((date) => {
    groups[date].sort(
      (a, b) =>
        dayjs(a.createdDate).tz("Asia/Taipei").valueOf() -
        dayjs(b.createdDate).tz("Asia/Taipei").valueOf()
    );
  });

  const sortedGroups: Record<string, TrainingRecord[]> = {};
  Object.keys(groups)
    .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
    .forEach((date) => {
      sortedGroups[date] = groups[date];
    });

  return sortedGroups;
});

/**
 * 獲取計畫類型標籤
 */
const getPlanTypeLabel = (planType: TrainingPlan["planType"]): string => {
  if (!planType) return "";
  switch (planType) {
    case "Personal":
      return "個人教練";
    case "Block":
      return "團體課程";
    case "Sequential":
      return "開放團課";
    default:
      return "";
  }
};

/**
 * 格式化時間
 */
const formatTime = (dateTimeString: string): string => {
  return dayjs(dateTimeString).tz("Asia/Taipei").format("HH:mm");
};

/**
 * 格式化日期標題
 */
const formatDateHeader = (dateString: string): string => {
  const date = dayjs(dateString);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = weekdays[date.day()];

  return `${date.format("YYYY/MM/DD")} (週${weekday})`;
};

/**
 * 驗證編輯表單
 */
const validateEditForm = (): boolean => {
  const errors = {
    trainingPlan: "",
    date: "",
    time: "",
  };

  // 只有在有可用計畫時才要求選擇訓練計畫
  if (
    availableTrainingPlans.value.length > 0 &&
    !editingRecord.value.trainingPlan
  ) {
    errors.trainingPlan = "請選擇訓練計畫";
  }

  if (!editingDate.value) {
    errors.date = "請選擇日期";
  }

  if (!editingHour.value || !editingMinute.value) {
    errors.time = "請選擇時間";
  }

  validationErrors.value = errors;
  return !Object.values(errors).some((error) => error !== "");
};

/**
 * 處理匯出 PDF
 */
const handleExportToPdf = async (): Promise<void> => {
  if (props.trainingRecords.length === 0) {
    ElMessage.warning("沒有資料可匯出");
    return;
  }

  isExporting.value = true;
  try {
    const doc = new jsPDF();

    doc.addFont("/fonts/NotoSansTC-Regular.ttf", "NotoSansTC", "normal");
    doc.addFont("/fonts/NotoSansTC-Bold.ttf", "NotoSansTC", "bold");
    doc.setFont("NotoSansTC");

    doc.setFontSize(20);
    doc.text("簽到記錄", 14, 20);

    let currentY = 30;

    Object.entries(groupedRecords.value).forEach(([date, records]) => {
      doc.setFontSize(14);
      doc.setFont("NotoSansTC", "bold");
      doc.text(formatDateHeader(date), 14, currentY);
      currentY += 10;

      const tableData = records.map((record) => [
        formatTime(record.createdDate),
        getPlanTypeLabel(record.trainingPlan?.planType),
        record.trainingPlan?.coach?.name || "未指定",
        record.trainingPlan?.quota?.toString() || "",
      ]);

      autoTable(doc, {
        head: [["時間", "計畫", "教練", "額度", "已用"]],
        body: tableData,
        startY: currentY,
        styles: {
          font: "NotoSansTC",
          fontSize: 9,
          halign: "center",
        },
        headStyles: {
          font: "NotoSansTC",
          fontStyle: "bold",
          fillColor: [66, 139, 202],
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
          halign: "center",
        },
        margin: { left: 14, right: 14 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save(`簽到歷史記錄.pdf`);
    ElMessage.success("PDF 匯出成功");
  } catch (error) {
    console.error("Failed to export PDF:", error);
    ElMessage.error("PDF 匯出失敗，請稍後再試");
  } finally {
    isExporting.value = false;
  }
};

/**
 * 處理編輯訓練記錄
 */
const handleEditRecord = (record: TrainingRecord): void => {
  try {
    // 直接設置編輯記錄
    editingRecord.value = {
      id: record.id,
      trainee: props.traineeId,
      trainingPlan: record.trainingPlan?.id || 0,
      date: "",
      editor: props.coachId,
    };

    // 設置當前時間
    const currentDateTime = dayjs().tz("Asia/Taipei");
    editingDate.value = currentDateTime.format("YYYY-MM-DD");
    editingTime.value = currentDateTime.format("HH:mm");
    editingHour.value = currentDateTime.format("HH");
    editingMinute.value = "00";

    if (props.trainingPlans && props.trainingPlans.length > 0) {
      // 只顯示還有剩餘額度的訓練計畫
      availableTrainingPlans.value = props.trainingPlans.filter(
        (plan) => (plan.quota || 0) - (plan.trainingRecord?.length || 0) > 0
      );
    }

    showEditModal.value = true;
  } catch (error) {
    console.error("Failed to handle edit record:", error);
    ElMessage.error("開啟編輯失敗，請稍後再試");
  }
};

/**
 * 處理儲存編輯的訓練記錄
 */
const handleSaveEditRecord = async (): Promise<void> => {
  if (!validateEditForm()) {
    return;
  }

  const combinedTime = `${editingHour.value}:${editingMinute.value}`;
  const combinedDateTime = `${editingDate.value}T${combinedTime}`;
  editingRecord.value.date = dayjs(combinedDateTime).tz("Asia/Taipei").format();

  try {
    const result = await traineeStore.updateTrainingRecord(editingRecord.value);
    if (result) {
      ElMessage.success("更新成功");
      showEditModal.value = false;
      await loadTrainingRecords();
    } else {
      ElMessage.error("更新失敗");
    }
  } catch (error) {
    console.error("Failed to update training record:", error);
    ElMessage.error("更新失敗，請稍後再試");
  }
};

/**
 * 處理取消編輯
 */
const handleCancelEdit = (): void => {
  showEditModal.value = false;
  editingRecord.value = {
    id: 0,
    trainee: 0,
    trainingPlan: 0,
    date: "",
    editor: 0,
  };
  editingDate.value = "";
  editingTime.value = "";
  editingHour.value = "";
  editingMinute.value = "";
  initializeDefaultTime();
  validationErrors.value = {
    trainingPlan: "",
    date: "",
    time: "",
  };
};

/**
 * 處理新增簽到記錄
 */
const handleCreateRecord = (): void => {
  try {
    // 設置建立記錄
    creatingRecord.value = {
      trainee: props.traineeId,
      trainingPlan: 0,
      date: undefined,
      editor: props.coachId,
    };

    // 設置當前時間
    const currentDateTime = dayjs().tz("Asia/Taipei");
    creatingDate.value = currentDateTime.format("YYYY-MM-DD");
    creatingTime.value = currentDateTime.format("HH:mm");
    creatingHour.value = currentDateTime.format("HH");
    creatingMinute.value = "00";

    if (props.trainingPlans && props.trainingPlans.length > 0) {
      // 只顯示還有剩餘額度的訓練計畫
      availableTrainingPlans.value = props.trainingPlans.filter(
        (plan) => (plan.quota || 0) - (plan.trainingRecord?.length || 0) > 0
      );
    }

    showCreateModal.value = true;
  } catch (error) {
    console.error("Failed to handle create record:", error);
    ElMessage.error("開啟新增失敗，請稍後再試");
  }
};

/**
 * 驗證建立表單
 */
const validateCreateForm = (): boolean => {
  const errors = {
    trainingPlan: "",
    date: "",
    time: "",
  };

  // 只有在有可用計畫時才要求選擇訓練計畫
  if (
    availableTrainingPlans.value.length > 0 &&
    !creatingRecord.value.trainingPlan
  ) {
    errors.trainingPlan = "請選擇訓練計畫";
  }

  if (!creatingDate.value) {
    errors.date = "請選擇日期";
  }

  if (!creatingHour.value || !creatingMinute.value) {
    errors.time = "請選擇時間";
  }

  validationErrors.value = errors;
  return !Object.values(errors).some((error) => error !== "");
};

/**
 * 處理儲存新增的訓練記錄
 */
const handleSaveCreateRecord = async (): Promise<void> => {
  if (!validateCreateForm()) {
    return;
  }

  const combinedTime = `${creatingHour.value}:${creatingMinute.value}`;
  const combinedDateTime = `${creatingDate.value}T${combinedTime}`;
  creatingRecord.value.date = dayjs(combinedDateTime)
    .tz("Asia/Taipei")
    .toDate();

  try {
    const result = await traineeStore.createTrainingRecord(
      creatingRecord.value
    );

    if (result) {
      ElMessage.success("新增成功");
      showCreateModal.value = false;
      await loadTrainingRecords();
    } else {
      ElMessage.error("新增失敗");
    }
  } catch (error) {
    console.error("Failed to create training record:", error);
    ElMessage.error("新增失敗，請稍後再試");
  }
};

/**
 * 處理取消新增
 */
const handleCancelCreate = (): void => {
  showCreateModal.value = false;
  creatingRecord.value = {
    trainee: 0,
    trainingPlan: 0,
    date: undefined,
    editor: 0,
  };
  creatingDate.value = "";
  creatingTime.value = "";
  creatingHour.value = "";
  creatingMinute.value = "";
  validationErrors.value = {
    trainingPlan: "",
    date: "",
    time: "",
  };
};

/**
 * 處理刪除訓練記錄
 */
const handleDeleteRecord = (record: TrainingRecord): void => {
  deletingRecord.value = record;
  showDeleteModal.value = true;
};

/**
 * 處理確認刪除訓練記錄
 */
const handleConfirmDeleteRecord = async (): Promise<void> => {
  if (!deletingRecord.value) return;

  try {
    const result = await traineeStore.deleteTrainingRecord(
      deletingRecord.value.id
    );
    if (result) {
      ElMessage.success("刪除成功");
      showDeleteModal.value = false;
      await loadTrainingRecords();
    } else {
      ElMessage.error("刪除失敗");
    }
  } catch (error) {
    console.error("Failed to delete training record:", error);
    ElMessage.error("刪除失敗，請稍後再試");
  }
};

/**
 * 處理取消刪除
 */
const handleCancelDelete = (): void => {
  showDeleteModal.value = false;
  deletingRecord.value = null;
};

onMounted(async (): Promise<void> => {
  initializeDefaultTime();
  // 初始化新增簽到紀錄的時間
  const currentDateTime = dayjs().tz("Asia/Taipei");
  creatingDate.value = currentDateTime.format("YYYY-MM-DD");
  creatingTime.value = currentDateTime.format("HH:mm");
  creatingHour.value = currentDateTime.format("HH");
  creatingMinute.value = "00";
  await loadTrainingRecords();
});
</script>
