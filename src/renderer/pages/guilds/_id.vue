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

        <div v-html="channelTypeIcon(channel)" class="channel-type"></div>

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
              <div style="display : inline-block">
                <img alt="" :src="authorInfo(message).displayAvatarURL" class="chat-avatar"/>

                <span class="author">
                  {{ authorInfo(message).displayName }}

                </span>
              </div>

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
      settings: {},
      guildId: ''
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
      await this.apiRequest('exitVoiceChannel', {
        guildId: this.guild.id
      })

      this.currentVoiceChannel = ""
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
    async _getSubjectGuild(id, settlement) {
      return await this.apiRequest("getSubjectGuild", {
        guildId: this.guildId,
        id: id,
        settlement: settlement,
      })
    },
    async _getSubjectClient(id, settlement) {
      return await this.apiRequest("getSubjectClient", {
        id: id,
        settlement: settlement
      })
    },
    async _getGuildData(id, method) {
      return await this.apiRequest("fetchListGuild", {
        guildId: id,
        method: method
      })
    },
    async _getClientData(method) {
      return await this.apiRequest("fetchListClient", {
        method: method
      })
    },
    async _createInvite() {
      await this.apiRequest("createInvite", {
        channelId: this.channelsList[0].id
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

      // this.inviteList = await this._getInviteList(this.$route.params.id)
      this.inviteList = await this._getGuildData(this.$route.params.id, "invites")
    },
    async showBanList() {
      this.resetSettings()
      this.settingsActivated = true;

      this.settings.ban = true

      const banList = await this._getGuildData(this.guildId, "bans")

      for (let ban of banList) {
        let user = await this._getSubjectClient(ban.user, "users")

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
    },
    resolve_img_url(path) {
      let images = require.context('../../assets/', false, /\.png$|\.jpg$|\.svg$/)
      return images("./" + path)
    }
  },
  computed: {
    authorInfo() {
      return (message) => {
        let user = this.guildUsers[message['authorId']]

        if (!user) {
          user = {
            'displayName': 'UNDEFINED',
            'displayAvatarURL': this.resolve_img_url('discord.png')
          }
        }
        return user
      }
    },
    channelTypeIcon() {
      return (channel) => {
        let content;
        switch (channel.type) {
          case 'GUILD_TEXT':
            content = `<svg height=20' width='20' viewBox="0 0 24 24"><path fill="#8e9297" fill-rule="evenodd" clip-rule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path></svg>`
            break
          case 'GUILD_VOICE':
            content = `<svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24"><path fill="#8e9297" fill-rule="evenodd" clip-rule="evenodd" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z" aria-hidden="true"></path></svg>`

            break
          case 'GUILD_STAGE_VOICE':
            content = `<svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24" fill="#8e9297"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5 17.8 9.94 16.5 12 16.5C14.06 16.5 15.5 17.8 15.5 19.5V20H8.5ZM7 13C7 10.24 9.24 8 12 8C14.76 8 17 10.24 17 13C17 13.91 16.74 14.75 16.31 15.49L17.62 16.25C18.17 15.29 18.5 14.19 18.5 13C18.5 9.42 15.58 6.5 12 6.5C8.42 6.5 5.5 9.42 5.5 13C5.5 14.18 5.82 15.29 6.38 16.25L7.69 15.49C7.26 14.75 7 13.91 7 13ZM2.5 13C2.5 7.75 6.75 3.5 12 3.5C17.25 3.5 21.5 7.75 21.5 13C21.5 14.73 21.03 16.35 20.22 17.75L21.51 18.5C22.45 16.88 23 15 23 13C23 6.93 18.07 2 12 2C5.93 2 1 6.93 1 13C1 15 1.55 16.88 2.48 18.49L3.77 17.74C2.97 16.35 2.5 14.73 2.5 13Z" fill="currentColor"></path></svg>`

            break

          case 'GUILD_NEWS':
            content =`<svg width="20" height="20" viewBox="0 0 24 24" fill="#8e9297"><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M22.545 4.87988V5.87988H23.28C23.4126 5.87988 23.52 5.98733 23.52 6.11988V10.6399C23.52 10.7724 23.4126 10.8799 23.28 10.8799H17.76C17.6275 10.8799 17.52 10.7724 17.52 10.6399V6.11988C17.52 5.98733 17.6275 5.87988 17.76 5.87988H18.52V4.87988C18.52 3.75988 19.47 2.87988 20.52 2.87988C21.57 2.87988 22.545 3.75988 22.545 4.87988ZM19.52 5.87988H21.52V4.87988C21.52 4.30845 21.0534 3.87988 20.52 3.87988C19.9867 3.87988 19.52 4.30845 19.52 4.87988V5.87988Z"></path><path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M4.85 8.26429L15.84 5.84426V10.5599C15.84 11.6202 16.6996 12.4799 17.76 12.4799H21V19.0586H19.1V17.9302L12.7065 16.524L10.36 19.6233C10.1776 19.8633 9.89545 19.9998 9.6 19.9998C9.524 19.9998 9.4461 19.9904 9.3701 19.9725L5.5701 19.0313C5.1464 18.925 4.85 18.5495 4.85 18.1175V8.26429ZM9.2181 17.9942L6.75 17.3824V15.2111L10.6706 16.0751L9.2181 17.9942Z"></path><path d="M3.9 8.25981H2V15.2939H3.9V8.25981Z" fill="currentColor"></path></svg>`

            break

          default:
            console.log(channel.type)
            break
        }

        return content
      }
    }
  },
  async created() {
    this.guildId = this.$route.params.id

    // get guild object
    this.guild = await this._getSubjectClient(this.guildId, 'guilds')

    // get all user in current guild
    const members = await this._getGuildData(this.guildId, "members")

    for (let member of members) {
      this.guildUsers[member['userId']] = member;
    }

    // get all channels
    const allChannels = await this._getGuildData(this.guildId, "channels")

    // get categories
    const categories = allChannels.filter(c => c.type === 'GUILD_CATEGORY')

    // get text | voice | ... channels
    const channels = allChannels.filter(c => c.type !== 'GUILD_CATEGORY')

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
