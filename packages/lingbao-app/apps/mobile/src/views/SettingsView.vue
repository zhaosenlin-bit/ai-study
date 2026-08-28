<template>
  <div class="settings">
    <header class="page-header">
      <button class="back" @click="router.back()">‹</button>
      <h2>设置</h2>
      <div class="spacer"></div>
    </header>
    <div class="setting-list">
      <div class="setting-item glass">
        <span>API 模式</span>
        <span class="muted">{{ USE_MOCK ? "Mock 演示" : "真实后端" }}</span>
      </div>
      <div class="setting-item glass" @click="onExport">
        <span>导出学习记录</span>
        <span class="arrow">›</span>
      </div>
      <div class="setting-item glass danger" @click="onClear">
        <span>清空所有数据</span>
        <span class="arrow">›</span>
      </div>
      <div class="setting-item glass">
        <span>关于</span>
        <span class="muted">灵宝 v0.1.0</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { db } from "@/lib/db";

const router = useRouter();
const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string) !== "false";

async function onExport() {
  const keys = await db.listKeys();
  const data: Record<string, unknown> = {};
  for (const k of keys) data[k] = await db.get(k);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lingbao-backup-" + new Date().toISOString().slice(0,10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

async function onClear() {
  if (!confirm("确定清空所有本地数据吗?此操作不可恢复!")) return;
  if (!confirm("再次确认:清空所有孩子的学习记录?")) return;
  const keys = await db.listKeys();
  for (const k of keys) await db.remove(k);
  alert("已清空");
  router.replace("/child");
}
</script>

<style scoped>
.settings { position: relative; z-index: 1; padding: 24px 20px; height: 100%; overflow-y: auto; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header h2 { font-size: 18px; font-weight: 700; }
.back { font-size: 28px; color: var(--c-text-soft); padding: 4px 12px; }
.spacer { width: 36px; }
.setting-list { display: flex; flex-direction: column; gap: 10px; }
.setting-item { padding: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.setting-item.danger { color: var(--c-err); }
.arrow { color: var(--c-text-mute); font-size: 20px; }
.muted { color: var(--c-text-soft); font-size: 14px; }
</style>