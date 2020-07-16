// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false, //登录组件是否显示
    modalShow: false, //底部弹出层是否显示
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){ //判断用户是否授权
      wx.getSetting({
        success: res => {
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
             success: res => {
               userInfo = res.userInfo
               //显示评论弹出层
               this.setData({
                 modalShow: true
               })
             }
            })
          } else {
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },
    onLoginSuccess(event){
      userInfo = event.detail;
      console.log(userInfo)
      //授权框消失，评论框显示
      this.setData({
        loginShow: false
      },()=>{
        this.setData({
          modalShow: true
        })
      })
    },
    onLoginFail(){
      console.log(1);
      
      wx.showModal({
        title: '授权用户才能进行评论',
        content: '',
      })
    },
    onInput(event){
      this.setData({
        content: event.detail.value
      })
    },
    onSend(event){
      // console.log(event)
      // let formId = event.detail.formId
      //插入数据库
      console.log(this.properties.blogId)
      console.log(event)
      let content = event.detail.value.content;
      if(content.trim() == ''){
        wx.showModal({
          title: '评论的内容不能为空',
          content: '',
        })
        return;
      }
      wx.showLoading({
        title: '评价中',
        mask: true,  //遮罩层
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '评论成功',
      })
      this.setData({
        modalShow:false,
        content: ''
      })
      // console.log(this.properties.blogId);
      //父元素刷新评论页面
      this.triggerEvent('refreshCommentList')
      })
      //推送模板消息
    }
  },
  
})
