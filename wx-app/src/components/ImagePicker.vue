<template>
  <view class="image-picker">
    <view
      v-for="(url, index) in modelValue"
      :key="url"
      class="image-item"
    >
      <image class="image" :src="url" mode="aspectFill" @tap="preview(index)" />
      <view class="delete" @tap.stop="remove(index)">
        <text class="delete-icon">×</text>
      </view>
    </view>
    <view
      v-if="modelValue.length < max"
      class="add-btn"
      :class="{ disabled: uploading }"
      @tap="handleChoose"
    >
      <text class="add-icon">+</text>
      <text class="add-hint">{{ uploading ? '上传中' : `${modelValue.length}/${max}` }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { chooseImage, uploadFile } from '../utils/upload';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    max?: number;
  }>(),
  { max: 9 },
);

const emit = defineEmits<{
  (e: 'update:modelValue', urls: string[]): void;
}>();

const uploading = ref(false);

async function handleChoose() {
  if (uploading.value) return;
  const remain = props.max - props.modelValue.length;
  if (remain <= 0) return;

  try {
    const paths = await chooseImage(remain);
    uploading.value = true;
    const urls = [...props.modelValue];
    for (const path of paths) {
      const result = await uploadFile(path);
      urls.push(result.url);
      emit('update:modelValue', [...urls]);
    }
  } catch {
    // cancelled or failed
  } finally {
    uploading.value = false;
  }
}

function remove(index: number) {
  const urls = [...props.modelValue];
  urls.splice(index, 1);
  emit('update:modelValue', urls);
}

function preview(index: number) {
  uni.previewImage({
    urls: props.modelValue,
    current: props.modelValue[index],
  });
}
</script>

<style scoped>
.image-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
}
.image {
  width: 100%;
  height: 100%;
  background: #eee;
}
.delete {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-icon {
  color: #fff;
  font-size: 28rpx;
  line-height: 1;
}
.add-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
.add-btn.disabled {
  opacity: 0.6;
}
.add-icon {
  font-size: 60rpx;
  color: #ccc;
  line-height: 1;
}
.add-hint {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
