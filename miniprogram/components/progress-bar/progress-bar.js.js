// components/progress-bar/progress-bar.js.js
let movableAreaWidth = 0;
let movableViewWidth = 0;
const backgroundAudioManager = wx.getBackgroundAudioManager();
let currentSec = -1; //当前的秒数
let duration = 0; //当前歌曲总时长，以秒为单位
let currentTime = 0
let isMoving = false //表示当前的进度条是否在拖拽，如果在拖拽，就不调用onTimeUpdate这个方法
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currenTime: '00:00',
      totalTime: '00:00'
    },
    movableDis : 0,
    progress: 0
  },

  lifetimes: {
    //生命周期函数，组件在页面上布局完成后执行
    ready(){
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00'){
        this._setTime();
      }
      this._getMovableDis();
      this._bindBGMEvent();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //只要位置有变化就会触发
    onChange(event){
      //拖动了，才有source == touch
      if(event.detail.source == 'touch'){
        //当前的进度百分比
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) % 100;
        this.data.movableDis = event.detail.x;//当前的偏移量
        isMoving = true;
      }
    },
    //触摸完成的时候触发
    onTouchEnd(){
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime));
      this.setData({
        progress : this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currenTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      //表示把歌曲进度设置到什么时刻
      backgroundAudioManager.seek(this.data.movableDis);
      isMoving = false;
    },
    //获取进度条宽度
    _getMovableDis(){
      const query = this.createSelectorQuery();
      //查找到元素，然后获取元素宽度
      query.select('.movable-area').boundingClientRect();
      query.select('.movable-view').boundingClientRect();
      query.exec(rect => {
        movableAreaWidth = rect[0].width;
        movableViewWidth = rect[1].width;
      })
    },
    _bindBGMEvent(){
      backgroundAudioManager.onPlay(()=>{
        isMoving = false;
        //抛出一个事件
        this.triggerEvent('musicPlay');
      })
      backgroundAudioManager.onStop(()=>{
        // console.log('onStop')
      })
      backgroundAudioManager.onPause(()=>{
        // console.log('onPause')
        this.triggerEvent('musicPause');
      })
      backgroundAudioManager.onWaiting(()=>{
        // console.log('onWaiting')
        
      })
      backgroundAudioManager.onCanplay(()=>{
        //背景音乐的总时长
        if(typeof backgroundAudioManager.duration != 'undefined'){
          this._setTime();
        } else {
          //有时候可能会获取不到总时长，所以加个定时器
          setTimeout(()=>{
            this._setTime();
          },1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(()=>{
        //如果当前没有拖拽，才执行这里面的代码
        if(!isMoving){
          //获取每秒
          const currentTime = backgroundAudioManager.currentTime;
          //获取总时长
          const duration = backgroundAudioManager.duration;
          //得到补零之后的分和秒

          const Sec = currentTime.toString().split('.')[0];
          if(Sec != currentSec){
            const currentTimeFmt = this._dateFormat(currentTime);
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth)  * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currenTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = Sec

            //联动歌词
            //触发triggerEvent事件，
            this.triggerEvent('timeUpdata',{
              currentTime
            })
          }
        }
      })
      backgroundAudioManager.onEnded(()=>{
        // console.log('onEnded')
        this.triggerEvent('musicEnd');
      })
      backgroundAudioManager.onError((res)=>{
        wx.showToast({
          title: '错误' + res.errCode,
        })
      })
    },

    _setTime(){
      duration = backgroundAudioManager.duration;
      const derationFmt = this._dateFormat(duration);
      this.setData({
        ['showTime.totalTime']: `${derationFmt.min}:${derationFmt.sec}`
      })
    },
    //格式化时间
    _dateFormat(sec){
      const min = Math.floor(sec / 60);//得到分钟
      sec = Math.floor(sec % 60);//得到秒
      return{
        'min':this._parse0(min),
        'sec':this._parse0(sec)
      }
    },

    //当小于十秒的时候，需要补零
    _parse0(sec){
      return sec < 10 ? '0' + sec : sec
    }
  }
})
