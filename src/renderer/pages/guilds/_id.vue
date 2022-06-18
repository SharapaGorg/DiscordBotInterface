<template>
  <div class="root">
    <div class="channels-list" ref="channels">
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
        <p v-html="channel.name"></p>
        <img
          :src="getUser().displayAvatarURL" alt="" class="avatar"
          v-show="currentVoiceChannel === channel.id"
        />
      </div>

    </div>
    <div>
      <div class="settings">
        <div class="header">Guild settings</div>
        <div class="setting-button" @click="showBanList">Ban list</div>
        <div class="setting-button" @click="showInviteList">Invite list</div>
      </div>

      <div class="messages" ref="messages">
        <div v-show="settings.ban">
          <div class="ban-item">
            <span>Nickname</span>
            <span>Reason</span>
          </div>
          <div
            class="ban-item"
            v-for="ban in banList"
            :key="ban.id"
          >
            <span>{{ ban.tag }}</span>
            <span>{{ ban.reason }}</span>
            <div @click="unBan" class="list-button">Разбанить</div>
          </div>
        </div>

        <div v-show="settings.invite">
          <div class="ban-item">
            <span>Invite code</span>
            <span>Link</span>
            <div @click="_createInvite" class="list-button">Создать приглашение</div>
          </div>
          <div
            v-for="invite in inviteList"
            :key="invite.id"
            class="ban-item"
          >
            <span>{{ invite.code }}</span>
            <span>https://discord.com/invite/{{ invite.code }}</span>
          </div>
        </div>

        <div ref="content" v-show="!settingsActivated">
          <div
            class="actionButton"
            style="margin-left: auto; margin-right: auto"
            v-show="currentTextChannel"
            @click="extendMessages"
          >
            Еще 50 сообщений
          </div>

          <div
            v-for="message in currentMessages"
            :key="message.id"
            class="message"
          >
            <div class="message-header">
              <div>
                <img alt="" :src="getUserInfo(message['authorId']).displayAvatarURL" class="chat-avatar"/>

                <span class="author">
                  {{ getUserInfo(message['authorId']).displayName }}

                  <p class="bot" v-show="getUserInfo(message['authorId'])['bot']">
                    BOT
                  </p>
                </span>
              </div>

              <div class="user-id">{{ message['authorId'] }}</div>

              <span class="date">{{ _formatDate(message['createdTimestamp']) }}</span>

            </div>
            <span
              v-html="$md.render(message.content ? message.content : '*no-printed-content*')"
              class="message-content"
            ></span>
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
        <img class="bot-avatar" alt="" :src="getUser().displayAvatarURL"/>
        <span class="bot-tag">{{ getUser().tag }}</span>
        <div class="audio-icon">
          <svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V21H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1ZM12 4C11.2 4 11 4.66667 11 5V11C11 11.3333 11.2 12 12 12C12.8 12 13 11.3333 13 11V5C13 4.66667 12.8 4 12 4Z"
                  fill="currentColor"></path>
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V22H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1Z"
                  fill="currentColor"></path>
          </svg>
        </div>

        <div class='audio-icon'>
          <svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2 21.1071 2.895 22.0031 4 22.0031H6C7.104 22.0031 8 21.1071 8 20.0031V17.0031C8 15.8991 7.104 15.0031 6 15.0031H4V12.0031C4 7.59105 7.589 4.00305 12 4.00305C16.411 4.00305 20 7.59105 20 12.0031V15.0031H18C16.896 15.0031 16 15.8991 16 17.0031V20.0031C16 21.1071 16.896 22.0031 18 22.0031H20C21.104 22.0031 22 21.1071 22 20.0031V12.0031C22 6.48805 17.514 2.00305 12 2.00305Z"
                fill="currentColor"></path>
            </svg>
          </svg>
        </div>

        <div @click="exitChannel" class="audio-icon">
          <svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                  d="M21.1169 1.11603L22.8839 2.88403L19.7679 6.00003L22.8839 9.11603L21.1169 10.884L17.9999 7.76803L14.8839 10.884L13.1169 9.11603L16.2329 6.00003L13.1169 2.88403L14.8839 1.11603L17.9999 4.23203L21.1169 1.11603ZM18 22H13C6.925 22 2 17.075 2 11V6C2 5.447 2.448 5 3 5H7C7.553 5 8 5.447 8 6V10C8 10.553 7.553 11 7 11H6C6.063 14.938 9 18 13 18V17C13 16.447 13.447 16 14 16H18C18.553 16 19 16.447 19 17V21C19 21.553 18.553 22 18 22Z"></path>
          </svg>
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
      categoriesList: [],
      banList: [],
      inviteList: [],
      guild: [],
      textChannel: false,
      message: "",
      currentTextChannel: "",
      currentVoiceChannel: "",
      currentMessages: [],
      refresher: null,
      allMessages: {},
      guildUsers: {},
      settingsActivated: false,
      settings: {}
    };
  },
  methods: {
    getUser() {
      return this.$store.state.user
    },
    async apiRequest(method, options) {
      return await this.$axios.$post(api, {
        method: method,
        options: options
      })
    },
    async selectChannel(channel) {
      this.resetSettings()
      this.settingsActivated = false

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

          this.currentTextChannel = channel.id;

          this.allMessages[channel.id] = []

          await this.extendMessages()

          this.$nextTick(() => {
            this.$refs.messages.scrollTop = this.$refs.content.clientHeight;
          });

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
        : {displayName: "ACCESS DENIED # 0000"};
    },
    async extendMessages() {
      const currentLimit = this.allMessages[this.currentTextChannel].length;

      // get more messages
      let messages = await this.apiRequest('getMessagesFromChannel', {
        id: this.currentTextChannel,
        limit: currentLimit + 50
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
    _formatDate(timestamp) {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      let date = new Date(timestamp);

      let month = months[date.getMonth()]
      let day = date.getDate();
      let hours = date.getHours();
      let minutes = "0" + date.getMinutes();
      let seconds = "0" + date.getSeconds();

      return day + ' ' + month + ' | ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
    },
    async _getDiscordObject(method, id) {
      return await this.apiRequest(method, {
        guildId: id
      })
    },
    async _getUser(id) {
      return await this.apiRequest("getUser", {
        id: id
      })
    },
    async _getGuild(id) {
      return await this._getDiscordObject("getServer", id);
    },
    async _getChannelsList(id) {
      return await this._getDiscordObject("getChannelsList", id)
    },
    async _getMembersList(id) {
      return await this._getDiscordObject("getMembersList", id)
    },
    async _getCategoriesList(id) {
      return await this._getDiscordObject("getCategoriesList", id)
    },
    async _getBanList(id) {
      return await this._getDiscordObject("getBanList", id)
    },
    async _getInviteList(id) {
      return await this._getDiscordObject("getInviteList", id)
    },
    async _createInvite() {
      await this.apiRequest("createInvite", {
        channelId : this.channelsList[0].id
      })
    },
    _insertAt(array, index, ...elementsArray) {
      array.splice(index, 0, ...elementsArray)
    },
    resetSettings() {
      this.settings = {}
    },
    async showInviteList() {
      this.resetSettings()
      this.settingsActivated = true;

      this.settings.invite = true

      this.inviteList = await this._getInviteList(this.$route.params.id)
    },
    async showBanList() {
      this.resetSettings()
      this.settingsActivated = true;

      this.settings.ban = true

      const banList = await this._getBanList(this.$route.params.id)

      for (let ban of banList) {
        let user = await this._getUser(ban.user)

        ban.tag = user.tag
      }

      this.banList = banList
    },
    async unBan() {
      //
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
  async created() {
    const guildId = this.$route.params.id

    // get guild object
    this.guild = await this._getGuild(guildId)

    // get all user in current guild
    const members = await this._getMembersList(guildId)

    for (let member of members) {
      this.guildUsers[member['userId']] = member;
    }

    // get categories
    const categories = await this._getCategoriesList(guildId)

    // get channels
    const channels = await this._getChannelsList(guildId)

    this.upgradableBubbleSort(categories, "rawPosition")

    this.channelsList = categories

    // link each channel with special category (set each channel` position)
    for (let channel of channels) {
      const categoryId = channel['parentId']
      let index = 0;

      if (typeof categoryId !== 'undefined') {
        const category = categories.filter(c => c.id === categoryId)[0]
        index = categories.indexOf(category) + 1
      }

      this._insertAt(this.channelsList, index, channel)
    }


  }
};
</script>
