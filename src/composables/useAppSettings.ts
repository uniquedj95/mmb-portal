import { ref } from "vue";

type FontSize = "" | "default" | "small" | "large";

const size = ref<FontSize>("small");
const popupZIndex = ref(2000);

export default function useAppSettings () {
  return {
    size,
    popupZIndex,
  }
}