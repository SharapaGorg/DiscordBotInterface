<template>
  <div class="root">
    <div style="height : 45vh;"></div>
    <div class="token-field">
      <input placeholder='TOKEN' v-model="token"/>
    </div>
    <div class="token-button" @click="startBot">
      <span>Загрузиться в бота</span>
    </div>
  </div>
</template>

<script>

const api = 'http://localhost:4000/api'

export default {
  name: 'IndexPage',
  data() {
    return {
      token: ''
    }
  },
  mounted() {
    if (localStorage.getItem('discordToken')) {
      this.token = localStorage.getItem('discordToken');
    }
  },
  methods: {
    async startBot() {
      await this.$axios.$post(api, {
        method: 'startBot',
        options : {
          token : this.token
        }
      });

      localStorage.setItem('discordToken', this.token);
      this.$router.push('/guildsList');
    }
  }
}
</script>

