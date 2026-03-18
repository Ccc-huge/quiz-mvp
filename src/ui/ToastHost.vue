<template>
  <div v-if="toastState.visible" class="toast" :class="toastState.type" role="status">
    {{ toastState.message }}
  </div>
</template>

<script setup>
import { toastState } from './toast';
</script>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  max-width: min(720px, calc(100vw - 32px));
  padding: 10px 14px;
  border-radius: 999px;
  color: #111827;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(10px);
  font-size: 14px;
  z-index: 1000;
  user-select: none;
}
.toast.success {
  border-color: rgba(34, 197, 94, 0.35);
}
.toast.warning {
  border-color: rgba(245, 158, 11, 0.4);
}
.toast.error {
  border-color: rgba(239, 68, 68, 0.4);
}
</style>

