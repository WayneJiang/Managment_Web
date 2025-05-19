<template>
  <div class="card bg-base-100 shadow-xl w-full">
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
            class="input input-bordered"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">性別</span>
          </label>
          <select
            v-model="refTrainee.gender"
            class="select select-bordered w-full"
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
            class="input input-bordered"
            :class="{ 'input-error': refBirthdayError }"
            :min="dayjs().subtract(100, 'year').format('YYYY-MM-DD')"
            :max="dayjs().subtract(10, 'year').format('YYYY-MM-DD')"
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
            class="input input-bordered"
            :class="{ 'input-error': refPhoneError }"
            placeholder="09XX-XXX-XXX"
            maxlength="12"
            @input="validatePhone"
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
            class="input input-bordered"
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
            class="input input-bordered"
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
          <input
            type="text"
            :value="calculateBMI"
            class="input input-bordered"
            disabled
          />
        </div>
      </div>
      <div class="card-actions justify-end mt-4">
        <button class="btn btn-primary" @click="onSubmit">儲存</button>
        <button v-if="coach" class="btn btn" @click="onBack">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  trainee: {
    type: Object,
    required: true,
  },
  coach: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save", "back"]);

const refTrainee = ref({
  name: "",
  birthday: "",
  gender: "male",
  age: 0,
  phone: "",
  height: 0,
  weight: 0,
});

const refPhoneError = ref("");
const refFormattedPhone = ref("");
const refBirthdayError = ref("");
const refHeightError = ref("");
const refWeightError = ref("");

const validatePhone = (event) => {
  const input = event.target;
  let value = input.value.replace(/\D/g, "");

  if (!value) {
    refPhoneError.value = "請輸入手機號碼";
    return;
  }

  if (!value.startsWith("09")) {
    refPhoneError.value = "手機號碼必須以 09 開頭";
    return;
  }
  if (value.length !== 10) {
    refPhoneError.value = "手機號碼必須為 10 位數字";
    return;
  }

  refPhoneError.value = "";
  refFormattedPhone.value = value.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
};

const validateBirthday = () => {
  if (!refTrainee.value.birthday) {
    refBirthdayError.value = "請選擇生日";
    return;
  }

  const birthDate = dayjs(refTrainee.value.birthday);
  const today = dayjs();
  const age = today.diff(birthDate, "year");

  if (age < 10) {
    refBirthdayError.value = "年齡必須大於或等於10歲";
  } else if (age > 100) {
    refBirthdayError.value = "年齡必須小於或等於100歲";
  } else {
    refBirthdayError.value = "";
  }
};

const validateHeight = () => {
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

const validateWeight = () => {
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

watch(
  () => refTrainee.value.birthday,
  () => {
    validateBirthday();
  }
);

watch(refFormattedPhone, (value) => {
  refTrainee.value.phone = value.replace(/\D/g, "");
});

onMounted(() => {
  refTrainee.value = {
    ...props.trainee,
    birthday: props.trainee.birthday
      ? dayjs(props.trainee.birthday).format("YYYY-MM-DD")
      : "",
  };

  if (refTrainee.value.phone) {
    refFormattedPhone.value = refTrainee.value.phone.replace(
      /(\d{4})(\d{3})(\d{3})/,
      "$1-$2-$3"
    );
  }
});

const calculateBMI = computed(() => {
  if (!refTrainee.value.height || !refTrainee.value.weight) return "未知";
  const heightInMeters = refTrainee.value.height / 100;
  const bmi = refTrainee.value.weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(2);
});

const onSubmit = () => {
  validateBirthday();
  validateHeight();
  validateWeight();
  if (
    refBirthdayError.value ||
    refPhoneError.value ||
    refHeightError.value ||
    refWeightError.value
  ) {
    return;
  }
  const data = {
    ...refTrainee.value,
    birthday: dayjs(refTrainee.value.birthday).format("YYYY-MM-DD"),
    phone: refTrainee.value.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3"),
    height: Number(refTrainee.value.height).toFixed(1),
    weight: Number(refTrainee.value.weight).toFixed(1),
  };
  emit("save", data);
};

const onBack = () => {
  emit("back");
};
</script>
