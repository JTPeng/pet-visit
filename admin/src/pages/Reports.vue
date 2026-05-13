<template>
  <div class="page">
    <van-nav-bar title="举报处理" />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty v-if="!loading && list.length === 0" description="暂无待处理举报" />
      <van-cell-group v-else>
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="`${item.targetType} | ${item.reason}`"
          :label="`举报人: ${item.reporterId} | ${item.createdAt?.slice(0, 10)}`"
        >
          <template #right-icon>
            <van-button size="mini" type="success" @click="handle(item.id, 'HANDLED')">处理</van-button>
            <van-button size="mini" plain style="margin-left: 8px" @click="handle(item.id, 'REJECTED')">驳回</van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import { getReports, handleReport } from '../api';

const list = ref<any[]>([]);
const loading = ref(true);
const refreshing = ref(false);

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    list.value = await getReports();
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

async function handle(id: number, status: 'HANDLED' | 'REJECTED') {
  try {
    await handleReport(id, status);
    list.value = list.value.filter((i) => i.id !== id);
    showToast('已处理');
  } catch {
    showToast('操作失败');
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
</style>
