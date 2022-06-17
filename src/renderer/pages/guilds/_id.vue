<template>
  <div class="root">
    <div class="channels-list">
      <router-link to="/guildsList">
        <div class="actionButton">
          <span> <-- К списку серверов </span>
        </div>
      </router-link>

      <div
        class="channel"
        :style="{
          background: currentTextChannel === channel.id ? '#5865F2' : '#2f3136',
          color: currentTextChannel === channel.id ? '#dcddde' : '#8e9297',
          paddingLeft: channel.type !== 'GUILD_CATEGORY' ? '30px' : '15px',
        }"
        v-for="channel in channelsList"
        :key="channel.id"
        @click="selectChannel(channel)"
      >
        <p v-html="channel.name + ' [' + channel.type.split('_')[1] + ']'"></p>
        <img
          :src="getUser().displayAvatarURL" alt="" class="avatar"
          v-show="currentVoiceChannel === channel.id"
        />
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

    <div class="audio-panel">
      <div>
        <div class="audio-icon">
          <svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V21H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1ZM12 4C11.2 4 11 4.66667 11 5V11C11 11.3333 11.2 12 12 12C12.8 12 13 11.3333 13 11V5C13 4.66667 12.8 4 12 4Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V22H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1Z" fill="currentColor"></path></svg>
        </div>

        <div class='audio-icon'>
          <svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2 21.1071 2.895 22.0031 4 22.0031H6C7.104 22.0031 8 21.1071 8 20.0031V17.0031C8 15.8991 7.104 15.0031 6 15.0031H4V12.0031C4 7.59105 7.589 4.00305 12 4.00305C16.411 4.00305 20 7.59105 20 12.0031V15.0031H18C16.896 15.0031 16 15.8991 16 17.0031V20.0031C16 21.1071 16.896 22.0031 18 22.0031H20C21.104 22.0031 22 21.1071 22 20.0031V12.0031C22 6.48805 17.514 2.00305 12 2.00305Z" fill="currentColor"></path></svg></svg>
        </div>

        <div @click="exitChannel" class="audio-icon">
          <svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M21.1169 1.11603L22.8839 2.88403L19.7679 6.00003L22.8839 9.11603L21.1169 10.884L17.9999 7.76803L14.8839 10.884L13.1169 9.11603L16.2329 6.00003L13.1169 2.88403L14.8839 1.11603L17.9999 4.23203L21.1169 1.11603ZM18 22H13C6.925 22 2 17.075 2 11V6C2 5.447 2.448 5 3 5H7C7.553 5 8 5.447 8 6V10C8 10.553 7.553 11 7 11H6C6.063 14.938 9 18 13 18V17C13 16.447 13.447 16 14 16H18C18.553 16 19 16.447 19 17V21C19 21.553 18.553 22 18 22Z"></path></svg>
        </div>
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
      currentVoiceChannel : "",
      currentMessages: [],
      refresher: null,
      allMessages: {},
      guildUsers: {},
    };
  },
  methods: {
    getUser() {
      return this.$store.state.user
    },
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
          this.currentVoiceChannel = channel.id

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

      this.currentVoiceChannel = ""
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
