<template>
  <div id="app">
    <div class="chat-container">

      <!-- 模型选择 -->
      <div class="model-select">
        <label for="model">选择模型: </label>
        <el-select v-model="selectedModel" @change="updateUrl" id="model">
          <el-option label="ErnieBot" value="ErnieBot"></el-option>
          <el-option label="ErnieBot-Turbo" value="ErnieBot-Turbo"></el-option>
          <el-option label="BloomZ-7B" value="BloomZ-7B"></el-option>
        </el-select>
      </div>

      <div class="chat-box">
        <!-- Display Messages -->
        <el-scrollbar wrap-class="message-list">
          <el-card v-for="message in messages" :key="message.id" class="message-card">
            <template #header>
              <img v-if="message.isUser" class="avatar" :src="avatar"/>
              <img v-else class="avatar" src="../../assets/wenxin.png"/>
            </template>
            <div class="message-content" v-html="parseMarkdown(message.text)"/>
          </el-card>
        </el-scrollbar>
      </div>

      <!-- Input Box -->
      <div class="input-container">
        <el-input
            v-model="newMessage"
            @keydown.native="handleKeyDown"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            placeholder="请输入消息..."
            :class="{'focused': isInputFocused}"
            class="input-height resizable-textarea"
            type="textarea"
            autosize
        />
        <el-button
            :loading="isSending"
            @click="sendMessage"
            type="primary"
            class="send-button"
        >
          发送
        </el-button>
      </div>

    </div>
  </div>
</template>

<script>
import hljs from "highlight.js";
import Clipboard from "clipboard";
import tocbot from "tocbot";
// const MarkdownIt = require('@alias/markdown-it');
// import { ElSelect, ElOption, ElButton, ElInput, ElLoading } from 'element-plus';

export default {
  components: {
    // ElSelect,
    // ElOption,
    // ElButton,
    // ElInput,
    // ElLoading,
  },
  destroyed() {
    this.clipboard.destroy();
  },
  data() {
    return {
      avatar: this.$store.state.avatar ? this.$store.state.avatar : this.$store.state.blogInfo.websiteConfig.touristAvatar,
      AI_avatar: this.$store.state.avatar ? this.$store.state.avatar : this.$store.state.blogInfo.websiteConfig.touristAvatar,
      messages: [],
      clipboard: null,
      newMessage: '',
      selectedModel: 'ErnieBot-Turbo',
      apiUrl: '/api/wenxin/turbo/param/chats',
      isInputFocused: false,
      isSending: false,
      userId: this.$store.state.userId ? this.$store.state.avatar : Math.floor(Math.random() * 900000) + 100000,
    };
  },

  methods: {
    parseMarkdown(text) {
      const MarkdownIt = require("markdown-it");
      const hljs = require("highlight.js");
      const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
          // 当前时间加随机数生成唯一的id标识
          var d = new Date().getTime();
          if (
              window.performance &&
              typeof window.performance.now === "function"
          ) {
            d += performance.now();
          }
          const codeIndex = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
              /[xy]/g,
              function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
              }
          );
          // 复制功能主要使用的是 clipboard.js
          let html = `<button class="copy-btn iconfont iconfuzhi" type="button" data-clipboard-action="copy" data-clipboard-target="#copy${codeIndex}"></button>`;
          const linesLength = str.split(/\n/).length - 1;
          // 生成行号
          let linesNum = '<span aria-hidden="true" class="line-numbers-rows">';
          for (let index = 0; index < linesLength; index++) {
            linesNum = linesNum + "<span></span>";
          }
          linesNum += "</span>";
          if (lang && hljs.getLanguage(lang)) {
            // highlight.js 高亮代码
            const preCode = hljs.highlight(lang, str, true).value;
            html = html + preCode;
            if (linesLength) {
              html += '<b class="name">' + lang + "</b>";
            }
            // 将代码包裹在 textarea 中，由于防止textarea渲染出现问题，这里将 "<" 用 "<" 代替，不影响复制功能
            return `<pre class="hljs"><code>${html}</code>${linesNum}</pre><textarea style="position: absolute;top: -9999px;left: -9999px;z-index: -9999;" id="copy${codeIndex}">${str.replace(
                /<\/textarea>/g,
                "</textarea>"
            )}</textarea>`;
          }
        }
      });
      // 将markdown替换为html标签
      const html = md.render(text);
      // 添加代码复制功能
      this.$nextTick(() => {
        // 添加代码复制功能
        this.clipboard = new Clipboard(".copy-btn");
        this.clipboard.on("success", () => {
          this.$toast({type: "success", message: "复制成功"});
        });
      });
      return html
    },

    updateUrl() {
      if (this.selectedModel === 'ErnieBot') {
        this.apiUrl = '/api/wenxin/ernie/param/chats';
      } else if (this.selectedModel === 'ErnieBot-Turbo') {
        this.apiUrl = '/api/wenxin/turbo/param/chats';
      } else if (this.selectedModel === 'BloomZ-7B') {
        this.apiUrl = '/api/wenxin/bloomz7b/param/chats';
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim()) return;

      this.isSending = true;

      this.messages.push({
        id: Date.now(),
        text: this.newMessage,
        isUser: true,
      });

      const response = await this.axios.post(this.apiUrl, {
            userId: this.userId,
            content: this.newMessage,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
      ).then((res) => {
        if (res.data && res.data.result) {
          const data = res.data;
          this.messages.push({
            id: Date.now(),
            text: data.result,
            isAssistant: true,
          });
        } else {
          // 弹框提示系统异常
          this.$message.error(res.data.message);
        }
      }).catch((err) => console.log(err));
      this.newMessage = '';
      this.isSending = false;

    },

    handleKeyDown(event) {
      if (event.key === 'Enter' && !event.altKey) {
        event.preventDefault();
        this.sendMessage();
      } else if (event.key === 'Enter' && event.altKey) {
        this.newMessage += '\n';
      }
    },
  },
};
</script>

<style scoped>
.chat-container {
  max-width: 1080px;
  margin: 30px auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 95vh;
  background-color: #fff;
}

.el-card__body {
  padding: 10px;
}

.chat-box {
  flex: 1;
  overflow-y: auto;
}

.input-container {
  display: flex;
  align-items: center;
}

.message-list {
  max-height: calc(90vh - 100px);
  padding: 10px;
  box-sizing: border-box;
}

.message-card {
  margin-bottom: 10px;
  padding: 1px;
  width: 99%;
}

.model-select {
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  margin-right: 10px;
}

.message-card::v-deep .el-card__header {
  padding-top: 7px;
  padding-bottom: 5px;
  padding-left: 7px;
}

.input-height {
  width: 100%;
  font-size: 14px;
  border-radius: 10px;
  align-items: center;
}

.send-button {
  min-height: 20px;
  margin-left: 10px;
  border-radius: 10px;
}

</style>