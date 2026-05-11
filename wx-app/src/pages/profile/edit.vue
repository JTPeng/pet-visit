<template>
  <view class="page">
    <view class="form">
      <view class="form-item">
        <text class="label">头像</text>
        <AvatarUploader v-model="form.avatar" />
      </view>

      <view class="form-item">
        <text class="label">昵称</text>
        <input
          class="input"
          v-model="form.nickname"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">简介</text>
        <textarea
          class="textarea"
          v-model="form.bio"
          placeholder="介绍一下自己吧"
          maxlength="100"
        />
      </view>
    </view>

    <button class="save-btn" :disabled="saving" @tap="handleSave">
      {{ saving ? '保存中...' : '保存' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useUserStore } from '../../stores/user';
import AvatarUploader from '../../components/AvatarUploader.vue';

const userStore = useUserStore();

const form = reactive({
  nickname: userStore.userInfo?.nickname || '',
  avatar: userStore.userInfo?.avatar || '/static/default-avatar.png',
  bio: userStore.userInfo?.bio || '',
});

const saving = ref(false);

async function handleSave() {
  if (!form.nickname.trim()) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' });
    return;
  }

  saving.value = true;
  try {
    await userStore.updateProfile({
      nickname: form.nickname.trim(),
      avatar: form.avatar,
      bio: form.bio.trim() || undefined,
    });
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch {
    uni.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 32rpx;
}
.form {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}
.form-item {
  margin-bottom: 32rpx;
}
.form-item:last-child {
  margin-bottom: 0;
}
.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}
.avatar-wrap {
  display: flex;
  align-items: center;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #eee;
}
.avatar-hint {
  margin-left: 24rpx;
  font-size: 26rpx;
  color: #999;
}
.input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.textarea {
  width: 100%;
  height: 200rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.save-btn {
  margin-top: 48rpx;
  width: 100%;
  background: #ff8a47;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  line-height: 88rpx;
  text-align: center;
}
.save-btn[disabled] {
  opacity: 0.6;
}
</style>
