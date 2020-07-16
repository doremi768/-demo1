// components/lyric/lyric.js.js
let lyricHeight = 0;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric:String //解析歌词
  },

  //属性监听器
  observers:{
    lyric(lrc){
      if(lrc == '暂无歌词'){
        this.setData({
          lrcList: [
            {
              time: 0,
              lrc
            }
          ],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc);
      }
    }
  },


  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0, //当前选中的歌词的索引
    scrollTop: 0 // 滚动条滚动的高度
  },

  lifetime: {
    //对px和rpx换算
    ready(){
      //获取手机信息
      wx.getSystemInfo({
        success: (result) => {
          //750rpx
          //得到1rpx的大小,result.screenWidth / 750
          //在得到歌词的px高度
          // lyricHeight = result.screenWidth / 750 * 64
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updata(currentTime){
      let lrcList = this.data.lrcList;
      //如果没歌词，直接返回
      setTimeout(()=>{
        if(lrcList.length == 0){
          return 
        };
      })
      // console.log(lrcList[lrcList.length - 1].time)
      // if(currentTime > lrcList[lrcList.length - 1].time){
      //   if(this.data.nowLyricIndex != -1){
      //     this.data({
      //       nowLyricIndex: -1,
      //       scrollTop: lrcList.length * 35
      //     })
      //   }
      // }
      //遍历歌词列表
      for(let i = 0; i < lrcList.length; i++){
        //如果当前时间小于等于遍历到的歌词时间
        if(currentTime <= lrcList[i].time){
          this.setData({
            nowLyricIndex: i - 1,
          //取到当前歌词的高度
            scrollTop: (i - 1) * 35
          })
          break;
        }
      }
    },

   _parseLyric(sLyric){
    let line = sLyric.split('\n') // 通过\n对换行进行分割
    let _lrcList = [];
    //遍历每行的歌词时间和歌词
    line.forEach(elem => {
      //取到歌词时间
      let time = elem.match(/\[(\d{2,}):(\d{2,})(?:\.(\d{2,3}))?]/g);
      if(time != null){
        //以歌词时间为分割，得到歌词
        let lrc = elem.split(time)[1];
        //得到分钟和秒
        let timeMinSec = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
        //把时间转换成秒
        let timeSec = parseInt(timeMinSec[1] * 60 + parseInt(timeMinSec[2]) + parseInt(timeMinSec[3]) / 1000);
        _lrcList.push({
          lrc,
          time: timeSec
        })
      }
    })
    this.setData({
      lrcList : _lrcList
    })
    }
  }
})
