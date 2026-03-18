<template>
  <div class="app">
    <router-view />
    <ToastHost />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ToastHost from './ui/ToastHost.vue';

const theme = ref('light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme.value);
  localStorage.setItem('theme', theme.value);
};

onMounted(() => {
  const saved = localStorage.getItem('theme') || 'light';
  theme.value = saved;
  document.documentElement.setAttribute('data-theme', saved);
});

defineExpose({ toggleTheme, theme });
</script>

<style>
.app {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
