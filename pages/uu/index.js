Page({
  data: {
    title: 'Hello',
    dataObj: {}
  },
  
  onLoad: function(options) {
    const that = this;
    wx.request({
      url: 'https://m1.apifoxmock.com/m1/5178036-4843222-default/api/total',
      method: 'POST',
      data: {},
      success: function(res) {
        that.setData({
          dataObj: res.data
        })
      }
    });
  },
  
  // 其他生命周期函数
  onReady: function() {},
  
  onShow: function() {},
  
  onHide: function() {},
  
  onUnload: function() {},
  
  // 自定义方法
  methods: {
    // 如果需要自定义方法，可以直接在 Page 对象中定义
  }
})