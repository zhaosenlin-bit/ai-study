<template>
  <div class="pet-sprite" :style="{ width: size + 'px', height: (size * 1.15) + 'px' }">
    <transition name="pet-fade" mode="out-in">
      <img :key="bodySrc" :src="bodySrc" class="pet-body" :alt="'灵宝'" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  emotionId?: number;
  size?: number;
}>();

const size = computed(() => props.size ?? 280);

// 根据 emotionId 选择对应贴图
// 0-9 生命周期(含 idle/sleep/wake) -> idle (主图)
// 10-29 情绪 -> 主图(idle 默认)
// 30-39 思考/检索 -> thinking
// 38 庆祝 -> celebrating
// 8 sleep -> sleeping
const bodySrc = computed(() => {
  const id = props.emotionId ?? 5;
  if (id === 0 || id === 8) return "/lingbao_sleeping.png";
  if (id === 38 || id === 19) return "/lingbao_celebrating.png";
  if (id >= 30 && id <= 37) return "/lingbao_thinking.png";
  return "/lingbao_idle.png";
});
</script>

<style scoped>
.pet-sprite {
  position: relative;
  display: inline-block;
  filter: drop-shadow(0 8px 32px rgba(126, 140, 255, 0.45));
}
.pet-body {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.pet-fade-enter-active, .pet-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.pet-fade-enter-from { opacity: 0; transform: scale(0.9); }
.pet-fade-leave-to { opacity: 0; transform: scale(1.1); }
</style>