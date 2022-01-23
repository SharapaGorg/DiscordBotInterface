<template>
  <div class="root">
    <div class="channels-list">
      <div
        class="channel"
        :style="{
          background: currentTextChannel === channel.id ? '#5865F2' : '#36393f',
          color : currentTextChannel === channel.id ? '#dcddde' : '#8e9297'
        }"
        v-for="channel in channelsList"
        :key="channel.id"
        @click="selectChannel(channel)"
      >
        <h2>{{ channel.name }} [{{ channel.type.split("_")[1] }}]</h2>
      </div>
    </div>
    <div>
      <div class="messages" ref="messages">
        <div ref='content'>
          <div
            v-for="message in currentMessages"
            :key="message.id"
            class="message"
          >
            <h3>{{ message.authorId }}</h3>
            <span v-html="$md.render(message.content)"></span>
          </div>
        </div>
      </div>
      <div class="message-field" v-show="currentTextChannel">
        <input
          placeholder="Message content"
          v-model="message"
          v-on:keyup.enter="sendMessage"
        />
        <div class="sent-message"></div>
      </div>
    </div>
  </div>
</template>

<script>
const api = "http://localhost:4000/api";

export default {
  data() {
    return {
      channelsList: [],
      guild: [],
      textChannel: false,
      message: "",
      currentTextChannel: "",
      currentMessages: [],
    };
  },
  methods: {
    async selectChannel(channel) {
      if (channel.type === "GUILD_VOICE") {
        this.textChannel = false;
        this.currentTextChannel = "";
      }
      if (channel.type === "GUILD_TEXT") {
        this.textChannel = true;
        this.currentTextChannel = channel.id;

        const messages = await this.$axios.$post(api, {
          method: "getMessagesFromChannel",
          options: {
            id: channel.id,
          },
        });
        this.currentMessages = messages.reverse();
        console.log(this.currentMessages[0])

        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.content.clientHeight;
        });
      }
    },
    async sendMessage() {
      await this.$axios.$post(api, {
        method: "sendMessage",
        options: {
          chatId: this.currentTextChannel,
          message: this.message,
        },
      });
      this.message = "";
    },
  },
  // GUILD_CATEGORY GUILD_TEXT GUILD_VOICE - types of channels
  async mounted() {
    // get channels id in current guild
    this.guild = await this.$axios.$post(api, {
      method: "getServer",
      options: {
        id: this.$route.params.id,
      },
    });

    const guildChannels = this.guild.channels;

    for (let i = 0; i < guildChannels.length; i++) {
      const channel = await this.$axios.$post(api, {
        method: "getChannel",
        options: {
          id: guildChannels[i],
        },
      });

      if (channel["type"] !== "GUILD_CATEGORY") {
        this.channelsList.push(channel);
      }
    }
  },
};
</script>
