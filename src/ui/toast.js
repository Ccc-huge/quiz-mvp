import { reactive } from 'vue';

export const toastState = reactive({
  visible: false,
  message: '',
  type: 'info' // info | success | warning | error
});

let timer = null;

export function showToast(message, type = 'info', durationMs = 2200) {
  toastState.visible = true;
  toastState.message = message;
  toastState.type = type;

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    toastState.visible = false;
  }, durationMs);
}

