<template>
  <div class="root">
    <div class="channels-list">
      <router-link to="/guildsList">
        <div class="backTap">
          <span>
              <-- К списку серверов
          </span>
        </div>
      </router-link>

      <div
        class="channel"
        :style="{
          background: currentTextChannel === channel.id ? '#5865F2' : '#36393f',
          color: currentTextChannel === channel.id ? '#dcddde' : '#8e9297',
          paddingLeft : channel.type !== 'GUILD_CATEGORY' ? '30px' : '15px'
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
        <div ref="content">
          <div
            v-for="message in currentMessages"
            :key="message.id"
            class="message"
          >
            <h3>{{ message['authorId'] }}</h3>
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
      refresher: null,
      allMessages : {}
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

        this.currentMessages = this.allMessages[channel.id].reverse();

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
      // this.allMessages[this.currentTextChannel].push({
      //   content : this.message,
      //   authorId : localStorage.getItem('discordToken')
      // });

      this.message = "";
    },
    upgradableBubbleSort(arr, value) {
      for (let i = 0, endI = arr.length - 1; i < endI; i++) {
        for (let j = 0, endJ = endI - i; j < endJ; j++) {
          if (arr[j][value] > arr[j + 1][value]) {
            let swap = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = swap;
          }
        }
      }
      return arr;
    }
  },
// GUILD_CATEGORY GUILD_TEXT GUILD_VOICE - types of channels
  mounted: async function () {
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

      if (channel.type !== 'GUILD_CATEGORY') {
        // render channel
        this.channelsList.push(channel);
        // get current messages from current channel
        if (channel.type === 'GUILD_TEXT') {
          let currentMessages = await this.$axios.$post(api, {
            method: 'getMessagesFromChannel',
            options: {
              id: channel.id
            }
          });

          this.allMessages[channel.id] = currentMessages;
        }
      }
    }
    this.upgradableBubbleSort(this.channelsList, 'rawPosition');

    // clear previous refresher
    clearInterval(this.refresher);
    // constant check for new messages using messageCreate event at backend (node.js)
    this.refresher = setInterval(async () => {
      let newMessages = await this.$axios.$post(api, {
        method: 'getNewMessages',
        options: {}
      })

      for (let newMessage of newMessages) {
        if (!this.allMessages[newMessages['channelId']]) {
          this.allMessages[newMessages['channelId']] = [];
        }

        this.allMessages[newMessage['channelId']].push(newMessage);
      }

    }, 500);
  },
}
</script>
