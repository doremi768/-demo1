// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();//初始化云数据库

const rp = require('request-promise');
const URL = 'http://musicapi.xiecheng.live/personalized';
const playlistCollection = db.collection('playlist');
const MAX_LIMIT = 100;
// 云函数入口函数
exports.main = async (event, context) => {
  //得到集合中的数据

  // const list = await playlistCollection.get();
  //获取总条数
  const countResult = await playlistCollection.count;
  //total是count的属性，是结果数量
  const total = countResult.total;
  //结果数量除100，就得到了要取几次
  const batchTimes = total / MAX_LIMIT;
  //用数组来存每次的promise
  const tasks = [];
  for(let i = 0; i < batchTimes; i++){
    //skip表示从哪个位置开始取，limit表示取多少，get取，最后得到了一个promise,查询的结果数据
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
    //将promise放入数组中
    tasks.push(promise);
  }
  let list = {
    data: []
  }
  if(tasks.length > 0){
    (await Promise.all(tasks)).reduce((acc,cur)=>{
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  const playlist = await rp(URL).then((res)=>{
    return JSON.parse(res).result;
  });
  //数据去重
  const newData = [];
  for(let i = 0; i < playlist.length; i++){
    let flag = true;
    for(let j = 0; j < list.data.length; j++){
      if(playlist[i].id === list.data[j].id){
        //进入了这里面说明有重复数据，直接将false改为false;
        //然后结束当前内层循环，直接开始下一次外层循环
        flag = false;
        break;
      }
    }
    //如果此时false是true，说明数据没有重复，将之存入数组
    if(flag){
      newData.push(playlist[i]);
    }
  }

  //遍历出所有数据，插入到数据库,插入到数据的值，应该是去重之后的数据
  for(let i = 0 ; i < newData.length; i++){
    await playlistCollection.add({
      data: {
        ...newData[i],
        //获取服务器的时间
        createTime: db.serverDate(),
      }
    }).then(res => {
      console.log('插入成功');
    }).catch(err => {
      console.error('插入失败');
    })
  }
  return newData.length;
}