import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/trainee/info/:id",
    name: "TraineeInfo",
    component: () => import("../views/TraineeInfo.vue"),
  },
  {
    path: "/coach/:id",
    name: "CoachInfo",
    component: () => import("../views/CoachInfo.vue"),
  },
  {
    path: "/plan/:editor/:id",
    name: "TrainingPlan",
    component: () => import("../views/TrainingPlan.vue"),
  },
];

export default routes;
