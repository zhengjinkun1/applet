let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    icons:[],
    titleData:[
      {
        title:"收入",
        type:'shouru',
        isActive:true 
      },
      {
        title:"支出",
        type:'zhichu',
        isActive:false 
      }
    ],
    //账户选择数据
    accountData: [
      {
        title: '现金',
        isActive: true
      },
      {
        title: '支付宝',
        isActive: false
      },
      {
        title: '微信',
        isActive: false
      },
      {
        title: '信用卡',
        isActive: false
      },
      {
        title: '储蓄卡',
        isActive: false
      }
    ],
    bookingInfo:{                         
      date:'选择日期',
      money:'',
      comment:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIconsData();
  },
  toggle(e){
    
    if(e.target.dataset.active){
      return;
    }
    let data = this.data[e.currentTarget.dataset.key];
    // 
    for(let i=0;i<data.length;i++){
      // 
      if(data[i].isActive){
        data[i].isActive = false;
        break;
      }
    }
    data[e.currentTarget.dataset.index].isActive = true;
    
    // 设置页面响应数据
    this.setData({
      [e.currentTarget.dataset.key]:data
    })
  },
  // 获取图标数据
  getIconsData(){
    // 调用云函数
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.cloud.callFunction({
      // 云函数名称
      name:'get_icons',

      success:res=>{
        wx.hideLoading();
        res.result.data.forEach(v=>{
          v.isActive = false;
        })
        
        this.setData({
          icons:res.result.data
        })
      },
      fail:err=>{
        wx.hideLoading();
        
      }
    })
  },
  // 选择金额，输入金额，备注
  userBookingInfo(e){
    
    let bookingInfo = this.data.bookingInfo;
    bookingInfo[e.currentTarget.dataset.key] = e.detail.value;
    this.setData({
      bookingInfo
    })
  },
  save(){
    // 判断用户是否授权认证
    if(!app.globalData.isAuth){
      wx.showModal({
        title:'',
        content:'请先授权',
        success(res) {
          if(res.confirm) {
            
            wx.navigateTo({
              url: '../auth/auth',
            })
          }
        }
      })
    }

    let bookingData = {};
    // 判断用户是否选择记账类型
    for(let i=0;i<this.data.icons.length;i++){
      if(this.data.icons[i].isActive){
        bookingData.bookingType ={
          title:this.data.icons[i].title,
          type:this.data.icons[i].type,
          url:this.data.icons[i].url
        };
        break;
      }
    }
    if(!bookingData.bookingType){
      wx.showToast({
        title: '请选择记账类型',
        icon:'none',
        duration:2000
      })
      return;
    }

    if(this.data.bookingInfo.date == '选择日期'){
      wx.showToast({
        title: '请选择日期',
        icon:'none',
        duration:2000
      })
      return;
    }

    if(this.data.bookingInfo.money == ''){
      wx.showToast({
        title: '请选择金额',
        icon:'none',
        duration:2000
      })
      return;
    }
    // 收入-支出
    for(let i=0;i<this.data.titleData.length;i++){
      if(this.data.titleData[i].isActive){
        bookingData.costType = {
          title:this.data.titleData[i].title,
          type:this.data.titleData[i].type
        }
        // 
        break;
      }
      
      
      
    }
    // 账户选择
    for(let i=0;i<this.data.accountData.length;i++){
      if(this.data.accountData[i].isActive){
        bookingData.accountType = this.data.accountData[i].title;
        break;
      }
    }
    bookingData.userBooking = Object.assign({},this.data.bookingInfo)
    this.addBooking(bookingData);
  },
  addBooking(data){
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    wx.cloud.callFunction({
      name:'add_booking',
      data,
      success:res=>{
        wx.hideLoading();
        
      },
      fail:err=>{
        wx.hideLoading();
        
      }
    })
  }

  
})