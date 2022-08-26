<template>
  <div class="app">
    <Editor v-model="state" ></Editor>
  </div>
</template>

<script>
//传入数据
import data from "./data.json";
import { ref, provide } from "vue";
//引入组件
import Editor from "./packages/editor";
//引入registerConfig
import { registerConfig as config } from "./utils/editor-config.jsx";


export default {
  name: "App",
  //注册组件
  components: {
    Editor,
  },
  setup() {
    //将data作为数据源
    const state = ref(data);

    //将组件配置config提供出去，通过一个组件可以渲染多个
    provide("config", config);

    
    return {
      state,

    };
  },
};
</script>

<style scoped>
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
