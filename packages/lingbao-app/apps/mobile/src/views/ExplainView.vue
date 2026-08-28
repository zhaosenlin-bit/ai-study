<template>
  <div class="explain">
    <header class="page-header">
      <button class="back" @click="router.back()">‹</button>
      <h2>{{ topic }}</h2>
      <div class="spacer"></div>
    </header>
    <div class="pet-mini glass">
      <PetSprite :emotion-id="app.petEmotion" :size="80" theme-color="#7e8cff" />
      <div class="pet-text">{{ speaking ? petMsg : (loaded ? "看完了点击开始练习" : "灵宝正在备课...") }}</div>
    </div>
    <div class="content-card glass" v-if="loaded">
      <p class="script">{{ script }}</p>
      <h3 class="kp-title">重点</h3>
      <ul class="kp-list">
        <li v-for="(kp, i) in keyPoints" :key="i">{{ kp }}</li>
      </ul>
    </div>
    <div v-else class="content-card glass loading">
      <p>灵宝正在为你准备讲解...</p>
    </div>
    <button class="btn-primary start-btn" v-if="loaded" @click="onStartPractice">开始练习 →</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import PetSprite from "@/components/PetSprite.vue";
import { api } from "@/lib/api";
import { useAppStore } from "@/stores/app";
import { Emotion } from "@/lib/emotion";

const route = useRoute();
const router = useRouter();
const app = useAppStore();

const taskId = computed(() => route.query.task as string);
const topic = ref("");
const script = ref("");
const keyPoints = ref<string[]>([]);
const loaded = ref(false);
const speaking = ref(false);
const petMsg = ref("");

onMounted(async () => {
  app.petEmotion = Emotion.THINKING;
  petMsg.value = "灵宝正在备课...";
  const res = await api.explain(taskId.value || "t1", "乘法复习", 3);
  topic.value = res.topic;
  script.value = res.script;
  keyPoints.value = res.keyPoints;
  loaded.value = true;
  app.petEmotion = Emotion.SPEAKING;
  petMsg.value = "跟着灵宝一起听~";
  speaking.value = true;
  // 模拟灵宝"说话"
  await new Promise((r) => setTimeout(r, 2500));
  speaking.value = false;
  app.petEmotion = Emotion.IDLE;
});

function onStartPractice() {
  router.push("/learn/practice?task=" + taskId.value);
}
</script>

<style scoped>
.explain { position: relative; z-index: 1; padding: 24px 20px; height: 100%; overflow-y: auto; display: flex; flex-direction: column; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-header h2 { font-size: 18px; font-weight: 700; }
.back { font-size: 28px; color: var(--c-text-soft); padding: 4px 12px; }
.spacer { width: 36px; }
.pet-mini { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 16px; }
.pet-text { font-size: 14px; flex: 1; }
.content-card { padding: 24px; margin-bottom: 16px; line-height: 1.8; flex: 1; }
.script { font-size: 16px; white-space: pre-line; }
.kp-title { font-size: 14px; font-weight: 700; margin: 20px 0 12px; color: var(--c-accent); }
.kp-list { padding-left: 20px; color: var(--c-text-soft); font-size: 14px; }
.kp-list li { margin: 6px 0; }
.loading { text-align: center; padding: 60px 24px; color: var(--c-text-soft); }
.start-btn { margin-top: auto; }
</style>