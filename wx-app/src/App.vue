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
<style></style>
