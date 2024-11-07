// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
    strict: true,
    shim: true,
  },
  modules: ['@nuxt/eslint', '@vueuse/nuxt',],

  // https://eslint.nuxt.com
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
      },
    },
  },

  css: [
    '@/assets/css/main.css',
  ],

  ssr: true,
})