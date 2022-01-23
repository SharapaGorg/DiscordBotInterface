/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */


module.exports = {
  ssr: false,
  target: 'static',
  head: {
    title: 'discord-bot-interface',
    meta: [{charset: "utf-8"}]
  },
  loading: false,
  components: true,
  css: ['@/assets/main.css'],
  plugins: [],
  buildModules: [
  ],
  modules: ['@nuxtjs/axios', '@nuxtjs/markdownit'],
  axios : {},
  markdownit: {
    preset: 'default',
    linkify: true,
    breaks: true,
    typographer: true,
    runtime: true,
    html: false,
    use: [
      [
        'markdown-it-anchor',
        {
          level: 1,
          // slugify: string => string,
          permalink: true,
          // renderPermalink: (slug, opts, state, permalink) => {},
          permalinkClass: 'header-anchor',
          permalinkSymbol: '¶',
          permalinkBefore: true
        }
      ],
      'markdown-it-attrs',
      'markdown-it-div',
      'markdown-it-toc-done-right',
      'markdown-it-emoji'
    ]
  },
};
