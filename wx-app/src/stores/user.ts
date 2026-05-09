import { defineStore } from 'pinia';

interface UserState {
  token: string;
  openid: string;
  nickname: string;
  avatar: string;
  phone: string;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    openid: '',
    nickname: '',
    avatar: '',
    phone: '',
  }),
  getters: {
    isLogin: (state) => Boolean(state.token),
    hasPhone: (state) => Boolean(state.phone),
  },
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    logout() {
      this.$reset();
    },
  },
  persist: true,
});
