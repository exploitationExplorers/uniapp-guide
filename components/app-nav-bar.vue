<template>
  <view class="app-nav" :style="{ backgroundColor: backgroundColor }">
    <view class="app-nav-status" :style="{ height: `${statusBarHeight}px` }"></view>
    <view class="app-nav-bar" :style="{ height: `${navBarHeight}px` }">
      <view class="app-nav-title-wrap">
        <text class="app-nav-title" :style="{ color: titleColor }">{{ title }}</text>
      </view>
      <view
        v-if="showRight"
        class="app-nav-action"
        :style="{ right: `${actionRight}px`, width: `${actionSize}px`, height: `${actionSize}px` }"
        @click="handleRightClick"
      >
        <image v-if="rightIcon" class="app-nav-action-icon" :src="rightIcon" mode="aspectFit" />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AppNavBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    backgroundColor: {
      type: String,
      default: '#1890ff'
    },
    titleColor: {
      type: String,
      default: '#ffffff'
    },
    rightIcon: {
      type: String,
      default: ''
    },
    showRight: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      statusBarHeight: 20,
      navBarHeight: 44,
      actionRight: 16,
      actionSize: 24
    };
  },
  created() {
    this.initMetrics();
  },
  methods: {
    initMetrics() {
      const systemInfo = uni.getSystemInfoSync();
      const statusBarHeight = Number(systemInfo.statusBarHeight) || 20;
      let navBarHeight = 44;
      let actionRight = 16;

      // 微信小程序下优先避开右上角胶囊区域
      if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
        const rect = uni.getMenuButtonBoundingClientRect();
        if (rect && rect.height) {
          navBarHeight = rect.height + (rect.top - statusBarHeight) * 2;
          actionRight = Math.max(16, systemInfo.windowWidth - rect.left + 8);
        }
      }

      this.statusBarHeight = statusBarHeight;
      this.navBarHeight = navBarHeight;
      this.actionRight = actionRight;
    },
    handleRightClick() {
      this.$emit('right-click');
    }
  }
};
</script>

<style scoped>
.app-nav {
  position: relative;
}

.app-nav-status {
  width: 100%;
}

.app-nav-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-nav-title-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 120rpx;
  box-sizing: border-box;
}

.app-nav-title {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

.app-nav-action {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-nav-action-icon {
  width: 100%;
  height: 100%;
}
</style>
