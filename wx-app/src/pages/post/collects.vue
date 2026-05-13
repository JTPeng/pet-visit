<template>
  <view class="page">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="posts.length === 0" class="empty">
      <text class="empty-text">还没有收藏任何帖子</text>
    </view>
    <view v-else class="list">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @update="onPostUpdate"
      />
      <view v-if="noMore" class="no-more">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import PostCard from '../../components/PostCard.vue';
import { getMyCollects, type PostItem } from '../../api/post';

const posts = ref<PostItem[]>([]);
const loading = ref(true);
const noMore = ref(false);
const page = ref(1);

onShow(async () => {
  page.value = 1;
  noMore.value = false;
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const res = await getMyCollects(page.value);
    posts.value = res.items.map((p) => ({ ...p, isCollected: true }));
    if (res.items.length < 20) noMore.value = true;
  } catch {
    // already toasted
  } finally {
    loading.value = false;
  }
}

function onPostUpdate(updated: PostItem) {
  if (!updated.isCollected) {
    posts.value = posts.value.filter((p) => p.id !== updated.id);
  } else {
    const idx = posts.value.findIndex((p) => p.id === updated.id);
    if (idx !== -1) posts.value[idx] = updated;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 16rpx;
}
.loading,
.empty {
  text-align: center;
  padding-top: 200rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #999;
}
.no-more {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #ccc;
}
</style>
