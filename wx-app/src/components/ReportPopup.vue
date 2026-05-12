<template>
  <view v-if="visible" class="mask" @tap="close">
    <view class="sheet" @tap.stop>
      <text class="title">举报</text>
      <view class="reasons">
        <view
          v-for="r in REASONS"
          :key="r.value"
          class="reason-item"
          :class="{ active: selected === r.value }"
          @tap="selected = r.value"
        >
          <text>{{ r.label }}</text>
        </view>
      </view>
      <textarea
        v-model="detail"
        class="detail"
        placeholder="补充说明（可选，500 字以内）"
        maxlength="500"
      />
      <view class="actions">
        <view class="btn cancel" @tap="close">取消</view>
        <view class="btn submit" @tap="handleSubmit">提交</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { createReport, type ReportReason, type ReportTargetType } from '../api/report';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'PORN', label: '色情低俗' },
  { value: 'POLITICS', label: '政治敏感' },
  { value: 'AD', label: '广告引流' },
  { value: 'ATTACK', label: '人身攻击' },
  { value: 'FAKE', label: '虚假信息' },
  { value: 'OTHER', label: '其他' },
];

const props = defineProps<{
  visible: boolean;
  targetType: ReportTargetType;
  targetId: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'success'): void;
}>();

const selected = ref<ReportReason | ''>('');
const detail = ref('');

watch(
  () => props.visible,
  (v) => {
    if (v) {
      selected.value = '';
      detail.value = '';
    }
  },
);

function close() {
  emit('update:visible', false);
}

async function handleSubmit() {
  if (!selected.value) {
    uni.showToast({ title: '请选择举报原因', icon: 'none' });
    return;
  }
  try {
    await createReport({
      targetType: props.targetType,
      targetId: props.targetId,
      reason: selected.value,
      detail: detail.value.trim() || undefined,
    });
    uni.showToast({ title: '举报已提交', icon: 'success' });
    emit('update:visible', false);
    emit('success');
  } catch {
    // already toasted
  }
}
</script>

<style scoped>
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}
.sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  box-sizing: border-box;
}
.title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 24rpx;
}
.reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.reason-item {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
}
.reason-item.active {
  background: #fff3ea;
  color: #ff8a47;
}
.detail {
  width: 100%;
  height: 160rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
  box-sizing: border-box;
  margin-bottom: 24rpx;
}
.actions {
  display: flex;
  gap: 16rpx;
}
.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.cancel {
  background: #f5f5f5;
  color: #666;
}
.submit {
  background: #ff8a47;
  color: #fff;
}
</style>
