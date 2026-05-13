<template>
  <view class="page">
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: activeTab === 'recommend' }"
        @tap="activeTab = 'recommend'"
      >
        推荐
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'following' }"
        @tap="switchToFollowing"
      >
        关注
      </view>
    </view>

    <scroll-view
      class="feed"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="posts.length === 0 && !loading" class="empty">
        <text class="empty-text">{{ activeTab === 'following' ? '关注的人还没有发帖' : '暂无内容' }}</text>
      </view>
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @update="onPostUpdate"
      />
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>
      <view v-if="noMore && posts.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import PostCard from '../../components/PostCard.vue';
import { getRecommendFeed, getFollowingFeed, type PostItem } from '../../api/post';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();
const activeTab = ref<'recommend' | 'following'>('recommend');
const posts = ref<PostItem[]>([]);
const page = ref(1);
const loading = ref(false);
const noMore = ref(false);
const refreshing = ref(false);

onShow(() => {
  refresh();
});

watch(activeTab, () => {
  refresh();
});

function switchToFollowing() {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  activeTab.value = 'following';
}

async function refresh() {
  page.value = 1;
  noMore.value = false;
  posts.value = [];
  await loadData();
}

async function onRefresh() {
  refreshing.value = true;
  await refresh();
  refreshing.value = false;
}

async function loadMore() {
  if (loading.value || noMore.value) return;
  page.value++;
  await loadData();
}

async function loadData() {
  loading.value = true;
  try {
    const data =
      activeTab.value === 'recommend'
        ? await getRecommendFeed(page.value)
        : await getFollowingFeed(page.value);

    if (page.value === 1) {
      posts.value = data;
    } else {
      posts.value.push(...data);
    }
    if (data.length < 20) {
      noMore.value = true;
    }
  } catch {
    // already toasted
  } finally {
    loading.value = false;
  }
}

function onPostUpdate(updated: PostItem) {
  const idx = posts.value.findIndex((p) => p.id === updated.id);
  if (idx !== -1) {
    posts.value[idx] = updated;
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #faf8f5;
}
.tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 20rpx 32rpx 0;
  gap: 48rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}
.tab {
  font-size: 30rpx;
  color: #c7c7cc;
  padding-bottom: 16rpx;
  position: relative;
  font-weight: 500;
}
.tab.active {
  color: #2d2d2d;
  font-weight: 700;
}
.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: linear-gradient(135deg, #ff8a47, #ffb347);
}
.feed {
  flex: 1;
  padding: 20rpx;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 240rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #c7c7cc;
}
.loading,
.no-more {
  text-align: center;
  padding: 32rpx;
  font-size: 24rpx;
  color: #c7c7cc;
}
</style>
