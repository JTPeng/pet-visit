import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('./pages/Login.vue'),
    },
    {
      path: '/',
      component: () => import('./pages/Layout.vue'),
      redirect: '/moderation',
      children: [
        { path: 'moderation', component: () => import('./pages/Moderation.vue') },
        { path: 'reports', component: () => import('./pages/Reports.vue') },
        { path: 'words', component: () => import('./pages/Words.vue') },
        { path: 'users', component: () => import('./pages/Users.vue') },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token');
  if (!token && to.path !== '/login') {
    return '/login';
  }
});

export default router;
