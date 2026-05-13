<template>
  <div class="login-page">
    <div class="login-card">
      <h2>宠物上门 · 管理后台</h2>
      <van-form @submit="handleLogin">
        <van-cell-group inset>
          <van-field v-model="form.username" label="账号" placeholder="请输入管理员账号" :rules="[{ required: true }]" />
          <van-field v-model="form.password" type="password" label="密码" placeholder="请输入密码" :rules="[{ required: true }]" />
        </van-cell-group>
        <div class="btn-wrap">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { adminLogin } from '../api';

const router = useRouter();
const loading = ref(false);
const form = reactive({ username: '', password: '' });

async function handleLogin() {
  loading.value = true;
  try {
    const res = await adminLogin(form.username, form.password);
    localStorage.setItem('admin_token', res.token);
    router.replace('/');
  } catch (err: any) {
    showToast(err?.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 16px;
}
.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 32px 16px;
}
.login-card h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 20px;
  color: #333;
}
.btn-wrap {
  margin: 24px 16px 0;
}
</style>
