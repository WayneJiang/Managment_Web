<template>
  <div
    class="card shadow-xl mt-4 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="card-title text-2xl">簽到歷史記錄</h2>
          <!-- 月份選擇器 -->
          <div class="form-control">
            <select
              v-model="selectedMonth"
              @change="handleMonthChange"
              class="select select-bordered w-full max-w-xs"
              :style="{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
              }"
            >
              <option
                v-for="monthOption in monthOptions"
                :key="monthOption.value"
                :value="monthOption.value"
              >
                {{ monthOption.label }}
              </option>
            </select>
          </div>
        </div>
        <button
          class="btn"
          :style="{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderColor: 'var(--color-primary)',
          }"
          @click="handleExportToPdf"
          :disabled="trainingRecords.length === 0 || isLoading"
        >
          <span
            v-if="isExporting"
            class="loading loading-spinner loading-sm"
          ></span>
          匯出 PDF
        </button>
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
          <div class="card-body p-4">
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
              <h3 class="text-xl font-bold">{{ formatDateHeader(date) }}</h3>
              <div class="badge badge-outline">
                {{ dayRecords.length }} 筆記錄
              </div>
            </div>

            <!-- 時間段列表 -->
            <div class="space-y-3">
              <div
                v-for="(record, index) in dayRecords"
                :key="index"
                class="flex items-center justify-between p-3 rounded-lg"
                :style="{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }"
              >
                <!-- 時間 -->
                <div class="flex items-center gap-3">
                  <div class="text-lg font-bold text-primary">
                    {{ formatTime(record.createdDate) }}
                  </div>
                  <div
                    class="badge"
                    :class="{
                      'badge-primary':
                        record.trainingPlan?.planType === 'personal',
                      'badge-secondary':
                        record.trainingPlan?.planType !== 'personal',
                    }"
                  >
                    {{ getPlanTypeLabel(record.trainingPlan?.planType) }}
                  </div>
                </div>

                <!-- 教練資訊 -->
                <div class="flex items-center gap-2">
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
                <div class="flex items-center gap-2">
                  <button
                    v-if="isCoach"
                    class="btn btn-sm btn-outline btn-primary"
                    @click="handleEditRecord(record)"
                    :style="{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                    編輯
                  </button>
                  <button
                    v-if="isCoach"
                    class="btn btn-sm btn-outline btn-error"
                    @click="handleDeleteRecord(record)"
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
    </div>

    <!-- 編輯訓練記錄模態框 -->
    <div v-if="showEditModal" class="modal modal-open">
      <div
        class="modal-box"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
      >
        <h3 class="font-bold text-lg mb-4">編輯訓練記錄</h3>

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
            <option value="">請選擇訓練計畫</option>
            <option
              v-for="trainingPlan in availableTrainingPlans"
              :key="trainingPlan.id"
              :value="trainingPlan.id"
            >
              {{ trainingPlan.coach?.name || "未指定教練" }} -
              {{ getPlanTypeLabel(trainingPlan.planType) }} ({{
                trainingPlan.planQuota
              }}堂)
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
              <select
                v-model="editingTime"
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
                  v-for="timeOption in timeOptions"
                  :key="timeOption.value"
                  :value="timeOption.value"
                >
                  {{ timeOption.label }}
                </option>
              </select>
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
            class="btn btn-primary"
            @click="handleSaveEditRecord"
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
            class="btn btn-ghost"
            @click="handleCancelEdit"
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

    <!-- 刪除確認模態框 -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div
        class="modal-box"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
      >
        <h3 class="font-bold text-lg mb-4">刪除訓練記錄</h3>
        <p class="mb-4">您確定要刪除這筆訓練記錄嗎？此操作無法復原。</p>

        <div class="modal-action">
          <button
            class="btn btn-error"
            @click="handleConfirmDeleteRecord"
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
            class="btn btn-ghost"
            @click="handleCancelDelete"
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
import { computed, ref, onMounted } from "vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ElMessage } from "element-plus";
import type {
  TrainingRecord,
  UpdateTrainingRecord,
} from "../services/trainingRecord";
import type { TrainingPlan } from "../services/trainingPlan";
import { useTraineeStore } from "../stores/trainee";
import { useViewerStore } from "../stores/viewer";

const traineeStore = useTraineeStore();
const viewerStore = useViewerStore();

const props = defineProps<{
  coachId: number;
  traineeId: number;
  trainingRecords: TrainingRecord[];
}>();

const emit = defineEmits<{
  "update-records": [records: TrainingRecord[]];
}>();

dayjs.extend(utc);
dayjs.extend(timezone);

// 使用 store 的狀態
const isCoach = computed(() => viewerStore.isCoach);

// 本地狀態管理
const isLoading = ref<boolean>(false);
const selectedMonth = ref<string>("");
const showEditModal = ref<boolean>(false);
const showDeleteModal = ref<boolean>(false);
const isExporting = ref<boolean>(false);
const editingRecord = ref<UpdateTrainingRecord>({
  id: 0,
  trainee: 0,
  trainingPlan: 0,
  date: "",
  editor: 0,
});
const deletingRecord = ref<TrainingRecord | null>(null);
const availableTrainingPlans = ref<TrainingPlan[]>([]);
const editingDate = ref<string>("");
const editingTime = ref<string>("");

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
  const minutes = currentTime.minute();
  const adjustedMinutes = Math.round(minutes / 30) * 30;
  const adjustedTime = currentTime.minute(adjustedMinutes).format("HH:mm");
  editingTime.value = adjustedTime;
};

/**
 * 24小時制時間選項
 */
const timeOptions = computed(() => {
  const options: Array<{ value: string; label: string }> = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      options.push({
        value: timeString,
        label: timeString,
      });
    }
  }

  return options;
});

/**
 * 生成月份選項（過去12個月到當月）
 */
const monthOptions = computed(() => {
  const options: Array<{ value: string; label: string }> = [];
  const currentDate = dayjs();

  for (let i = 12; i >= 1; i--) {
    const date = currentDate.subtract(i, "month");
    options.push({
      value: date.format("YYYY/MM"),
      label: date.format("YYYY/MM"),
    });
  }

  options.push({
    value: currentDate.format("YYYY/MM"),
    label: currentDate.format("YYYY/MM"),
  });

  return options;
});

/**
 * 載入訓練記錄資料
 */
const loadTrainingRecords = async (): Promise<void> => {
  try {
    isLoading.value = true;
    const records = await traineeStore.fetchTrainingRecord(
      props.traineeId,
      selectedMonth.value
    );

    if (records) {
      emit("update-records", records);
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
 * 處理月份變更
 */
const handleMonthChange = async (): Promise<void> => {
  await loadTrainingRecords();
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
    case "personal":
      return "個人教練";
    case "block":
      return "團體課程";
    case "sequential":
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
  const today = dayjs();

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = weekdays[date.day()];

  if (date.isSame(today, "day")) {
    return `今天 ${date.format("MM/DD")} (週${weekday})`;
  } else {
    return `${date.format("YYYY/MM/DD")} (週${weekday})`;
  }
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

  if (!editingRecord.value.trainingPlan) {
    errors.trainingPlan = "請選擇訓練計畫";
  }

  if (!editingDate.value) {
    errors.date = "請選擇日期";
  }

  if (!editingTime.value) {
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
    doc.text("簽到歷史記錄", 14, 20);

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
        record.trainingPlan?.planQuota?.toString() || "",
        record.trainingPlan?.usedQuota?.toString() || "",
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
const handleEditRecord = async (record: TrainingRecord): Promise<void> => {
  try {
    const trainee = await traineeStore.fetchById(props.traineeId);
    if (trainee?.trainingPlan) {
      availableTrainingPlans.value = trainee.trainingPlan;
    }

    const currentDateTime = dayjs().tz("Asia/Taipei");
    editingDate.value = currentDateTime.format("YYYY-MM-DD");

    const minutes = currentDateTime.minute();
    const adjustedMinutes = Math.round(minutes / 30) * 30;
    const adjustedTime = currentDateTime
      .minute(adjustedMinutes)
      .format("HH:mm");
    editingTime.value = adjustedTime;

    editingRecord.value = {
      id: record.id,
      trainee: props.traineeId,
      trainingPlan: record.trainingPlan?.id || 0,
      date: "",
      editor: props.coachId,
    };

    showEditModal.value = true;
  } catch (error) {
    console.error("Failed to load training plans:", error);
    ElMessage.error("獲取訓練計畫失敗，請稍後再試");
  }
};

/**
 * 處理儲存編輯的訓練記錄
 */
const handleSaveEditRecord = async (): Promise<void> => {
  if (!validateEditForm()) {
    return;
  }

  const combinedDateTime = `${editingDate.value}T${editingTime.value}`;
  editingRecord.value.date = combinedDateTime;

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
  initializeDefaultTime();
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
  selectedMonth.value = dayjs().format("YYYY/MM");
  initializeDefaultTime();
  await loadTrainingRecords();
});
</script>
