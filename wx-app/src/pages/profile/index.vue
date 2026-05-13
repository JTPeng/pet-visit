<template>
  <view class="page">
    <!-- 未登录状态 -->
    <view v-if="!userStore.isLogin" class="guest">
      <image class="guest-avatar" src="/static/default-avatar.png" mode="aspectFill" />
      <text class="guest-text">登录后查看个人信息</text>
      <button class="login-btn" @tap="handleLogin">登录</button>
    </view>

    <!-- 已登录状态 -->
    <view v-else class="profile">
      <view class="header">
        <image class="avatar" :src="userStore.userInfo?.avatar" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ userStore.userInfo?.nickname }}</text>
          <text class="bio">{{ userStore.userInfo?.bio || '这个人很懒，什么都没写~' }}</text>
        </view>
      </view>

      <view class="stats">
        <view class="stat-item">
          <text class="stat-num">{{ userStore.userInfo?.followerCount || 0 }}</text>
          <text class="stat-label">粉丝</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ userStore.userInfo?.followingCount || 0 }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-item" @tap="goPetList">
          <text class="stat-num">{{ petCount }}</text>
          <text class="stat-label">宠物</text>
        </view>
      </view>

      <view class="actions">
        <button class="edit-btn" @tap="goEdit">编辑资料</button>
      </view>

      <view class="menu">
        <view class="menu-item" @tap="goPetList">
          <text>🐾 我的宠物</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="goCollects">
          <text>⭐ 我的收藏</text>
          <text class="menu-arrow">›</text>
        </view>
        <view v-if="!userStore.hasPhone" class="menu-item" @tap="showBindPhone = true">
          <text>📱 绑定手机号</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item logout" @tap="handleLogout">
          <text>退出登录</text>
        </view>
      </view>

      <BindPhonePopup
        :visible="showBindPhone"
        @update:visible="showBindPhone = $event"
        @success="onPhoneBound"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../stores/user';
import { listMyPets } from '../../api/pet';
import BindPhonePopup from '../../components/BindPhonePopup.vue';

const userStore = useUserStore();
const petCount = ref(0);
const showBindPhone = ref(false);

onShow(async () => {
  if (userStore.isLogin) {
    try {
      const pets = await listMyPets();
      petCount.value = pets.length;
    } catch {
      petCount.value = 0;
    }
  }
});

async function handleLogin() {
  await userStore.login();
}

function goEdit() {
  uni.navigateTo({ url: '/pages/profile/edit' });
}

function goPetList() {
  uni.navigateTo({ url: '/pages/pet/list' });
}

function goCollects() {
  uni.navigateTo({ url: '/pages/post/collects' });
}

function onPhoneBound() {
  uni.showToast({ title: '绑定成功', icon: 'success' });
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
      }
    },
  });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #faf8f5;
}
.guest {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}
.guest-avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background: #f5f0eb;
  border: 6rpx solid #fff3ea;
}
.guest-text {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #c7c7cc;
}
.login-btn {
  margin-top: 48rpx;
  width: 60%;
  background: linear-gradient(135deg, #ff8a47, #ffb347);
  color: #fff;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 92rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 138, 71, 0.3);
}
.profile {
  padding: 24rpx;
}
.header {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 36rpx;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(255, 138, 71, 0.06);
}
.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  border: 6rpx solid #fff3ea;
}
.info {
  margin-left: 24rpx;
  flex: 1;
}
.nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: #2d2d2d;
}
.bio {
  font-size: 26rpx;
  color: #8e8e93;
  margin-top: 8rpx;
  line-height: 1.5;
}
.stats {
  display: flex;
  justify-content: space-around;
  background: #ffffff;
  margin-top: 20rpx;
  padding: 36rpx;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(255, 138, 71, 0.06);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 38rpx;
  font-weight: 700;
  color: #2d2d2d;
}
.stat-label {
  font-size: 24rpx;
  color: #c7c7cc;
  margin-top: 8rpx;
}
.actions {
  margin-top: 20rpx;
}
.edit-btn {
  width: 100%;
  background: #ffffff;
  color: #ff8a47;
  border: 2rpx solid #ffe0cc;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 84rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(255, 138, 71, 0.08);
}
.menu {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(255, 138, 71, 0.06);
  overflow: hidden;
}
.menu-item {
  padding: 32rpx 28rpx;
  font-size: 30rpx;
  color: #2d2d2d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2rpx solid #f5f0eb;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-item.logout {
  justify-content: center;
  color: #ff6b6b;
}
.menu-arrow {
  font-size: 28rpx;
  color: #c7c7cc;
}
</style>
