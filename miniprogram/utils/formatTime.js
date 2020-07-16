module.exports = (date) => {
  let fmt = 'yyyy-MM-dd hh:mm:ss';
  const o = {
    'y+':date.getFullYear(),
    'M+':date.getMonth() + 1,//取到对应的月份，这里取到的月份是0-11所以需要加一
    'd+': date.getDate(), //日
    'h+':date.getHours(), //小时
    'm+':date.getMinutes(), //分钟
    's+':date.getSeconds(), //秒
  }

  for(let k in o){
    if(new RegExp('(' + k + ')').test(fmt)){
      fmt = fmt.replace(RegExp.$1,o[k].toString().length == 1 ? '0'+ o[k] : o[k])
    }
  }
  return fmt;
}