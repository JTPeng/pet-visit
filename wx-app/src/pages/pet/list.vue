<template>
  <view class="page">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="pets.length === 0" class="empty">
      <text class="empty-icon">🐾</text>
      <text class="empty-text">还没有添加宠物</text>
      <button class="add-btn" @tap="goCreate">添加我的第一个宠物</button>
    </view>
    <view v-else class="list">
      <view
        v-for="pet in pets"
        :key="pet.id"
        class="pet-card"
        @tap="goDetail(pet.id)"
      >
        <image class="avatar" :src="pet.avatar || defaultAvatar" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ pet.name }}</text>
          <text class="meta">{{ typeLabel(pet.type) }} · {{ pet.breed || '未知品种' }}</text>
          <text v-if="pet.gender !== 'UNKNOWN'" class="meta">{{ genderLabel(pet.gender) }}</text>
        </view>
      </view>
      <button class="add-btn floating" @tap="goCreate">+ 添加宠物</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { listMyPets, type Pet } from '../../api/pet';

const defaultAvatar = '/static/default-avatar.png';
const pets = ref<Pet[]>([]);
const loading = ref(true);

onShow(async () => {
  try {
    pets.value = await listMyPets();
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
  return { MALE: '公', FEMALE: '母' }[g] || '';
}

function goCreate() {
  uni.navigateTo({ url: '/pages/pet/edit' });
}
function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/pet/detail?id=${id}` });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 24rpx;
}
.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  color: #999;
}
.empty-icon {
  font-size: 120rpx;
}
.empty-text {
  margin-top: 24rpx;
  font-size: 30rpx;
  color: #999;
}
.add-btn {
  margin-top: 48rpx;
  background: #ff8a47;
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  line-height: 80rpx;
  padding: 0 48rpx;
}
.add-btn.floating {
  margin-top: 24rpx;
  width: 100%;
  background: #fff;
  color: #ff8a47;
  border: 2rpx dashed #ff8a47;
  border-radius: 16rpx;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.pet-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  background: #eee;
}
.info {
  margin-left: 24rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.meta {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
