<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-else-if="post" class="detail">
        <view class="header">
          <image class="author-avatar" :src="post.author.avatar" mode="aspectFill" @tap="goUser" />
          <view class="author-info">
            <text class="author-name" @tap="goUser">{{ post.author.nickname }}</text>
            <text class="time">{{ formatTime(post.createdAt) }}</text>
          </view>
          <view class="more" @tap="showActions">
            <text>···</text>
          </view>
        </view>

        <text class="content">{{ post.content }}</text>

        <view v-if="post.images.length" class="images">
          <image
            v-for="(img, i) in post.images"
            :key="i"
            class="img"
            :src="img"
            mode="widthFix"
            @tap="previewImage(i)"
          />
        </view>

        <view v-if="post.tags.length" class="tags">
          <text v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</text>
        </view>

        <view class="stats">
          <text class="stat">{{ post.likeCount }} 赞</text>
          <text class="stat">{{ post.commentCount }} 评论</text>
          <text class="stat">{{ post.collectCount }} 收藏</text>
        </view>

        <view class="divider" />

        <view class="comments-section">
          <text class="section-title">评论</text>
          <view v-if="comments.length === 0" class="empty-comments">
            <text>暂无评论，快来抢沙发~</text>
          </view>
          <view v-for="comment in comments" :key="comment.id" class="comment-item">
            <image class="comment-avatar" :src="comment.author.avatar" mode="aspectFill" />
            <view class="comment-body">
              <text class="comment-author">{{ comment.author.nickname }}</text>
              <text class="comment-content">{{ comment.content }}</text>
              <view class="comment-meta">
                <text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
                <text class="comment-reply" @tap="replyTo(comment)">回复</text>
              </view>
              <view v-if="comment.replies && comment.replies.length" class="replies">
                <view v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <text class="reply-author">{{ reply.author.nickname }}</text>
                  <text class="reply-content">{{ reply.content }}</text>
                </view>
                <text
                  v-if="comment._count && comment._count.replies > 3"
                  class="more-replies"
                >
                  查看全部 {{ comment._count.replies }} 条回复
                </text>
              </view>
            </view>
          </view>
          <view v-if="commentNoMore && comments.length > 0" class="no-more">
            <text>没有更多评论了</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="input-wrap" @tap="focusInput">
        <text class="input-placeholder">{{ replyTarget ? `回复 ${replyTarget.author.nickname}` : '写评论...' }}</text>
      </view>
      <view class="bar-actions">
        <view class="bar-action" @tap="handleLike">
          <text>{{ post?.isLiked ? '❤️' : '🤍' }}</text>
        </view>
        <view class="bar-action" @tap="handleCollect">
          <text>{{ post?.isCollected ? '⭐' : '☆' }}</text>
        </view>
      </view>
    </view>

    <!-- 评论输入弹窗 -->
    <view v-if="showCommentInput" class="comment-mask" @tap="closeInput">
      <view class="comment-input-wrap" @tap.stop>
        <textarea
          class="comment-textarea"
          v-model="commentText"
          :placeholder="replyTarget ? `回复 ${replyTarget.author.nickname}` : '写评论...'"
          :focus="showCommentInput"
          maxlength="500"
          :auto-height="true"
        />
        <button class="send-btn" :disabled="!commentText.trim()" @tap="sendComment">发送</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import {
  getPostDetail,
  getComments,
  createComment,
  likePost,
  unlikePost,
  collectPost,
  uncollectPost,
  type PostItem,
  type CommentItem,
} from '../../api/post';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();
const post = ref<PostItem | null>(null);
const comments = ref<CommentItem[]>([]);
const loading = ref(true);
const commentPage = ref(1);
const commentNoMore = ref(false);
const showCommentInput = ref(false);
const commentText = ref('');
const replyTarget = ref<CommentItem | null>(null);

onLoad(async (options: any) => {
  if (!options?.id) return;
  try {
    post.value = await getPostDetail(options.id);
    await loadComments(options.id);
  } catch {
    // already toasted
  } finally {
    loading.value = false;
  }
});

async function loadComments(postId: string) {
  const res = await getComments(postId, commentPage.value);
  if (commentPage.value === 1) {
    comments.value = res.items;
  } else {
    comments.value.push(...res.items);
  }
  if (res.items.length < 20) commentNoMore.value = true;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

function goUser() {
  if (post.value) {
    uni.navigateTo({ url: `/pages/user/index?id=${post.value.author.id}` });
  }
}

function previewImage(index: number) {
  if (post.value) {
    uni.previewImage({ urls: post.value.images, current: post.value.images[index] });
  }
}

function showActions() {
  const items = ['举报'];
  if (post.value?.authorId === userStore.userInfo?.id) {
    items.push('删除');
  }
  uni.showActionSheet({
    itemList: items,
    success: (res) => {
      if (items[res.tapIndex] === '举报') {
        // TODO: show report popup
      } else if (items[res.tapIndex] === '删除') {
        // TODO: delete post
      }
    },
  });
}

function focusInput() {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  showCommentInput.value = true;
}

function closeInput() {
  showCommentInput.value = false;
  replyTarget.value = null;
  commentText.value = '';
}

function replyTo(comment: CommentItem) {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  replyTarget.value = comment;
  showCommentInput.value = true;
}

async function sendComment() {
  if (!post.value || !commentText.value.trim()) return;
  try {
    const newComment = await createComment(post.value.id, {
      content: commentText.value.trim(),
      parentId: replyTarget.value?.id,
    });
    if (replyTarget.value) {
      const parent = comments.value.find((c) => c.id === replyTarget.value!.id);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newComment);
      }
    } else {
      comments.value.unshift(newComment);
    }
    post.value.commentCount++;
    closeInput();
    uni.showToast({ title: '评论成功', icon: 'success' });
  } catch {
    // already toasted
  }
}

async function handleLike() {
  if (!userStore.isLogin || !post.value) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  if (post.value.isLiked) {
    await unlikePost(post.value.id);
    post.value.isLiked = false;
    post.value.likeCount--;
  } else {
    await likePost(post.value.id);
    post.value.isLiked = true;
    post.value.likeCount++;
  }
}

async function handleCollect() {
  if (!userStore.isLogin || !post.value) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  if (post.value.isCollected) {
    await uncollectPost(post.value.id);
    post.value.isCollected = false;
    post.value.collectCount--;
  } else {
    await collectPost(post.value.id);
    post.value.isCollected = true;
    post.value.collectCount++;
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}
.scroll {
  flex: 1;
  padding: 24rpx;
  padding-bottom: 120rpx;
}
.loading {
  text-align: center;
  padding-top: 200rpx;
  color: #999;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}
.author-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #eee;
}
.author-info {
  margin-left: 16rpx;
  flex: 1;
}
.author-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}
.time {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}
.more {
  font-size: 36rpx;
  color: #999;
  padding: 16rpx;
}
.content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  margin-bottom: 24rpx;
}
.images {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.img {
  width: 100%;
  border-radius: 12rpx;
  background: #f5f5f5;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.tag {
  font-size: 24rpx;
  color: #ff8a47;
  background: #fff3ea;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
.stats {
  display: flex;
  gap: 32rpx;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 24rpx;
}
.divider {
  height: 2rpx;
  background: #f5f5f5;
  margin-bottom: 24rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}
.empty-comments {
  text-align: center;
  padding: 48rpx 0;
  font-size: 26rpx;
  color: #ccc;
}
.comment-item {
  display: flex;
  margin-bottom: 32rpx;
}
.comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #eee;
}
.comment-body {
  margin-left: 16rpx;
  flex: 1;
}
.comment-author {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}
.comment-content {
  font-size: 28rpx;
  color: #333;
  margin-top: 8rpx;
  line-height: 1.5;
  display: block;
}
.comment-meta {
  display: flex;
  gap: 24rpx;
  margin-top: 8rpx;
}
.comment-time {
  font-size: 22rpx;
  color: #999;
}
.comment-reply {
  font-size: 22rpx;
  color: #ff8a47;
}
.replies {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}
.reply-item {
  margin-bottom: 12rpx;
}
.reply-author {
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
}
.reply-content {
  font-size: 26rpx;
  color: #333;
  margin-left: 8rpx;
}
.more-replies {
  font-size: 24rpx;
  color: #ff8a47;
  margin-top: 8rpx;
}
.no-more {
  text-align: center;
  font-size: 24rpx;
  color: #ccc;
  padding: 24rpx;
}
.bottom-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  border-top: 2rpx solid #f5f5f5;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
.input-wrap {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 0 24rpx;
}
.input-placeholder {
  font-size: 26rpx;
  color: #999;
}
.bar-actions {
  display: flex;
  gap: 24rpx;
  margin-left: 24rpx;
}
.bar-action {
  font-size: 40rpx;
}
.comment-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}
.comment-input-wrap {
  width: 100%;
  background: #fff;
  padding: 24rpx;
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
  box-sizing: border-box;
}
.comment-textarea {
  flex: 1;
  min-height: 64rpx;
  max-height: 200rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.send-btn {
  width: 120rpx;
  height: 64rpx;
  line-height: 64rpx;
  background: #ff8a47;
  color: #fff;
  font-size: 26rpx;
  border-radius: 32rpx;
  text-align: center;
  padding: 0;
}
.send-btn[disabled] {
  opacity: 0.5;
}
</style>
