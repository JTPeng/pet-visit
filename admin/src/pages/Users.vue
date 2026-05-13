<template>
  <div class="page">
    <van-nav-bar title="用户管理" />
    <van-search v-model="searchId" placeholder="输入用户 ID 查询" @search="onSearch" />

    <van-cell-group v-if="user">
      <van-cell title="ID" :value="user.id" />
      <van-cell title="昵称" :value="user.nickname" />
      <van-cell title="手机号" :value="user.phone || '未绑定'" />
      <van-cell title="封禁状态" :value="banStatus" />
    </van-cell-group>

    <div v-if="user" class="actions">
      <van-button v-if="!isBanned" block type="danger" @click="handleBan">封禁 7 天</van-button>
      <van-button v-else block type="success" @click="handleUnban">解除封禁</van-button>
    </div>

    <van-empty v-if="searched && !user" description="用户不存在" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { showToast } from 'vant';
import { getUser, banUser, unbanUser } from '../api';

const searchId = ref('');
const user = ref<any>(null);
const searched = ref(false);

const isBanned = computed(() => {
  if (!user.value?.banUntil) return false;
  return new Date(user.value.banUntil) > new Date();
});

const banStatus = computed(() => {
  if (!isBanned.value) return '正常';
  return `封禁至 ${user.value.banUntil.slice(0, 10)}`;
});

async function onSearch() {
  if (!searchId.value.trim()) return;
  searched.value = true;
  try {
    user.value = await getUser(searchId.value.trim());
  } catch {
    user.value = null;
  }
}

async function handleBan() {
  try {
    await banUser(user.value.id, 7);
    await onSearch();
    showToast('已封禁');
  } catch {
    showToast('操作失败');
  }
}

async function handleUnban() {
  try {
    await unbanUser(user.value.id);
    await onSearch();
    showToast('已解封');
  } catch {
    showToast('操作失败');
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
.actions { padding: 16px; }
</style>
