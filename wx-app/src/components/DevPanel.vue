<template>
  <view v-if="isDev" class="dev-entry">
    <view class="dev-fab" @tap="show = !show">🛠</view>
    <view v-if="show" class="dev-panel">
      <view class="dev-title">开发模式</view>
      <view class="dev-info">
        <text>当前：{{ currentUser || '未登录' }}</text>
      </view>
      <view class="dev-accounts">
        <view
          v-for="acc in accounts"
          :key="acc.id"
          class="dev-account"
          :class="{ active: currentUser === acc.name }"
          @tap="switchTo(acc)"
        >
          <text class="dev-acc-name">{{ acc.name }}</text>
          <text class="dev-acc-desc">{{ acc.desc }}</text>
        </view>
      </view>
      <view class="dev-logout" @tap="logout">退出登录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '../stores/user';
import { setToken } from '../api/request';

const isDev = import.meta.env.DEV;
const show = ref(false);
const userStore = useUserStore();

const accounts = [
  { id: 'seed_user_1', name: '橘猫铲屎官', desc: '2只猫 · 有手机号' },
  { id: 'seed_user_2', name: '柴犬小分队', desc: '2只狗 · 有手机号' },
  { id: 'seed_user_3', name: '布偶猫妈妈', desc: '1只猫 · 未绑手机' },
];

const currentUser = computed(() => userStore.userInfo?.nickname || '');

function signToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const payload = btoa(
    JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 30 }),
  ).replace(/=/g, '');
  // Dev mode: we use a simple token that the backend will verify with JWT_SECRET
  // For H5 dev, we call the backend to get a real token
  return `${header}.${payload}`;
}

async function switchTo(acc: { id: string; name: string }) {
  // 直接调后端的一个 dev 接口，或者用预签的 token
  // 这里用 fetch 调一个简易的 dev login
  try {
    const res = await fetch(`/api/admin/dev-login?userId=${acc.id}`, {
      method: 'POST',
    });
    const body = await res.json();
    if (body.code === 0 && body.data?.token) {
      userStore.token = body.data.token;
      setToken(body.data.token);
      await userStore.fetchMe();
      show.value = false;
      uni.showToast({ title: `已切换为 ${acc.name}`, icon: 'success' });
    } else {
      uni.showToast({ title: '切换失败', icon: 'none' });
    }
  } catch {
    uni.showToast({ title: '切换失败', icon: 'none' });
  }
}

function logout() {
  userStore.logout();
  show.value = false;
  uni.showToast({ title: '已退出', icon: 'success' });
}
</script>

<style scoped>
.dev-entry {
  position: fixed;
  right: 24rpx;
  bottom: 200rpx;
  z-index: 9999;
}
.dev-fab {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}
.dev-panel {
  position: absolute;
  bottom: 100rpx;
  right: 0;
  width: 480rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
}
.dev-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 16rpx;
  text-align: center;
}
.dev-info {
  font-size: 24rpx;
  color: #8e8e93;
  margin-bottom: 16rpx;
  text-align: center;
}
.dev-accounts {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.dev-account {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  background: #f5f0eb;
  border-radius: 16rpx;
}
.dev-account.active {
  background: #fff3ea;
  border: 2rpx solid #ff8a47;
}
.dev-acc-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #2d2d2d;
}
.dev-acc-desc {
  font-size: 22rpx;
  color: #8e8e93;
}
.dev-logout {
  margin-top: 16rpx;
  text-align: center;
  font-size: 26rpx;
  color: #ff6b6b;
  padding: 12rpx;
}
</style>
