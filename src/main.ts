import { createApp, type App as VueApp } from "vue";
import { createPinia, type Pinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";

import router from "./router";

const pinia: Pinia = createPinia();
const app: VueApp = createApp(App);

app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.mount("#app");
