<template>
  <div class="splash">
    <div class="pet-wrap">
      <PetSprite :emotion-id="emotion" :size="320" theme-color="#7e8cff" />
    </div>
    <div class="speech-bubble glass" v-if="message">
      <span>{{ message }}</span>
    </div>
    <div class="title-wrap">
      <h1 class="title">灵宝 AI 伴学</h1>
      <p class="subtitle">你的智能学习小伙伴</p>
    </div>
    <button class="btn-primary start-btn" @click="onStart">开始学习</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import PetSprite from "@/components/PetSprite.vue";
import { useAppStore } from "@/stores/app";
import { useChildStore } from "@/stores/child";
import { Emotion } from "@/lib/emotion";

const router = useRouter();
const app = useAppStore();
const children = useChildStore();

const emotion = ref(Emotion.IDLE);
const message = ref("");

onMounted(async () => {
  await children.load();
  // 灵宝主动打招呼
  emotion.value = Emotion.WAKE_UP;
  message.value = "嗨~我是灵宝!";
  await sleep(800);
  emotion.value = Emotion.HAPPY;
  message.value = "今天我们一起学习吧!";
  await sleep(1200);
  emotion.value = Emotion.IDLE;
  message.value = "准备好了吗?";
});

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function onStart() {
  if (children.children.length === 0) {
    router.push("/child");
  } else if (!children.current) {
    router.push("/child");
  } else {
    router.push("/home");
  }
}
</script>

<style scoped>
.splash {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.pet-wrap {
  margin-bottom: 24px;
  filter: drop-shadow(0 8px 24px rgba(126, 140, 255, 0.4));
}
.speech-bubble {
  padding: 14px 22px;
  margin-bottom: 24px;
  font-size: 16px;
  color: var(--c-text);
  position: relative;
}
.speech-bubble::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid var(--c-glass-strong);
}
.title-wrap { text-align: center; margin-bottom: 48px; }
.title {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--c-accent) 0%, var(--c-accent-2) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle { color: var(--c-text-soft); font-size: 14px; margin-top: 8px; }
.start-btn { font-size: 18px; min-width: 200px; }
</style>
