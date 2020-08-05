import {utils} from '../../js/utils'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 当前日期
    currentDate:'',
    // 开始-结束日期
    dateRange : {
      start:'',
      end:''
    },
    // 从数据库获取的数据
    getBookingData:[],

    currentBookingData:{
      shouru:0,
      zhichu:0
    },
    monthBookingData:{
      shouru:0,
      zhichu:0
    }
  },

  onShow(){
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month >= 10 ? month : '0' + month;
    let day = date.getDate();
    day = day >=10 ? day : '0' + day;
    this.data.dateRange.start = year + '-' + month + '-01';
    this.data.dateRange.end = year + '-'+ month + '-' + day;

    this.setData({
      dateRange:this.data.dateRange,
      currentDate:month + '-' + day,

    })
    this.getCurrentData(this.data.dateRange.end);
    this.getMonthData();
    // 
  },
  // 选择日期
  selectDate(e){
    let date = e.detail.value.split('-');
    this.setData({
      currentDate:date[1] + '-' + date[2]
    })
    this.getCurrentData(e.detail.value);
  },
  // 获取当天记帐数据
  getCurrentData(date){
    wx.showLoading({
      title: '加载中...',
      mask:true
    });
    wx.cloud.callFunction({
      name:'get_booking_data',
      data:{
        date
      },
      success:res=>{
        wx.hideLoading();
        

        this.data.currentBookingData = {
          shouru:0,
          zhichu:0
        }
        res.result.data.forEach(v =>{
          this.data.currentBookingData[v.costType.type] += Number(v.userBooking.money);
          v.userBooking.money = utils.thousandPlace(Number(v.userBooking.money).toFixed(2));
        })
        for(let key in this.data.currentBookingData){
          this.data.currentBookingData[key] = utils.thousandPlace( this.data.currentBookingData[key].toFixed(2));
        }
        this.setData({
          getBookingData:res.result.data,
          currentBookingData:this.data.currentBookingData
        })
      },
      fail:err=>{
        wx.hideLoading();
        
      }

    })
  },
  // 获取当月的收入-支出数据
  getMonthData(){
    wx.showLoading({
      title: '加载中...',
      mask:true
    });
    wx.cloud.callFunction({
      name:'get_month_data',
      data:this.data.dateRange,
      success:res=>{
        
        this.data.monthBookingData = {
          shouru:0,
          zhichu:0,
          jieyu:[]
        }
        res.result.data.forEach(v =>{
          this.data.monthBookingData[v.costType.type] += Number(v.userBooking.money);
        })
        this.data.monthBookingData.jieyu = (this.data.monthBookingData.shouru -
        this.data.monthBookingData.zhichu).toFixed(2).split('.');
        
        if(this.data.monthBookingData.jieyu[0] > 0 || this.data.monthBookingData.jieyu[0] < -1000){
          this.data.monthBookingData.jieyu[0] = utils.thousandPlace(this.data.monthBookingData.jieyu[0]);
        }
        
        
        this.data.monthBookingData.shouru = utils.thousandPlace(this.data.monthBookingData.shouru.toFixed(2));
        this.data.monthBookingData.zhichu = utils.thousandPlace(this.data.monthBookingData.zhichu.toFixed(2));
        
        
        this.setData({
          monthBookingData:this.data.monthBookingData
        })

      },
      fail:err=>{
        
      }
    })
  }
  
  
})