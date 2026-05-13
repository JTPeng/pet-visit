<template>
  <div class="layout">
    <router-view />
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/moderation" icon="todo-list-o">审核</van-tabbar-item>
      <van-tabbar-item to="/reports" icon="warning-o">举报</van-tabbar-item>
      <van-tabbar-item to="/words" icon="shield-o">词库</van-tabbar-item>
      <van-tabbar-item to="/users" icon="friends-o">用户</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const active = ref(0);
</script>

<style scoped>
.layout {
  padding-bottom: 50px;
}
</style>
