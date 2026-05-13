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

    <view v-if="post.images.length" class="images" :class="`images-${Math.min(post.images.length, 3)}`">
      <image
        v-for="(img, i) in post.images.slice(0, 9)"
        :key="i"
        class="img"
        :src="img"
        mode="aspectFill"
        @tap.stop="previewImage(i)"
      />
    </view>

    <view v-if="post.tags.length" class="tags">
      <text v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</text>
    </view>

    <view class="actions">
      <view class="action" @tap.stop="handleLike">
        <text :class="{ liked: post.isLiked }">{{ post.isLiked ? '❤️' : '🤍' }} {{ post.likeCount || '' }}</text>
      </view>
      <view class="action" @tap.stop="goDetail">
        <text>💬 {{ post.commentCount || '' }}</text>
      </view>
      <view class="action" @tap.stop="handleCollect">
        <text :class="{ collected: post.isCollected }">{{ post.isCollected ? '⭐' : '☆' }} {{ post.collectCount || '' }}</text>
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
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.author-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #eee;
}
.author-info {
  margin-left: 16rpx;
  flex: 1;
}
.author-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.time {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}
.content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.images {
  display: grid;
  gap: 8rpx;
  margin-bottom: 16rpx;
}
.images-1 {
  grid-template-columns: 1fr;
}
.images-2 {
  grid-template-columns: 1fr 1fr;
}
.images-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8rpx;
  background: #f5f5f5;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.tag {
  font-size: 24rpx;
  color: #ff8a47;
  background: #fff3ea;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
.actions {
  display: flex;
  justify-content: space-around;
  border-top: 2rpx solid #f5f5f5;
  padding-top: 16rpx;
}
.action {
  font-size: 26rpx;
  color: #666;
}
.liked {
  color: #e64340;
}
.collected {
  color: #f5a623;
}
</style>
