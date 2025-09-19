<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:06:42
         compiled from "/www/wwwroot/hawaiihub.net/templates/siteConfig/touch/3001__skin4/index.html" */ ?>
<?php /*%%SmartyHeaderCode:928189527688616528fabe6-44865669%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '2da1d52010e173306838fab0c58c17aeaad59790' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/templates/siteConfig/touch/3001__skin4/index.html',
      1 => 1753615518,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '928189527688616528fabe6-44865669',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_webname' => 0,
    'cfg_soft_lang' => 0,
    'cfg_keywords' => 0,
    'cfg_description' => 0,
    'cfg_basehost' => 0,
    'cfg_staticPath' => 0,
    'cfg_staticVersion' => 0,
    'templets_skin' => 0,
    'member_userDomain' => 0,
    'cfg_hideUrl' => 0,
    'redirectUrl' => 0,
    'site' => 0,
    'cfg_cookiePre' => 0,
    'cfg_auto_location' => 0,
    'cfg_weblogo' => 0,
    'HUONIAOROOT' => 0,
    'cfg_weixinQr' => 0,
    'cfg_weixinName' => 0,
    'langData' => 0,
    'cfg_miniProgramQr' => 0,
    'cfg_miniProgramName' => 0,
    'cfg_app_ios_download' => 0,
    'cfg_app_android_download' => 0,
    'cfg_app_logo' => 0,
    'cfg_appname' => 0,
    'cfg_app_ios_version' => 0,
    'cfg_app_android_version' => 0,
    'siteCityInfo' => 0,
    'type' => 0,
    'installModuleArr' => 0,
    'business_channelDomain' => 0,
    'info_channelDomain' => 0,
    'tieba_channelDomain' => 0,
    'circle_channelDomain' => 0,
    'dating_channelDomain' => 0,
    'live_channelDomain' => 0,
    'huodong_channelDomain' => 0,
    'cfg_business_state' => 0,
    'job_channelDomain' => 0,
    'house_channelDomain' => 0,
    'renovation_channelDomain' => 0,
    'langList' => 0,
    'cfg_kefu_touch_url' => 0,
    'cfg_kefuMiniProgram' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68861652b1b792_56970291',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68861652b1b792_56970291')) {function content_68861652b1b792_56970291($_smarty_tpl) {?><?php if (!is_callable('smarty_modifier_replace')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/modifier.replace.php';
?><!DOCTYPE html>
<html>
<head>
<title><?php echo $_smarty_tpl->tpl_vars['cfg_webname']->value;?>
</title>
<meta charset="<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
">
<meta name="keywords" content="<?php echo $_smarty_tpl->tpl_vars['cfg_keywords']->value;?>
">
<meta name="description" content="<?php echo $_smarty_tpl->tpl_vars['cfg_description']->value;?>
">
<meta name="wap-font-scale" content="no">
<meta name="format-detection" content="telephone=no">
<meta name="viewport" content="width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no,viewport-fit=cover">
<link rel="shortcut icon" href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/favicon.ico" type="image/x-icon">
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/core/touchBase.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
">
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/ui/swiper.min.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
">
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/ui/jquery.dialog.min.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
">
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
css/index.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
">
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/core/touchScale.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/core/jquery-1.8.3.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
js/jquery.inview.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
>
	var masterDomain = '<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
', userDomain = '<?php echo $_smarty_tpl->tpl_vars['member_userDomain']->value;?>
', staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';
	var hideFileUrl = <?php echo $_smarty_tpl->tpl_vars['cfg_hideUrl']->value;?>
, redirectUrl = '<?php echo $_smarty_tpl->tpl_vars['redirectUrl']->value;?>
', site = '<?php echo $_smarty_tpl->tpl_vars['site']->value;?>
';
	var cookiePre = '<?php echo $_smarty_tpl->tpl_vars['cfg_cookiePre']->value;?>
';
	var templets = '<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
';
	var cfg_auto_location = '<?php echo $_smarty_tpl->tpl_vars['cfg_auto_location']->value;?>
';
	// if(device.indexOf('huoniao') > -1){
    //     setTimeout(function(){
    //         setupWebViewJavascriptBridge(function(bridge) {
    //             bridge.callHandler('goToIndex', {}, function(){});
    //         });
    //     }, 500);
    // }
<?php echo '</script'; ?>
>


<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['cfg_description']->value;?>
<?php $_tmp1=ob_get_clean();?><?php $_smarty_tpl->tpl_vars['Share_description'] = new Smarty_variable($_tmp1, null, 0);?>
<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['cfg_webname']->value;?>
<?php $_tmp2=ob_get_clean();?><?php $_smarty_tpl->tpl_vars['Share_title'] = new Smarty_variable($_tmp2, null, 0);?>
<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['cfg_weblogo']->value;?>
<?php $_tmp3=ob_get_clean();?><?php $_smarty_tpl->tpl_vars['Share_img'] = new Smarty_variable($_tmp3, null, 0);?>
<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
<?php $_tmp4=ob_get_clean();?><?php $_smarty_tpl->tpl_vars['Share_url'] = new Smarty_variable($_tmp4, null, 0);?>
<?php echo $_smarty_tpl->getSubTemplate (((string)$_smarty_tpl->tpl_vars['HUONIAOROOT']->value)."/templates/siteConfig/public_share.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, null, array(), 0);?>

</head>

	<body>
		<div class="wechat-popup">
			<div class="con">
				<a href="javascript:;" class="close">×</a>
				<?php if ($_smarty_tpl->tpl_vars['cfg_weixinQr']->value) {?><dl><dt><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_weixinQr']->value;?>
"></dt><dd><?php echo $_smarty_tpl->tpl_vars['cfg_weixinName']->value;?>
<br><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][16];?>
</dd></dl><?php }?>    
				<?php if ($_smarty_tpl->tpl_vars['cfg_miniProgramQr']->value) {?><dl><dt><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_miniProgramQr']->value;?>
"></dt><dd><?php echo $_smarty_tpl->tpl_vars['cfg_miniProgramName']->value;?>
<br><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][16];?>
</dd></dl><?php }?>    
			</div>
		</div>
		<div class="downloadAppFixed">
		<div class="con">
			<a href="javascript:;" class="close">×</a>
			<?php if ($_smarty_tpl->tpl_vars['cfg_app_ios_download']->value||$_smarty_tpl->tpl_vars['cfg_app_android_download']->value) {?>
			<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'mobile'),$_smarty_tpl);?>
">
				<dl class="fn-clear app">
					<dt><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_app_logo']->value;?>
" /></dt>
					<dd>
						<h3><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][87];
echo $_smarty_tpl->tpl_vars['cfg_appname']->value;?>
</h3> 
						<p data-ios="<?php echo $_smarty_tpl->tpl_vars['cfg_app_ios_version']->value;?>
" data-android="<?php echo $_smarty_tpl->tpl_vars['cfg_app_android_version']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][16][110];?>
：v<em></em></p> 
					</dd>
				</dl>
			</a>
			<?php }?>
			<?php if ($_smarty_tpl->tpl_vars['cfg_weixinQr']->value) {?>
			<div class="weixin">
				<img src="<?php echo $_smarty_tpl->tpl_vars['cfg_weixinQr']->value;?>
" />
				<ul>
					<li><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][17];?>
“<?php echo $_smarty_tpl->tpl_vars['cfg_weixinName']->value;?>
”<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][26][194];?>
</li> 
					<li><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][18];?>
</li> 
				</ul>
			</div>
			<?php }?>
		</div>
	</div>
		<!--轮播图-->
		<div class="banner">
			<div class="wrapper">
			    <div class="swiper-container">
			        <div class="swiper-wrapper">
			        	<?php ob_start();?><?php echo getMyAd(array('title'=>"首页_模板四_移动端_广告一",'type'=>"slide"),$_smarty_tpl);?>
<?php $_tmp5=ob_get_clean();?><?php echo smarty_modifier_replace($_tmp5,"slideshow-item","swiper-slide");?>

			        </div>
			        <div class="pagination"></div>
			    </div>
		 	</div>
		</div>

		<div class="head-search-box">
			<div class="head-search">
				<!--选定地点-->
				<?php if ($_smarty_tpl->tpl_vars['siteCityInfo']->value&&$_smarty_tpl->tpl_vars['siteCityInfo']->value['count']>1) {?><div class="areachose" data-url="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/changecity.html?currentPageOpen=1"><span><?php echo $_smarty_tpl->tpl_vars['siteCityInfo']->value['name'];?>
</span><s></s></div><?php }?>

				<!--搜索、扫描-->
				<div class="search-scan">

					<a class="search<?php if ($_smarty_tpl->tpl_vars['siteCityInfo']->value['count']<=1) {?> singelCity<?php }?>" href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/siteSearch.html?currentPageOpen=1"><i></i></a>
					<i class="scan"></i>
				</div>
			</div>
		</div>
		<!--导航-->
		<div class="pubBox tcInfo">
			<div class="noslide tabMain show">
			    <div class="swiper-container swipre00">
					<div class="swiper-wrapper">
						<div class="swiper-slide">
							<ul>
							   <?php $_smarty_tpl->smarty->_tag_stack[] = array('siteConfig', array('action'=>'siteModule','return'=>'type','type'=>1)); $_block_repeat=true; echo siteConfig(array('action'=>'siteModule','return'=>'type','type'=>1), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

							   <?php if ($_smarty_tpl->tpl_vars['type']->value['code']!='special'&&$_smarty_tpl->tpl_vars['type']->value['code']!='website') {?>
								<li class="<?php if ($_smarty_tpl->tpl_vars['type']->value['wx']!=1) {?>wx-hide<?php }?>"><a href="<?php echo $_smarty_tpl->tpl_vars['type']->value['url'];?>
" class="<?php if ($_smarty_tpl->tpl_vars['type']->value['code']=='info'||$_smarty_tpl->tpl_vars['type']->value['code']=='waimai'||$_smarty_tpl->tpl_vars['type']->value['code']=='shop'||$_smarty_tpl->tpl_vars['type']->value['code']=='task'||$_smarty_tpl->tpl_vars['type']->value['code']=='job'||$_smarty_tpl->tpl_vars['type']->value['code']=='tuan'||$_smarty_tpl->tpl_vars['type']->value['code']=='article') {?>toMini<?php }?>" data-module="<?php echo $_smarty_tpl->tpl_vars['type']->value['code'];?>
" data-temp="index" data-code="<?php echo $_smarty_tpl->tpl_vars['type']->value['code'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['type']->value['name'];?>
"><span class="icon-circle"><img src="<?php echo $_smarty_tpl->tpl_vars['type']->value['icon'];?>
"></span><span class="icon-txt"><?php echo $_smarty_tpl->tpl_vars['type']->value['name'];?>
</span></a></li>
								<?php }?>
								<?php $_block_content = ob_get_clean(); $_block_repeat=false; echo siteConfig(array('action'=>'siteModule','return'=>'type','type'=>1), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

							</ul>
						</div>
					</div>
					<div class="pagination pag00"></div>

			    </div>
			</div>
		</div>
		<!-- 广告位二 -->
		<div class="adv-box2">
			<?php echo getMyAd(array('title'=>"首页_模板四_移动端_广告二"),$_smarty_tpl);?>

		</div>
		<?php if (in_array("article",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<!--同城头条s-->
		<div class="tcNews-box">
			<div class="tcNews">
				<div class="news-icon"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/news_icon.png"/></div>
				<div class="news-list">
					<div class="swiper-container">
					    <div class="swiper-wrapper">
					    	<div class="pl_h fn-clear">
			                    <div class="pl_h_l"></div>
			                    <div class="pl_h_r"></div>
			                </div>
			            </div>
					</div>
				</div>
			</div>
		</div>
		<!-- 同城头条 e -->
		<?php }?>
		<!--限时抢购、服务-->
		<div class="servericeall-box fn-clear">

			<div class="deadline fn-left">
				<a href="<?php echo getUrlPath(array('service'=>'shop','template'=>'qianggou'),$_smarty_tpl);?>
">
					<s></s><p class="deadline-show"><span id="time_h">0</span><i>:</i><span id="time_m">0</span><i>:</i><span id="time_s">0</span></p>
				</a>
				<ul>

				</ul>
			</div>
			<div class="adv-box3 fn-right">
				<?php echo getMyAd(array('title'=>"首页_模板四_移动端_广告三"),$_smarty_tpl);?>

			</div>

		</div>
		<!-- 本地商家 生活服务 便民黄页 s-->
		<div class="row-all">
			<ul>
				<!-- 判断三种情况 添加三种样式 -->
				<li class="busLi <?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)&&in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>smallLi<?php }
if ((in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)&&!(in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value)))||(!(in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value))&&in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value))) {?>midLi<?php }?>"><a href="<?php echo $_smarty_tpl->tpl_vars['business_channelDomain']->value;?>
">

					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][0];?>
</h2>   
					<p><strong id="datanums1">0</strong>家</p>
					<h3><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][1];?>
</h3>   
				</a></li>
				<?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
				<li class="infoLi <?php if (in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>smallLi<?php } else { ?>midLi<?php }?>"><a href="<?php echo $_smarty_tpl->tpl_vars['info_channelDomain']->value;?>
" data-module="info" data-temp="index" class="toMini">

					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][16][18];?>
</h2>   
					<p><strong id="datanums2">0</strong>条</p>
					<h3><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][1];?>
</h3>   
				</a></li>
				<?php }?>
				<?php if (in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
				<li class="tiebaLi <?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>smallLi<?php } else { ?>midLi<?php }?>"><a href="<?php echo $_smarty_tpl->tpl_vars['tieba_channelDomain']->value;?>
" class="toMini" data-module="tieba" data-temp="index">

					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][223];?>
</h2>   
					<p><strong id="datanums3">0</strong>条</p>
					<h3><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][1];?>
</h3>   
				</a></li>
				<?php }?>
			</ul>
		</div>
		<!-- 本地商家 生活服务 便民黄页 e-->
		<!-- 热门话题 s-->
		<?php if (in_array("circle",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<div class="hot-talk">
			<div class="com-title">
				<a href="<?php echo $_smarty_tpl->tpl_vars['circle_channelDomain']->value;?>
">
					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][2];?>
</h2>   
					<span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][18][18];?>
<i></i></span>   
				</a>
			</div>
			<div class="hot-con">
				<ul class="fir_ul">
					<!-- 占位 -->
					<li class="hot-pl_h hot-pl_h1"></li>
					<li class="hot-pl_h hot-pl_h2"></li>
					<li class="hot-pl_h hot-pl_h3"></li>
				</ul>
				<ul class="sec_ul">
					<!-- 占位 -->
					<li class="hot-pl_h hot-pl_h1"></li>
					<li class="hot-pl_h hot-pl_h2"></li>
					<li class="hot-pl_h hot-pl_h3"></li>
				</ul>
				<ul class="th_ul">
					<!-- 占位 -->
					<li class="hot-pl_h hot-pl_h1"></li>
					<li class="hot-pl_h hot-pl_h2"></li>
					<li class="hot-pl_h hot-pl_h3"></li>
				</ul>
			</div>

		</div>
		<?php }?>
		<!-- 热门话题 e-->
		<!--产品推荐-->
		<div class="recommend-box">
			<?php echo getMyAd(array('title'=>"首页_模板四_移动端_广告四"),$_smarty_tpl);?>

		</div>
		<!-- 便民查询 s -->
		<div class="pubBox convenience">
			<div class="com-title">
				<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_homepage'),$_smarty_tpl);?>
">
					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][24];?>
</h2>  
					<span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][18][18];?>
<i></i></span>   
				</a>
			</div>
			<ul class="fn-clear service_list">
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=超市'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-shop.png"></span>
						<span class="icon-txt">超市</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=医院'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-hospital.png"></span>
						<span class="icon-txt">医院</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=公交站'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-bus.png"></span>
						<span class="icon-txt">公交站</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=书店'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-book.png"></span>
						<span class="icon-txt">书店</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=体育馆'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-sports.png"></span>
						<span class="icon-txt">体育馆</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=营业厅'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-bussiness.png"></span>
						<span class="icon-txt">营业厅</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=加油站'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-gasStation.png"></span>
						<span class="icon-txt">加油站</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=公安局'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-polic.png"></span>
						<span class="icon-txt">公安局</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_list','param'=>'directory=停车场'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-park.png"></span>
						<span class="icon-txt">停车场</span>
					</a>
				</li>
				<li>
					<a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'114_homepage'),$_smarty_tpl);?>
">
						<span class="icon-scircle"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/co-all.png"></span>
						<span class="icon-txt">全部</span>
					</a>
				</li>
			</ul>

		</div>
		<!-- 便民查询 e -->

        <?php if (in_array("dating",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<div class="jiaoyou-online">
			<div class="com-title">
				<a href="<?php echo $_smarty_tpl->tpl_vars['dating_channelDomain']->value;?>
">
					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][3];?>
</h2>  
					<span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][18][18];?>
<i></i></span>   
				</a>
			</div>
			<div class="dating_con fn-clear">
				<div class="jiaoyou">
					<a href="<?php echo $_smarty_tpl->tpl_vars['dating_channelDomain']->value;?>
">
						<h3><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][4];?>
</h3>  
						<div class="jiaoyou-headicon fn-clear">
							<ul class="head-icon">
							</ul>
							<div class="more">
								<i></i>
							</div>
						</div>
					</a>
				</div>
				<div class="hn">
					<a href="<?php echo getUrlPath(array('service'=>'dating','template'=>'hongniang'),$_smarty_tpl);?>
">
						<h3><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][5];?>
</h3>  
						<div class="hn-info">
						</div>
					</a>
				</div>
			</div>
		</div>
        <?php }?>
        <!-- 视频直播 s-->
        <?php if (in_array("live",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <div class="live_wrap">
        	<a href="<?php echo $_smarty_tpl->tpl_vars['live_channelDomain']->value;?>
">
        		<h1><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][15][23];?>
</h1>  
        		<p><span></span><i></i></p>
        	</a>
        </div>
        <?php }?>
        <!-- 视频直播 e-->

        <?php if (in_array("huodong",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<!--同城活动s-->
		<div class="tc-activity-box">
			<div class="com-title">
				<a href="<?php echo $_smarty_tpl->tpl_vars['huodong_channelDomain']->value;?>
">
					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][16][161];?>
</h2>  
					<span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][18][18];?>
<i></i></span>   
				</a>
			</div>
			<div class="swiper-container">
				<div class="tc-activity  swiper-wrapper" >
					<!--占位-->
					<div class="activity-pl_h swiper-slide activity"></div>
					<div class="activity-pl_h swiper-slide activity"></div>
					<div class="activity-pl_h swiper-slide activity"></div>
				</div>
			</div>
		</div>
		<!--同城活动e-->
		<?php }?>

        <?php if ($_smarty_tpl->tpl_vars['cfg_business_state']->value) {?>
        <!--推荐商家 s-->
		<div class="Business-box">
			<div class="tit_ul fn-clear">
				<ul>
					<li class="active" data-id='0'><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][6];?>
</li>  
				</ul>
				<a href="<?php echo $_smarty_tpl->tpl_vars['business_channelDomain']->value;?>
" class="bus_a"><i></i></a>
			</div>
			<div class="swiper-container">
				<ul class="business-list-box  swiper-wrapper" >
					<li class="bus-pl_h"></li>
					<li class="bus-pl_h"></li>
					<li class="bus-pl_h"></li>
				</ul>
			</div>
		</div>
		<!-- 推荐商家 e-->
        <?php }?>
        
		<!-- 贴吧社区 s-->
		<?php if (in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<div class="tieba_wrap">
			<div class="com-title">
				<a href="<?php echo $_smarty_tpl->tpl_vars['tieba_channelDomain']->value;?>
" class="toMini" data-module="tieba" data-temp="index">
					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][11];?>
</h2>  
					<span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][18][18];?>
<i></i></span>   
				</a>
			</div>

			<div class="swiper-container">
				<div class="tieba_con  swiper-wrapper" >
					<div class="tie-pl_h swiper-slide tiezi"></div>
					<div class="tie-pl_h swiper-slide tiezi"></div>
					<div class="tie-pl_h swiper-slide tiezi"></div>
				</div>
			</div>
		</div>
		<?php }?>
		<!-- 贴吧社区 e-->
		<!--职业招聘s-->
		<?php if (in_array("job",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<div class="job-box">
			<div class="com-title">
				<a href="<?php echo $_smarty_tpl->tpl_vars['job_channelDomain']->value;?>
" class="toMini" data-module="job" data-temp="index">
					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][7];?>
</h2>  
					<span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][18][18];?>
<i></i></span>   
				</a>
			</div>
			<div class="job-block">
				<ul class="fn-clear">
					
					<li class="job-meeting">
						<a href="<?php echo getUrlPath(array('service'=>'job','template'=>'zhaopinhui'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][8];?>
</a>
					</li>
					
					<li class="lookenterprise">
						<a href="<?php echo getUrlPath(array('service'=>'job','template'=>'company-list'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][9];?>
</a>
					</li>
					
					<li class="looktalent">
						<a href="<?php echo getUrlPath(array('service'=>'job','template'=>'talent'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][10];?>
</a>
					</li>
				</ul>
			</div>
			<div class="job-list-box">
				<ul>
					<li class="loading"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][38][8];?>
</li>   
				</ul>
				<div class="look-more job-more">
					<a href="<?php echo $_smarty_tpl->tpl_vars['job_channelDomain']->value;?>
/job-list"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][13];?>
<i></i></a>    
				</div>
			</div>
		</div>
		<?php }?>
		<!--职业招聘e-->
		<?php if (in_array("house",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<!--出租房源s-->
		<div class="house-resource">
			<div class="com-title">
				<a href="<?php echo $_smarty_tpl->tpl_vars['house_channelDomain']->value;?>
">
					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][14];?>
</h2>    
					<span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][18][18];?>
<i></i></span>   
				</a>
			</div>
			<div class="house_tab">
				<ul>
					
					<li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'loupan'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][764];?>
</a></li>

					
					<li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'sale'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][218];?>
</a></li>

					
					<li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'zu'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][219];?>
</a></li>

					
					<li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'xzl'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][220];?>
</a></li>

					
					<li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'sp'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][221];?>
</a></li>

					
					<li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'cf'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][761];?>
</a></li>

					
					<li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'cf'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][53][15];?>
</a></li>

					
					<li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'cw'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][31][7];?>
</a></li>

				</ul>
			</div>
			<div class="house-list-box">
				<ul>
					<!--默认加载-->
					<li class="loading"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][38][8];?>
</li>   

				</ul>
				<div class="look-more house-more">
					<a href="<?php echo $_smarty_tpl->tpl_vars['house_channelDomain']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][52];?>
<i></i></a>   
				</div>
			</div>
		</div>
		<!--出租房源e-->
		<?php }?>

		<!--家装行业s-->
		<?php if (in_array("renovation",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<div class="jiazhuang-box">
			<div class="jiazhuang">
				<a href="<?php echo $_smarty_tpl->tpl_vars['renovation_channelDomain']->value;?>
">
					<img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/bg-jiazhuang.png" alt="">
				</a>
			</div>
		</div>
		<?php }?>
		<!--家装行业e-->

		<?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
		<!--分类信息s-->
		<div class="classify-info">
			<div class="com-title">
				<a href="<?php echo $_smarty_tpl->tpl_vars['info_channelDomain']->value;?>
" data-module="info" data-temp="index">
					<h2><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][26][67];?>
</h2>   
					<span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][18][18];?>
<i></i></span>   
				</a>
			</div>
			<div class="info-list-box">
				<ul>
					<li class="loading"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][38][8];?>
</li>   

				</ul>
				<div class="look-more info-more">
					<a href="<?php echo $_smarty_tpl->tpl_vars['info_channelDomain']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][52];?>
<i></i></a>   
				</div>
			</div>
		</div>
		<!--分类信息e-->
		<?php }?>

		<!--底部导航栏-->

<div class="gotop"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/go-top.png"></div>
<?php if ($_smarty_tpl->tpl_vars['cfg_weixinQr']->value||$_smarty_tpl->tpl_vars['cfg_miniProgramQr']->value) {?><div class="wechat-fix"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/wechat-fix.png"></div><?php }?>
<?php echo $_smarty_tpl->getSubTemplate ("../../touch_bottom_5.0.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, null, array('active'=>"index",'bottom_module'=>"siteConfig",'noDySdk'=>"1"), 0);?>

<?php echo $_smarty_tpl->getSubTemplate (((string)$_smarty_tpl->tpl_vars['HUONIAOROOT']->value)."/templates/siteConfig/public_location.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, null, array(), 0);?>

<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
js/index.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/lang/<?php echo $_smarty_tpl->tpl_vars['langList']->value['currCode'];?>
.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/swiper.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/jquery.dialog.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
js/common.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>

<?php if ($_smarty_tpl->tpl_vars['cfg_kefu_touch_url']->value) {?>
<style>
#qimo_chatpup{position: fixed!important;}
#customerBtn {position: fixed;display: block;width: 1rem;height: 1.4rem;background: rgba(0,0,0,.5); right: 0;top: 58%;border-top-left-radius: .15rem;border-bottom-left-radius: .15rem;z-index: 999;}
#customerBtn .btn-img-wrap {display: block; -webkit-user-select: none;-moz-user-select: none; -ms-user-select: none;user-select: none;padding-top: .2rem;}
#customerBtn .btn-img-wrap img {display: block;margin: 0 auto;width: .5rem;height: .5rem;}
#customerBtn .btn-img-wrap p {margin: 0;padding: 0;line-height:.7rem;font-size: .3rem;color: #fff;text-align: center;}
</style>
<div id="customerBtn">
  <a class="btn-img-wrap" href="<?php echo $_smarty_tpl->tpl_vars['cfg_kefu_touch_url']->value;?>
">
    <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/customer.png" alt="">
    <p>客服</p>
  </a>
</div>
<?php echo '<script'; ?>
>
$(function(){
  	if(window.__wxjs_environment == 'miniprogram'){
		<?php if (!$_smarty_tpl->tpl_vars['cfg_kefuMiniProgram']->value) {?>
	    $('.btn-img-wrap').hide();
		<?php }?>
    }
});
<?php echo '</script'; ?>
>
<?php }?>

</body>
</html>
<?php }} ?>
