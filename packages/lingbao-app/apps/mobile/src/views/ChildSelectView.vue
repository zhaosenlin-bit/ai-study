<template>
  <div class="child-select">
    <header class="page-header">
      <h2>选择 / 创建孩子</h2>
      <p class="hint">本地存储 · 支持多个孩子切换</p>
    </header>

    <div class="children-list" v-if="children.children.length">
      <div v-for="c in children.children" :key="c.id" class="child-card glass" @click="onSelect(c.id)">
        <div class="avatar">{{ c.name.slice(0, 1) }}</div>
        <div class="info">
          <div class="name">{{ c.name }}</div>
          <div class="grade">{{ c.grade }} 年级</div>
        </div>
        <button class="btn-del" @click.stop="onDelete(c.id)">×</button>
      </div>
    </div>
    <div v-else class="empty glass">
      <p>还没有孩子档案,创建一个吧!</p>
    </div>

    <div class="create-form glass" v-if="showCreate">
      <input v-model="newName" placeholder="孩子昵称(如 小明)" class="input" />
      <select v-model="newGrade" class="input">
        <option v-for="g in [3,4,5,6,7,8,9]" :key="g" :value="g">{{ g }} 年级</option>
      </select>
      <div class="form-actions">
        <button class="btn-ghost" @click="showCreate = false">取消</button>
        <button class="btn-primary" :disabled="!newName.trim()" @click="onCreate">创建</button>
      </div>
    </div>

    <button v-else class="btn-primary add-btn" @click="showCreate = true">+ 添加孩子</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useChildStore } from "@/stores/child";

const router = useRouter();
const children = useChildStore();
const showCreate = ref(false);
const newName = ref("");
const newGrade = ref(3);

async function onSelect(id: string) {
  await children.select(id);
  router.push("/home");
}

async function onCreate() {
  if (!newName.value.trim()) return;
  const c = await children.create(newName.value.trim(), newGrade.value);
  await children.select(c.id);
  router.push("/diagnosis");
}

async function onDelete(id: string) {
  if (confirm("确定删除这个孩子档案吗?所有学习数据会丢失!")) {
    await children.remove(id);
  }
}
</script>

<style scoped>
.child-select {
  position: relative;
  z-index: 1;
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.page-header h2 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.page-header .hint { color: var(--c-text-soft); font-size: 13px; margin-bottom: 24px; }
.children-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.child-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
}
.avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-accent), var(--c-accent-2));
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700;
}
.info { flex: 1; }
.name { font-size: 16px; font-weight: 600; }
.grade { font-size: 13px; color: var(--c-text-soft); margin-top: 2px; }
.btn-del {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255, 84, 112, 0.2);
  color: var(--c-err);
  font-size: 18px;
}
.empty {
  padding: 32px;
  text-align: center;
  color: var(--c-text-soft);
  margin-bottom: 16px;
}
.create-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.input {
  padding: 12px 16px;
  border-radius: var(--r-md);
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--c-glass-border);
  color: var(--c-text);
  font-size: 15px;
}
.form-actions { display: flex; gap: 12px; justify-content: flex-end; }
.add-btn { align-self: center; margin-top: auto; }
</style>
