<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from './stores/user';
import { getToken } from './api/request';

onLaunch(async () => {
  const userStore = useUserStore();
  const token = getToken();

  if (token) {
    userStore.token = token;
    await userStore.fetchMe();
  } else {
    await userStore.login();
  }
});

onShow(() => {});
onHide(() => {});
</script>
<style>
page {
  background-color: #faf8f5;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  color: #2d2d2d;
  font-size: 28rpx;
  line-height: 1.6;
}
button {
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
}
button::after {
  border: none;
}
</style>
