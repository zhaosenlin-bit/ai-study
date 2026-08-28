<template>
  <div class="parent">
    <header class="page-header">
      <button class="back" @click="router.back()">‹</button>
      <h2>家长面板</h2>
      <div class="spacer"></div>
    </header>
    <div class="stat-grid">
      <div class="stat-card glass">
        <div class="stat-label">今日任务</div>
        <div class="stat-value">{{ completedCount }} / {{ totalCount }}</div>
      </div>
      <div class="stat-card glass">
        <div class="stat-label">已掌握主题</div>
        <div class="stat-value">{{ masteredTopics }}</div>
      </div>
      <div class="stat-card glass">
        <div class="stat-label">学习中孩子</div>
        <div class="stat-value">{{ children.children.length }}</div>
      </div>
      <div class="stat-card glass">
        <div class="stat-label">诊断报告</div>
        <div class="stat-value">{{ latestLevel || "—" }}</div>
      </div>
    </div>
    <h3 class="section-title">孩子档案</h3>
    <div class="child-list">
      <div v-for="c in children.children" :key="c.id" class="child-row glass">
        <div class="avatar">{{ c.name.slice(0,1) }}</div>
        <div class="child-info">
          <div class="name">{{ c.name }}</div>
          <div class="meta">{{ c.grade }} 年级 · 创建于 {{ formatDate(c.createdAt) }}</div>
        </div>
        <button v-if="c.id !== children.currentId" class="btn-ghost small" @click="onSelect(c.id)">查看</button>
        <span v-else class="cur-badge">当前</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useChildStore } from "@/stores/child";
import { db } from "@/lib/db";

const router = useRouter();
const children = useChildStore();
const completedCount = ref(0);
const totalCount = ref(0);
const masteredTopics = ref(0);
const latestLevel = ref<string>("");

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

onMounted(async () => {
  if (!children.current) { router.replace("/child"); return; }
  const c = children.current;
  const plan = await db.get<any>("plan_" + c.id + "_today");
  if (plan) {
    totalCount.value = plan.tasks.length;
    completedCount.value = plan.tasks.filter((t: any) => t.done).length;
  }
  const report = await db.get<any>("diagnosis_" + c.id + "_latest");
  if (report) latestLevel.value = report.overall.level;
  // 累计掌握:从所有 plan 任务的 done 状态粗略估算
  const allKeys = (await db.listKeys()).filter((k: string) => k.startsWith("plan_"));
  let total = 0;
  for (const k of allKeys) {
    const p = await db.get<any>(k);
    if (p) total += p.tasks.filter((t: any) => t.done).length;
  }
  masteredTopics.value = total;
});

async function onSelect(id: string) {
  await children.select(id);
  router.replace("/home");
}
</script>

<style scoped>
.parent { position: relative; z-index: 1; padding: 24px 20px 100px; height: 100%; overflow-y: auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header h2 { font-size: 18px; font-weight: 700; }
.back { font-size: 28px; color: var(--c-text-soft); padding: 4px 12px; }
.spacer { width: 36px; }
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.stat-card { padding: 16px; }
.stat-label { font-size: 12px; color: var(--c-text-soft); }
.stat-value { font-size: 24px; font-weight: 800; margin-top: 6px; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.child-list { display: flex; flex-direction: column; gap: 10px; }
.child-row { display: flex; align-items: center; gap: 14px; padding: 14px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2)); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; }
.child-info { flex: 1; }
.name { font-size: 15px; font-weight: 600; }
.meta { font-size: 12px; color: var(--c-text-soft); margin-top: 2px; }
.btn-ghost.small { padding: 6px 14px; font-size: 12px; }
.cur-badge { padding: 4px 10px; border-radius: 999px; background: rgba(65, 224, 196, 0.25); color: var(--c-ok); font-size: 11px; }
</style>