<template>
  <view class="page">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="pet" class="content">
      <view class="header">
        <image class="avatar" :src="pet.avatar || defaultAvatar" mode="aspectFill" />
        <text class="name">{{ pet.name }}</text>
        <text class="meta">{{ typeLabel(pet.type) }}</text>
      </view>

      <view class="info-card">
        <view class="info-row">
          <text class="info-label">品种</text>
          <text class="info-value">{{ pet.breed || '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">性别</text>
          <text class="info-value">{{ genderLabel(pet.gender) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">生日</text>
          <text class="info-value">{{ pet.birthday ? pet.birthday.slice(0, 10) : '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">体重</text>
          <text class="info-value">{{ pet.weight !== null ? `${pet.weight} kg` : '未设置' }}</text>
        </view>
        <view v-if="pet.note" class="info-row note-row">
          <text class="info-label">备注</text>
          <text class="info-value note">{{ pet.note }}</text>
        </view>
      </view>

      <button class="edit-btn" @tap="goEdit">编辑</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getPet, type Pet } from '../../api/pet';

const defaultAvatar = '/static/default-avatar.png';
const pet = ref<Pet | null>(null);
const loading = ref(true);
const petId = ref('');

onLoad(async (options: any) => {
  if (!options?.id) {
    uni.showToast({ title: '宠物不存在', icon: 'none' });
    return;
  }
  petId.value = options.id;
  try {
    pet.value = await getPet(options.id);
  } catch {
    // already toasted
  } finally {
    loading.value = false;
  }
});

function typeLabel(t: string) {
  return { CAT: '猫', DOG: '狗', OTHER: '其他' }[t] || t;
}
function genderLabel(g: string) {
  return { MALE: '公', FEMALE: '母', UNKNOWN: '未知' }[g] || '未知';
}
function goEdit() {
  uni.navigateTo({ url: `/pages/pet/edit?id=${petId.value}` });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 24rpx;
}
.loading {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
}
.header {
  background: #fff;
  border-radius: 16rpx;
  padding: 48rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 24rpx;
  background: #eee;
}
.name {
  margin-top: 24rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}
.meta {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}
.info-card {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx 24rpx;
}
.info-row {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}
.info-row:last-child {
  border-bottom: none;
}
.note-row {
  flex-direction: column;
  align-items: flex-start;
}
.info-label {
  font-size: 28rpx;
  color: #999;
  width: 120rpx;
}
.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.note {
  margin-top: 12rpx;
  line-height: 1.6;
}
.edit-btn {
  margin-top: 32rpx;
  width: 100%;
  background: #ff8a47;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  line-height: 88rpx;
}
</style>
