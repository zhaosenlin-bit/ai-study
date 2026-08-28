<template>
  <div class="app-shell">
    <ParticleBg />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import ParticleBg from "@/components/ParticleBg.vue";
</script>

<style scoped>
.app-shell {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(ellipse at top, #1a1b3a 0%, #0b0b1e 70%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
