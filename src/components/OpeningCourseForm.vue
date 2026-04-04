<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-xl mb-4">
        {{ isEdit ? "修改課程" : "新增課程" }}
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="label">
            <span class="font-medium">課程名稱</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="input w-full"
            :class="{ 'input-error': errors.name }"
          />
          <p v-if="errors.name" class="text-sm mt-1" :style="{ color: 'var(--color-error)' }">
            {{ errors.name }}
          </p>
        </div>

        <div>
          <label class="label">
            <span class="font-medium">教練</span>
          </label>
          <select
            v-model="formData.coachId"
            class="select w-full"
            :class="{ 'select-error': errors.coachId }"
          >
            <option v-for="coach in coaches" :key="coach.id" :value="coach.id">
              {{ coach.name }}
            </option>
          </select>
          <p v-if="errors.coachId" class="text-sm mt-1" :style="{ color: 'var(--color-error)' }">
            {{ errors.coachId }}
          </p>
        </div>

        <div>
          <label class="label">
            <span class="font-medium">星期</span>
          </label>
          <select
            v-model="formData.dayOfWeek"
            class="select w-full"
            :class="{ 'select-error': errors.dayOfWeek }"
          >
            <option :value="DayOfWeek.MONDAY">星期一</option>
            <option :value="DayOfWeek.TUESDAY">星期二</option>
            <option :value="DayOfWeek.WEDNESDAY">星期三</option>
            <option :value="DayOfWeek.THURSDAY">星期四</option>
            <option :value="DayOfWeek.FRIDAY">星期五</option>
            <option :value="DayOfWeek.SATURDAY">星期六</option>
            <option :value="DayOfWeek.SUNDAY">星期日</option>
          </select>
          <p v-if="errors.dayOfWeek" class="text-sm mt-1" :style="{ color: 'var(--color-error)' }">
            {{ errors.dayOfWeek }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">
              <span class="font-medium">開始時間</span>
            </label>
            <select
              v-model="formData.start"
              class="select w-full"
              :class="{ 'select-error': errors.start }"
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
            <p v-if="errors.start" class="text-sm mt-1" :style="{ color: 'var(--color-error)' }">
              {{ errors.start }}
            </p>
          </div>
          <div>
            <label class="label">
              <span class="font-medium">結束時間</span>
            </label>
            <select
              v-model="formData.end"
              class="select w-full"
              :class="{ 'select-error': errors.end }"
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
            <p v-if="errors.end" class="text-sm mt-1" :style="{ color: 'var(--color-error)' }">
              {{ errors.end }}
            </p>
          </div>
        </div>

        <div>
          <label class="label">
            <span class="font-medium">備註</span>
          </label>
          <textarea
            v-model="formData.note"
            class="textarea w-full"
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
} from "../services/opening-course";
import { DayOfWeek } from "../services/opening-course";
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

// 24小時制時間選項（10分鐘間隔）
const timeOptions = Array.from({ length: 144 }, (_, i) => {
  const hour = Math.floor(i / 6)
    .toString()
    .padStart(2, "0");
  const minute = (i % 6) * 10;
  return {
    value: `${hour}:${minute.toString().padStart(2, "0")}`,
    label: `${hour}:${minute.toString().padStart(2, "0")}`,
  };
});

// 根據開始時間取得結束時間選項
const getEndTimeOptions = (startTime: string) => {
  if (!startTime) return timeOptions;

  // 將開始時間轉換為分鐘數以便比較
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;

  return timeOptions.filter((time) => {
    const [timeHour, timeMinute] = time.value.split(":").map(Number);
    const timeTotalMinutes = timeHour * 60 + timeMinute;
    return timeTotalMinutes > startTotalMinutes;
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
        coachId: newCourse.coach?.id?.toString() || "",
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
