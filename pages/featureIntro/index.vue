<template>
  <!-- 页面主容器 -->
  <view class="container">
    <!-- 头部区域，包含标题 -->
    <view class="header">
      <!-- 主标题文字 -->
      <text class="header-title">火柴头导游小程序</text>
    </view>

    <!-- 功能列表区域 -->
    <view class="feature-list">
      <!-- 循环渲染功能列表项 -->
      <view class="feature-item" v-for="(item, index) in features" :key="index">
        <!-- 图标容器 -->
        <view class="icon-box">
          <!-- 功能图标，使用aspectFit模式保持比例 -->
          <image class="feature-icon" :src="item.icon" mode="aspectFit"></image>
        </view>
        <!-- 内容容器 -->
        <view class="content-box">
          <!-- 功能标题 -->
          <text class="item-title">{{ item.title }}</text>
          <!-- 功能描述 -->
          <text class="item-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 使用范围说明区域 -->
    <view class="scope-section">
      <!-- 说明内容盒子 -->
      <view class="scope-box">
        <!-- 标题栏 -->
        <view class="scope-title-bar">
          <!-- 左侧竖线装饰 -->
          <view class="vertical-line"></view>
          <!-- 说明标题 -->
          <text class="scope-title">特定使用范围说明</text>
        </view>
        <!-- 说明具体文本内容 -->
        <view class="scope-content">
          <!-- 说明段落1 -->
          <text
            >本小程序是公司内部给导游使用的带团工具，主要功能是导游在程序端拉取带团列表，查看带团详情，然后记账、报账。</text
          >
          <!-- 说明段落2 -->
          <text class="yellow-text"
            >导游端跟服务端唯一绑定关系的方式就是导游的手机号。后台管理系统根据导游自己提供的手机号给导游派团，导游端根据手机号拉取已派的团及操作。</text
          >
          <!-- 说明段落3 -->
          <text class="yellow-text"
            >所以手机号是跟程序内所有功能强关联的。没有通过手机号登陆的情况下，程序所有功能将不可使用。</text
          >
          <!-- 重点强调说明 -->
          <text class="highlight"
            >请务必使用您在旅行社报备的手机号注册/登录成功后才可进行后续操作！</text
          >
        </view>
      </view>
    </view>

    <!-- 底部按钮区域 -->
    <view class="footer">
      <!-- 开始使用按钮，点击触发handleStart -->
      <button class="start-btn" @click="handleStart">开始使用</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 功能列表数据源
      features: [
        {
          title: "导游带团列表", // 功能标题
          desc: "查看您的带团信息，包括团号、团期、流水号、接站牌等详细信息", // 功能描述
          icon: "/static/featureIntro/list.svg", // 功能图标路径
        },
        {
          title: "团队详细数据",
          desc: "查看行程安排、团队备注、游客名单等详细信息",
          icon: "/static/featureIntro/teamData.svg",
        },
        {
          title: "导游记账功能",
          desc: "记录酒店、餐饮、景区、交通等各项收支，轻松管理团队财务",
          icon: "/static/featureIntro/money.svg",
        },
        {
          title: "导游提交报账",
          desc: "提交团队代收、其他收入、其他支出等报账信息，查看审核状态",
          icon: "/static/featureIntro/bill.svg",
        },
        {
          title: "带团统计数据",
          desc: "查看现付总额、收入总额、交回总额等财务统计，轻松了解收支情况",
          icon: "/static/featureIntro/statisticsData.svg",
        },
      ],
    };
  },
  methods: {
    // 处理开始使用按钮点击事件
    handleStart() {
      // 使用reLaunch关闭所有页面，打开到应用内的某个页面
      // 导航到首页
      uni.navigateTo({
        url: "/pages/index/index",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
// 页面主容器样式
.container {
  min-height: 100vh; // 最小高度为视口高度
  background-color: #2b4c7e; // 背景颜色：深蓝色
  padding: 40rpx 30rpx; // 上下40rpx，左右30rpx内边距
  box-sizing: border-box; // 盒模型：边框计算在宽高中
  display: flex; // 使用Flex布局
  flex-direction: column; // 垂直排列
  align-items: center; // 水平居中
}

// 头部区域样式
.header {
  margin-bottom: 40rpx; // 底部外边距
  margin-top: 20rpx; // 顶部外边距

  // 头部标题文字样式
  .header-title {
    font-size: 40rpx; // 字体大小
    font-weight: bold; // 字体加粗
    color: #ffffff; // 字体颜色：白色
    letter-spacing: 2rpx; // 字间距
  }
}

// 功能列表区域样式
.feature-list {
  width: 100%; // 宽度100%
  background-color: rgba(255, 255, 255, 0.1); // 背景颜色：白色半透明
  border-radius: 16rpx; // 圆角
  padding: 10rpx 0; // 上下内边距
  margin-bottom: 30rpx; // 底部外边距
}

// 单个功能项样式
.feature-item {
  display: flex; // Flex布局
  align-items: flex-start; // 顶部对齐
  padding: 30rpx; // 内边距
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); // 底部边框：细线

  // 最后一个子元素去除底部边框
  &:last-child {
    border-bottom: none;
  }

  // 图标容器样式
  .icon-box {
    margin-right: 24rpx; // 右侧外边距
    display: flex; // Flex布局
    background: #4facfe; // 背景色：浅蓝
    border-radius: 50%; // 圆形容器
    width: 72rpx; // 容器宽度
    height: 72rpx; // 容器高度
    justify-content: center; // 水平居中
    align-items: center; // 垂直居中
    box-shadow: 0 4rpx 12rpx rgba(0, 153, 255, 0.3); // 添加阴影效果
    flex-shrink: 0; // 防止容器被压缩

    // 图标图片样式
    .feature-icon {
      width: 40rpx; // 图标宽度，占容器约55%
      height: 40rpx; // 图标高度，占容器约55%
    }
  }

  // 内容容器样式
  .content-box {
    flex: 1; // 占据剩余空间

    // 标题样式
    .item-title {
      font-size: 32rpx; // 字体大小
      color: #ffffff; // 字体颜色
      font-weight: 500; // 字体粗细
      margin-bottom: 12rpx; // 底部外边距
      display: block; // 块级元素
    }

    // 描述样式
    .item-desc {
      font-size: 26rpx; // 字体大小
      color: rgba(255, 255, 255, 0.8); // 字体颜色：半透明白
      line-height: 1.5; // 行高
      display: block; // 块级元素
    }
  }
}

// 使用范围说明区域样式
.scope-section {
  width: 100%; // 宽度100%
  margin-bottom: 40rpx; // 底部外边距
}

// 说明盒子样式
.scope-box {
  background-color: #2b4c7e; // 背景颜色：深蓝色，与页面背景一致
  border-left: 4rpx solid #f0ad4e; // 黄色边框
  background-color: rgba(255, 255, 255, 0.1); // 背景颜色：白色半透明
  border-radius: 12rpx; // 圆角
  padding: 30rpx; // 内边距

  // 标题栏样式
  .scope-title-bar {
    display: flex; // Flex布局
    align-items: center; // 垂直居中
    margin-bottom: 20rpx; // 底部外边距

    // 竖线装饰样式
    .vertical-line {
      width: 6rpx; // 宽度
      height: 30rpx; // 高度
      background-color: #f0ad4e; // 颜色：黄色
      margin-right: 16rpx; // 右侧外边距
      border-radius: 4rpx; // 圆角
    }

    // 标题文字样式
    .scope-title {
      font-size: 30rpx; // 字体大小
      color: #f0ad4e; // 颜色：黄色
      font-weight: bold; // 加粗
    }
  }

  // 说明内容样式
  .scope-content {
    // 文本段落样式
    text {
      display: block; // 块级元素
      font-size: 26rpx; // 字体大小
      color: #ffffff; // 字体颜色
      line-height: 1.6; // 行高
      margin-bottom: 16rpx; // 底部外边距
      text-align: justify; // 两端对齐
      margin-top: 10rpx; // 顶部外边距
      // 最后一个元素去除底部外边距
      &:last-child {
        margin-bottom: 0;
      }

      // 高亮样式
      &.yellow-text {
        color: #f0ad4e; // 字体颜色：黄色
      }

      // 高亮样式
      &.highlight {
        color: #f0ad4e; // 颜色：黄色
        font-weight: bold; // 加粗
        text-align: center;
      }
    }
  }
}

// 底部区域样式
.footer {
  width: 100%; // 宽度100%
  padding-bottom: 40rpx; // 底部内边距

  // 按钮样式
  .start-btn {
    background-color: #0099ff; // 背景颜色：亮蓝色
    color: #ffffff; // 字体颜色：白色
    font-size: 32rpx; // 字体大小
    font-weight: bold; // 加粗
    border-radius: 10rpx; // 圆角
    height: 90rpx; // 高度
    line-height: 90rpx; // 行高
    border: none; // 无边框

    // 点击态样式
    &:active {
      opacity: 0.9; // 透明度变化
    }
  }
}
</style>
