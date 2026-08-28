<template>
  <div class="diagnosis">
    <div class="pet-mini glass">
      <PetSprite :emotion-id="petEmotionId" :size="100" theme-color="#7e8cff" />
      <span class="pet-msg">{{ petMsg }}</span><span v-if="analyzing" class="pet-spinner" aria-label="loading"></span>
    </div>
    <div class="progress-bar glass">
      <div class="bar-fill" :style="{ width: progress + '%' }"></div>
      <span class="bar-text">{{ idx + 1 }} / {{ items.length }}</span>
    </div>
    <div class="question-card glass" v-if="current">
      <h3 class="subject-tag">{{ subjectLabel }}</h3>
      <p class="q-text">{{ current.question }}</p>
      <div class="options">
        <button v-for="(opt, i) in current.options" :key="i" class="opt-btn glass" :class="{ active: chosen === i }" @click="chosen = i">
          <span class="opt-letter">{{ String.fromCharCode(65 + i) }}</span>
          <span>{{ opt }}</span>
        </button>
      </div>
      <button class="btn-primary submit-btn" :disabled="chosen === null" @click="onSubmit">
        {{ idx === items.length - 1 ? '完成诊断' : '下一题' }}
      </button>
    </div>
    <div v-else class="loading glass">加载诊断题中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import PetSprite from "@/components/PetSprite.vue";
import { api } from "@/lib/api";
import { useChildStore } from "@/stores/child";
import { useAppStore } from "@/stores/app";
import { db } from "@/lib/db";
import { Emotion } from "@/lib/emotion";

const router = useRouter();
const childStore = useChildStore();
const app = useAppStore();

const items = ref<any[]>([]);
const idx = ref(0);
const chosen = ref<number | null>(null);
const answers = ref<any[]>([]);
const diagId = ref("");
const petEmotionId = ref(Emotion.IDLE);
const petMsg = ref("准备好了吗?跟着灵宝来挑战吧~");
const analyzing = ref(false);
const analyzeStep = ref("");

const current = computed(() => items.value[idx.value]);
const progress = computed(() => items.value.length ? ((idx.value + 1) / items.value.length) * 100 : 0);
const subjectLabel = computed(() => {
  const s = current.value?.subject;
  return s === "math" ? "数学" : s === "chinese" ? "语文" : "英语";
});

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

onMounted(async () => {
  const c = childStore.current;
  if (!c) { router.replace("/child"); return; }
  petEmotionId.value = Emotion.CHEERING;
  petMsg.value = "开始啦!相信自己!";
  const res = await api.startDiagnosis(c.id, c.grade);
  items.value = res.items;
  diagId.value = res.id;
  await sleep(800);
  petEmotionId.value = Emotion.IDLE;
  petMsg.value = "不着急,慢慢想~";
});

async function onSubmit() {
  if (chosen.value === null || !current.value) return;
  answers.value.push({ itemId: current.value.id, chosenIndex: chosen.value });
  const correct = chosen.value === current.value.correctIndex;
  petEmotionId.value = correct ? Emotion.HAPPY : Emotion.ENCOURAGING;
  petMsg.value = correct ? "答对啦!继续加油~" : "不要紧,我们下一题~";
  await sleep(700);
  if (idx.value < items.value.length - 1) {
    idx.value++;
    chosen.value = null;
    petEmotionId.value = Emotion.IDLE;
    petMsg.value = "下一题来咯~";
  } else {
    await submit();
  }
}

async function submit() {
  const cid = childStore.current!.id;
  const grade = childStore.current!.grade;
  analyzing.value = true;
  petEmotionId.value = Emotion.THINKING;
  try {
    analyzeStep.value = "正在批改你的答案...";
    petMsg.value = "灵宝正在批改你的答案..."; await sleep(400);
    analyzeStep.value = "正在分析各科强弱项...";
    petMsg.value = "灵宝正在分析你的表现..."; await sleep(400);
    const report = await api.submitDiagnosis(diagId.value, grade, answers.value);
    await db.set("diagnosis_" + cid + "_latest", JSON.parse(JSON.stringify(report)));
    analyzeStep.value = "正在为你定制专属计划...";
    petMsg.value = "正在为你定制专属计划..."; await sleep(300);
    const plan = await api.generatePlan(cid, grade, report);
    await db.set("plan_" + cid + "_today", JSON.parse(JSON.stringify(plan)));
    petEmotionId.value = Emotion.CELEBRATING;
    petMsg.value = "太棒啦!你的学习计划新鲜出炉~";
    await sleep(1200);
    router.replace("/home");
  } catch (e: any) {
    analyzing.value = false;
    petEmotionId.value = Emotion.ENCOURAGING;
    petMsg.value = "网络小卡顿,稍后再试~";
    console.error("[diagnosis]", e);
  }
}
</script>

<style scoped>
.diagnosis { position: relative; z-index: 1; padding: 24px; height: 100%; overflow-y: auto; display: flex; flex-direction: column; }
.pet-mini { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 16px; }
.pet-msg { font-size: 14px; flex: 1; }
.pet-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(126,140,255,0.25);
  border-top-color: var(--c-accent);
  animation: spin 0.8s linear infinite;
  margin-left: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.progress-bar { position: relative; height: 8px; margin-bottom: 24px; overflow: hidden; border-radius: 4px; padding: 0; }
.bar-fill { height: 100%; background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2)); transition: width 0.4s ease; }
.bar-text { position: absolute; right: 12px; top: -22px; font-size: 12px; color: var(--c-text-soft); }
.question-card { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 20px; }
.subject-tag { display: inline-block; font-size: 12px; font-weight: 600; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2)); padding: 4px 12px; border-radius: 999px; width: max-content; color: white; }
.q-text { font-size: 18px; line-height: 1.6; font-weight: 600; }
.options { display: flex; flex-direction: column; gap: 12px; }
.opt-btn { padding: 16px; text-align: left; display: flex; align-items: center; gap: 12px; font-size: 15px; transition: all 0.2s; }
.opt-btn.active { background: rgba(126, 140, 255, 0.25); border-color: var(--c-accent); }
.opt-letter { width: 28px; height: 28px; border-radius: 50%; background: rgba(126, 140, 255, 0.3); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.submit-btn { margin-top: auto; }
.loading { padding: 32px; text-align: center; }
</style>