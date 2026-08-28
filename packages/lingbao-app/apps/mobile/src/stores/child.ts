import { defineStore } from "pinia";
import { toRaw } from "vue";
import { ref, computed } from "vue";
import { db } from "@/lib/db";

export interface Child {
  id: string;
  name: string;
  grade: number;
  avatar?: string;
  createdAt: number;
}

export const useChildStore = defineStore("child", () => {
  const children = ref<Child[]>([]);
  const currentId = ref<string | null>(null);

  const current = computed(() =>
    children.value.find((c) => c.id === currentId.value) ?? null
  );

  async function load() {
    children.value = ((await db.get("children")) as Child[]) ?? [];
    currentId.value = ((await db.get("currentChildId")) as string | null) ?? null;
  }

  // 把 reactive proxy 转成 plain object(IDB 才能 structuredClone)
  function plain<T>(v: T): T {
    return JSON.parse(JSON.stringify(toRaw(v)));
  }

  async function create(name: string, grade: number): Promise<Child> {
    const child: Child = {
      id: "child_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      name, grade, createdAt: Date.now(),
    };
    children.value.push(child);
    await db.set("children", plain(children.value));
    return child;
  }

  async function select(id: string) {
    currentId.value = id;
    await db.set("currentChildId", id);
  }

  async function remove(id: string) {
    children.value = children.value.filter((c) => c.id !== id);
    await db.set("children", plain(children.value));
    if (currentId.value === id) {
      currentId.value = null;
      await db.set("currentChildId", null);
    }
  }

  return { children, current, currentId, load, create, select, remove };
});