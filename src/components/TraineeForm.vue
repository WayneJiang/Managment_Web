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
            v-model="refTrainee.name"
            class="input"
            :style="{
              borderColor: refNameError
                ? 'var(--color-error)'
                : 'var(--color-input-border)',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text)',
            }"
            @input="validateName"
          />
          <label class="label" v-if="refNameError">
            <span
              class="label-text-alt"
              :style="{ color: 'var(--color-error)' }"
              >{{ refNameError }}</span
            >
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">性別</span>
          </label>
          <select
            v-model="refTrainee.gender"
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
            v-model="refTrainee.birthday"
            class="input"
            :class="{ 'input-error': refBirthdayError }"
            :min="dayjs().subtract(100, 'year').format('YYYY-MM-DD')"
            :max="dayjs().subtract(10, 'year').format('YYYY-MM-DD')"
            :placeholder="
              refTrainee.birthday === '1900-01-01' ? '年/月/日' : ''
            "
            :value="
              refTrainee.birthday === '1900-01-01' ? '' : refTrainee.birthday
            "
            @input="validateBirthday"
          />
          <label class="label" v-if="refBirthdayError">
            <span class="label-text-alt text-error">{{
              refBirthdayError
            }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">手機</span>
          </label>
          <input
            type="tel"
            v-model="refFormattedPhone"
            class="input"
            :class="{ 'input-error': refPhoneError }"
            placeholder="09XX-XXX-XXX"
            maxlength="12"
            @input="(e: Event) => validatePhone((e.target as HTMLInputElement).value)"
          />
          <label class="label" v-if="refPhoneError">
            <span class="label-text-alt text-error">{{ refPhoneError }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">身高(cm)</span>
          </label>
          <input
            type="number"
            v-model.number="refTrainee.height"
            class="input"
            :class="{ 'input-error': refHeightError }"
            min="100.0"
            max="250.0"
            step="0.1"
            @input="validateHeight"
          />
          <label class="label" v-if="refHeightError">
            <span class="label-text-alt text-error">{{ refHeightError }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">體重(kg)</span>
          </label>
          <input
            type="number"
            v-model.number="refTrainee.weight"
            class="input"
            :class="{ 'input-error': refWeightError }"
            min="30.0"
            max="300.0"
            step="0.1"
            @input="validateWeight"
          />
          <label class="label" v-if="refWeightError">
            <span class="label-text-alt text-error">{{ refWeightError }}</span>
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">BMI</span>
          </label>
          <input type="text" :value="calculateBMI" class="input" disabled />
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
          @click="onSubmit"
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
          @click="onBack"
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
import { Trainee } from "../services/trainee";

interface Props {
  trainee: Trainee;
  coach?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "save", data: Trainee): void;
  (e: "back"): void;
}>();

const refTrainee = ref<Trainee>({} as Trainee);

const refPhoneError = ref<string>("");
const refFormattedPhone = ref<string>("");
const refBirthdayError = ref<string>("");
const refHeightError = ref<string>("");
const refWeightError = ref<string>("");
const refNameError = ref<string>("");

const validatePhone = (value: string): void => {
  const phone = value.replace(/\D/g, "");

  if (!phone) {
    refPhoneError.value = "請輸入手機號碼";
    return;
  }

  if (!phone.startsWith("09")) {
    refPhoneError.value = "手機號碼必須以 09 開頭";
    return;
  }
  if (phone.length !== 10) {
    refPhoneError.value = "手機號碼必須為 10 位數字";
    return;
  }

  refPhoneError.value = "";
  refFormattedPhone.value = phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
};

const validateBirthday = (): void => {
  if (
    !refTrainee.value.birthday ||
    refTrainee.value.birthday === "1900-01-01"
  ) {
    refBirthdayError.value = "請選擇生日";
    return;
  }
  refBirthdayError.value = "";
};

const validateHeight = (): void => {
  const height = refTrainee.value.height;
  if (!height) {
    refHeightError.value = "請輸入身高";
    return;
  }
  if (height < 100.0 || height > 250.0) {
    refHeightError.value = "身高必須在 100.0 到 250.0 公分之間";
  } else {
    refHeightError.value = "";
  }
};

const validateWeight = (): void => {
  const weight = refTrainee.value.weight;
  if (!weight) {
    refWeightError.value = "請輸入體重";
    return;
  }
  if (weight < 30.0 || weight > 300.0) {
    refWeightError.value = "體重必須在 30.0 到 300.0 公斤之間";
  } else {
    refWeightError.value = "";
  }
};

const validateName = (): void => {
  if (!refTrainee.value.name || refTrainee.value.name.trim() === "") {
    refNameError.value = "請輸入姓名";
    return;
  }
  refNameError.value = "";
};

watch(refFormattedPhone, (value: string) => {
  refTrainee.value.phone = value.replace(/\D/g, "");
});

onMounted(() => {
  refTrainee.value = props.trainee;

  if (refTrainee.value.phone) {
    refFormattedPhone.value = refTrainee.value.phone.replace(
      /(\d{4})(\d{3})(\d{3})/,
      "$1-$2-$3"
    );
  }
});

const calculateBMI = computed<string>(() => {
  if (!refTrainee.value.height || !refTrainee.value.weight) return "未知";
  const heightInMeters = refTrainee.value.height / 100;
  const bmi = refTrainee.value.weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(2);
});

const onSubmit = (): void => {
  validateName();
  validateBirthday();
  validatePhone(refTrainee.value.phone);
  validateHeight();
  validateWeight();
  if (
    refNameError.value ||
    refBirthdayError.value ||
    refPhoneError.value ||
    refHeightError.value ||
    refWeightError.value ||
    !refTrainee.value.phone
  ) {
    if (!refTrainee.value.phone) {
      refPhoneError.value = "請輸入手機號碼";
    }
    return;
  }
  const data: Trainee = {
    ...refTrainee.value,
    birthday:
      refTrainee.value.birthday === "1900-01-01"
        ? "1900-01-01"
        : dayjs(refTrainee.value.birthday).format("YYYY-MM-DD"),
    phone: refTrainee.value.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3"),
    height: Number(Number(refTrainee.value.height).toFixed(1)),
    weight: Number(Number(refTrainee.value.weight).toFixed(1)),
  };
  emit("save", data);
};

const onBack = (): void => {
  emit("back");
};
</script>
