<template>
  <view class="page">
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="profile" class="profile">
      <view class="header">
        <image class="avatar" :src="profile.avatar" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ profile.nickname }}</text>
          <text class="bio">{{ profile.bio || '这个人很懒，什么都没写~' }}</text>
        </view>
      </view>

      <view class="stats">
        <view class="stat-item">
          <text class="stat-num">{{ profile.followerCount }}</text>
          <text class="stat-label">粉丝</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ profile.followingCount }}</text>
          <text class="stat-label">关注</text>
        </view>
      </view>

      <view v-if="!isSelf" class="actions">
        <button
          class="follow-btn"
          :class="{ followed: isFollowing }"
          @tap="toggleFollow"
        >
          {{ isFollowing ? '已关注' : '关注' }}
        </button>
      </view>

      <view class="posts-placeholder">
        <text class="placeholder-text">帖子列表将在 P6 阶段实现</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../../stores/user';
import { getUserById, type PublicUserProfile } from '../../api/user';
import { follow, unfollow, checkIsFollowing } from '../../api/follow';

const userStore = useUserStore();
const profile = ref<PublicUserProfile | null>(null);
const loading = ref(true);
const isFollowing = ref(false);

const props = defineProps<{ id?: string }>();

const userId = computed(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  return props.id || currentPage?.options?.id || '';
});

const isSelf = computed(() => userId.value === userStore.userInfo?.id);

onMounted(async () => {
  if (!userId.value) {
    uni.showToast({ title: '用户不存在', icon: 'none' });
    return;
  }

  try {
    profile.value = await getUserById(userId.value);
    if (userStore.isLogin && !isSelf.value) {
      const res = await checkIsFollowing(userId.value);
      isFollowing.value = res.isFollowing;
    }
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
});

async function toggleFollow() {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }

  try {
    if (isFollowing.value) {
      await unfollow(userId.value);
      isFollowing.value = false;
      if (profile.value) profile.value.followerCount--;
    } else {
      await follow(userId.value);
      isFollowing.value = true;
      if (profile.value) profile.value.followerCount++;
    }
  } catch {
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
}
.loading {
  display: flex;
  justify-content: center;
  padding-top: 200rpx;
  color: #999;
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
.follow-btn {
  width: 100%;
  background: #ff8a47;
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  line-height: 80rpx;
  text-align: center;
}
.follow-btn.followed {
  background: #fff;
  color: #999;
  border: 2rpx solid #ddd;
}
.posts-placeholder {
  margin-top: 48rpx;
  text-align: center;
}
.placeholder-text {
  font-size: 26rpx;
  color: #ccc;
}
</style>
