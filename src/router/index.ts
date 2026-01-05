import { createRouter, createWebHistory, type Router } from "vue-router";

const router: Router = createRouter({
  history: createWebHistory(),
  routes: [
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
      meta: { requiresState: ["id"] },
    },
    {
      path: "/coach",
      name: "CoachInfo",
      component: () => import("../views/CoachInfo.vue"),
      meta: { requiresState: ["id"] },
    },
    {
      path: "/plan",
      name: "TrainingPlan",
      component: () => import("../views/TrainingPlan.vue"),
      meta: { requiresState: ["id"] },
    },
    {
      path: "/opening-course",
      name: "OpeningCourse",
      component: () => import("../views/OpeningCourse.vue"),
      meta: { requiresState: ["id"] },
    },
    {
      path: "/line-callback",
      name: "LineCallback",
      component: () => import("../views/LineCallback.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const requiredState = to.meta.requiresState as string[] | undefined;

  if (requiredState && requiredState.length > 0) {
    const routeState = (to as any).state || history.state;
    const missingKeys = requiredState.filter((key) => !routeState?.[key]);

    if (missingKeys.length > 0) {
      return "/";
    }
  }
});

export default router;
