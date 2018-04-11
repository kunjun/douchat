// pages/my/list.js
var app = getApp();
var util = require('../../utils/util.js');
var page = 1;
var list = new Array();
Page({
  data:{
  tabs: ["全部", "车找人", "人找车"]
  },
  del:function(e){
    var that = this;
    var currentTarget = e.currentTarget.id;
    wx.showModal({
      title: '提示',
      content: '确定删除?',
      success: function(res) {
        if (res.confirm) {
          util.req('info/del',{sk:app.globalData.sk,id:list[currentTarget].id},function(data){
            if(data.status == 1){
              list.splice(currentTarget,1);
              that.setData({list:list});
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
            }else{
                util.isError('删除失败,请重试', that);
                return false;
            }
          })
        }
      }
    })
    return false;
  },
  edit:function(e){
    var currentTarget = e.currentTarget.id;
    console.log('/pages/info/add?id='+list[currentTarget].id);
    wx.navigateTo({
      url: '/pages/info/edit?id='+list[currentTarget].id,
      complete:function(res){
          console.log(res)
      }
    })
  },
  onReachBottom:function(){
    if(!this.data.nomore){
      page++;
      this.getList();
    }
  },
  getList(){
    var that = this;
    util.req('getMyInfoList','get',{sk:app.globalData.sk,page:page},function(data){
      if(data.items == null){
          if(page == 1){  
            that.setData({'isnull':true});
          }
          that.setData({nomore:true});
          return false;
        } 

        if(page == 1){          
          list = new Array();
        }

        var surp = new Array('','空位','人');
        data.items.forEach(function(item){
          var obj = {
            type:that.data.tabs[item.type],
            tp:item.type,
            time:util.formatTime(new Date(item.time*1000)),
            surplus:item.surplus+surp[item.type],
            see:item.see,
            gender:item.user.gender,
            url:'/pages/info/index?id='+item.id,
            tm:util.getDateDiff(item.time*1000),
            id:item.id
          };
          if (item.destination) {
              if ((item.destination).split('市')[1]) {
                  obj.over = ((item.destination).split('市')[1]).replace(/([\u4e00-\u9fa5]+[县区]).+/, '$1')
              }
          }
          if (item.departure) {
              if ((item.departure).split('市')[1]) {
                  obj.start = ((item.departure).split('市')[1]).replace(/([\u4e00-\u9fa5]+[县区]).+/, '$1')
              }
          }
          list.push(obj);
        })
      that.setData({list:list});
    })
  },  
  onPullDownRefresh: function(){
    page = 1;
    this.getList();
    wx.stopPullDownRefresh();
  },
  onShow:function(){
    page = 1;
    this.getList();
  }
})