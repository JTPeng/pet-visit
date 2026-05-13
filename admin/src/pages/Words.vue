<template>
  <div class="page">
    <van-nav-bar title="敏感词库" />
    <van-search v-model="keyword" placeholder="搜索敏感词" />
    <van-cell-group>
      <van-cell
        v-for="item in filtered"
        :key="item.id"
        :title="item.word"
        :label="item.category"
      >
        <template #right-icon>
          <van-button size="mini" type="danger" plain @click="handleDelete(item.id)">删除</van-button>
        </template>
      </van-cell>
    </van-cell-group>
    <van-empty v-if="filtered.length === 0" description="无匹配结果" />

    <van-floating-bubble icon="plus" @click="showAdd = true" />

    <van-dialog v-model:show="showAdd" title="添加敏感词" show-cancel-button @confirm="handleAdd">
      <van-field v-model="newWord" label="词" placeholder="请输入" />
      <van-field v-model="newCategory" label="分类" placeholder="POLITICS/PORN/GAMBLING/AD/OTHER" />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { showToast } from 'vant';
import { getSensitiveWords, addSensitiveWord, deleteSensitiveWord } from '../api';

const list = ref<any[]>([]);
const keyword = ref('');
const showAdd = ref(false);
const newWord = ref('');
const newCategory = ref('OTHER');

const filtered = computed(() =>
  keyword.value
    ? list.value.filter((w) => w.word.includes(keyword.value))
    : list.value,
);

onMounted(() => loadData());

async function loadData() {
  try {
    list.value = await getSensitiveWords();
  } catch {
    //
  }
}

async function handleAdd() {
  if (!newWord.value.trim()) return;
  try {
    await addSensitiveWord(newWord.value.trim(), newCategory.value || 'OTHER');
    newWord.value = '';
    newCategory.value = 'OTHER';
    await loadData();
    showToast('已添加');
  } catch {
    showToast('添加失败');
  }
}

async function handleDelete(id: number) {
  try {
    await deleteSensitiveWord(id);
    list.value = list.value.filter((w) => w.id !== id);
    showToast('已删除');
  } catch {
    showToast('删除失败');
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
</style>
