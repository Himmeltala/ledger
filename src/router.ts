import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  routes: [
    {
      path: "/",
      name: "Index",
      component: () => import("@/views/Index.vue")
    },
    {
      path: "/comments",
      name: "Comments",
      component: () => import("@/views/Comments.vue")
    },
    {
      path: "/charts",
      name: "Charts",
      component: () => import("@/views/Charts.vue")
    }
  ],
  history: createWebHashHistory()
});

export default router;
