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
  background: #f8f8f8;
}
.guest {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}
.guest-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #eee;
}
.guest-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #999;
}
.login-btn {
  margin-top: 48rpx;
  width: 60%;
  background: #ff8a47;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  line-height: 88rpx;
  text-align: center;
}
.profile {
  padding: 32rpx;
}
.header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 32rpx;
  border-radius: 16rpx;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #eee;
}
.info {
  margin-left: 24rpx;
  flex: 1;
}
.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}
.bio {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}
.stats {
  display: flex;
  justify-content: space-around;
  background: #fff;
  margin-top: 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.actions {
  margin-top: 24rpx;
}
.edit-btn {
  width: 100%;
  background: #fff;
  color: #ff8a47;
  border: 2rpx solid #ff8a47;
  border-radius: 44rpx;
  font-size: 30rpx;
  line-height: 80rpx;
  text-align: center;
}
.menu {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}
.menu-item {
  padding: 32rpx;
  font-size: 30rpx;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2rpx solid #f5f5f5;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-item.logout {
  justify-content: center;
  color: #e64340;
}
.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}
</style>
