// pages/playlist/playlist.js
const MAX_LIMIT = 60;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [
      {
        url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      },
      {
        url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      },
      {
        url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
      }
    ],
    playlist: [
      
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getplaylist();
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
    this.setData({
      playlist: []
    })
    this._getplaylist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getplaylist();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  _getplaylist(){
    //加载框显示
    wx.showLoading({
      title: '加载中...',
    })
    //请求云函数，将数据库的数据取到
    wx.cloud.callFunction({
      name: 'music',//云函数的名称
      data: {
        $url: 'playlist',
        //得到数据的长度
        start: this.data.playlist.length,
        //每次数据取到的条数
        count: MAX_LIMIT
      }
    }).then(res => {
      this.setData({
        //得到数据
        playlist: this.data.playlist.concat(res.result.data)
      })
      //停止当前页面下拉刷新
      wx.stopPullDownRefresh();
      //数据刷新之后，隐藏加载框
      wx.hideLoading();
    })
  }
})