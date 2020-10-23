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
    X: "X",
    Y: "Y",
    Width: "Width",
    Height: "Height",
    ...enLocale
  },
  "zh-CN": {
    toggle: "切换",
    add: "新增",
    remove: "移除",
    key: "按键",
    alias: "别名",
    command: "命令",
    transparency: "透明度",
    X: "X",
    Y: "Y",
    Width: "宽",
    Height: "高",
    ...zhLocale
  }
}

export default messages;
