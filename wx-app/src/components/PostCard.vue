<template>
  <view class="card" @tap="goDetail">
    <view class="card-header">
      <image class="author-avatar" :src="post.author.avatar" mode="aspectFill" @tap.stop="goUser" />
      <view class="author-info">
        <text class="author-name" @tap.stop="goUser">{{ post.author.nickname }}</text>
        <text class="time">{{ formatTime(post.createdAt) }}</text>
      </view>
    </view>

    <text class="content">{{ post.content }}</text>

    <view v-if="post.images.length" class="images" :class="`grid-${Math.min(post.images.length, 3)}`">
      <view v-for="(img, i) in post.images.slice(0, 9)" :key="i" class="img-wrap">
        <image class="img" :src="img" mode="aspectFill" @tap.stop="previewImage(i)" />
      </view>
    </view>

    <view v-if="post.tags.length" class="tags">
      <view v-for="tag in post.tags" :key="tag" class="tag">
        <text class="tag-text">#{{ tag }}</text>
      </view>
    </view>

    <view class="actions">
      <view class="action-item" @tap.stop="handleLike">
        <text class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</text>
        <text class="action-num" :class="{ active: post.isLiked }">{{ post.likeCount || '' }}</text>
      </view>
      <view class="action-item" @tap.stop="goDetail">
        <text class="action-icon">💬</text>
        <text class="action-num">{{ post.commentCount || '' }}</text>
      </view>
      <view class="action-item" @tap.stop="handleCollect">
        <text class="action-icon">{{ post.isCollected ? '⭐' : '☆' }}</text>
        <text class="action-num" :class="{ active: post.isCollected }">{{ post.collectCount || '' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { type PostItem, likePost, unlikePost, collectPost, uncollectPost } from '../api/post';
import { useUserStore } from '../stores/user';

const props = defineProps<{ post: PostItem }>();
const emit = defineEmits<{ (e: 'update', post: PostItem): void }>();

const userStore = useUserStore();

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

function goDetail() {
  uni.navigateTo({ url: `/pages/post/detail?id=${props.post.id}` });
}

function goUser() {
  uni.navigateTo({ url: `/pages/user/index?id=${props.post.author.id}` });
}

function previewImage(index: number) {
  uni.previewImage({ urls: props.post.images, current: props.post.images[index] });
}

async function handleLike() {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  const p = props.post;
  if (p.isLiked) {
    await unlikePost(p.id);
    emit('update', { ...p, isLiked: false, likeCount: p.likeCount - 1 });
  } else {
    await likePost(p.id);
    emit('update', { ...p, isLiked: true, likeCount: p.likeCount + 1 });
  }
}

async function handleCollect() {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  const p = props.post;
  if (p.isCollected) {
    await uncollectPost(p.id);
    emit('update', { ...p, isCollected: false, collectCount: p.collectCount - 1 });
  } else {
    await collectPost(p.id);
    emit('update', { ...p, isCollected: true, collectCount: p.collectCount + 1 });
  }
}
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 16rpx rgba(255, 138, 71, 0.06);
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.author-avatar {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  border: 4rpx solid #fff3ea;
}
.author-info {
  margin-left: 16rpx;
  flex: 1;
}
.author-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2d2d2d;
}
.time {
  font-size: 22rpx;
  color: #c7c7cc;
  margin-top: 4rpx;
  display: block;
}
.content {
  font-size: 28rpx;
  color: #2d2d2d;
  line-height: 1.7;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.images {
  display: grid;
  gap: 8rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}
.grid-1 {
  grid-template-columns: 1fr;
}
.grid-2 {
  grid-template-columns: 1fr 1fr;
}
.grid-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.img-wrap {
  aspect-ratio: 1;
  overflow: hidden;
}
.img {
  width: 100%;
  height: 100%;
  background: #f5f0eb;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.tag {
  background: #fff3ea;
  padding: 6rpx 20rpx;
  border-radius: 24rpx;
}
.tag-text {
  font-size: 22rpx;
  color: #ff8a47;
  font-weight: 500;
}
.actions {
  display: flex;
  justify-content: space-around;
  padding-top: 16rpx;
  border-top: 2rpx solid #f5f0eb;
}
.action-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
}
.action-icon {
  font-size: 32rpx;
}
.action-num {
  font-size: 24rpx;
  color: #8e8e93;
}
.action-num.active {
  color: #ff8a47;
  font-weight: 500;
}
</style>
