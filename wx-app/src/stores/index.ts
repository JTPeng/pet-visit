import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(
  piniaPluginPersistedstate({
    storage: {
      getItem: (key) => uni.getStorageSync(key) || null,
      setItem: (key, value) => uni.setStorageSync(key, value),
    },
  }),
);

export default pinia;
