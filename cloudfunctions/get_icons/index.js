// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 获取数据库引用
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  // 到日志里看输出，在控制台是看不到的
  try{
    // 查询数据库
    return await db.collection('iconsData').get();

  }catch(err){
    
  }
  // 
}