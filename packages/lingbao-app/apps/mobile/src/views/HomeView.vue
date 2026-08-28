<template>
  <div class="home">
    <header class="home-header">
      <div>
        <p class="greeting">你好,{{ childStore.current?.name }}</p>
        <h2>{{ today }}</h2>
      </div>
      <button class="avatar glass" @click="router.push('/parent')">{{ childStore.current?.name?.slice(0,1) }}</button>
    </header>
    <div class="pet-section">
      <PetSprite :emotion-id="app.petEmotion" :size="240" theme-color="#7e8cff" />
      <div class="bubble glass" v-if="plan && plan.petEncouragement">{{ plan.petEncouragement }}</div>
    </div>
    <h3 class="section-title">今日任务</h3>
    <div class="task-list">
      <div v-for="t in plan?.tasks || []" :key="t.id" class="task-card glass" @click="onTaskClick(t)">
        <div class="task-icon" :data-type="t.type">
          <span v-if="t.type === 'explain'">📖</span>
          <span v-else-if="t.type === 'practice'">✏️</span>
          <span v-else>🔁</span>
        </div>
        <div class="task-info">
          <div class="task-title">{{ t.topic }}</div>
          <div class="task-meta">
            {{ subjectLabel(t.subject) }} · {{ t.duration }} 分钟
            <span v-if="t.done" class="done-badge">已完成</span>
          </div>
        </div>
        <div class="task-arrow">›</div>
      </div>
    </div>
    <div class="bottom-nav glass">
      <button class="nav-btn" @click="router.push('/parent')">📊 家长</button>
      <button class="nav-btn" @click="router.push('/settings')">⚙️ 设置</button>
      <button class="nav-btn" @click="onSwitchChild">👶 切换</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import PetSprite from "@/components/PetSprite.vue";
import { useChildStore } from "@/stores/child";
import { useAppStore } from "@/stores/app";
import { db } from "@/lib/db";
import { Emotion } from "@/lib/emotion";

const router = useRouter();
const childStore = useChildStore();
const app = useAppStore();

const plan = ref<any>(null);
const today = computed(() => {
  const d = new Date();
  const w = "日一二三四五六";
  return (d.getMonth() + 1) + "月" + d.getDate() + "日 · 周" + w[d.getDay()];
});

function subjectLabel(s: string) {
  return s === "math" ? "数学" : s === "chinese" ? "语文" : "英语";
}

onMounted(async () => {
  if (!childStore.current) { router.replace("/child"); return; }
  plan.value = await db.get("plan_" + childStore.current.id + "_today");
  app.greet("今天也要加油哦~", Emotion.HAPPY);
});

function onTaskClick(t: any) {
  if (t.type === "explain") router.push("/learn/explain?task=" + t.id);
  else router.push("/learn/practice?task=" + t.id);
}

async function onSwitchChild() {
  childStore.currentId = null;
  await db.set("currentChildId", null);
  router.replace("/child");
}
</script>

<style scoped>
.home { position: relative; z-index: 1; padding: 24px 20px 100px; height: 100%; overflow-y: auto; }
.home-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.greeting { color: var(--c-text-soft); font-size: 13px; }
.home-header h2 { font-size: 20px; font-weight: 700; margin-top: 2px; }
.avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2)); border: none; color: white; }
.pet-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 24px; }
.bubble { margin-top: 12px; padding: 12px 18px; font-size: 14px; max-width: 280px; text-align: center; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.task-list { display: flex; flex-direction: column; gap: 12px; }
.task-card { display: flex; align-items: center; gap: 14px; padding: 16px; cursor: pointer; transition: transform 0.15s; }
.task-card:active { transform: scale(0.98); }
.task-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(126, 140, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 22px; }
.task-info { flex: 1; }
.task-title { font-size: 15px; font-weight: 600; }
.task-meta { font-size: 12px; color: var(--c-text-soft); margin-top: 4px; }
.done-badge { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: rgba(65, 224, 196, 0.25); color: var(--c-ok); font-size: 11px; }
.task-arrow { color: var(--c-text-mute); font-size: 24px; }
.bottom-nav { position: fixed; bottom: 16px; left: 16px; right: 16px; display: flex; justify-content: space-around; padding: 8px; z-index: 10; }
.nav-btn { padding: 10px 16px; font-size: 13px; color: var(--c-text-soft); }
.nav-btn:active { color: var(--c-accent); }
</style>