<template>
  <view v-if="visible" class="popup-mask" @tap="close">
    <view class="popup-content" @tap.stop>
      <text class="popup-title">绑定手机号</text>
      <text class="popup-desc">绑定手机号后才能发帖、评论和互动</text>
      <!-- #ifdef MP-WEIXIN -->
      <button
        class="popup-btn"
        open-type="getPhoneNumber"
        @getphonenumber="onGetPhoneNumber"
      >
        一键绑定手机号
      </button>
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <button class="popup-btn" disabled>
        请在微信小程序中绑定手机号
      </button>
      <!-- #endif -->
      <text class="popup-cancel" @tap="close">暂不绑定</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'success'): void;
}>();

const userStore = useUserStore();

function close() {
  emit('update:visible', false);
}

async function onGetPhoneNumber(e: any) {
  const code = e.detail?.code;
  if (!code) {
    uni.showToast({ title: '获取手机号失败', icon: 'none' });
    return;
  }
  try {
    await userStore.bindPhone(code);
    uni.showToast({ title: '绑定成功', icon: 'success' });
    emit('update:visible', false);
    emit('success');
  } catch {
    uni.showToast({ title: '绑定失败，请重试', icon: 'none' });
  }
}
</script>

<style scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.popup-content {
  width: 80%;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}
.popup-desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 16rpx;
  text-align: center;
}
.popup-btn {
  margin-top: 48rpx;
  width: 100%;
  background: #ff8a47;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  line-height: 88rpx;
  text-align: center;
}
.popup-cancel {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
