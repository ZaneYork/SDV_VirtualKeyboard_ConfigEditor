<template>
  <div>
    <v-stage :config="{height: height, width: width}" @tap="onParentClick"
             :style="{transform: 'scale(' + scale +')', 'transform-origin': '0 0', 'margin-bottom': '-' + height*(1-scale) + 'px'}">
      <v-layer>
        <v-rect
          :config="{x:0,y:0,width:width,height:height,stroke: 'cyan',strokeWidth: 1 / this.scale, dash: [5 / this.scale, 5 / this.scale]}"></v-rect>
        <v-rect
          :config="{x:4,y:16,width:slotSize+24,height:slotSize*24+24,stroke: 'gold',strokeWidth: 1 / this.scale, dash: [3 / this.scale, 3 / this.scale]}"></v-rect>
        <v-rect
          :config="{x:16,y:height - slotSize - 28,width:slotSize*24+24,height:slotSize+24,stroke: 'gold',strokeWidth: 1 / this.scale, dash: [3 / this.scale, 3 / this.scale]}"></v-rect>
        <v-group @tap="toggle">
          <v-rect :config="getButtonConfig(config.vToggle, 'lightyellow')"></v-rect>
          <v-text :config="getTextConfig(config.vToggle, $t('toggle'))"></v-text>
        </v-group>
      </v-layer>
      <v-layer>
        <v-group v-for="button in config.buttons" :key="firstNotEmpty(button.id, button.key)"
                 v-if="button.id !== currentButtonId" @tap="() => onActivated(button)">
          <v-rect :config="getButtonConfig(button, 'darkorange')"></v-rect>
          <v-text :config="getTextConfig(button, firstNotEmpty(button.alias, button.key))"></v-text>
        </v-group>
        <v-group v-for="button in config.buttonsExtend" :key="firstNotEmpty(button.id, button.key)"
                 v-if="toggleState && button.id !== currentButtonId" @tap="() => onActivated(button)">
          <v-rect :config="getButtonConfig(button, 'lightyellow')"></v-rect>
          <v-text :config="getTextConfig(button, firstNotEmpty(button.alias, button.key))"></v-text>
        </v-group>
      </v-layer>
      <v-layer v-if="!isEmpty(currentButtonId)">
        <v-rect :config="getButtonConfig(currentButton, 'lightcyan')"></v-rect>
        <v-text :config="getTextConfig(currentButton, firstNotEmpty(currentButton.alias, currentButton.key))"></v-text>
      </v-layer>
    </v-stage>
    <el-drawer
      title=""
      :visible.sync="drawer"
      direction="rtl"
      size="40%"
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
    <el-button v-if="landscape && !isEmpty(currentButtonId)"
               type="primary" icon="el-icon-edit" circle @click="drawer=true"
               class="button-float"></el-button>
    <el-form ref="form" label-width="80px">
      <el-form-item :label="$t('key')">
        <el-autocomplete
          class="inline-input"
          v-model="currentButton.key"
          :fetch-suggestions="querySearch"
          :placeholder="$t('key')"
        ></el-autocomplete>
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

  export default {
    data: function () {
      return {
        grid: [5, 5],
        scale: 0.4,
        slotSize: 80,
        width: 1280,
        height: 720,
        toggleState: true,
        drawer: false,
        landscape: false,
        currentButtonId: '',
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
          {label: "A", value: "A"},
          {label: "B", value: "B"},
          {label: "C", value: "C"},
          {label: "CapsLock", value: "CapsLock"},
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
          {label: "Escape", value: "Escape"},
          {label: "F", value: "F"},
          {label: "F1", value: "F1"},
          {label: "F10", value: "F10"},
          {label: "F11", value: "F11"},
          {label: "F12", value: "F12"},
          {label: "F2", value: "F2"},
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
          {label: "Insert", value: "Insert"},
          {label: "J", value: "J"},
          {label: "K", value: "K"},
          {label: "L", value: "L"},
          {label: "Left", value: "Left"},
          {label: "LeftAlt", value: "LeftAlt"},
          {label: "LeftControl", value: "LeftControl"},
          {label: "LeftShift", value: "LeftShift"},
          {label: "LeftWindows", value: "LeftWindows"},
          {label: "M", value: "M"},
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
          {label: "OemBackslash", value: "OemBackslash"},
          {label: "OemClear", value: "OemClear"},
          {label: "OemCloseBrackets", value: "OemCloseBrackets"},
          {label: "OemComma", value: "OemComma"},
          {label: "OemCopy", value: "OemCopy"},
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
          {label: "PageDown", value: "PageDown"},
          {label: "PageUp", value: "PageUp"},
          {label: "Pause", value: "Pause"},
          {label: "Play", value: "Play"},
          {label: "Print", value: "Print"},
          {label: "PrintScreen", value: "PrintScreen"},
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
          {label: "Z", value: "Z"}
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
      this.scale = window.webObject.getScale();
      this.landscape = window.webObject.isLandscape();
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
        let conf = JSON.parse(JSON.stringify(this.config));
        for (let button of conf.buttons) {
          delete button.id;
        }
        for (let button of conf.buttonsExtend) {
          delete button.id;
        }
        return conf;
      };
    },
    methods: {
      getTextConfig: function (button, text) {
        if(button === undefined) {
          return {};
        }
        debugger
        return {
          x: button.rectangle.X,
          y: button.rectangle.Y,
          width: button.rectangle.Width,
          height: button.rectangle.Height,
          text: text,
          align: 'center',
          verticalAlign: 'middle',
          fontSize: Math.sqrt(144 / this.scale),
          perfectDrawEnabled: false,
          transformsEnabled: 'position',
        };
      },
      getButtonConfig: function (button, color) {
        if(button === undefined) {
          return {};
        }
        return {
          x: button.rectangle.X,
          y: button.rectangle.Y,
          width: button.rectangle.Width,
          height: button.rectangle.Height,
          opacity: button.transparency,
          fill: color,
          stroke: 'black',
          strokeWidth: 2 / this.scale,
          perfectDrawEnabled: false,
          transformsEnabled: 'position',
          shadowForStrokeEnabled: false,
          hitStrokeWidth: 0,
        };
      },
      querySearch: function(queryString, cb) {
        let results = queryString ? this.options.filter((option)=> option.value.toLowerCase().includes(queryString.toLowerCase())) : this.options;
        // 调用 callback 返回建议列表的数据
        results.sort((a,b)=>a.value.length-b.value.length);
        cb(results);
      },
      toggle: function (event) {
        this.toggleState = !this.toggleState;
        event.cancelBubble = true;
      },
      onActivated: function (button) {
        this.currentButton = button;
        this.currentButtonId = button.id;
      },
      getNodeParentFor(node, parentName, attrName){
        if(node[attrName] !== undefined) {
          return node;
        }
        else if(node[parentName] !== undefined && node[parentName] != null) {
          return this.getNodeParentFor(node[parentName], parentName, attrName);
        }
        return null;
      },
      onParentClick: function (event) {
        let parent = this.getNodeParentFor(event.target, 'parent', 'getPointerPosition');
        if(parent == null)
          return;
        let dx = parent.getPointerPosition().x - (this.currentButton.rectangle.X + this.currentButton.rectangle.Width / 2);
        let dy = parent.getPointerPosition().y - (this.currentButton.rectangle.Y + this.currentButton.rectangle.Height / 2);
        let adx = Math.abs(dx);
        let ady = Math.abs(dy);
        if (adx > ady) {
          if (adx < this.currentButton.rectangle.Width / 2) {
            return;
          }
          if (dx > 0) {
            this.currentButton.rectangle.X += this.grid[0];
          } else {
            this.currentButton.rectangle.X -= this.grid[0];
          }
        } else {
          if (ady < this.currentButton.rectangle.Height / 2) {
            return;
          }
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
        if (index >= 0){
          list.splice(index, 1);
          this.currentButtonId = null;
        }
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
  .button-float {
    position: fixed;
    z-index: 99;
    right: 1%;
    top: 5%;
  }
</style>
