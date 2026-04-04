<template>
  <div class="card shadow-xl w-full">
    <div class="card-body">
      <h2 class="card-title text-2xl">學員資料</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div>
          <label class="label">
            <span class="font-medium">姓名</span>
          </label>
          <input
            type="text"
            v-model="traineeData.name"
            class="input w-full"
            :class="{ 'input-error': validationErrors.name }"
            @input="validateField('name')"
          />
          <p v-if="validationErrors.name" class="text-sm mt-1" :style="{ color: 'var(--color-error)' }">
            {{ validationErrors.name }}
          </p>
        </div>
        <div>
          <label class="label">
            <span class="font-medium">性別</span>
          </label>
          <select
            v-model="traineeData.gender"
            class="select w-full"
          >
            <option value="Male">男</option>
            <option value="Female">女</option>
          </select>
        </div>
        <div>
          <label class="label">
            <span class="font-medium">生日</span>
          </label>
          <input
            type="date"
            v-model="traineeData.birthday"
            class="input w-full"
            :class="{ 'input-error': validationErrors.birthday }"
            :min="getMinBirthday()"
            :max="getMaxBirthday()"
            :placeholder="getBirthdayPlaceholder()"
            :value="getBirthdayValue()"
            @input="validateField('birthday')"
          />
          <p v-if="validationErrors.birthday" class="text-sm mt-1 text-error">
            {{ validationErrors.birthday }}
          </p>
        </div>
        <div>
          <label class="label">
            <span class="font-medium">手機</span>
          </label>
          <input
            type="tel"
            v-model="formattedPhone"
            class="input w-full"
            :class="{ 'input-error': validationErrors.phone }"
            placeholder="09XX-XXX-XXX"
            maxlength="12"
            @input="handlePhoneInput"
          />
          <p v-if="validationErrors.phone" class="text-sm mt-1 text-error">
            {{ validationErrors.phone }}
          </p>
        </div>
        <div>
          <label class="label">
            <span class="font-medium">身高(cm)</span>
          </label>
          <input
            type="number"
            v-model.number="traineeData.height"
            class="input w-full"
            :class="{ 'input-error': validationErrors.height }"
            min="100.0"
            max="250.0"
            step="0.1"
            @input="validateField('height')"
          />
          <p v-if="validationErrors.height" class="text-sm mt-1 text-error">
            {{ validationErrors.height }}
          </p>
        </div>
        <div>
          <label class="label">
            <span class="font-medium">體重(kg)</span>
          </label>
          <input
            type="number"
            v-model.number="traineeData.weight"
            class="input w-full"
            :class="{ 'input-error': validationErrors.weight }"
            min="30.0"
            max="300.0"
            step="0.1"
            @input="validateField('weight')"
          />
          <p v-if="validationErrors.weight" class="text-sm mt-1 text-error">
            {{ validationErrors.weight }}
          </p>
        </div>
        <div>
          <label class="label">
            <span class="font-medium">BMI</span>
          </label>
          <input type="text" :value="calculatedBMI" class="input w-full" disabled />
        </div>
      </div>

      <!-- Note 欄位 - 僅教練可見 -->
      <div v-if="coach" class="mt-4">
        <label class="label">
          <span class="font-medium">備註</span>
          <span class="text-sm" :class="getNoteCharacterCountClass()">
            {{ getNoteCharacterCount() }}/100
          </span>
        </label>
        <textarea
          v-model="traineeData.note"
          class="textarea w-full"
          :class="{ 'textarea-error': validationErrors.note }"
          placeholder="請輸入備註（最多100字）..."
          rows="3"
          maxlength="100"
          @input="validateField('note')"
        ></textarea>
        <p v-if="validationErrors.note" class="text-sm mt-1" :style="{ color: 'var(--color-error)' }">
          {{ validationErrors.note }}
        </p>
      </div>
      <div class="card-actions justify-end mt-4">
        <button class="btn btn-primary" @click="handleSubmit">
          儲存
        </button>
        <button
          v-if="coach"
          class="btn btn-outline"
          @click="handleBack"
        >
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import dayjs from "dayjs";
import type { Trainee } from "../services/trainee";

interface Props {
  trainee: Trainee;
  coach?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "save", data: Trainee): void;
  (e: "back"): void;
}>();

// 表單資料
const traineeData = ref<Trainee>({} as Trainee);
const formattedPhone = ref<string>("");

// 驗證錯誤狀態
const validationErrors = ref({
  name: "",
  birthday: "",
  phone: "",
  height: "",
  weight: "",
  note: "",
});

/**
 * 獲取輸入框樣式
 */
const getInputStyle = (fieldName: keyof typeof validationErrors.value) => {
  const hasError = validationErrors.value[fieldName];
  return {
    borderColor: hasError ? "var(--color-error)" : "var(--color-input-border)",
    backgroundColor: "var(--color-input-bg)",
    color: "var(--color-text)",
  };
};

/**
 * 獲取最小生日（100年前）
 */
const getMinBirthday = (): string => {
  return dayjs().subtract(100, "year").format("YYYY-MM-DD");
};

/**
 * 獲取最大生日（10年前）
 */
const getMaxBirthday = (): string => {
  return dayjs().subtract(10, "year").format("YYYY-MM-DD");
};

/**
 * 獲取生日佔位符
 */
const getBirthdayPlaceholder = (): string => {
  return traineeData.value.birthday === "1900-01-01" ? "年/月/日" : "";
};

/**
 * 獲取生日值
 */
const getBirthdayValue = (): string => {
  return traineeData.value.birthday === "1900-01-01"
    ? ""
    : traineeData.value.birthday;
};

/**
 * 驗證姓名
 */
const validateName = (): void => {
  if (!traineeData.value.name || traineeData.value.name.trim() === "") {
    validationErrors.value.name = "請輸入姓名";
    return;
  }
  validationErrors.value.name = "";
};

/**
 * 驗證生日（非必填）
 */
const validateBirthday = (): void => {
  // 生日為非必填欄位，不做必填驗證
  validationErrors.value.birthday = "";
};

/**
 * 驗證手機號碼
 */
const validatePhone = (value: string): void => {
  const phone = value.replace(/\D/g, "");

  if (!phone) {
    validationErrors.value.phone = "請輸入手機號碼";
    return;
  }

  if (!phone.startsWith("09")) {
    validationErrors.value.phone = "手機號碼必須以 09 開頭";
    return;
  }

  if (phone.length !== 10) {
    validationErrors.value.phone = "手機號碼必須為 10 位數字";
    return;
  }

  validationErrors.value.phone = "";
  formattedPhone.value = phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
};

/**
 * 驗證身高（非必填）
 */
const validateHeight = (): void => {
  const height = traineeData.value.height;
  // 身高為非必填欄位，但如果有填寫則驗證範圍
  if (height && (height < 100.0 || height > 250.0)) {
    validationErrors.value.height = "身高必須在 100.0 到 250.0 公分之間";
  } else {
    validationErrors.value.height = "";
  }
};

/**
 * 驗證體重（非必填）
 */
const validateWeight = (): void => {
  const weight = traineeData.value.weight;
  // 體重為非必填欄位，但如果有填寫則驗證範圍
  if (weight && (weight < 30.0 || weight > 300.0)) {
    validationErrors.value.weight = "體重必須在 30.0 到 300.0 公斤之間";
  } else {
    validationErrors.value.weight = "";
  }
};

/**
 * 驗證備註
 */
const validateNote = (): void => {
  const note = traineeData.value.note || "";
  if (note.length > 100) {
    validationErrors.value.note = "備註不能超過100字";
  } else {
    validationErrors.value.note = "";
  }
};

/**
 * 統一驗證函數
 */
const validateField = (
  fieldName: keyof typeof validationErrors.value
): void => {
  switch (fieldName) {
    case "name":
      validateName();
      break;
    case "birthday":
      validateBirthday();
      break;
    case "phone":
      validatePhone(traineeData.value.phone);
      break;
    case "height":
      validateHeight();
      break;
    case "weight":
      validateWeight();
      break;
    case "note":
      validateNote();
      break;
  }
};

/**
 * 處理手機號碼輸入
 */
const handlePhoneInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  validatePhone(target.value);
};

/**
 * 計算 BMI
 */
const calculatedBMI = computed<string>(() => {
  if (!traineeData.value.height || !traineeData.value.weight) return "未知";
  const heightInMeters = traineeData.value.height / 100;
  const bmi = traineeData.value.weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(2);
});

/**
 * 獲取備註字數
 */
const getNoteCharacterCount = (): number => {
  return (traineeData.value.note || "").length;
};

/**
 * 獲取備註字數計數的樣式類別
 */
const getNoteCharacterCountClass = (): string => {
  const count = getNoteCharacterCount();
  if (count > 100) {
    return "text-error";
  } else if (count > 80) {
    return "text-warning";
  } else {
    return "text-base-content opacity-70";
  }
};

/**
 * 檢查表單是否有效
 */
const isFormValid = (): boolean => {
  return (
    !Object.values(validationErrors.value).some((error) => error !== "") &&
    traineeData.value.phone !== "" &&
    (traineeData.value.note || "").length <= 100
  );
};

/**
 * 處理表單提交
 */
const handleSubmit = (): void => {
  // 驗證所有欄位
  validateField("name");
  validateField("birthday");
  validateField("phone");
  validateField("height");
  validateField("weight");
  validateField("note");

  if (!isFormValid()) {
    if (!traineeData.value.phone) {
      validationErrors.value.phone = "請輸入手機號碼";
    }
    if ((traineeData.value.note || "").length > 100) {
      validationErrors.value.note = "備註不能超過100字";
    }
    return;
  }

  const data: Trainee = {
    ...traineeData.value,
    birthday:
      !traineeData.value.birthday || traineeData.value.birthday === "1900-01-01"
        ? undefined
        : dayjs(traineeData.value.birthday).format("YYYY-MM-DD"),
    phone: traineeData.value.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3"),
    height: traineeData.value.height
      ? Number(Number(traineeData.value.height).toFixed(1))
      : undefined,
    weight: traineeData.value.weight
      ? Number(Number(traineeData.value.weight).toFixed(1))
      : undefined,
    note: traineeData.value.note || "",
  } as Trainee;

  emit("save", data);
};

/**
 * 處理返回按鈕
 */
const handleBack = (): void => {
  emit("back");
};

// 監聽格式化手機號碼變化
watch(formattedPhone, (value: string) => {
  traineeData.value.phone = value.replace(/\D/g, "");
});

// 初始化
onMounted(() => {
  traineeData.value = props.trainee;

  if (traineeData.value.phone) {
    formattedPhone.value = traineeData.value.phone.replace(
      /(\d{4})(\d{3})(\d{3})/,
      "$1-$2-$3"
    );
  }
});
</script>
