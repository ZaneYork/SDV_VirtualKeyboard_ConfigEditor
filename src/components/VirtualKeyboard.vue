<template>
  <div>
    <v-stage
      :config="{height: height, width: width}"
      :style="{transform: 'scale(' + scale +')', 'transform-origin': '0 0', 'margin-bottom': '-' + height*(1-scale) + 'px'}"
      @tap="onParentClick"
      @click="onParentClick"
    >
      <v-layer>
        <v-rect
          :config="{x:0,y:0,width:width,height:height,stroke: 'cyan',strokeWidth: 1 / scale, dash: [5 / scale, 5 / scale],preventDefault:false}"
        />
        <v-rect
          :config="{x:4,y:16,width:slotSize+24,height:slotSize*24+24,stroke: 'gold',strokeWidth: 1 / scale, dash: [3 / scale, 3 / scale],preventDefault:false}"
        />
        <v-rect
          :config="{x:16,y:height - slotSize - 28,width:slotSize*24+24,height:slotSize+24,stroke: 'gold',strokeWidth: 1 / scale, dash: [3 / scale, 3 / scale],preventDefault:false}"
        />
        <v-group
          @tap="toggle"
          @click="toggle"
        >
          <v-rect :config="getButtonConfig(config.vToggle, 'lightyellow')" />
          <v-text :config="getTextConfig(config.vToggle, $t('toggle'))" />
        </v-group>
      </v-layer>
      <v-layer>
        <v-group
          v-for="button in buttonsWithoutCurrent"
          :key="firstNotEmpty(button.id, button.key)"
          @tap="() => onActivated(button)"
          @click="() => onActivated(button)"
        >
          <v-rect :config="getButtonConfig(button, 'darkorange')" />
          <v-text :config="getTextConfig(button, firstNotEmpty(button.alias, button.key))" />
        </v-group>
      </v-layer>
      <v-layer v-if="toggleState">
        <v-group
          v-for="button in buttonsExtendWithoutCurrent"
          :key="firstNotEmpty(button.id, button.key)"
          @tap="() => onActivated(button)"
          @click="() => onActivated(button)"
        >
          <v-rect :config="getButtonConfig(button, 'lightyellow')" />
          <v-text :config="getTextConfig(button, firstNotEmpty(button.alias, button.key))" />
        </v-group>
      </v-layer>
      <v-layer v-if="!isEmpty(currentButtonId)">
        <v-rect :config="getButtonConfig(currentButton, 'lightcyan')" />
        <v-text :config="getTextConfig(currentButton, firstNotEmpty(currentButton.alias, currentButton.key))" />
      </v-layer>
    </v-stage>
    <el-drawer
      title=""
      :visible.sync="drawer"
      direction="rtl"
      size="40%"
      :with-header="true"
    >
      <el-form label-width="50px">
        <el-form-item :label="$t('X')">
          <el-slider
            v-model="currentButton.rectangle.X"
            :max="width"
            :min="0"
            :step="5"
            show-input
          />
        </el-form-item>
        <el-form-item :label="$t('Y')">
          <el-slider
            v-model="currentButton.rectangle.Y"
            :max="height"
            :min="0"
            :step="5"
            show-input
          />
        </el-form-item>
        <el-form-item :label="$t('Width')">
          <el-slider
            v-model="currentButton.rectangle.Width"
            :max="width"
            :min="5"
            :step="5"
            show-input
          />
        </el-form-item>
        <el-form-item :label="$t('Height')">
          <el-slider
            v-model="currentButton.rectangle.Height"
            :max="height"
            :min="5"
            :step="5"
            show-input
          />
        </el-form-item>
      </el-form>
    </el-drawer>
    <el-button
      v-if="landscape && !isEmpty(currentButtonId)"
      type="primary"
      icon="el-icon-set-up"
      circle
      class="button-float"
      @click="drawer=true"
    />
    <el-form label-width="80px">
      <el-form-item :label="$t('key')">
        <el-autocomplete
          v-model="currentButton.key"
          class="inline-input"
          :fetch-suggestions="querySearch"
          :placeholder="$t('key')"
        />
      </el-form-item>
      <el-form-item :label="$t('alias')">
        <el-col :span="10">
          <el-input
            v-model="currentButton.alias"
            :placeholder="$t('alias')"
          />
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('command')">
        <el-col :span="10">
          <el-input
            v-model="currentButton.command"
            :placeholder="$t('command')"
          />
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('transparency')">
        <el-col>
          <el-slider
            v-model="currentButton.transparency"
            :max="1"
            :min="0"
            :step="0.01"
            show-input
          />
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('X')">
        <el-slider
          v-model="currentButton.rectangle.X"
          :max="width"
          :min="0"
          :step="5"
          show-input
        />
      </el-form-item>
      <el-form-item :label="$t('Y')">
        <el-slider
          v-model="currentButton.rectangle.Y"
          :max="height"
          :min="0"
          :step="5"
          show-input
        />
      </el-form-item>
      <el-form-item :label="$t('Width')">
        <el-slider
          v-model="currentButton.rectangle.Width"
          :max="width"
          :min="5"
          :step="5"
          show-input
        />
      </el-form-item>
      <el-form-item :label="$t('Height')">
        <el-slider
          v-model="currentButton.rectangle.Height"
          :max="height"
          :min="5"
          :step="5"
          show-input
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="onAddButton"
        >
          {{ $t('add') }}
        </el-button>
        <el-button
          type="danger"
          @click="onRemoveButton"
        >
          {{ $t('remove') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {v4 as uuidv4} from 'uuid';
  import hintKeys from '../assets/hint-keys.json';

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
        options: hintKeys.map(key => {
          return {label: key, value: key}
        }),
        config: {}
      }
    },
    computed: {
      buttonsWithoutCurrent: function () {
        if(!this.config.buttons)
          return {}
        return this.config.buttons.filter(item => item.id !== this.currentButtonId);
      },
      buttonsExtendWithoutCurrent: function () {
        if(!this.config.buttonsExtend)
          return {}
        return this.config.buttonsExtend.filter(item => item.id !== this.currentButtonId);
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
        let conf = this.deepCopy(this.config);
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
        if (button === undefined) {
          return {};
        }
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
          listening: false,
        };
      },
      getButtonConfig: function (button, color) {
        if (button === undefined) {
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
      querySearch: function (queryString, cb) {
        let results = queryString ? this.options.filter((option) => option.value.toLowerCase().includes(queryString.toLowerCase())) : this.options;
        // 调用 callback 返回建议列表的数据
        results.sort((a, b) => a.value.length - b.value.length);
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
      getNodeParentFor(node, parentName, attrName) {
        if (node[attrName] !== undefined) {
          return node;
        } else if (node[parentName] !== undefined && node[parentName] != null) {
          return this.getNodeParentFor(node[parentName], parentName, attrName);
        }
        return null;
      },
      onParentClick: function (event) {
        let parent = this.getNodeParentFor(event.target, 'parent', 'getPointerPosition');
        if (parent == null)
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
        this.currentButtonId = newButton.id;
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
        if (index >= 0) {
          list.splice(index, 1);
          this.currentButtonId = null;
        }
      },
      firstNotEmpty: function (alias, key) {
        return this.isEmpty(alias) ? key : alias;
      },
      deepCopy: function (obj) {
        return JSON.parse(JSON.stringify(obj));
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
