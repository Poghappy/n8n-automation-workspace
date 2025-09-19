<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:06:43
         compiled from "/www/wwwroot/hawaiihub.net/templates/siteConfig/touch_bottom_5.0.html" */ ?>
<?php /*%%SmartyHeaderCode:1874941359688616534e5516-58084666%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'd055f0bf5dc4aed55f00541d4f52d4b413e87267' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/templates/siteConfig/touch_bottom_5.0.html',
      1 => 1753598768,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1874941359688616534e5516-58084666',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticPath' => 0,
    'cfg_staticVersion' => 0,
    'appIndex' => 0,
    'userinfo' => 0,
    'cfg_basehost' => 0,
    'member_userDomain' => 0,
    'member_busiDomain' => 0,
    'cfg_auto_location' => 0,
    'bottom_module' => 0,
    'nav' => 0,
    '_bindex' => 0,
    'active' => 0,
    'siteCityInfo' => 0,
    'icon_on' => 0,
    'langList' => 0,
    'isByteMiniprogram' => 0,
    'shopstatus' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_688616535814f6_11232984',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_688616535814f6_11232984')) {function content_688616535814f6_11232984($_smarty_tpl) {?><link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/ui/jquery.dialog.min.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
">

<?php if (!$_smarty_tpl->tpl_vars['appIndex']->value) {?>

<?php if ($_smarty_tpl->tpl_vars['userinfo']->value) {?>
<!-- 发布信息 s-->
<div class="cd-bouncy-nav-modal" id="myFabu">
	<div class="cd-bouncy-nav">
		<!-- <iframe  name="myFabuIframe" id="myFabuIframe" src="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabuJoin_touch_popup_3.4'),$_smarty_tpl);?>
" data-src="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabuJoin_touch_popup_3.4'),$_smarty_tpl);?>
" frameborder="0" width="100%" height="100%"></iframe> -->
	</div>
</div>
<!-- 发布信息 e-->
<?php }?>

<?php if (!$_smarty_tpl->tpl_vars['userinfo']->value) {?>
<!-- 登录 s-->
<div class="login-modal" id="myLogin" >
	<div class="loginBox">
		<!-- <iframe name="myLoginIframe" id="myLoginIframe" src="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'login_touch_popup_3.4'),$_smarty_tpl);?>
" data-src="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'login_touch_popup_3.4'),$_smarty_tpl);?>
" frameborder="0"  width="100%" height="100%"></iframe> -->
	</div>
</div>
<!-- 登录 e-->
<?php }?>
<?php echo '<script'; ?>
 type="text/javascript">
	var masterDomain = "<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
";
	var memberDomain_bottom = "<?php echo $_smarty_tpl->tpl_vars['member_userDomain']->value;?>
";
	var busDomain_bottom = "<?php echo $_smarty_tpl->tpl_vars['member_busiDomain']->value;?>
";
	var cfg_auto_location = '<?php echo $_smarty_tpl->tpl_vars['cfg_auto_location']->value;?>
'
<?php echo '</script'; ?>
>
<div class="footer_4_3" data-title="<?php echo $_smarty_tpl->tpl_vars['bottom_module']->value;?>
">
	<ul class="fn-clear <?php if ($_smarty_tpl->tpl_vars['bottom_module']->value=='shop') {?>red_ul<?php }?>">
		<?php $_smarty_tpl->tpl_vars['icon_on'] = new Smarty_variable('', null, 0);?>
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"siteConfig",'action'=>'touchHomePageFooter','version'=>'2.0','return'=>'nav','module'=>$_smarty_tpl->tpl_vars['bottom_module']->value)); $_block_repeat=true; echo loop(array('service'=>"siteConfig",'action'=>'touchHomePageFooter','version'=>'2.0','return'=>'nav','module'=>$_smarty_tpl->tpl_vars['bottom_module']->value), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

		<li class="<?php if ($_smarty_tpl->tpl_vars['nav']->value['fabu']==0) {?>ficon<?php } else { ?>fabu<?php }?> <?php if (($_smarty_tpl->tpl_vars['_bindex']->value['nav']==1&&$_smarty_tpl->tpl_vars['active']->value=='index')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==2&&$_smarty_tpl->tpl_vars['active']->value=='secondicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==4&&$_smarty_tpl->tpl_vars['active']->value=='fourthicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==5&&$_smarty_tpl->tpl_vars['active']->value=='fifthicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==3&&$_smarty_tpl->tpl_vars['active']->value=='thirdicon')) {
$_smarty_tpl->tpl_vars['icon_on'] = new Smarty_variable(1, null, 0);?> icon_on<?php }?> <?php if ($_smarty_tpl->tpl_vars['nav']->value['message']) {?>message_show<?php }?> <?php if ($_smarty_tpl->tpl_vars['bottom_module']->value=='shop'&&$_smarty_tpl->tpl_vars['_bindex']->value['nav']==3) {?>topcart shopgocart<?php }?>" data-code="<?php echo $_smarty_tpl->tpl_vars['nav']->value['code'];?>
" data-curr = "<?php if (($_smarty_tpl->tpl_vars['_bindex']->value['nav']==1&&$_smarty_tpl->tpl_vars['active']->value=='index')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==2&&$_smarty_tpl->tpl_vars['active']->value=='secondicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==4&&$_smarty_tpl->tpl_vars['active']->value=='fourthicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==5&&$_smarty_tpl->tpl_vars['active']->value=='fifthicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==3&&$_smarty_tpl->tpl_vars['active']->value=='thirdicon')) {
echo $_smarty_tpl->tpl_vars['active']->value;
}?>" data-currIndex="<?php echo $_smarty_tpl->tpl_vars['_bindex']->value['nav']-1;?>
" data-city="<?php echo $_smarty_tpl->tpl_vars['siteCityInfo']->value['domain'];?>
">

		   <a href="javascript:;" data-url="<?php echo $_smarty_tpl->tpl_vars['nav']->value['url'];?>
" data-mini="<?php echo $_smarty_tpl->tpl_vars['nav']->value['miniPath'];?>
" data-icon1="<?php echo $_smarty_tpl->tpl_vars['nav']->value['icon'];?>
" data-icon2="<?php echo $_smarty_tpl->tpl_vars['nav']->value['icon_h'];?>
" class="<?php if ($_smarty_tpl->tpl_vars['bottom_module']->value=='shop'&&$_smarty_tpl->tpl_vars['_bindex']->value['nav']==3) {?>cart-btn<?php }?>"<?php if ($_smarty_tpl->tpl_vars['icon_on']->value) {?> onclick="javascript:document.scrollingElement.scrollTop=0;"<?php }?>>
		   <!--
		   <a href="<?php if (($_smarty_tpl->tpl_vars['bottom_module']->value=='siteConfig'&&$_smarty_tpl->tpl_vars['nav']->value['fabu'])) {?>javascript:;<?php } else {
echo $_smarty_tpl->tpl_vars['nav']->value['url'];
}?>" data-icon1="<?php echo $_smarty_tpl->tpl_vars['nav']->value['icon'];?>
" data-icon2="<?php echo $_smarty_tpl->tpl_vars['nav']->value['icon_h'];?>
" class="<?php if ($_smarty_tpl->tpl_vars['bottom_module']->value=='shop'&&$_smarty_tpl->tpl_vars['_bindex']->value['nav']==3) {?>cart-btn<?php }?>"<?php if ($_smarty_tpl->tpl_vars['icon_on']->value) {?> onclick="javascript:document.scrollingElement.scrollTop=0;"<?php }?>>
		   -->
			<i>
			<?php if (($_smarty_tpl->tpl_vars['_bindex']->value['nav']==1&&$_smarty_tpl->tpl_vars['active']->value=='index')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==2&&$_smarty_tpl->tpl_vars['active']->value=='secondicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==4&&$_smarty_tpl->tpl_vars['active']->value=='fourthicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==5&&$_smarty_tpl->tpl_vars['active']->value=='fifthicon')||($_smarty_tpl->tpl_vars['_bindex']->value['nav']==3&&$_smarty_tpl->tpl_vars['active']->value=='thirdicon')) {?>
			<img src="<?php echo $_smarty_tpl->tpl_vars['nav']->value['icon_h'];?>
">
			<?php } else { ?>
		    <img src="<?php echo $_smarty_tpl->tpl_vars['nav']->value['icon'];?>
">
			<?php }?>
			</i>
			
		    <?php if ($_smarty_tpl->tpl_vars['nav']->value['fabu']==0) {?><p><?php echo $_smarty_tpl->tpl_vars['nav']->value['name'];?>
</p><?php }?>
			<?php if ($_smarty_tpl->tpl_vars['bottom_module']->value=='shop'&&$_smarty_tpl->tpl_vars['_bindex']->value['nav']==3) {?><em class="cart num"><?php if ($_smarty_tpl->tpl_vars['nav']->value['cartNum']<=99) {
echo $_smarty_tpl->tpl_vars['nav']->value['cartNum'];
} else { ?>99+<?php }?></em><?php }?>
		   </a>
		 </li>
		 <?php $_smarty_tpl->tpl_vars['icon_on'] = new Smarty_variable('', null, 0);?>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"siteConfig",'action'=>'touchHomePageFooter','version'=>'2.0','return'=>'nav','module'=>$_smarty_tpl->tpl_vars['bottom_module']->value), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

	</ul>

</div>
<style>

/*.footer_4_3 .ficon.message_icon em{background-color: #fff; border: solid .03rem #ff5e4d; color:#ff5e4d ;}*/
</style>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/lang/<?php echo $_smarty_tpl->tpl_vars['langList']->value['currCode'];?>
.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/jquery.dialog.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript">
<?php if ($_smarty_tpl->tpl_vars['isByteMiniprogram']->value) {?>
if(typeof(tt) == 'undefined') {
    document.head.appendChild(document.createElement('script')).src = 'https://lf3-cdn-tos.bytegoofy.com/goofy/developer/jssdk/jssdk-1.2.1.js?v=' + ~(-new Date());
}
<?php }?>
var member_Domain = "<?php echo $_smarty_tpl->tpl_vars['member_userDomain']->value;?>
";
var audioSrc = {
	refresh: '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
audio/refresh.mp3',
	tap: '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
audio/tap.mp3',
	cancel: '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
audio/cancel.mp3'
}

var is_login_animating = false;
var audio,audio1,audio2,stop=1;
    audio = new Audio();
    audio1 = new Audio();
    audio2 = new Audio();
    audio.src = audioSrc.refresh;
    audio1.src = audioSrc.tap;
    audio2.src = audioSrc.cancel;

var myLoginIframe = '';
var myFabuIframe = '';
var popupIframeTop = 0;
var bottomMsgInterval = null;

//关闭菜单
function btnLoginClose(){
	audio2.play();
	$('.login-modal').removeClass('fade-in').addClass('fade-out');
	setTimeout(function(){
		$('.login-modal').hide();
	}, 500);
	$('html').removeClass("popup_fixed");
	$(window).scrollTop(popupIframeTop);
}

function btnFbClose(){
	audio2.play();
	$('.cd-bouncy-nav-modal').removeClass('fade-in').addClass('fade-out');
	setTimeout(function(){
		$('.cd-bouncy-nav-modal').hide();
	}, 500);
	$('html').removeClass("popup_fixed");
    $(window).scrollTop(popupIframeTop);
}

function noscroll(){
    setTimeout(function(){
        $('html').addClass("popup_fixed");
	}, 300);
}



 $(function(){
	var cookie = $.cookie("HN_float_hide");

	<?php if ($_smarty_tpl->tpl_vars['bottom_module']->value=='shop') {?>
	var shopStatus = '<?php echo $_smarty_tpl->tpl_vars['shopstatus']->value;?>
';
	var busiUrl = "<?php echo getUrlPath(array('service'=>'member','template'=>'shop'),$_smarty_tpl);?>
"
	if(shopStatus === '1'){
		$(".footer_4_3 li").each(function(){
			var href = $(this).find('a').attr('href')
			if(href.indexOf('index_shop') > -1){
				$(this).find('a').attr('href',busiUrl)
				return false;
			}
		})
	}
	<?php }?>

	// 判断是否登录
	setTimeout(function(){
		if($(".cd-bouncy-nav").size()>0){
			$(".cd-bouncy-nav").append('<iframe  name="myFabuIframe" id="myFabuIframe" src="/static/images/blank.gif" data-src="'+member_Domain+'/fabuJoin_touch_popup_3.4.html" frameborder="0" width="100%" height="100%"></iframe>');
		}else if(!wx_miniprogram && !baidu_miniprogram && !qq_miniprogram){
			$(".loginBox").append('<iframe name="myLoginIframe" id="myLoginIframe" src="/static/images/blank.gif" data-src="'+member_Domain+'/login_touch_popup_3.4.html" frameborder="0"  width="100%" height="100%"></iframe>');
		}
		var fabuAhref = $('.footer_4_3 ul .fabu a').attr('href');
		//微信小程序发布按钮
		if(navigator.userAgent.toLowerCase().match(/micromessenger/) ) {
	        wx.miniProgram.getEnv(function (res) {
	            wx_miniprogram = res.miniprogram;
	            window.wx_miniprogram_judge = true;
	            if(wx_miniprogram) {
					var src = $("#myFabuIframe").data("src");
					if(src != undefined && fabuAhref == 'javascript:;'){
						$('.footer_4_3 ul .fabu a').attr('href', src);
					}
	            }
	        });
	    }

		//百度小程序、QQ小程序
		if(baidu_miniprogram || qq_miniprogram){
			var src = $("#myFabuIframe").data("src");
			if(src != undefined && fabuAhref == 'javascript:;'){
				$('.footer_4_3 ul .fabu a').attr('href', src);
			}
		}

	    var device_low = navigator.userAgent.toLowerCase()
	    //qq小程序发布按钮
		if(device_low.match('qq') && device_low.match('miniprogram')) {
	        qq.miniProgram.getEnv(function (res) {
	            qq_miniprogram = res.miniprogram;
	            console.log(qq_miniprogram)
	            if(qq_miniprogram) {
					var src = $("#myFabuIframe").data("src");
					if(src != undefined && fabuAhref == 'javascript:;'){
						$('.footer_4_3 ul .fabu a').attr('href', src);
					}
	            }
	        });
	    }

	    //百度小程序发布按钮
		if(device_low.match('swan-baiduboxapp')) {
	        swan.webView.getEnv(function (res) {
	            baidu_miniprogram = res.smartprogram;
	            if(baidu_miniprogram) {
					var src = $("#myFabuIframe").data("src");
					if(src != undefined && fabuAhref == 'javascript:;'){
						$('.footer_4_3 ul .fabu a').attr('href', src);
					}
	            }
	        });
	    }

	},1000)

	//弹出菜单--登录
	$('.header-top .login').on('tap', function() {
		//小程序直接跳转到登录页面
		if(wx_miniprogram || baidu_miniprogram || qq_miniprogram){
			location.href = masterDomain + '/login.html';
		}else{
	        popupIframeTop = $(window).scrollTop();
			audio.play();
			$('.login-modal').show().removeClass('fade-out').addClass('fade-in');
			if(myLoginIframe != 'login'){
				myLoginIframe = 'login';
				$("#myLoginIframe").attr("src", $("#myLoginIframe").data('src') + '#log');
			}
			stop=0;
			noscroll();
		}
	});
	 //弹出菜单--注册
	$('.header-top .register').on('tap', function() {
        popupIframeTop = $(window).scrollTop();
		audio.play();
		$('.login-modal').show().removeClass('fade-out').addClass('fade-in');
		if(myLoginIframe != 'register'){
			myLoginIframe = 'register';
			$("#myLoginIframe").attr("src", $("#myLoginIframe").data('src') + '#reg');
		}
		stop=0;
		noscroll();
	});

	//发布信息弹出菜单
	// $('.footer_4_3 ul .fabu').on('click tap', function() {
	// 	if(window.wx_miniprogram_judge == undefined) return;
	// 	if($(this).find('a').attr("href")!='javascript:;') return;
	//     popupIframeTop = $(window).scrollTop();
	//     var userid = $.cookie(cookiePre+'login_user');
	//     if(userid == undefined || userid == null || userid == 0 || userid == ''){

	// 		//小程序里跳转到登录页面
	// 		if(wx_miniprogram || baidu_miniprogram || qq_miniprogram){
	// 			location.href = masterDomain + '/login.html';
	// 			return;
	// 		}

	//       audio.play();
	//       $('.login-modal').show().removeClass('fade-out').addClass('fade-in');
	//       if(myLoginIframe != 'login'){
	//         myLoginIframe = 'login';
	//         $("#myLoginIframe").attr("src", $("#myLoginIframe").data('src') + '#log');
	//       }
	//       stop=0;
	//       noscroll();
	//     }else {
	//       audio.play();
	//       if (myFabuIframe != 'fabu') {
	//         $("#myFabuIframe").attr("src", $("#myFabuIframe").data('src') + '#fabu');
	//       }
	//       if(wx_miniprogram){
	// 		  // var src = $("#myFabuIframe").attr("src");
	// 		  // if(src != undefined){
	// 			//   // location.href = $("#myFabuIframe").attr("src");
	// 			//   // wx.miniProgram.navigateTo({url: '/pages/redirect/index?url=' + encodeURIComponent(src)});
	// 			//   $(this).find('a').attr('href', src);
	// 		  // }
	//         // $('#gotopage').remove();
	//         // $('body').append('<a href="'+$("#myFabuIframe").attr("src")+'" id="gotopage"></a>');
	//         // $('#gotopage').click();
	//         return;
	//       }
	//       $('.cd-bouncy-nav-modal').show().removeClass('fade-out').addClass('fade-in');
	//       myFabuIframe = 'fabu';
	//       stop = 0;
	//       noscroll();
	//     }
	// });

	//获取消息数目
	function getMessageNum_bottom(){
		console.log('getMessageNum_bottom')
		$.ajax({
	       url: '/include/ajax.php?service=member&action=message&type=tongji&im=1',
	       type: "GET",
	       dataType: "json",
	       timeout: 3000,
	       success: function (data) {
		       var html = [];
		       if(data.state == 100){
		       	var info = data.info.pageInfo;
		       	var count = info.im + info.unread + info.upunread + info.commentunread;
		       	$('.footer_4_3 li.message_show').find('em').remove();
		       	if(count<=99 && count>0){
		       		$('.footer_4_3 li.message_show').find('a i').prepend('<em>'+count+'</em>');
		       		$('.footer_4_3 li.message_show').attr('data-unread',info.unread);
		       		$('.footer_4_3 li.message_show').attr('data-im',info.im);
		       		$('.footer_4_3 li.message_show').attr('data-upunread',info.upunread);
		       		$('.footer_4_3 li.message_show').attr('data-commentunread',info.commentunread)
		       	}else if(count>99){
		       		$('.footer_4_3 li.message_show').find('a i').prepend('<em>99+</em>')
		       	}

		       }
	       },
	       error: function(){
	         $('.loading').html('<span>'+langData['siteConfig'][37][80]+'</span>');  //请求出错请刷新重试
	       }
	    });
	}

	var userid = $.cookie(cookiePre+"login_user");
	if($('.footer_4_3 li.message_show').size()>0){
		if(userid == null || userid == ""){
		       console.log(langData['siteConfig'][37][81])//登录之后可以查看新消息
		       $('.message_show').click(function(){
		       	 if(wx_miniprogram){
		       	 	wx.miniProgram.navigateTo({url: '/pages/login/index?path='+encodeURIComponent(location.href)+'&back=1&fromShare=' + $.cookie('HN_fromShare')});
        			return false;
		       	 }
		       })
		}else{

            //点击跳转到原生页面
            $('.message_show').click(function(e){
                if(wx_miniprogram){
                    $('.message_show a').attr('href', 'javascript:;'); //取消默认的跳转
                    wx.miniProgram.navigateTo({url: '/pages/member/message/index?module=<?php echo $_smarty_tpl->tpl_vars['bottom_module']->value;?>
'});
                    return false;
                }
            })

			if(typeof has_touch_top == 'undefined'){
				setTimeout(function(){
					getMessageNum_bottom();
					if($('#fast_nav').size()==0){
						bottomMsgInterval = setInterval(getMessageNum_bottom,10000)
						console.log('默认底部')
					}
					pageShowCheck(5)
				},3000)


				
				$(document).on('visibilitychange', function (e) {
					clearInterval(bottomMsgInterval)
					if (e.target.visibilityState === "visible") {
						// 页面显示
						if($('#fast_nav').size()==0){
							bottomMsgInterval = setInterval(getMessageNum_bottom,10000)
							console.log('前台底部')
						}
						pageShowCheck(5)
						console.log('重新开始2')
					} else if (e.target.visibilityState === "hidden") {
						// 页面隐藏
						console.log('清除定时器2')
						clearInterval(bottomMsgInterval)
					}
				});
			}
		}
	}
	function pageShowCheck(timeOut){ // timeOut => 单位是分钟 一段时间过后 修改定时器  interval请求时间间隔 单位是秒
        let next_timeOut = timeOut;
        switch(timeOut){
            case 5: 
                next_timeOut = 10,
                interval = 10;
                break;
            case 10: 
                next_timeOut = 20,
                interval = 20;
                break;
            case 20: 
                next_timeOut = 30,
                interval = 30;
                break;
            case 30: 
                next_timeOut = 60,
                interval = 60;
                break;
            case 60: 
                next_timeOut = 0,
                interval = 0;
                break;
        }
        setTimeout(() => {
            clearInterval(bottomMsgInterval)
            if(timeOut && interval && $('#fast_nav').size() == 0){
                bottomMsgInterval = setInterval(getMessageNum_bottom,interval * 1000)
				console.log('pageShowCheck')
            }
            if(next_timeOut){
                pageShowCheck(next_timeOut)
            }
        },timeOut * 60 * 1000);
    }
	window.addEventListener('message',function(e){
		if(e.data[0] == 'btnFbClose'){
		   btnFbClose();
	   }else if(e.data[0] == 'btnLoginClose'){
		   btnLoginClose();
	   }
   },false);
    //抖音小程序 底部导航
	var isBytemini = device.toLowerCase().includes("toutiaomicroapp");
    if (isBytemini) {
        $('body').delegate('.footer_4_3 a', 'click', function () {
            var par = $(this).closest('li');
            var thref = $(this).attr('href');
            if (par.attr('data-code') == 'job') {
				event.preventDefault();
                tt.miniProgram.redirectTo({ url: '/pages/packages/job/index/index' })
				return false;
            }
        })
    }
	//验证当前访问页面是否为当前城市(2023.7.17)
	let manualChange=localStorage.getItem('manualChange');
	if(typeof HN_Location=='undefined'||(Boolean(manualChange)&&'<?php echo $_smarty_tpl->tpl_vars['bottom_module']->value;?>
'!='siteConfig')){ //未检测到HN_Location
		localStorage.removeItem('manualChange');
		return false
	}
	let pathName=location.pathname;
	let pathArr=pathName.split('/');
	let pahtLength=pathArr.length;
	let needChange=true; //是否需要切换城市提示，默认是true
	//不需要的模块目前有：圈子、任务悬赏、互动交友、积分商城、有奖乐购、拍卖
	//重复的：skin首页、团购
	let modules=['/tuan','/circle','/task','/dating','/integral','/awardlegou','/paimai']; //不需要地址切换提示的模块，加这个数组里面
	for (let i = 0; i < modules.length; i++) {
		let element = modules[i];
		if(pathName.indexOf(element)>-1||'<?php echo $_smarty_tpl->tpl_vars['bottom_module']->value;?>
'=='siteConfig'){ 
			needChange=false;
			break;
		}
	}
	//1. 含有index或者index.html
	//2. /info或者/info/
	//3. xxx.com/sz/ 或者 xxx.com/info/ xxx.com/sz/info 或者 xxx.com/sz/info/
    setTimeout(function(){    
        if((pathName.indexOf('/index')>-1||pahtLength==2||(pahtLength==3&&(pathArr[pahtLength-1]==''||pathArr[pahtLength-1].indexOf('<?php echo $_smarty_tpl->tpl_vars['bottom_module']->value;?>
')>-1))||(pahtLength==4&&pathArr[pahtLength-2]=='<?php echo $_smarty_tpl->tpl_vars['bottom_module']->value;?>
'&&pathArr[pahtLength-1]==''))&&needChange){
            var isChecked = false;
            var siteCityInfo = $.cookie("HN_siteCityInfo");
            var changeAutoCity;
            if(siteCityInfo){
                HN_Location.init(function(data){
                    if(isChecked) return;
                    isChecked = true;
                    if (data != undefined && data.province != "" && data.city != "" && data.district != "" && !changeAutoCity) {
                    var province = data.province, city = data.city, district = data.district, town = data.town;
                        $.ajax({
                        url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&town="+town+"&district="+district+"&module=<?php echo $_smarty_tpl->tpl_vars['bottom_module']->value;?>
",
                        type: "POST",
                        dataType: "json",
                        success: function(data){
                        if(data && data.state == 100){
                            var siteCityInfo_ = JSON.parse(siteCityInfo);
                            var nowCityInfo = data.info;
                            if(siteCityInfo_.cityid != nowCityInfo.cityid && cfg_auto_location == '1'){
                                changeAutoCity = $.dialog({
                                width: 250,
                                buttons: {
                                    "取消": function() {
                                        this.close();
                                    },
                                    "确定": function() {
                                    
                                    if(device.toLowerCase().indexOf('huoniao') > -1 && device.toLowerCase().indexOf('android') > -1){
                                        setupWebViewJavascriptBridge(function(bridge) {
                                            bridge.callHandler('changeCity', JSON.stringify(nowCityInfo), function(){
                                                location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
                                            });
                                        });
                                    }else{
                                        var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
                                        var channelDomain_1 = channelDomainClean.split('.');
                                        var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");
                                    
                                        channelDomain_ = channelDomainClean.split("/")[0];
                                        channelDomain_1_ = channelDomain_1_.split("/")[0];
                                    
                                        $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomainClean, path: '/'});
                                        $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomain_1_, path: '/'});

                                        location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
                                    }
                                
                                    }
                                    },
                                content: '<div style="text-align: center"> '+langData['siteConfig'][53][22]+'<div style="font-size: .5rem; color: #ff6600; padding: .1rem 0;"><strong>' + nowCityInfo.name + '</strong></div>'+langData['siteConfig'][53][23]+' </div>'//检测到你目前的城市为 是否切换
                                }).open();
                            }
                        }
                        }
                    })
                    }
                })
            }
        }
    }, 500);

	
   
 });
<?php echo '</script'; ?>
>
<?php }?>
<?php }} ?>
