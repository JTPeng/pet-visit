<template>
  <div class="page">
    <van-nav-bar title="审核队列" />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty v-if="!loading && list.length === 0" description="暂无待审核内容" />
      <van-cell-group v-else>
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.content?.slice(0, 30)"
          :label="`作者: ${item.authorId} | ${item.createdAt?.slice(0, 10)}`"
        >
          <template #right-icon>
            <van-button size="mini" type="success" @click="handle(item.id, 'pass')">通过</van-button>
            <van-button size="mini" type="danger" style="margin-left: 8px" @click="handle(item.id, 'reject')">拒绝</van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getReviewPosts, handleReviewPost } from '../api';

const list = ref<any[]>([]);
const loading = ref(true);
const refreshing = ref(false);

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    list.value = await getReviewPosts();
  } catch {
    //
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function onRefresh() {
  loadData();
}

async function handle(id: string, action: 'pass' | 'reject') {
  try {
    await handleReviewPost(id, action);
    list.value = list.value.filter((i) => i.id !== id);
    showToast(action === 'pass' ? '已通过' : '已拒绝');
  } catch {
    showToast('操作失败');
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
</style>
