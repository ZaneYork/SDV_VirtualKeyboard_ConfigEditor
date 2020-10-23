// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueI18n from 'vue-i18n'
import messages from "./i18n/messages";
import {
  Row,
  Col,
  Button,
  Autocomplete,
  Option,
  Input,
  Slider,
  ColorPicker,
  Form,
  FormItem,
  Drawer
} from 'element-ui';
import ElementLocale from 'element-ui/lib/locale'
import VueKonva from 'vue-konva'

// register component to use
Vue.config.productionTip = false
Vue.use(VueI18n)

Vue.use(VueKonva)
Vue.component(Row.name, Row,);
Vue.component(Col.name, Col);
Vue.component(Button.name, Button);
Vue.component(Autocomplete.name, Autocomplete);
Vue.component(Option.name, Option);
Vue.component(Input.name, Input);
Vue.component(Slider.name, Slider);
Vue.component(ColorPicker.name, ColorPicker);
Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);
Vue.component(Drawer.name, Drawer);
ElementLocale.i18n((key, value) => i18n.t(key, value))

const i18n = new VueI18n({
  locale: navigator.language, // set locale
  messages, // set locale messages
})
window.onresize = setHtmlFontSize;

function setHtmlFontSize() {
  const htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
  const htmlDom = document.getElementsByTagName('html')[0];
  htmlDom.style.fontSize = htmlWidth / 10 + 'px';
}

setHtmlFontSize();
/* eslint-disable no-new */
new Vue({
  i18n,
  el: '#app',
  components: {App},
  template: '<App/>'
})
