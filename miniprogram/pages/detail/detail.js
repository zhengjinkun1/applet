// miniprogram/pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookingData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 截取查询参数
    // 
    let ids = options.ids;
    this.getBookingDataById(ids);
    wx.setNavigationBarTitle({
      title:options.costtitle + '-' + options.title + '记账详情',
    })
  },
  // 根据id查询记帐数据
  getBookingDataById(ids){
    wx.showLoading({
      title: '加载中...',
      mask:true
    })

    wx.cloud.callFunction({
      name:'get_booking_byId',
      data:{
        ids
      },
      success:res => {
        wx.hideLoading();
        
        this.setData({
          bookingData:res.result.data
        })
      },
      fail: err => {
        wx.hideLoading();
        
      }
    })
  }

  
})