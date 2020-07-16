// pages/player/player.js
let musicList = [];
//正在播放歌曲的index
let nowPlayingIndex = 0;
//获取全局唯一的背景音频管理器，是一个对象，像js中的单例设计模式
const backgroundAudioManage = wx.getBackgroundAudioManager()

//微信自带方法，通过这个就可以调用全局属性或方法
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //如果这里面的数据需要放在页面显示，那就放在data中，否则就单独定义在外面
    picUrl: '',
    isPlaying: false, //false表示不播放，true表示播放
    isLyricShow: false, //表示当前歌词是否显示
    liric: '',
    isSame: false, //表示是否为同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    nowPlayingIndex = options.index;
    //将storage中的数据取出来
    musicList = wx.getStorageSync('musiclist');
    this._loadMusicDetail(options.musicid);
  },
  //取到歌曲的数据
  _loadMusicDetail(musicid){
    //判断是不是同一首歌曲
    if(musicid == app.getPlayMusicId()){
      this.setData({
        isSame: true
      })
    } else {
        this.setData({
          isSame: false
        })
    }
    //不是同一首歌曲才停止
    if(!this.data.isSame){
      backgroundAudioManage.stop();
    }
    let music = musicList[nowPlayingIndex];
    //设置title名字
    wx.setNavigationBarTitle({
      title: music.name,
    });
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    });
    //将musicid传入全局方法中
    app.setPlayMusicId(musicid);
    wx.showLoading({
      title: '歌曲加载中...',
    })
    wx.cloud.callFunction({
      name: 'music',
      //视频中的是musicId
      data: {
        musicId: musicid,
        $url: 'musicUrl'
      }
    }).then(res => {
      let result = JSON.parse(res.result);
      //如果不是同一首歌曲，就重新获取
      if(!this.data.isSame){
        //表示当前歌曲无法播放，有些歌曲必须要登录了才能播放
        if(result.data[0].url == null){
          wx.showToast({
            title: '无权限播放'
          })
          return
        }

        //设置播放地址
        backgroundAudioManage.src = result.data[0].url;
        backgroundAudioManage.title = music.name;
        backgroundAudioManage.singer = music.ar[0].name;
        backgroundAudioManage.coverImgUrl = music.al.picUrl;
        backgroundAudioManage.epname = music.al.name
        //保存播放地址
        this.savePlayHistory();
      }
      
      //当请求完数据之后，变成播放
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()

      //加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data:{
          musicId:musicid,
          $url: 'lyric'
        }
      }).then(res=>{
        let lyric = "暂无歌词" //因为有些歌曲没有歌词，如纯音乐
        const lrc = JSON.parse(res.result).lrc;
        if(lrc){
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      }) 
    })
  },

  //当触发点击事件之后，如果在播放，就暂停
  togglePlaying(){
    if(this.data.isPlaying){
      backgroundAudioManage.pause();
    }else{
      backgroundAudioManage.play();
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  //切换到上一首
  prev(){
    backgroundAudioManage.stop();
    nowPlayingIndex--;
    if(nowPlayingIndex < 0){
      nowPlayingIndex = musicList.length - 1;
    }
    this._loadMusicDetail(musicList[nowPlayingIndex].id);
  },

  //切换到下一首
  next(){
    backgroundAudioManage.stop();
    nowPlayingIndex++;
    if(nowPlayingIndex === musicList.length){
      nowPlayingIndex = 0;
    }
    this._loadMusicDetail(musicList[nowPlayingIndex].id);
  },

  //操作歌词是否显示
  onChangeLyricShow(){
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  timeUpdata(event){
    //选中lyric这个类名，调用lyric方法并将得到currentTime的值，
    //传入lyric组件中
    this.selectComponent('.lyric').updata(event.detail.currentTime)
  },

  onPlay(){
    this.setData({
      isPlaying: true
    })
  },
  onPause(){
    this.setData({
      isPlaying: false
    })
  },

  //保存播放历史
  savePlayHistory(){
    //当前正在播放的歌曲
    const music = musicList[nowPlayingIndex];
    const openid = app.globalData.openid;
    console.log(openid)
    const history = wx.getStorageSync(openid);
    let bHave = false;//判断歌曲是否存在,false为不存在
    //判断当前歌曲是否存在播放历史中
    for(let i = 0; i< history.length; i++){
      if(history[i].id == music.id){
        bHave = true;
        break;
      }
    }
    if(!bHave){
      history.unshift(music);
      wx.setStorage({
        data: history,
        key:openid,
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})