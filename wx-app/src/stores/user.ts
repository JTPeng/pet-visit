import { defineStore } from 'pinia';
import { wxLogin as apiWxLogin, bindPhone as apiBindPhone } from '../api/auth';
import { getMe, updateProfile as apiUpdateProfile } from '../api/user';
import { setToken, clearToken } from '../api/request';

interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  bio: string | null;
  phone: string | null;
  followerCount: number;
  followingCount: number;
}

interface UserState {
  token: string;
  userInfo: UserInfo | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: null,
  }),
  getters: {
    isLogin: (state) => Boolean(state.token),
    hasPhone: (state) => Boolean(state.userInfo?.phone),
  },
  actions: {
    async login() {
      let code = '';
      try {
        const res = await new Promise<UniApp.LoginRes>((resolve, reject) => {
          uni.login({ success: resolve, fail: reject });
        });
        code = res.code;
      } catch {
        return false;
      }

      try {
        const data = await apiWxLogin(code);
        this.token = data.token;
        setToken(data.token);
        this.userInfo = {
          id: data.user.id,
          nickname: data.user.nickname,
          avatar: data.user.avatar,
          bio: null,
          phone: data.user.phone,
          followerCount: 0,
          followingCount: 0,
        };
        return true;
      } catch {
        return false;
      }
    },

    async fetchMe() {
      if (!this.token) return;
      try {
        const data = await getMe();
        this.userInfo = {
          id: data.id,
          nickname: data.nickname,
          avatar: data.avatar,
          bio: data.bio,
          phone: data.phone,
          followerCount: data.followerCount,
          followingCount: data.followingCount,
        };
      } catch {
        this.logout();
      }
    },

    async updateProfile(payload: { nickname?: string; avatar?: string; bio?: string }) {
      const data = await apiUpdateProfile(payload);
      if (this.userInfo) {
        this.userInfo.nickname = data.nickname;
        this.userInfo.avatar = data.avatar;
        this.userInfo.bio = data.bio;
      }
    },

    async bindPhone(code: string) {
      const data = await apiBindPhone(code);
      if (this.userInfo) {
        this.userInfo.phone = data.phone;
      }
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      clearToken();
    },
  },
  persist: true,
});
