// miniprogram/pages/my/my.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{
      nickname:'未授权',
      userImg:''
    },
    listData:[
      {title:'我的记账',url:'../mybooking/mybooking'},
      {title:'疫情防控',url:'../epidmic/epidmic'}
    ]
  },

  onShow: function () {
    if(app.globalData.isAuth) {
      wx.getUserInfo({
        success:res => {
          this.data.userInfo = {
            nickname:res.userInfo.nickName,
            userImg:res.userInfo.avatarUrl
          }
          this.setData({
            userInfo:this.data.userInfo
          })
        }
      })
    }
  },
  goPage:function(e){
    // 
    // return ;
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  }

})