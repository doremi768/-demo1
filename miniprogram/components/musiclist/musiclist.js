// components/musiclist.js

const app = getApp();


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },
 //页面生命周期函数
 pageLifetimes: {
  show(){
    //获取到musicid,并赋值
    setTimeout(()=>{
      this.setData({
        playingId: parseInt(app.getPlayMusicId())
      })
    })
  
  }
},

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      const ds = event.currentTarget.dataset
      let musicId = ds.musicid
      this.setData({
        playingId: musicId
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicid=${musicId}&&index=${ds.index}`,
      })
    }
    
  }
})
