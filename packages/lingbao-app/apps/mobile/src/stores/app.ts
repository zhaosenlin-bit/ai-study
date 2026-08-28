import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const petEmotion = ref<number>(5);
  const petMessage = ref<string>("");
  const loading = ref(false);

  function greet(msg: string, emotion: number) {
    petMessage.value = msg;
    petEmotion.value = emotion;
  }

  return { petEmotion, petMessage, loading, greet };
});