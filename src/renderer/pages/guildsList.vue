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
        <img :src="guild['iconURL']" />
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
          name: "NAME 1",
          id: 1,
        },
      ],
    };
  },
  methods: {
    setGuild(id) {
      this.$router.replace("/guilds/" + id);
    },
  },
  async created() {
    this.guilds = await this.$axios.$post(api, {
      method: "getServerList",
      options: {},
    });

    this.user = await this.$axios.$post(api, {
      method: "getBotUser",
      options: {},
    });

  },
};
</script>

<style scoped>
</style>
