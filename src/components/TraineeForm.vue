<template>
  <div
    class="card shadow-xl w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <h2 class="card-title text-2xl">學員資料</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">姓名</span>
          </label>
          <input
            type="text"
            v-model="traineeData.name"
            class="input"
            :style="getInputStyle('name')"
            @input="validateField('name')"
          />
          <label class="label" v-if="validationErrors.name">
            <span
              class="label-text-alt"
              :style="{ color: 'var(--color-error)' }"
              >{{ validationErrors.name }}</span
            >
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">性別</span>
          </label>
          <select
            v-model="traineeData.gender"
            class="select"
            :style="{
              borderColor: 'var(--color-input-border)',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text)',
            }"
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">生日</span>
          </label>
          <input
            type="date"
            v-model="traineeData.birthday"
            class="input"
            :class="{ 'input-error': validationErrors.birthday }"
            :min="getMinBirthday()"
            :max="getMaxBirthday()"
            :placeholder="getBirthdayPlaceholder()"
            :value="getBirthdayValue()"
            @input="validateField('birthday')"
          />
          <label class="label" v-if="validationErrors.birthday">
            <span class="label-text-alt text-error">{{
              validationErrors.birthday
            }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">手機</span>
          </label>
          <input
            type="tel"
            v-model="formattedPhone"
            class="input"
            :class="{ 'input-error': validationErrors.phone }"
            placeholder="09XX-XXX-XXX"
            maxlength="12"
            @input="handlePhoneInput"
          />
          <label class="label" v-if="validationErrors.phone">
            <span class="label-text-alt text-error">{{
              validationErrors.phone
            }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">身高(cm)</span>
          </label>
          <input
            type="number"
            v-model.number="traineeData.height"
            class="input"
            :class="{ 'input-error': validationErrors.height }"
            min="100.0"
            max="250.0"
            step="0.1"
            @input="validateField('height')"
          />
          <label class="label" v-if="validationErrors.height">
            <span class="label-text-alt text-error">{{
              validationErrors.height
            }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">體重(kg)</span>
          </label>
          <input
            type="number"
            v-model.number="traineeData.weight"
            class="input"
            :class="{ 'input-error': validationErrors.weight }"
            min="30.0"
            max="300.0"
            step="0.1"
            @input="validateField('weight')"
          />
          <label class="label" v-if="validationErrors.weight">
            <span class="label-text-alt text-error">{{
              validationErrors.weight
            }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">BMI</span>
          </label>
          <input type="text" :value="calculatedBMI" class="input" disabled />
        </div>
      </div>
      <div class="card-actions justify-end mt-4">
        <button
          class="btn"
          :style="{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            borderColor: 'var(--color-primary)',
          }"
          @click="handleSubmit"
        >
          儲存
        </button>
        <button
          v-if="coach"
          class="btn"
          :style="{
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            borderColor: 'var(--color-primary)',
          }"
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
 * 驗證生日
 */
const validateBirthday = (): void => {
  if (
    !traineeData.value.birthday ||
    traineeData.value.birthday === "1900-01-01"
  ) {
    validationErrors.value.birthday = "請選擇生日";
    return;
  }
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
 * 驗證身高
 */
const validateHeight = (): void => {
  const height = traineeData.value.height;
  if (!height) {
    validationErrors.value.height = "請輸入身高";
    return;
  }
  if (height < 100.0 || height > 250.0) {
    validationErrors.value.height = "身高必須在 100.0 到 250.0 公分之間";
  } else {
    validationErrors.value.height = "";
  }
};

/**
 * 驗證體重
 */
const validateWeight = (): void => {
  const weight = traineeData.value.weight;
  if (!weight) {
    validationErrors.value.weight = "請輸入體重";
    return;
  }
  if (weight < 30.0 || weight > 300.0) {
    validationErrors.value.weight = "體重必須在 30.0 到 300.0 公斤之間";
  } else {
    validationErrors.value.weight = "";
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
 * 檢查表單是否有效
 */
const isFormValid = (): boolean => {
  return (
    !Object.values(validationErrors.value).some((error) => error !== "") &&
    traineeData.value.phone !== ""
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

  if (!isFormValid()) {
    if (!traineeData.value.phone) {
      validationErrors.value.phone = "請輸入手機號碼";
    }
    return;
  }

  const data: Trainee = {
    ...traineeData.value,
    birthday:
      traineeData.value.birthday === "1900-01-01"
        ? "1900-01-01"
        : dayjs(traineeData.value.birthday).format("YYYY-MM-DD"),
    phone: traineeData.value.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3"),
    height: Number(Number(traineeData.value.height).toFixed(1)),
    weight: Number(Number(traineeData.value.weight).toFixed(1)),
  };

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
