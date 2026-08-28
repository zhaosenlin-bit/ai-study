<template>
  <div class="practice">
    <header class="page-header">
      <button class="back" @click="router.back()">‹</button>
      <h2>练习: {{ topic }}</h2>
      <div class="spacer"></div>
    </header>
    <div class="pet-mini glass">
      <PetSprite :emotion-id="petEmotionId" :size="80" theme-color="#7e8cff" />
      <div class="pet-text">{{ petMsg }}</div>
    </div>
    <div class="progress-bar glass">
      <div class="bar-fill" :style="{ width: progress + '%' }"></div>
      <span class="bar-text">{{ idx + 1 }} / {{ questions.length }}</span>
    </div>
    <div class="question-card glass" v-if="current">
      <p class="q-text">{{ current.question }}</p>
      <div class="options">
        <button v-for="(opt, i) in current.options" :key="i" class="opt-btn glass" :class="optClass(i)" :disabled="answered" @click="onChoose(i)">
          <span class="opt-letter">{{ String.fromCharCode(65 + i) }}</span>
          <span>{{ opt }}</span>
          <span v-if="answered && i === current.correctIndex" class="check">✓</span>
          <span v-if="answered && chosen === i && i !== current.correctIndex" class="cross">✗</span>
        </button>
      </div>
      <button class="btn-primary submit-btn" v-if="answered && idx < questions.length - 1" @click="onNext">下一题</button>
      <button class="btn-primary submit-btn" v-else-if="answered && idx === questions.length - 1" @click="onFinish">完成</button>
    </div>
    <div v-else class="loading glass">题目加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import PetSprite from "@/components/PetSprite.vue";
import { api } from "@/lib/api";
import { useChildStore } from "@/stores/child";
import { useAppStore } from "@/stores/app";
import { db } from "@/lib/db";
import { Emotion } from "@/lib/emotion";

const route = useRoute();
const router = useRouter();
const childStore = useChildStore();
const app = useAppStore();

const taskId = computed(() => route.query.task as string);
const topic = ref("练习");
const questions = ref<any[]>([]);
const idx = ref(0);
const chosen = ref<number | null>(null);
const answered = ref(false);
const correctCount = ref(0);
const petEmotionId = ref(Emotion.IDLE);
const petMsg = ref("加油!灵宝看着你呢~");

const current = computed(() => questions.value[idx.value]);
const progress = computed(() => questions.value.length ? ((idx.value + 1) / questions.value.length) * 100 : 0);

function optClass(i: number) {
  if (!answered.value) return { active: chosen.value === i };
  if (i === current.value.correctIndex) return "correct";
  if (chosen.value === i) return "wrong";
  return "";
}

onMounted(async () => {
  const c = childStore.current;
  if (!c) { router.replace("/child"); return; }
  const res = await api.practice(taskId.value || "t1", "乘法复习", c.grade);
  questions.value = res.questions;
  topic.value = "乘法复习";
});

async function onChoose(i: number) {
  if (answered.value) return;
  chosen.value = i;
  answered.value = true;
  const res = await api.answer(taskId.value || "t1", current.value.id, i);
  if (res.correct) {
    correctCount.value++;
    petEmotionId.value = Emotion.CELEBRATING;
    petMsg.value = "太棒啦!" + res.feedback;
  } else {
    petEmotionId.value = Emotion.ENCOURAGING;
    petMsg.value = res.feedback;
  }
}

function onNext() {
  idx.value++;
  chosen.value = null;
  answered.value = false;
  petEmotionId.value = Emotion.IDLE;
  petMsg.value = "下一题,继续加油!";
}

async function onFinish() {
  // 标记任务完成
  const c = childStore.current;
  if (c) {
    const key = "plan_" + c.id + "_today";
    const plan = await db.get<any>(key);
    if (plan) {
      for (const t of plan.tasks) {
        if (t.id === taskId.value) t.done = true;
      }
      await db.set(key, JSON.parse(JSON.stringify(plan)));
    }
  }
  petEmotionId.value = Emotion.CELEBRATING;
  petMsg.value = "今天你答对了 " + correctCount.value + " / " + questions.value.length + " 题!";
  await new Promise((r) => setTimeout(r, 2000));
  router.replace("/home");
}
</script>

<style scoped>
.practice { position: relative; z-index: 1; padding: 24px 20px; height: 100%; overflow-y: auto; display: flex; flex-direction: column; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-header h2 { font-size: 16px; font-weight: 700; }
.back { font-size: 28px; color: var(--c-text-soft); padding: 4px 12px; }
.spacer { width: 36px; }
.pet-mini { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 16px; }
.pet-text { font-size: 14px; flex: 1; }
.progress-bar { position: relative; height: 8px; margin-bottom: 24px; padding: 0; }
.bar-fill { height: 100%; background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2)); transition: width 0.4s ease; }
.bar-text { position: absolute; right: 12px; top: -22px; font-size: 12px; color: var(--c-text-soft); }
.question-card { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 20px; }
.q-text { font-size: 18px; line-height: 1.6; font-weight: 600; }
.options { display: flex; flex-direction: column; gap: 12px; }
.opt-btn { padding: 16px; text-align: left; display: flex; align-items: center; gap: 12px; font-size: 15px; transition: all 0.2s; }
.opt-btn.active { background: rgba(126, 140, 255, 0.25); border-color: var(--c-accent); }
.opt-btn.correct { background: rgba(65, 224, 196, 0.25); border-color: var(--c-ok); }
.opt-btn.wrong { background: rgba(255, 84, 112, 0.25); border-color: var(--c-err); }
.opt-letter { width: 28px; height: 28px; border-radius: 50%; background: rgba(126, 140, 255, 0.3); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.check { margin-left: auto; color: var(--c-ok); font-size: 20px; font-weight: 700; }
.cross { margin-left: auto; color: var(--c-err); font-size: 20px; font-weight: 700; }
.submit-btn { margin-top: auto; }
.loading { padding: 32px; text-align: center; }
</style>