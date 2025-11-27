<template>
  <view style="width: 100%">
    <view class="user-avatar">
      <view class="avatar_background">
        <image class="imgs" src="/static/pic_01.png"></image>
      </view>
      <view class="avatar">
        <view class="use_images">
          <image :src="imgUrl" mode=""></image>
        </view>
        <text class="useName">尊敬的：{{ useId }}，{{ time_period }}好</text>
      </view>
    </view>
    <view class="personalCenterLink">
      <view
        class="linkList"
        v-for="(item, index) in addres"
        :key="index"
        @click="linkRedirection(item.url, item.key)">
        <image class="images" :src="item.icon" mode=""></image>
        <text>{{ item.key }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      useId: "",
      time_period: "",
      imgUrl: "",
      addres: [
        {
          icon: "/static/pic_02.png",
          key: "个人资料",
          url: "/pages/personalProfile/index",
        },
        {
          icon: "/static/pic_03.png",
          key: "我的账本",
          url: "/pages/myAccountBook/index",
        },
        {
          icon: "/static/pic_04.png",
          key: "带团统计",
          url: "/pages/groupStatistics/index",
        },
        {
          icon: "/static/pic_05.png",
          key: "关于火柴头",
          url: "/pages/aboutUs/index",
        },
        {
          icon: "/static/pic_11.png",
          key: "水印相机",
          url: "/pages/takePhoto/index",
        },
        {
          icon: "/static/pic_06.png",
          key: "退出登录",
          url: "",
        },
      ],
    };
  },
  onLoad() {
    const app = getApp();
    console.log(app);
    this.useId = app.globalData.userInfo.usename;
    this.imgUrl = app.globalData.userInfo.images;
    this.setTimePeriod();
  },
  methods: {
    setTimePeriod() {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        this.time_period = "上午";
      } else if (hour >= 12 && hour < 18) {
        this.time_period = "下午";
      } else {
        this.time_period = "晚上";
      }
    },
    linkRedirection(val, item) {
      if (!val) {
        uni.showModal({
          title: "",
          content: "确定退出当前登录账号吗？",
          success: (res) => {
            if (res.confirm) {
              console.log("用户点击确定");
              uni.navigateTo({
                url: "/pages/login/index",
              });
              // uni.request({
              // 	url: 'https://m1.apifoxmock.com/m1/5178036-4843222-default/api/total',
              // 	method: 'POST',
              // 	data: {},
              // 	success: (res) => {

              // 	}
              // });
            } else if (res.cancel) {
              console.log("用户点击取消");
            }
          },
        });
      } else {
        uni.navigateTo({
          url: val,
          fail: (err) => {
            console.log("跳转失败:", err);
            uni.navigateTo({
              url: "/pages/404/404",
            });
          },
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.linkList::before {
  content: "";
  display: block;
  width: 60rpx;
  height: 60rpx;
  position: absolute;
  top: 50%;
  right: 9%;
  transform: translate(-50%, -50%);
  background-image: url(/static/pic_07.png);
}

.linkList {
  cursor: pointer;
  border-bottom: 1rpx solid #eee;
  display: flex;
  justify-content: flex-start;
  width: 100%;
  align-items: center;
  padding: 36rpx 40rpx;
  position: relative;

  text {
    display: block;
    margin-left: 48rpx;
    flex: 1;
  }

  .images {
    display: block;
    width: 30rpx;
    height: 30rpx;
  }
}

.user-avatar {
  position: relative;
}

.avatar {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: auto;
  text-align: center;
}

.avatar_background {
  .imgs {
    width: 100%;
    filter: blur(3px);
  }
}

.use_images {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  background-color: #eee;
  margin: 0 auto;
}

.useName {
  color: #fff;
  margin-top: 10rpx;
  display: inline-block;
}
</style>
