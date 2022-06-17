<template>
  <div class="root">
    <div class="channels-list">
      <router-link to="/guildsList">
        <div class="actionButton">
          <span> <-- К списку серверов </span>
        </div>
      </router-link>

      <div
        @click="exitChannel"
        class='actionButton'>
        Отключиться от канала
      </div>

      <div
        class="channel"
        :style="{
          background: currentTextChannel === channel.id ? '#5865F2' : '#36393f',
          color: currentTextChannel === channel.id ? '#dcddde' : '#8e9297',
          paddingLeft: channel.type !== 'GUILD_CATEGORY' ? '30px' : '15px',
        }"
        v-for="channel in channelsList"
        :key="channel.id"
        @click="selectChannel(channel)"
      >
        <p v-html="channel.name + ' [' + channel.type.split('_')[1] + ']'"></p>
      </div>
    </div>
    <div>
      <div class="messages" ref="messages">
        <div ref="content">
          <div
            class="actionButton"
            style="margin-left: auto; margin-right: auto"
            v-show="currentTextChannel"
            @click="extendMessages"
          >
            Еще 10 сообщений
          </div>

          <div
            v-for="message in currentMessages"
            :key="message.id"
            class="message"
          >
            <span class="author">
              [{{ getUserInfo(message.authorId).tag }}] :
              {{ message.authorId }}
              <p class="bot" v-show="getUserInfo(message['authorId'])['bot']">
                BOT
              </p>
            </span>

            <span
              v-html="$md.render(message.content)"
              class="message-content"
            ></span>
            <!--            <img :src="'https://cdn.discordapp.com/attachments/' + currentTextChannel +'/' + message.id + '/unknown.png'"/>-->
            <!--            <span>{{ message }}</span>-->
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
      allMessages: {},
      guildUsers: {},
    };
  },
  methods: {
    async apiRequest(method, options) {
      const request = await this.$axios.$post(api, {
        method: method,
        options: options
      })

      return request
    },
    async selectChannel(channel) {
      switch (channel.type) {
        case 'GUILD_VOICE':
          this.textChannel = false;

          await this.apiRequest("joinChannel", {
            id: channel.id
          })
          break

        case 'GUILD_TEXT':
          this.textChannel = true;
          this.currentMessages = this.allMessages[channel.id];

          if (this.currentTextChannel !== channel.id) {
            this.currentMessages = this.currentMessages.reverse();
          }

          if (typeof this.currentMessages === "string") {
            this.currentMessages = [
              {
                authorId: "0000",
                content: "Access denied",
              }
            ];
          }

          this.$nextTick(() => {
            this.$refs.messages.scrollTop = this.$refs.content.clientHeight;
          });

          this.currentTextChannel = channel.id;

          break

        default:
          break
      }
    },
    async exitChannel() {
      await this.apiRequest('exitChannel', {
        guildId: this.guild.id
      })
    },
    getUserInfo(id) {
      return this.guildUsers[id]
        ? this.guildUsers[id]
        : {tag: "ACCESS DENIED # 0000"};
    },
    async extendMessages() {
      const currentLimit = this.allMessages[this.currentTextChannel].length;

      // get more messages
      let messages = await this.apiRequest('getMessagesFromChannel', {
        id: this.currentTextChannel,
        limit: currentLimit + 10
      })

      messages = messages.reverse();

      this.allMessages[this.currentTextChannel] = messages;
      this.currentMessages = messages;
    },
    async sendMessage() {
      await this.apiRequest("sendMessage", {
        chatId: this.currentTextChannel,
        message: this.message
      })

      this.message = "";
    },
    async _getUser(id) {
      const userInfo = await this.apiRequest("getUser", {
        id: id
      })

      return userInfo.data;
    },
    async _getChannel(id) {
      const channel = await this.apiRequest("getChannel", {
        id: id
      })

      return channel
    },
    async _getGuild(id) {
      const guild = await this.apiRequest("getServer", {
        id: id
      })

      return guild
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
    },
  },
  // GUILD_CATEGORY GUILD_TEXT GUILD_VOICE - types of channels
  mounted: async function () {
    this.guild = await this._getGuild(this.$route.params.id)

    // get all user in current guild
    const guildMembers = this.guild.members;

    for (const memberID of guildMembers) {
      const memberInfo = await this._getUser(memberID);
      this.guildUsers[memberID] = memberInfo;
    }

    const guildChannels = this.guild.channels;

    for (let i = 0; i < guildChannels.length; i++) {
      const channel = await this._getChannel(guildChannels[i])

      if (channel.type === 'GUILD_CATEGORY') {
        continue
      }

      // render channel
      this.channelsList.push(channel);

      // get current messages from current channel
      if (channel.type === "GUILD_TEXT") {
        this.allMessages[channel.id] = await this.apiRequest("getMessagesFromChannel", {
          id: channel.id,
          limit: 10
        });
      }
    }
    this.upgradableBubbleSort(this.channelsList, "rawPosition");

    // clear previous refresher
    clearInterval(this.refresher);
    // constant check for new messages using messageCreate event at backend (node.js)
    this.refresher = setInterval(async () => {
      let newMessages = await this.$axios.$post(api, {
        method: "getNewMessages",
        options: {},
      });

      for (let newMessage of newMessages) {
        if (!this.allMessages[newMessages["channelId"]]) {
          this.allMessages[newMessages["channelId"]] = [];
        }

        this.allMessages[newMessage["channelId"]].push(newMessage);
      }
    }, 500);
  },
};
</script>
