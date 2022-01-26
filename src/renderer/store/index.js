import createPersistedState from "vuex-persistedstate";

export const state = () => ({
  api : 'http://localhost:4000/api'
})

export const mutations = {

}


export const actions = {}

export const getters = {}

export const plugins = [createPersistedState()]
