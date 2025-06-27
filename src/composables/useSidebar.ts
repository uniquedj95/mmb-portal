import { ref } from 'vue';
import { getCookie, setCookie } from '../utils/cookie';

const SIBEDAR_STATUS_KEY = '__sidebar_status__';
const collapsed = ref(false);

function init () {
  const status = getCookie(SIBEDAR_STATUS_KEY);
  if (status !== null) {
    collapsed.value = !!+status
  }
}

function toggleSidebar() {
  collapsed.value = !collapsed.value;
  setCookie(SIBEDAR_STATUS_KEY, collapsed.value ? '1' : '0');
}

function closeSidebar() {
  collapsed.value = false;
  setCookie(SIBEDAR_STATUS_KEY, '0');
}

export function useSidebar() {
  init();

  return {
    collapsed,
    toggleSidebar,
    closeSidebar,
  };
}
