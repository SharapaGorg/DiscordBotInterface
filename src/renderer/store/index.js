import createPersistedState from "vuex-persistedstate";

export const state = () => ({
  api : 'http://localhost:4000/api',
  user : {}
})

export const mutations = {
  setUser(state, user) {
    state.user = user
  },
}


export const actions = {}

export const getters = {}

export const plugins = [createPersistedState()]
