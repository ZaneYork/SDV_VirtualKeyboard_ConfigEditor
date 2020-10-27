import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import './plugins/element.js'
import './plugins/vue-konva.js'

Vue.config.productionTip = false

window.onresize = setHtmlFontSize;
function setHtmlFontSize() {
  const htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
  const htmlDom = document.getElementsByTagName('html')[0];
  htmlDom.style.fontSize = htmlWidth / 10 + 'px';
}
setHtmlFontSize();

new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
