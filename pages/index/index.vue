<template>
  <view class="content">
    <image class="index-background" src="/static/pic_01.webp"></image>
    <view class="total-data">
      <view class="items">
        <text>总团量</text>
        <text>100</text>
      </view>
      <view class="items">
        <text>今年收入</text>
        <text>0</text>
      </view>
      <view class="items">
        <text>总收入</text>
        <text>0</text>
      </view>
      <view class="items">
        <text>本月收入</text>
        <text>0</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: "Hello",
    };
  },
  onLoad() {
    console.log("test");
  },
  methods: {},
};
</script>

<style scoped scss>
.content {
  position: relative;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;

  .index-background {
    width: 100%;
    height: 400rpx;
    filter: blur(3px);
  }

  .text-area {
    width: 100%;
  }

  .total-data {
    position: absolute;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 85%;
    height: 100%;

    .items:nth-child(odd) {
      text {
        text-align: left;
      }
    }

    .items {
      width: calc(100% / 2);
      color: #fff;

      text {
        display: block;
        text-align: right;
      }
    }
  }
}
</style>
