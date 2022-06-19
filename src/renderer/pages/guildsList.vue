<template>
  <div class="root">
    <div class="guilds-list">
      <br />
      <div class="bot-info">
        <img :src="user.displayAvatarURL" />
        <br />
        <span>{{ user.tag }}</span>
      </div>
      <br />
      <div
        v-for="guild in guilds"
        :key="guild.id"
        class="guild"
        @click="setGuild(guild.id)"
      >
        <img :src="iconURL(guild)" />
        <span>{{ guild.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const api = "http://localhost:4000/api";

export default {
  name: "guildsList",
  data() {
    return {
      user: {
        tag: "",
        displayAvatarURL: "",
      },
      guilds: [
        {
          name: "Loading ...",
          id: 1,
        },
      ],
    };
  },
  methods: {
    setGuild(id) {
      this.$router.replace("/guilds/" + id);
    },
    resolve_img_url (path) {
      let images = require.context('../assets/', false, /\.png$|\.jpg$|\.svg$/)
      return images("./"+path)
    }
  },
  computed: {
    iconURL() {
      return (guild) => {
        if (guild.icon) {
          return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`
        }
        else {
          return this.resolve_img_url('discord.png')
        }
      }
    }
  },
  async created() {
    this.guilds = await this.$axios.$post(api, {
      method: "fetchListClient",
      options: {
        method : 'guilds'
      },
    });


    this.user = await this.$axios.$post(api, {
      method: "getBotUser",
      options: {},
    });

    this.$store.commit('setUser', this.user)
  },
};
</script>

<style scoped>
</style>
