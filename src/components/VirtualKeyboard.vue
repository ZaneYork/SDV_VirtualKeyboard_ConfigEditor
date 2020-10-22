<template>
  <div>
    <div :grid='grid' @click="onParentClick"
         :style="{height: height+'px', width: width + 'px',
                  border: '1px solid #13a8d5', position: 'relative',
                  transform: 'scale(' + scale +')', 'transform-origin': '0 0',
                  'margin-bottom': '-' + height*(1-scale) + 'px'}">
      <vue-draggable-resizable :parent="true" className="vdr button button-vtg"
                               @dragging="(x,y)=>onDrag(config.vToggle,x,y)" :resizable="false" :scale="scale"
                               @resizing="(x, y, width, height)=>onResize(config.vToggle,x, y, width, height)"
                               :w="config.vToggle.rectangle.Width"
                               :h="config.vToggle.rectangle.Height"
                               :x="config.vToggle.rectangle.X"
                               :y="config.vToggle.rectangle.Y">
        <p class="button-text" @click="toggle">{{$t('toggle')}}</p>
      </vue-draggable-resizable>
      <vue-draggable-resizable v-for="button in config.buttons" :key="firstNotEmpty(button.id, button.key)"
                               :parent="true" className="vdr button" :resizable="false" :scale="scale"
                               @dragging="(x,y)=>onDrag(button,x,y)"
                               @resizing="(x, y, width, height)=>onResize(button,x, y, width, height)"
                               @activated="()=>onActivated(button)"
                               :w="button.rectangle.Width"
                               :h="button.rectangle.Height"
                               :x="button.rectangle.X"
                               :y="button.rectangle.Y">
        <p class="button-text">{{firstNotEmpty(button.alias, button.key)}}</p>
      </vue-draggable-resizable>
      <vue-draggable-resizable v-for="button in config.buttonsExtend" :key="firstNotEmpty(button.id, button.key)"
                               :parent="true" className="vdr button button-ext" v-if="toggleState" :resizable="false" :scale="scale"
                               @dragging="(x,y)=>onDrag(button,x,y)"
                               @resizing="(x, y, width, height)=>onResize(button,x, y, width, height)"
                               @activated="()=>onActivated(button)"
                               :w="button.rectangle.Width"
                               :h="button.rectangle.Height"
                               :x="button.rectangle.X"
                               :y="button.rectangle.Y">
        <p class="button-text">{{firstNotEmpty(button.alias, button.key)}}</p>
      </vue-draggable-resizable>
    </div>
    <el-drawer
      title=""
      :visible.sync="drawer"
      :direction="rtl"
      size="40%"
      :wrapperClosable="false"
      :show-close="true"
      :with-header="true">
      <el-form ref="form" label-width="50px">
        <el-form-item :label="$t('X')">
          <el-slider
            v-model="currentButton.rectangle.X"
            :max="width" :min="0" :step="5"
            show-input>
          </el-slider>
        </el-form-item>
        <el-form-item :label="$t('Y')">
          <el-slider
            v-model="currentButton.rectangle.Y"
            :max="height" :min="0" :step="5"
            show-input>
          </el-slider>
        </el-form-item>
        <el-form-item :label="$t('Width')">
          <el-slider
            v-model="currentButton.rectangle.Width"
            :max="width" :min="5" :step="5"
            show-input>
          </el-slider>
        </el-form-item>
        <el-form-item :label="$t('Height')">
          <el-slider
            v-model="currentButton.rectangle.Height"
            :max="height" :min="5" :step="5"
            show-input>
          </el-slider>
        </el-form-item>
      </el-form>
    </el-drawer>
    <draggable
      :distanceRight='0'
      :distanceBottom='100'
      :isScrollHidden='false'
      :isCanDraggable='true'
      :zIndex="100">
      <el-button type="primary" icon="el-icon-edit" circle @click="drawer=true"></el-button>
    </draggable>
    <el-form ref="form" label-width="80px">
      <el-form-item :label="$t('key')">
        <el-select v-model="currentButton.key" filterable :placeholder="$t('key')">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('alias')">
        <el-col :span="10">
          <el-input v-model="currentButton.alias" :placeholder="$t('alias')"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('command')">
        <el-col :span="10">
          <el-input v-model="currentButton.command" :placeholder="$t('command')"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('transparency')">
        <el-row>
          <el-col :span="2">
            <el-color-picker v-model="color" show-alpha disabled></el-color-picker>
          </el-col>
          <el-col :span="22">
            <el-slider
              v-model="currentButton.transparency"
              :max="1" :min="0" :step="0.01"
              show-input>
            </el-slider>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item :label="$t('X')">
        <el-slider
          v-model="currentButton.rectangle.X"
          :max="width" :min="0" :step="5"
          show-input>
        </el-slider>
      </el-form-item>
      <el-form-item :label="$t('Y')">
        <el-slider
          v-model="currentButton.rectangle.Y"
          :max="height" :min="0" :step="5"
          show-input>
        </el-slider>
      </el-form-item>
      <el-form-item :label="$t('Width')">
        <el-slider
          v-model="currentButton.rectangle.Width"
          :max="width" :min="5" :step="5"
          show-input>
        </el-slider>
      </el-form-item>
      <el-form-item :label="$t('Height')">
        <el-slider
          v-model="currentButton.rectangle.Height"
          :max="height" :min="5" :step="5"
          show-input>
        </el-slider>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onAddButton">{{$t('add')}}</el-button>
        <el-button type="danger" @click="onRemoveButton">{{$t('remove')}}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {v4 as uuidv4} from 'uuid';
  import Draggable from 'vue-draggable-float'

  export default {
    components:{Draggable},
    data: function () {
      return {
        grid: [5, 5],
        scale: 0.4,
        width: 1280,
        height: 720,
        toggleState: true,
        drawer: false,
        currentButton: {
          key: '',
          alias: '',
          command: '',
          rectangle: {X: 0, Y: 0, Width: 90, Height: 90},
          transparency: 0.5
        },
        options: [
          {label: "None", value: "None"},
          {label: "MouseLeft", value: "MouseLeft"},
          {label: "MouseRight", value: "MouseRight"},
          {label: "MouseMiddle", value: "MouseMiddle"},
          {label: "MouseX1", value: "MouseX1"},
          {label: "MouseX2", value: "MouseX2"},
          {label: "ControllerA", value: "ControllerA"},
          {label: "ControllerB", value: "ControllerB"},
          {label: "ControllerX", value: "ControllerX"},
          {label: "ControllerY", value: "ControllerY"},
          {label: "ControllerBack", value: "ControllerBack"},
          {label: "ControllerStart", value: "ControllerStart"},
          {label: "DPadUp", value: "DPadUp"},
          {label: "DPadDown", value: "DPadDown"},
          {label: "DPadLeft", value: "DPadLeft"},
          {label: "DPadRight", value: "DPadRight"},
          {label: "LeftShoulder", value: "LeftShoulder"},
          {label: "RightShoulder", value: "RightShoulder"},
          {label: "LeftTrigger", value: "LeftTrigger"},
          {label: "RightTrigger", value: "RightTrigger"},
          {label: "LeftStick", value: "LeftStick"},
          {label: "RightStick", value: "RightStick"},
          {label: "BigButton", value: "BigButton"},
          {label: "LeftThumbstickLeft", value: "LeftThumbstickLeft"},
          {label: "LeftThumbstickRight", value: "LeftThumbstickRight"},
          {label: "LeftThumbstickDown", value: "LeftThumbstickDown"},
          {label: "LeftThumbstickUp", value: "LeftThumbstickUp"},
          {label: "RightThumbstickLeft", value: "RightThumbstickLeft"},
          {label: "RightThumbstickRight", value: "RightThumbstickRight"},
          {label: "RightThumbstickDown", value: "RightThumbstickDown"},
          {label: "RightThumbstickUp", value: "RightThumbstickUp"},
          {label: "A", value: "A"},
          {label: "Add", value: "Add"},
          {label: "Apps", value: "Apps"},
          {label: "Attn", value: "Attn"},
          {label: "B", value: "B"},
          {label: "Back", value: "Back"},
          {label: "BrowserBack", value: "BrowserBack"},
          {label: "BrowserFavorites", value: "BrowserFavorites"},
          {label: "BrowserForward", value: "BrowserForward"},
          {label: "BrowserHome", value: "BrowserHome"},
          {label: "BrowserRefresh", value: "BrowserRefresh"},
          {label: "BrowserSearch", value: "BrowserSearch"},
          {label: "BrowserStop", value: "BrowserStop"},
          {label: "C", value: "C"},
          {label: "CapsLock", value: "CapsLock"},
          {label: "ChatPadGreen", value: "ChatPadGreen"},
          {label: "ChatPadOrange", value: "ChatPadOrange"},
          {label: "Crsel", value: "Crsel"},
          {label: "D", value: "D"},
          {label: "D0", value: "D0"},
          {label: "D1", value: "D1"},
          {label: "D2", value: "D2"},
          {label: "D3", value: "D3"},
          {label: "D4", value: "D4"},
          {label: "D5", value: "D5"},
          {label: "D6", value: "D6"},
          {label: "D7", value: "D7"},
          {label: "D8", value: "D8"},
          {label: "D9", value: "D9"},
          {label: "Decimal", value: "Decimal"},
          {label: "Delete", value: "Delete"},
          {label: "Divide", value: "Divide"},
          {label: "Down", value: "Down"},
          {label: "E", value: "E"},
          {label: "End", value: "End"},
          {label: "Enter", value: "Enter"},
          {label: "EraseEof", value: "EraseEof"},
          {label: "Escape", value: "Escape"},
          {label: "Execute", value: "Execute"},
          {label: "Exsel", value: "Exsel"},
          {label: "F", value: "F"},
          {label: "F1", value: "F1"},
          {label: "F10", value: "F10"},
          {label: "F11", value: "F11"},
          {label: "F12", value: "F12"},
          {label: "F13", value: "F13"},
          {label: "F14", value: "F14"},
          {label: "F15", value: "F15"},
          {label: "F16", value: "F16"},
          {label: "F17", value: "F17"},
          {label: "F18", value: "F18"},
          {label: "F19", value: "F19"},
          {label: "F2", value: "F2"},
          {label: "F20", value: "F20"},
          {label: "F21", value: "F21"},
          {label: "F22", value: "F22"},
          {label: "F23", value: "F23"},
          {label: "F24", value: "F24"},
          {label: "F3", value: "F3"},
          {label: "F4", value: "F4"},
          {label: "F5", value: "F5"},
          {label: "F6", value: "F6"},
          {label: "F7", value: "F7"},
          {label: "F8", value: "F8"},
          {label: "F9", value: "F9"},
          {label: "G", value: "G"},
          {label: "H", value: "H"},
          {label: "Help", value: "Help"},
          {label: "Home", value: "Home"},
          {label: "I", value: "I"},
          {label: "ImeConvert", value: "ImeConvert"},
          {label: "ImeNoConvert", value: "ImeNoConvert"},
          {label: "Insert", value: "Insert"},
          {label: "J", value: "J"},
          {label: "K", value: "K"},
          {label: "Kana", value: "Kana"},
          {label: "Kanji", value: "Kanji"},
          {label: "L", value: "L"},
          {label: "LaunchApplication1", value: "LaunchApplication1"},
          {label: "LaunchApplication2", value: "LaunchApplication2"},
          {label: "LaunchMail", value: "LaunchMail"},
          {label: "Left", value: "Left"},
          {label: "LeftAlt", value: "LeftAlt"},
          {label: "LeftControl", value: "LeftControl"},
          {label: "LeftShift", value: "LeftShift"},
          {label: "LeftWindows", value: "LeftWindows"},
          {label: "M", value: "M"},
          {label: "MediaNextTrack", value: "MediaNextTrack"},
          {label: "MediaPlayPause", value: "MediaPlayPause"},
          {label: "MediaPreviousTrack", value: "MediaPreviousTrack"},
          {label: "MediaStop", value: "MediaStop"},
          {label: "Multiply", value: "Multiply"},
          {label: "N", value: "N"},
          {label: "NumLock", value: "NumLock"},
          {label: "NumPad0", value: "NumPad0"},
          {label: "NumPad1", value: "NumPad1"},
          {label: "NumPad2", value: "NumPad2"},
          {label: "NumPad3", value: "NumPad3"},
          {label: "NumPad4", value: "NumPad4"},
          {label: "NumPad5", value: "NumPad5"},
          {label: "NumPad6", value: "NumPad6"},
          {label: "NumPad7", value: "NumPad7"},
          {label: "NumPad8", value: "NumPad8"},
          {label: "NumPad9", value: "NumPad9"},
          {label: "O", value: "O"},
          {label: "Oem8", value: "Oem8"},
          {label: "OemAuto", value: "OemAuto"},
          {label: "OemBackslash", value: "OemBackslash"},
          {label: "OemClear", value: "OemClear"},
          {label: "OemCloseBrackets", value: "OemCloseBrackets"},
          {label: "OemComma", value: "OemComma"},
          {label: "OemCopy", value: "OemCopy"},
          {label: "OemEnlW", value: "OemEnlW"},
          {label: "OemMinus", value: "OemMinus"},
          {label: "OemOpenBrackets", value: "OemOpenBrackets"},
          {label: "OemPeriod", value: "OemPeriod"},
          {label: "OemPipe", value: "OemPipe"},
          {label: "OemPlus", value: "OemPlus"},
          {label: "OemQuestion", value: "OemQuestion"},
          {label: "OemQuotes", value: "OemQuotes"},
          {label: "OemSemicolon", value: "OemSemicolon"},
          {label: "OemTilde", value: "OemTilde"},
          {label: "P", value: "P"},
          {label: "Pa1", value: "Pa1"},
          {label: "PageDown", value: "PageDown"},
          {label: "PageUp", value: "PageUp"},
          {label: "Pause", value: "Pause"},
          {label: "Play", value: "Play"},
          {label: "Print", value: "Print"},
          {label: "PrintScreen", value: "PrintScreen"},
          {label: "ProcessKey", value: "ProcessKey"},
          {label: "Q", value: "Q"},
          {label: "R", value: "R"},
          {label: "Right", value: "Right"},
          {label: "RightAlt", value: "RightAlt"},
          {label: "RightControl", value: "RightControl"},
          {label: "RightShift", value: "RightShift"},
          {label: "RightWindows", value: "RightWindows"},
          {label: "S", value: "S"},
          {label: "Scroll", value: "Scroll"},
          {label: "Select", value: "Select"},
          {label: "SelectMedia", value: "SelectMedia"},
          {label: "Separator", value: "Separator"},
          {label: "Sleep", value: "Sleep"},
          {label: "Space", value: "Space"},
          {label: "Subtract", value: "Subtract"},
          {label: "T", value: "T"},
          {label: "Tab", value: "Tab"},
          {label: "U", value: "U"},
          {label: "Up", value: "Up"},
          {label: "V", value: "V"},
          {label: "VolumeDown", value: "VolumeDown"},
          {label: "VolumeMute", value: "VolumeMute"},
          {label: "VolumeUp", value: "VolumeUp"},
          {label: "W", value: "W"},
          {label: "X", value: "X"},
          {label: "Y", value: "Y"},
          {label: "Z", value: "Z"},
          {label: "Zoom", value: "Zoom"},
        ],
        config: {}
      }
    },
    computed: {
      color: function () {
        return 'rgba(255,171,0,' + this.currentButton.transparency + ')';
      }
    },
    mounted() {
      this.$i18n.locale = window.webObject.getLanguage();
      this.width = window.webObject.getWidth();
      this.height = window.webObject.getHeight();
      window.setJson = (json) => {
        let config = JSON.parse(json);
        for (let button of config.buttons) {
          button.id = uuidv4();
        }
        for (let button of config.buttonsExtend) {
          button.id = uuidv4();
        }
        this.config = config;
      };
      window.setJson(window.webObject.getText());
      window.getJsonCallback = () => {
        return this.config;
      };
    },
    methods: {
      toggle: function () {
        this.toggleState = !this.toggleState;
      },
      onResize: function (button, x, y, width, height) {
        button.rectangle.X = x
        button.rectangle.Y = y
        button.rectangle.Width = width
        button.rectangle.Height = height
      },
      onDrag: function (button, x, y) {
        button.rectangle.X = x
        button.rectangle.Y = y
      },
      onActivated: function (button) {
        this.currentButton = button;
      },
      onParentClick: function (event) {
        let dx = event.clientX / this.scale - (this.currentButton.rectangle.X + this.currentButton.rectangle.Width / 2);
        let dy = event.clientY / this.scale - (this.currentButton.rectangle.Y + this.currentButton.rectangle.Height / 2);
        let adx = Math.abs(dx);
        let ady = Math.abs(dy);
        if (adx > ady) {
          if (adx < this.currentButton.rectangle.Width / 2) {
            return;
          }
          debugger
          if (dx > 0) {
            this.currentButton.rectangle.X += this.grid[0];
          } else {
            this.currentButton.rectangle.X -= this.grid[0];
          }
        } else {
          if (ady < this.currentButton.rectangle.Height / 2) {
            return;
          }
          debugger
          if (dy > 0) {
            this.currentButton.rectangle.Y += this.grid[1];
          } else {
            this.currentButton.rectangle.Y -= this.grid[1];
          }
        }
      },
      onAddButton: function () {
        let target;
        if (!this.toggleState) {
          target = this.config.buttons;
        } else {
          target = this.config.buttonsExtend;
        }
        let newButton = {
          "id": uuidv4(),
          "key": this.firstNotEmpty(this.currentButton.key, "None"),
          "rectangle": {
            "X": this.currentButton.rectangle.X,
            "Y": this.currentButton.rectangle.Y,
            "Width": this.currentButton.rectangle.Width,
            "Height": this.currentButton.rectangle.Height
          },
          "transparency": this.currentButton.transparency,
          "alias": this.currentButton.alias,
          "command": this.currentButton.command
        }
        target.push(newButton);
        this.currentButton = newButton;
      },
      onRemoveButton: function () {
        let list = this.config.buttons;
        let id = this.firstNotEmpty(this.currentButton.id, this.currentButton.key);
        let index = list.findIndex(button => {
          if (this.firstNotEmpty(button.id, button.key) === id) {
            return true
          }
        });
        if (index < 0) {
          list = this.config.buttonsExtend;
          index = list.findIndex(button => {
            if (this.firstNotEmpty(button.id, button.key) === id) {
              return true
            }
          });
        }
        if (index >= 0)
          list.splice(index, 1);
      },
      firstNotEmpty: function (alias, key) {
        return this.isEmpty(alias) ? key : alias;
      },
      //判断字符是否为空的方法
      isEmpty: function (obj) {
        return typeof obj == "undefined" || obj == null || obj === "";
      }
    }
  }
</script>

<style scoped>
  .button-text {
    font-size: medium
  }
  .vdr {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button {
    background-color: darkorange;
  }

  .button.active {
    border-color: deepskyblue;
    border-width: thick;
  }

  .button-vtg {
    background-color: lightyellow;
  }

  .button-ext {
    background-color: lightgoldenrodyellow;
  }
</style>
