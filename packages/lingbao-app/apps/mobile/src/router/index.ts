import { createRouter, createWebHistory } from "vue-router";
import SplashView from "@/views/SplashView.vue";
import ChildSelectView from "@/views/ChildSelectView.vue";
import DiagnosisView from "@/views/DiagnosisView.vue";
import HomeView from "@/views/HomeView.vue";
import ExplainView from "@/views/ExplainView.vue";
import PracticeView from "@/views/PracticeView.vue";
import ParentView from "@/views/ParentView.vue";
import SettingsView from "@/views/SettingsView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "splash", component: SplashView },
    { path: "/child", name: "child-select", component: ChildSelectView },
    { path: "/diagnosis", name: "diagnosis", component: DiagnosisView },
    { path: "/home", name: "home", component: HomeView },
    { path: "/learn/explain", name: "explain", component: ExplainView },
    { path: "/learn/practice", name: "practice", component: PracticeView },
    { path: "/parent", name: "parent", component: ParentView },
    { path: "/settings", name: "settings", component: SettingsView },
  ],
});
