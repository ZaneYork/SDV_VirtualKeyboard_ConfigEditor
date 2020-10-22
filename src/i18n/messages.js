import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

const messages = {
  en: {
    toggle: "Toggle",
    add: "ADD",
    remove: "REMOVE",
    key: "Key",
    alias: "Alias",
    command: "Command",
    transparency: "Transparency",
    ...enLocale
  },
  zh: {
    toggle: "切换",
    add: "新增",
    remove: "移除",
    key: "按键",
    alias: "别名",
    command: "命令",
    transparency: "透明度",
    ...zhLocale
  }
}

export default messages;
