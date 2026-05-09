<template>
  <view class="page">
    <text class="title">首页</text>
    <button class="btn" @tap="handleCheck">调用健康检查</button>
    <text v-if="result" class="result">{{ result }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { checkHealth } from '../../api/health';

const result = ref('');

async function handleCheck() {
  try {
    const data = await checkHealth();
    result.value = `后端正常: uptime=${data.uptime.toFixed(2)}s`;
  } catch (err) {
    result.value = '后端连接失败';
    console.error(err);
  }
}
</script>

<style scoped>
.page {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-top: 120rpx;
}
.btn {
  margin-top: 48rpx;
  width: 80%;
}
.result {
  margin-top: 32rpx;
  color: #333;
}
</style>
