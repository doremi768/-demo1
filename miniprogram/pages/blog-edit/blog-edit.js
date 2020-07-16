// pages/blog-edit/blog-edit.js
const MAX_WORDS_NUM = 140;//输入文字最大的个数
const MAX_IMG_NUM = 9 //最大的上传图片数量

const db = wx.cloud.database();

let content = ''; //当前输入的文字内容
let userInfo = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //输入的文字个数
    wordsNum: 0,
    footerBottom: 0,
    images: [], //用来存已经选择的图片
    selectphoto: true, //添加图片的样式是否显示

  },
  onInput(event){
    let wordsNum = event.detail.value.length;//得到字数的长度
    //如果字数超过最大字数
    if(wordsNum >= MAX_WORDS_NUM){
      //则
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value;
  },
  onFocus(event){
    //获取的键盘高度
    if(event == null){
      return 
    }
    this.setData({
      footerBottom: event.detail.height
    })
  },
  onBlur(){
    this.setData({
      footerBottom: 0
    })
  },
  onChooseImage(){
    //得到还可剩余选择的图片张数
    let max = MAX_IMG_NUM - this.data.images.length;
    wx.chooseImage({
      count: max,
      sizeType: ['original','compressed'],
      sourceType: ['album','camera'],
      success: res => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        //还能再选几张
        max = MAX_IMG_NUM - this.data.images.length;
        this.setData({
          selectphoto: max <= 0 ? false : true
        })
      }
    })

  },

  onDelImg(event){
    //删除
    this.data.images.splice(event.target.dataset.index,1);
    this.setData({
      images: this.data.images
    })
    if(this.data.images.length == MAX_IMG_NUM - 1){
      this.setData({
        selectphoto: true
      })
    }
  },

  onPreviewImage(event){
    wx.previewImage({
      urls:this.data.images,
      current: event.target.dataset.imgsrc
    })
  },
  //发布功能实现
  send(){
    //数据 -> 云数据库
    //数据库：内容、图片(上传到云存储中,唯一标识fileID),openid，昵称，头像，发布时间
    //去掉文字的前后空格
    if(content.trim() === ''){
      wx.showModal({
        title: '请输入内容',
        content: ''
      })
      return;
    }
    wx.showLoading({
      title: "发布中",
      mask:true
    })
    let promiseArr = [];
    let fileIds = [];
    //图片上传
    for(let i = 0 ; i < this.data.images.length; i++){
      let p = new Promise((resolve,reject)=>{
        let item = this.data.images[i];
        //文件扩展名
        let suffix = /\.\w+$/.exec(item)[0];
  
        wx.cloud.uploadFile({
          //如果图片相同新上传的会把后面的的覆盖，所以需要避免重复
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath : item,
          success: res => {
            fileIds = fileIds.concat(res.fileID);
            resolve();
          },
          fail: err => {
            console.log(err)
            reject();
          }
        })
      })
      promiseArr.push(p);
    };

    //存入到云数据库
    Promise.all(promiseArr).then(res => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: fileIds,
          createTime: db.serverDate() //服务端的时间
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: "发布成功",
          icon: 'success'
        })

        //返回blog页面，并且刷新
        wx.navigateBack()
        const pages = getCurrentPages();
        //取到上一个页面
        console.log(pages)
        const prevPage = pages[pages.length - 2];
        prevPage.onPullDownRefresh();
      }).catch(err => {
        wx.hideLoading();
        console.log(err)
        wx.showToast({
          title: '发布失败',
          icon: 'none'
        })
      })
    })
    },
    
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options;
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