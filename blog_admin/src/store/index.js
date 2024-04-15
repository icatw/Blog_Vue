import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    collapse: false,
    tabList: [{ name: "首页", path: "/" }],
    userId: null,
    roleList: null,
    avatar: null,
    nickname: null,
    intro: null,
    webSite: null,
    userMenuList: [],
    token: {
      tokenName: "",
      tokenValue: ""
    }
  },
  getters: {
    getToken(state) {
      if (state.token && state.token.tokenName) {
        console.log("token.tokenName:" + state.token.tokenName);
        return state.token;
      } else {
        // 如果state.token不存在或者tokenName为空，则从localStorage中获取token
        return localStorage.getItem("token");
      }
    }
  },
  mutations: {
    setToken(state, token) {
      state.token.tokenName = token.tokenName;
      state.token.tokenValue = token.tokenValue;
      localStorage.setItem("token", JSON.stringify(token));
    },
    saveTab(state, tab) {
      if (state.tabList.findIndex(item => item.path === tab.path) == -1) {
        state.tabList.push({ name: tab.name, path: tab.path });
      }
    },
    removeTab(state, tab) {
      var index = state.tabList.findIndex(item => item.name === tab.name);
      state.tabList.splice(index, 1);
    },
    resetTab(state) {
      state.tabList = [{ name: "首页", path: "/" }];
    },
    trigger(state) {
      state.collapse = !state.collapse;
    },
    login(state, user) {
      state.userId = user.userId;
      state.roleList = user.roleList;
      state.avatar = user.avatar;
      state.nickname = user.nickname;
      state.intro = user.intro;
      state.webSite = user.webSite;
    },
    saveUserMenuList(state, userMenuList) {
      state.userMenuList = userMenuList;
    },
    logout(state) {
      state.userId = null;
      state.roleList = null;
      state.avatar = null;
      state.nickname = null;
      state.intro = null;
      state.webSite = null;
      state.userMenuList = [];
      state.token = {
        tokenName: "",
        tokenValue: ""
      };
    },
    updateAvatar(state, avatar) {
      state.avatar = avatar;
    },
    updateUserInfo(state, user) {
      state.nickname = user.nickname;
      state.intro = user.intro;
      state.webSite = user.webSite;
    }
  },
  actions: {},
  modules: {},
  plugins: [
    createPersistedState({
      storage: window.sessionStorage
    })
  ]
});
