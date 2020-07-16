// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: {
      type: Object
    }
  },
  //监听器
  observers: {
    //当这个属性变化的时候，就会执行里面的方法
    ['playlist.playCount'](count){
      this.setData({
        /*['playlist.playCount']:this._tranNumber(count,2)
        *如果做这样做，当监听器监听到属性变化，执行方法的时候，给这个属性赋值，又会触发监听器，从而造成死循环
        *所以需要使用_count来保存数据，以免重复触发监听器监听的方法
        */
        _count:this._tranNumber(count,2)
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //跳转页面
    gotoMusiclist(){
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    },

    //将播放数量的数字转换成汉字位
    _tranNumber(num, point){
      //将num这个数字转换成字符串，然后取到整数位,将小数点后的舍去
      let numStr = num.toString().split('.')[0];
      if(numStr.length < 6){//判断当前字符串的长度，从而知道数字有多大
        //如果数字是十万以内，不做处理，直接返回
        return numStr;
      }else if(numStr.length >= 6 && numStr.length <= 8){
        //截取到千位和百位
        let decimal = numStr.substring(numStr.length - 4, numStr.length + point);
        return parseFloat(parseInt(num / 10000) + '.' + decimal).toFixed(2) + "万";
      } else if(numStr.length > 8){
        //截取到千万位和百万位
        let decimal = numStr.substring(numStr.length - 8,numStr.length - 8 + point);
        return parseFloat(parseInt(num / 100000000) + '.' + decimal).toFixed(2) + "亿";
      }
    }
  }
})
