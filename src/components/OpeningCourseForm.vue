<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        {{ isEdit ? "修改課程" : "新增課程" }}
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">課程名稱</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="input"
            :style="{
              borderColor: errors.name
                ? 'var(--color-error)'
                : 'var(--color-input-border)',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text)',
            }"
          />
          <label v-if="errors.name" class="label">
            <span
              class="label-text-alt"
              :style="{ color: 'var(--color-error)' }"
              >{{ errors.name }}</span
            >
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">教練</span>
          </label>
          <select
            v-model="formData.coachId"
            class="select"
            :style="{
              borderColor: errors.coachId
                ? 'var(--color-error)'
                : 'var(--color-input-border)',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text)',
            }"
          >
            <option v-for="coach in coaches" :key="coach.id" :value="coach.id">
              {{ coach.name }}
            </option>
          </select>
          <label v-if="errors.coachId" class="label">
            <span
              class="label-text-alt"
              :style="{ color: 'var(--color-error)' }"
              >{{ errors.coachId }}</span
            >
          </label>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">星期</span>
          </label>
          <select
            v-model="formData.dayOfWeek"
            class="select"
            :style="{
              borderColor: errors.dayOfWeek
                ? 'var(--color-error)'
                : 'var(--color-input-border)',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text)',
            }"
          >
            <option :value="DayOfWeek.MONDAY">星期一</option>
            <option :value="DayOfWeek.TUESDAY">星期二</option>
            <option :value="DayOfWeek.WEDNESDAY">星期三</option>
            <option :value="DayOfWeek.THURSDAY">星期四</option>
            <option :value="DayOfWeek.FRIDAY">星期五</option>
            <option :value="DayOfWeek.SATURDAY">星期六</option>
            <option :value="DayOfWeek.SUNDAY">星期日</option>
          </select>
          <label v-if="errors.dayOfWeek" class="label">
            <span
              class="label-text-alt"
              :style="{ color: 'var(--color-error)' }"
              >{{ errors.dayOfWeek }}</span
            >
          </label>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">開始時間</span>
            </label>
            <select
              v-model="formData.start"
              class="select"
              :style="{
                borderColor: errors.start
                  ? 'var(--color-error)'
                  : 'var(--color-input-border)',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text)',
              }"
            >
              <option value="">開始時間</option>
              <option
                v-for="time in timeOptions"
                :key="time.value"
                :value="time.value"
              >
                {{ time.label }}
              </option>
            </select>
            <label v-if="errors.start" class="label">
              <span
                class="label-text-alt"
                :style="{ color: 'var(--color-error)' }"
                >{{ errors.start }}</span
              >
            </label>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">結束時間</span>
            </label>
            <select
              v-model="formData.end"
              class="select"
              :style="{
                borderColor: errors.end
                  ? 'var(--color-error)'
                  : 'var(--color-input-border)',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text)',
              }"
            >
              <option value="">結束時間</option>
              <option
                v-for="time in getEndTimeOptions(formData.start)"
                :key="time.value"
                :value="time.value"
              >
                {{ time.label }}
              </option>
            </select>
            <label v-if="errors.end" class="label">
              <span
                class="label-text-alt"
                :style="{ color: 'var(--color-error)' }"
                >{{ errors.end }}</span
              >
            </label>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">備註</span>
          </label>
          <textarea
            v-model="formData.note"
            class="textarea textarea-bordered"
            rows="3"
          ></textarea>
        </div>

        <div class="modal-action">
          <button type="button" @click="closeModal" class="btn btn-outline">
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
            :class="{ 'btn-disabled': isSubmitting }"
          >
            <span
              v-if="isSubmitting"
              class="loading loading-spinner loading-sm"
            ></span>
            {{ isSubmitting ? "處理中..." : isEdit ? "修改" : "新增" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type {
  OpeningCourse,
  CreateOpeningCourse,
  UpdateOpeningCourse,
} from "../services/openoingCourse";
import { DayOfWeek } from "../services/openoingCourse";
import type { Coach } from "../services/coach";

interface Props {
  isOpen: boolean;
  course?: OpeningCourse | null;
  coaches: Coach[];
}

interface Emits {
  (e: "close"): void;
  (e: "submit", data: CreateOpeningCourse | UpdateOpeningCourse): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isSubmitting = ref<boolean>(false);

// 錯誤狀態管理
const errors = ref<{
  name: string;
  coachId: string;
  dayOfWeek: string;
  start: string;
  end: string;
}>({
  name: "",
  coachId: "",
  dayOfWeek: "",
  start: "",
  end: "",
});

const formData = ref<{
  name: string;
  coachId: string;
  dayOfWeek: DayOfWeek | "";
  start: string;
  end: string;
  note: string;
}>({
  name: "",
  coachId: "",
  dayOfWeek: "",
  start: "",
  end: "",
  note: "",
});

// 24小時制時間選項
const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

// 根據開始時間取得結束時間選項
const getEndTimeOptions = (startTime: string) => {
  if (!startTime) return timeOptions;
  const startHour = parseInt(startTime.split(":")[0]);
  return timeOptions.filter((time) => {
    const timeHour = parseInt(time.value.split(":")[0]);
    return timeHour > startHour;
  });
};

// 清除所有錯誤
const clearErrors = (): void => {
  errors.value = {
    name: "",
    coachId: "",
    dayOfWeek: "",
    start: "",
    end: "",
  };
};

// 驗證單一欄位
const validateField = (
  field: keyof typeof errors.value,
  value: string
): string => {
  switch (field) {
    case "name":
      return value.trim() ? "" : "請輸入課程名稱";
    case "coachId":
      return value ? "" : "請選擇教練";
    case "dayOfWeek":
      return value ? "" : "請選擇星期";
    case "start":
      return value ? "" : "請選擇開始時間";
    case "end":
      return value ? "" : "請選擇結束時間";
    default:
      return "";
  }
};

// 驗證時間範圍
const validateTimeRange = (): string => {
  if (formData.value.start && formData.value.end) {
    const startHour = parseInt(formData.value.start.split(":")[0]);
    const endHour = parseInt(formData.value.end.split(":")[0]);
    if (endHour <= startHour) {
      return "結束時間必須晚於開始時間";
    }
  }
  return "";
};

const resetForm = (): void => {
  formData.value = {
    name: "",
    coachId: "",
    dayOfWeek: "",
    start: "",
    end: "",
    note: "",
  };
  clearErrors();
};

const isEdit = computed(() => !!props.course);

watch(
  () => props.course,
  (newCourse) => {
    if (newCourse) {
      formData.value = {
        name: newCourse.name,
        coachId: newCourse.coach.id.toString(),
        dayOfWeek: newCourse.dayOfWeek,
        start: newCourse.start,
        end: newCourse.end,
        note: newCourse.note,
      };
    } else {
      resetForm();
    }
    clearErrors();
  },
  { immediate: true }
);

// 監聽開始時間變化，如果結束時間不合法則清空
watch(
  () => formData.value.start,
  (newStartTime) => {
    if (newStartTime && formData.value.end) {
      const startHour = parseInt(newStartTime.split(":")[0]);
      const endHour = parseInt(formData.value.end.split(":")[0]);
      if (endHour <= startHour) {
        formData.value.end = "";
      }
    }
    // 清除開始時間錯誤
    errors.value.start = validateField("start", newStartTime);
    // 重新驗證結束時間
    errors.value.end = validateField("end", formData.value.end);
  }
);

// 監聽結束時間變化
watch(
  () => formData.value.end,
  (newEndTime) => {
    errors.value.end = validateField("end", newEndTime);
    // 檢查時間範圍
    const timeRangeError = validateTimeRange();
    if (timeRangeError) {
      errors.value.end = timeRangeError;
    }
  }
);

const handleSubmit = async (): Promise<void> => {
  // 防止重複提交
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  clearErrors();

  try {
    // 驗證所有欄位
    let hasError = false;

    errors.value.name = validateField("name", formData.value.name);
    errors.value.coachId = validateField("coachId", formData.value.coachId);
    errors.value.dayOfWeek = validateField(
      "dayOfWeek",
      formData.value.dayOfWeek
    );
    errors.value.start = validateField("start", formData.value.start);
    errors.value.end = validateField("end", formData.value.end);

    // 檢查時間範圍
    const timeRangeError = validateTimeRange();
    if (timeRangeError) {
      errors.value.end = timeRangeError;
      hasError = true;
    }

    // 檢查是否有任何錯誤
    if (!hasError) {
      hasError = Object.values(errors.value).some((error) => error !== "");
    }

    // 如果有錯誤，阻擋提交
    if (hasError) {
      isSubmitting.value = false;
      return;
    }

    const baseData = {
      name: formData.value.name.trim(),
      dayOfWeek: formData.value.dayOfWeek as DayOfWeek,
      start: formData.value.start,
      end: formData.value.end,
      note: formData.value.note?.trim() || "",
      coach: parseInt(formData.value.coachId, 10),
    };

    if (props.course?.id) {
      // 更新模式
      const updateData: UpdateOpeningCourse = {
        ...baseData,
        id: props.course.id,
      };
      emit("submit", updateData);
    } else {
      // 建立模式
      const createData: CreateOpeningCourse = baseData;
      emit("submit", createData);
    }

    // 送出成功後立即關閉模態框
    closeModal();
  } catch (error) {
    // 錯誤會顯示在欄位下方
    console.error("表單提交錯誤:", error);
    // 只有在發生錯誤時才重置提交狀態
    isSubmitting.value = false;
  }
};

const closeModal = (): void => {
  // 重置提交狀態
  isSubmitting.value = false;
  emit("close");
  resetForm();
};
</script>
