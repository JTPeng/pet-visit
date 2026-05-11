<template>
  <view class="avatar-uploader" @tap="handleChoose">
    <image class="avatar-img" :src="modelValue || defaultAvatar" mode="aspectFill" />
    <view class="avatar-overlay">
      <text class="overlay-text">{{ uploading ? '上传中...' : '更换' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { chooseImage, uploadFile } from '../utils/upload';

const defaultAvatar = '/static/default-avatar.png';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', url: string): void;
}>();

const uploading = ref(false);

async function handleChoose() {
  if (uploading.value) return;
  try {
    const paths = await chooseImage(1);
    uploading.value = true;
    const result = await uploadFile(paths[0]);
    emit('update:modelValue', result.url);
  } catch {
    // chooseImage cancelled or upload failed - already toasted in util
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.avatar-uploader {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
}
.avatar-img {
  width: 100%;
  height: 100%;
  background: #eee;
}
.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48rpx;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.overlay-text {
  font-size: 22rpx;
  color: #fff;
}
</style>
