<template>
  <view class="page">
    <view class="form">
      <textarea
        class="content-input"
        v-model="content"
        placeholder="分享你和毛孩子的日常..."
        maxlength="1000"
        :auto-height="true"
      />
      <text class="char-count">{{ content.length }}/1000</text>

      <ImagePicker v-model="images" :max="9" />

      <view class="section">
        <text class="section-title">话题标签（最多 3 个）</text>
        <view class="tag-list">
          <view
            v-for="tag in TAGS"
            :key="tag"
            class="tag-item"
            :class="{ active: selectedTags.includes(tag) }"
            @tap="toggleTag(tag)"
          >
            <text>#{{ tag }}</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="pets.length > 0">
        <text class="section-title">关联宠物（可选）</text>
        <view class="pet-list">
          <view
            class="pet-item"
            :class="{ active: !selectedPetId }"
            @tap="selectedPetId = ''"
          >
            <text>不关联</text>
          </view>
          <view
            v-for="pet in pets"
            :key="pet.id"
            class="pet-item"
            :class="{ active: selectedPetId === pet.id }"
            @tap="selectedPetId = pet.id"
          >
            <text>{{ pet.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <button class="publish-btn" :disabled="!canPublish || publishing" @tap="handlePublish">
      {{ publishing ? '发布中...' : '发布' }}
    </button>

    <BindPhonePopup
      :visible="showBindPhone"
      @update:visible="showBindPhone = $event"
      @success="handlePublish"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import ImagePicker from '../../components/ImagePicker.vue';
import BindPhonePopup from '../../components/BindPhonePopup.vue';
import { createPost } from '../../api/post';
import { listMyPets, type Pet } from '../../api/pet';
import { useUserStore } from '../../stores/user';

const TAGS = ['晒猫', '晒狗', '养宠日常', '求助', '萌宠瞬间', '疫苗驱虫', '养宠新手'];

const userStore = useUserStore();
const content = ref('');
const images = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const selectedPetId = ref('');
const pets = ref<Pet[]>([]);
const publishing = ref(false);
const showBindPhone = ref(false);

const canPublish = computed(() => content.value.trim().length > 0 || images.value.length > 0);

onShow(async () => {
  if (userStore.isLogin) {
    try {
      pets.value = await listMyPets();
    } catch {
      pets.value = [];
    }
  }
});

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag);
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1);
  } else if (selectedTags.value.length < 3) {
    selectedTags.value.push(tag);
  } else {
    uni.showToast({ title: '最多选 3 个标签', icon: 'none' });
  }
}

async function handlePublish() {
  if (!userStore.isLogin) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }
  if (!userStore.hasPhone) {
    showBindPhone.value = true;
    return;
  }
  if (!canPublish.value) return;

  publishing.value = true;
  try {
    await createPost({
      content: content.value.trim(),
      images: images.value,
      tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
      petId: selectedPetId.value || undefined,
    });
    uni.showToast({ title: '发布成功', icon: 'success' });
    content.value = '';
    images.value = [];
    selectedTags.value = [];
    selectedPetId.value = '';
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 800);
  } catch {
    // already toasted
  } finally {
    publishing.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #faf8f5;
  padding: 24rpx;
}
.form {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 16rpx rgba(255, 138, 71, 0.06);
}
.content-input {
  width: 100%;
  min-height: 240rpx;
  font-size: 30rpx;
  line-height: 1.7;
  box-sizing: border-box;
  color: #2d2d2d;
}
.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #c7c7cc;
  margin-bottom: 24rpx;
}
.section {
  margin-top: 28rpx;
}
.section-title {
  font-size: 26rpx;
  color: #8e8e93;
  margin-bottom: 16rpx;
  display: block;
  font-weight: 500;
}
.tag-list,
.pet-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.tag-item,
.pet-item {
  padding: 10rpx 28rpx;
  background: #f5f0eb;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #8e8e93;
  transition: all 0.2s;
}
.tag-item.active,
.pet-item.active {
  background: #fff3ea;
  color: #ff8a47;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(255, 138, 71, 0.15);
}
.publish-btn {
  margin-top: 36rpx;
  width: 100%;
  background: linear-gradient(135deg, #ff8a47, #ffb347);
  color: #fff;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 92rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 138, 71, 0.3);
  letter-spacing: 2rpx;
}
.publish-btn[disabled] {
  opacity: 0.5;
  box-shadow: none;
}
</style>
