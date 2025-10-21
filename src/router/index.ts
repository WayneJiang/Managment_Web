import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/bind",
    name: "CoachBind",
    component: () => import("../views/CoachBind.vue"),
  },
  {
    path: "/trainee/info",
    name: "TraineeInfo",
    component: () => import("../views/TraineeInfo.vue"),
  },
  {
    path: "/coach",
    name: "CoachInfo",
    component: () => import("../views/CoachInfo.vue"),
  },
  {
    path: "/plan",
    name: "TrainingPlan",
    component: () => import("../views/TrainingPlan.vue"),
  },
  {
    path: "/opening-course",
    name: "OpeningCourse",
    component: () => import("../views/OpeningCourse.vue"),
  },
  {
    path: "/line-callback",
    name: "LineCallback",
    component: () => import("../views/LineCallback.vue"),
  },
];

export default routes;
