

$(function(){
  var action, objId = $('.house-list');
  var orderpage = 1;
  var isload = false;
  //切换
  $(".tab .type").bind("click", function(){
    var t = $(this), id = t.attr("data-id"), index = t.index();
    if(!t.hasClass("curr")){
      state = id;
      t.addClass("curr").siblings("li").removeClass("curr");
      getList(1);
    }
  });
  getList();

  var M={};
  // 删除
  objId.delegate(".del", "click", function(){

    var t = $(this), par = t.closest(".house-box"), id = par.attr("data-id");

    if(id){

        M.dialog = jqueryAlert({
              'title'   : '',
              'content' : langData['renovation'][15][22],//确定要删除吗?
              'modal'   : true,
              'buttons' :{
                  '是' : function(){
                      M.dialog.close();
                      $.ajax({
                          url: masterDomain+"/include/ajax.php?service=renovation&action=delStoreaptitudes&id="+id,
                          type: "GET",
                          dataType: "jsonp",
                          success: function (data) {
                            if(data && data.state == 100){
                              //删除成功后移除信息层并异步获取最新列表
                              objId.html('');
                              getList(1);

                            }else{
                              alert(data.info);
                            }
                          },
                          error: function(){
                            alert(langData['siteConfig'][20][183]);
                          }
                        });
                  },
                  '否' : function(){
                      M.dialog.close();
                  }
              }
        })
    }
  });




  // 下拉加载
  //加载
$(window).scroll(function() {
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w - 60;
    if ($(window).scrollTop() >= scroll && !isload) {
        orderpage++;
        getList();
        
    };
});

    function getList(tr) {
      if(tr){
        isload = false;
        orderpage = 1;
        objId.html('');
      }
      if(isload) return false;
      isload = true;
      if(typeof Identity=='string'){
        Identity=JSON.parse(Identity);
      }
      objId.append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候

       var url ="/include/ajax.php?service=renovation&action=storeAptitudes&u=1&company="+Identity.store.id+"&orderby=1&state="+state+"&page="+orderpage +"&pageSize=5";

      $.ajax({
          url: url,
          type: "GET",
          dataType: "json",
          success: function (data) {
            isload = false;          
            if(data && data.state == 100){
                var list = data.info.list,html=[], pageInfo = data.info.pageInfo;
                var totalpage = pageInfo.totalPage;
                if(list.length > 0){
                  var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                  var param = t + "do=edit&id=";
                  var urlString = editUrl + param;
                  $('.loading').remove();
                  for(var i=0;i<list.length;i++){
                    var id= list[i].id,
                        url= list[i].url, 
                        title= list[i].title, 
                        litpic= list[i].litpic, 
                        pubdate= list[i].pubdate, 
                        click= list[i].click;
                      html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                      html.push('      <div class="title">');
                      var time = huoniao.transTimes(pubdate,1)
                      html.push('        <span>'+langData['renovation'][14][69]+'：'+time+'</span>');//发布时间
                      if(list[i].state == "0"){//待审核
                        html.push('<span style="color:#F9412E; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                      }else if(list[i].state == "2"){//审核拒绝
                        html.push('<span style="color:#F9412E; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                      }
                      html.push('      </div>');
                      html.push('      <div class="house-item fn-clear">');
                      if(litpic !='' && litpic != undefined){
                        html.push('      <div class="house-img fn-left">');
                        html.push('         <a href="'+url+'">');
                        html.push('            <img src="'+litpic+'"></a>');
                        html.push('      </div>');
                      } 
                      html.push('          <dl class="fn-clear">');
                      html.push('            <a href="'+url+'">');
                      html.push('              <dt>'+title+' </dt>');                                    
                      html.push('            </a>');
                      html.push('            <dd class="o fn-clear">');                                     
                      html.push('<a href="'+urlString+id+'" class="edit">'+langData['renovation'][7][4]+'</a>');//编辑
                      html.push('<a href="javascript:;" class="del">'+langData['renovation'][7][5]+'</a>');//删除
                      html.push('            </dd>');
                      html.push('          </dl>');
                      html.push('        </div>');                             
                      html.push('    </div>');

                  }
                  objId.append(html.join(""));
                  isload = false;
                  if(orderpage >= totalpage){ 
                    isload = true;                 
                    objId.append('<div class="loading">'+langData['renovation'][2][25]+'</div>');   //已显示全部
                  }
                  if(pageInfo.audit>0){
                    $("#audit").show().html(pageInfo.audit);
                  }else{
                    $("#audit").hide();
                  }
                  if(pageInfo.gray>0){
                      $("#gray").show().html(pageInfo.gray);
                  }else{
                      $("#gray").hide();
                  }
                  if(pageInfo.refuse>0){
                      $("#refuse").show().html(pageInfo.refuse);
                  }else{
                      $("#refuse").hide();
                  }
                }else{
                   objId.find(".loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                }
                
            }else {
                  objId.find(".loading").html(data.info);
            }
        },
        error: function(){
            isload = false;
            objId.find(".loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
        }
      })
    }

})




