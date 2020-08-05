import {utils} from '../../js/utils'
let wxcharts = require('../../js/wxcharts')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseData:{
      titles:['年','月','日'],
      default:0
    },
    dateData:{
      start:'',
      end:''
    },
    currentData:'',
    titleData:[
      {
        name:'收入',
        type:'shouru',
        total:0,
        isActive:true
      },
      {
        name:'支出',
        type:'zhichu',
        total:0,
        isActive:false
      }
    ],
    // 每月有31号
    day31:['01','03','05','07','08','10','12'],
    // 记账数据
    bookingData:{
      shouru:[],
      zhichu:[]
    },
    typesData:{
      // 收入分类统计
      shouru:[],
      //支出分类统计
      zhichu:[]
    },
    currentType:'shouru',
    canvasWidth:0
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },
  onShow(){
    // this.chooseDate()
    this.getOnlineDate();
    // 获取屏幕宽度
    const res = wx.getSystemInfoSync();
    this.setData({
      canvasWidth:res.screenWidth
    })
  },
  // 改变查询条件
  changeChoose(){
    let dbt = this.data.chooseData
    dbt.default = dbt.default == dbt.titles.length-1 ? 0 : dbt.default+1;
    
    this.setData({
      chooseData:dbt
    }) 
    this.getDateBookingData();
  },
  // 获取上线时间
  getOnlineDate(){
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    wx.cloud.callFunction({
      name:'get_date',
      success:res=>{
        wx.hideLoading();
        
        if(res.result.data.length > 0){
          this.data.dateData.start = res.result.data[0].onlineDate;
          this.data.dateData.end = utils.formatDate(new Date(),'yyyy-MM-dd');

          this.setData({
            dateData:this.data.dateData,
            currentData:this.data.dateData.end
          })
          this.getDateBookingData();
         

        }
      },
      fail:err=>{
        wx.hideLoading();
        
      }
    })
  },
  // 选择日期
  chooseDate(e){
    this.setData({
      currentData:e.detail.value
    })
    this.getDateBookingData();
  },
  // 切换收入-支出
  select(e){
    if (e.currentTarget.dataset.active) {
      return;
    }

    for (let i = 0; i < this.data.titleData.length; i++) {
      if (this.data.titleData[i].isActive) {
        this.data.titleData[i].isActive = false;
        break;
      }
    }

    this.data.titleData[e.currentTarget.dataset.index].isActive = true;

    this.setData({
      titleData: this.data.titleData,
      currentType: this.data.titleData[e.currentTarget.dataset.index].type
    })
    this.drawPie(this.data.typesData[this.data.currentType])
    // this.getDateBookingData();
  },
  // 根据日期查询记账数据
  getDateBookingData(){
    // 日期条件
    let dateCondition = {
      start:'',
      end:''
    }
    // 获取当前日期
    let current = utils.formatDate(new Date(),'yyyy-MM-dd');
    let date = current.split('-');
    let currentData = this.data.currentData.split('-');
    // 按日查询
    if(this.data.chooseData.default == 2) {
      dateCondition.start = this.data.currentData;
    }else if (this.data.chooseData.default == 1){
      // 按月查询
      dateCondition.start = currentData[0] + '-' + currentData[1] + '-' + '01'
      // 判断是否同年
      if(date[0] == currentData[0]){
        
        // 同月
        if(date[1] == currentData[1]){
          dateCondition.end = current;
        }else {

          if(currentData[1] == '02') {
            // 判断年份是否为闰年
            if(currentData[0] % 400 == 0 || (currentData[0] % 4 == 0 && currentData[0] % 100 != 0)){
              dateCondition.end = currentData[0] + '-' + currentData[1] + '-29';
            }else {
              dateCondition.end = currentData[0] + '-' + currentData[1] + '-28';
            }
          }else {
            // 不是二月份判断是否为31号
            if(this.data.day31.indexOf(currentData[1])>-1){
              dateCondition.end = currentData[0] + '-' + currentData[1] + '-31';
            }else {
              dateCondition.end = currentData[0] + '-' + currentData[1] + '-30';
            }
          }
        }
      }else {
        // 不同年,按月查询
        if(currentData[1] == '02') {
          // 判断年份是否为闰年
          if(currentData[0] % 400 == 0 || (currentData[0] % 4 == 0 && currentData[0] % 100 != 0)){
            dateCondition.end = currentData[0] + '-' + currentData[1] + '-29';
          }else {
            dateCondition.end = currentData[0] + '-' + currentData[1] + '-28';
          }
        }else {
          // 不是二月份判断是否为31号
          if(this.data.day31.indexOf(currentData[1])>-1){
            dateCondition.end = currentData[0] + '-' + currentData[1] + '-31';
          }else {
            dateCondition.end = currentData[0] + '-' + currentData[1] + '-30';
          }
        }
      }

    }else {
      // 按年查询
      dateCondition.start = currentData[0] + '-01-01';
      // 判断是否同年
      if(date[0] == currentData[0]){
        dateCondition.end = current;
      }else {
        // 不同年
        dateCondition.end = currentData[0] + '-12-31'
      }
    }

    // 获取收入-支出类型
    // let type ='';
    // for(let i = 0;i<this.data.titleData.length;i++){
    //   if(this.data.titleData[i].isActive){
    //     type = this.data.titleData[i].type;
    //   }
    // }
    // 调用
    this.getBookData(dateCondition);
    
  },
  drawPie(data){
    if (data.length == 0) {
      return;
    }
    new wxcharts({
      canvasId: 'pieCanvas',
      type: 'pie',

      //饼图数据
      series: data,
      width: this.data.canvasWidth,
      height: 300,
      dataLabel: true
    });
  },
  // 根据日期查询记账数据
  getBookData(date){
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    wx.cloud.callFunction({
      name:'get_booking_bydate',
      data:{
        start:date.start,
        end:date.end,
      },
      success:res => {
        wx.hideLoading();
        
        // 获取类型
        this.data.bookingData = {
          shouru:[],
          zhichu:[]
        }
        // let type = [];
        res.result.data.forEach(v => {
          this.data.bookingData[v.costType.type].push(v);
        })

        // 统计总的收入-支出
        let bookingData = this.data.bookingData;
        // bookingData = [];
        let totalMoney = {
          shouru:0,
          zhichu:0
        }

        this.data.titleData.forEach(v => {
          v.total = 0;
          bookingData[v.type].forEach(v1 => {
            v.total += Number(v1.userBooking.money);
            totalMoney[v.type] += Number(v1.userBooking.money)
          })
        })

        this.data.titleData.forEach(v => {
          v.total =utils.thousandPlace(v.total.toFixed(2));
          
        })
        // 收入-支出统计
        // 获取类型
        let types = {}
        for(let key in this.data.bookingData){
          types[key] = [];
          let data = this.data.bookingData[key];
          data.forEach(v => {
            if(types[key].indexOf(v.bookingType.type) == -1){
              types[key].push(v.bookingType.type);
            }
          })

        }
        // let typesData
        for(let key in types){
         
          this.data.typesData[key] = [];
          types[key].forEach(v => {
            // 随机生产颜色
            let rgb = [];
            for(let i=0;i<3;i++){
              // 生产随机数0-255
              let random = Math.ceil(Math.random()*255);
              rgb.push(random);
            }
            rgb = 'rgb(' + rgb.join(',') + ')';
            let o = {
              [v]:[],
              count:0,
              total:0,
              // 类型标题
              title:'',
              url:'',
              percent:'',
              // 收入支出标题
              costTitle:'',
              // 记帐id集合
              ids:[],
              // 饼图数据结构
              // 总金额
              data:0,
              name:'',
              color:rgb,
              // 格式化饼图文本内容
              format(value){
                return '' + this.name + (value * 100).toFixed(3) + '%';
              }
            };
            let currentTypeData = this.data.bookingData[key];
            currentTypeData.forEach(v1 => {
              if(v == v1.bookingType.type) {
                o[v].push(v1);
                o.count++;
                o.total += Number(v1.userBooking.money);
                o.data += Number(v1.userBooking.money);
                o.ids.push(v1._id)
                if(o[v].length == 1){
                  o.title = v1.bookingType.title;
                  o.url = v1.bookingType.url;
                  o.name = v1.bookingType.title,
                  o.costTitle = v1.costType.title
                }
              }
            })
            o.percent = (o.total / totalMoney[key] * 100).toFixed(2) + '%';
            o.total = utils.thousandPlace(o.total.toFixed(2));
            o.ids = o.ids.join('-');
            this.data.typesData[key].push(o);
          })
        }
        // 
        // 
        this.setData({
          typesData:this.data.typesData,
          titleData:this.data.titleData
        })
        this.drawPie(this.data.typesData[this.data.currentType])

      },
      fail:err => {
        
      }
    })
  },
  // 查看记帐详情
  viewDetail:function(e) {
    // 
    // return ;
    // 参数序列化
    let params = '';
    let query = e.currentTarget.dataset;
    for(let key in query) {
      params += key + '=' + query[key] + '&';
    }
    params = params.slice(0,-1);
    
    // return;
    wx.navigateTo({
      url: '../detail/detail?' + params
    })
  }

})