<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:29:14
         compiled from "/www/wwwroot/hawaiihub.net/templates/siteConfig/top1.html" */ ?>
<?php /*%%SmartyHeaderCode:56654144468861b9ac59193-34488188%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '62167e427dfe205560ec1605a2c36a1c67c11d01' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/templates/siteConfig/top1.html',
      1 => 1753593708,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '56654144468861b9ac59193-34488188',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'pageGrayCss' => 0,
    'site_map' => 0,
    'amap_jscode' => 0,
    'defaultThemeColor' => 0,
    'colorArr' => 0,
    'saturation' => 0,
    'lightness' => 0,
    'themeColor' => 0,
    'themeColorInitial' => 0,
    'themeBackground' => 0,
    'rootColor' => 0,
    'cfg_cookiePre' => 0,
    'cfg_clihost' => 0,
    'service' => 0,
    'siteCityInfoArr' => 0,
    'site_map_key' => 0,
    'cfg_basehost' => 0,
    'member_userDomain' => 0,
    'member_busiDomain' => 0,
    'cfg_timezone' => 0,
    'langList' => 0,
    'cfg_staticVersion' => 0,
    'detail_litpic' => 0,
    'detail_imgGroup' => 0,
    'detail_thumbnail' => 0,
    'shareAdvancedUrl' => 0,
    'siteCityInfo' => 0,
    'langData' => 0,
    '_bindex' => 0,
    'row1' => 0,
    'installModuleArr' => 0,
    'cfg_business_state' => 0,
    'cfg_staticPath' => 0,
    'cfg_app_ios_download' => 0,
    'cfg_app_android_download' => 0,
    'cfg_shortname' => 0,
    'cfg_miniProgramQr' => 0,
    'cfg_weixinQr' => 0,
    'module' => 0,
    'row2' => 0,
    'privatePhone' => 0,
    'HUONIAOROOT' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68861b9ad65b49_64157337',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68861b9ad65b49_64157337')) {function content_68861b9ad65b49_64157337($_smarty_tpl) {?><?php echo $_smarty_tpl->tpl_vars['pageGrayCss']->value;?>
 
<?php if ($_smarty_tpl->tpl_vars['site_map']->value=="amap") {?>
<?php echo $_smarty_tpl->tpl_vars['amap_jscode']->value;?>
 
<?php }?>
<!-- 主题色处理 -->
<?php $_smarty_tpl->tpl_vars['colorArr'] = new Smarty_variable(hex2rgb($_smarty_tpl->tpl_vars['defaultThemeColor']->value,1), null, 0);?> <!-- 转换 -->
<?php $_smarty_tpl->tpl_vars['hue'] = new Smarty_variable($_smarty_tpl->tpl_vars['colorArr']->value['h'], null, 0);?> <!--色值-->
<?php $_smarty_tpl->tpl_vars['saturation'] = new Smarty_variable($_smarty_tpl->tpl_vars['colorArr']->value['s'], null, 0);?> <!--饱和度-->
<?php $_smarty_tpl->tpl_vars['lightness'] = new Smarty_variable($_smarty_tpl->tpl_vars['colorArr']->value['l'], null, 0);?>  <!--亮度-->
<?php $_smarty_tpl->tpl_vars['themeColor'] = new Smarty_variable("hsla(".((string)$_smarty_tpl->tpl_vars['hue']->value).", saturation%, lightness%, alpha)", null, 0);?> <!-- 透明度默认是1，一般不用改 -->
<?php $_smarty_tpl->tpl_vars['themeColorInitial'] = new Smarty_variable(str_replace(array('saturation','lightness','alpha'),array($_smarty_tpl->tpl_vars['saturation']->value,$_smarty_tpl->tpl_vars['lightness']->value,1),$_smarty_tpl->tpl_vars['themeColor']->value), null, 0);?> <!--初始化主题色-->
<?php $_smarty_tpl->tpl_vars['themeBackground'] = new Smarty_variable(str_replace(array('saturation','lightness','alpha'),array($_smarty_tpl->tpl_vars['saturation']->value,$_smarty_tpl->tpl_vars['lightness']->value,.08),$_smarty_tpl->tpl_vars['themeColor']->value), null, 0);?>
<?php $_smarty_tpl->tpl_vars['rootColor'] = new Smarty_variable(array($_smarty_tpl->tpl_vars['themeColorInitial']->value,$_smarty_tpl->tpl_vars['themeBackground']->value), null, 0);?>
<style>
	<?php if ($_smarty_tpl->tpl_vars['rootColor']->value) {?>
	:root{
		--color:<?php echo $_smarty_tpl->tpl_vars['rootColor']->value[0];?>
;
		--background:<?php echo $_smarty_tpl->tpl_vars['rootColor']->value[1];?>
;
	}
	.topInfo .loginbox .siteCityInfo,.topInfo .loginbox .changeCityBtn .changeCityList .hot dt,.topInfo .loginbox .changeCityList a.curr,.topInfo .regist,.m-home,.topInfo a:hover{color: var(--color) !important;}
	.topInfo .loginbox .changeCityBtn .changeCityList .pytit span:hover,.topInfo .loginbox .changeCityBtn .changeCityList .pytit span.curr{background: var(--color);}
	.topInfo .loginbox .changeCityBtn .changeCityList .pytit dd{border-color: var(--color);}
	.topInfo .submenu.tonglan a:hover{
		color:var(--color) !important;
		background-color: var(--background) !important;
	}
	<?php }?>
	.topInfo{margin-bottom: 0px;}
	.topInfo .loginbox .siteCityInfo{font-weight: bold;}
	.topInfo .pop{width: 200px;height: 230px;box-sizing: border-box;box-shadow: 0px 20px 40px 0px rgba(0,25,77,0.1);}
	.wxqrcode{display: flex;align-items: center;justify-content: center;flex-direction: column;height: 100%;}
	.wxqrcode div{font-weight: 400;font-size: 12px;color: #999999;}
	.wxqrcode div span{color: var(--color);}
	.listCode{height: 190px;padding: 0px 36px;gap: 44px;align-items: center;display: flex;}
	.listCode .item{line-height: 1;}
	.listCode .item img{width: 120px;height: 120px;}
	.listCode .item div{font-weight: 400;font-size: 12px;color: #999999;margin-top: 10px;text-align: center;}
	.listCode .item div span{color: var(--color);}
	.picon-down{background-image: url(/static/images/topNavDown.png);background-size: cover;background-position:center;width: 12px !important;height: 12px !important;}
	.topInfo .pop s{background: white;box-sizing: border-box;border-top: 1px solid #ccc;border-right: 1px solid #ccc;border-bottom: 1px solid transparent;border-left: 1px solid transparent;width: 9px;transform: rotateZ(-45deg);top: -5px;}
	.topInfo .submenu{padding: 8px 0px;}
	.topInfo .separ{color: transparent;}
	.topInfo li:hover .picon-down{transform: none;}
	.topInfo .submenu{box-shadow: 0px 20px 40px 0px rgba(0,25,77,0.1);border-radius: 0px 3px 3px 3px;}
	.topInfo .submenu.tonglan{border-radius: 3px 0px 3px 3px;}
	.topInfo .submenu .moduleItem::after{display: none;}
	.topInfo .submenu .moduleItem::before{position: absolute;content: '';width: 1px;height: 12px;background: #e6e7ed;left: 2px;top: 50%;margin-top: -6px;}
	.topInfo .submenu.tonglan .moduleItem:nth-child(11n-10):before{display: none;}
	.topInfo .submenu.tonglan .moduleItem:hover::before{display: none;}
	.topInfo .submenu.tonglan .moduleItem:hover+ a::before{display: none;}
	.topInfo .submenu.tonglan a{width: 104px;box-sizing: border-box;}
	.topInfo .submenu a{color: #666;font-size: 14px;line-height: 32px;}
	.topInfo a{color: #666;}
	.topInfo .dropdown .title{width: 100%;height: 100%;display: block;padding: 0px 8px 0px 10px;box-sizing: border-box;}
	.topInfo li.user .submenu{box-sizing: border-box;}
	#navLoginBefore .messageNum:hover{color: #ff0000 !important;}
	.navWeb .pop,.navWX .pop{border-color: #E5E5E5;}
	.navWeb .pop{left: -190px;}
	.navWeb .pop s{left: 226px;}
	.topInfo .loginbox .changeCityList .box{box-shadow: 0px 20px 40px 0px rgba(0,25,77,0.1);}
</style>
<?php $_smarty_tpl->tpl_vars['rootColor'] = new Smarty_variable(array($_smarty_tpl->tpl_vars['themeColorInitial']->value,$_smarty_tpl->tpl_vars['themeBackground']->value), null, 0);?>
<?php echo '<script'; ?>
 type="text/javascript">
	var cookiePre = '<?php echo $_smarty_tpl->tpl_vars['cfg_cookiePre']->value;?>
', cfg_clihost = '<?php echo $_smarty_tpl->tpl_vars['cfg_clihost']->value;?>
', cfg_module = '<?php echo $_smarty_tpl->tpl_vars['service']->value;?>
', cfg_cityInfo = '<?php echo $_smarty_tpl->tpl_vars['siteCityInfoArr']->value;?>
';
	var site_map = "<?php echo $_smarty_tpl->tpl_vars['site_map']->value;?>
", site_map_key = '<?php echo $_smarty_tpl->tpl_vars['site_map_key']->value;?>
';
	var userDetail;
	var masterDomain = '<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
';
	var userDomain = '<?php echo $_smarty_tpl->tpl_vars['member_userDomain']->value;?>
';
	var busiDomain = '<?php echo $_smarty_tpl->tpl_vars['member_busiDomain']->value;?>
';
	var cfg_timezone = '<?php echo $_smarty_tpl->tpl_vars['cfg_timezone']->value;?>
';
<?php echo '</script'; ?>
>

<!-- 多语言 -->
<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/lang/<?php echo $_smarty_tpl->tpl_vars['langList']->value['currCode'];?>
.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>

<img src="<?php if ($_smarty_tpl->tpl_vars['detail_litpic']->value) {
echo $_smarty_tpl->tpl_vars['detail_litpic']->value;
} elseif ($_smarty_tpl->tpl_vars['detail_imgGroup']->value[0]) {
echo $_smarty_tpl->tpl_vars['detail_imgGroup']->value[0];
} elseif ($_smarty_tpl->tpl_vars['detail_thumbnail']->value) {
echo $_smarty_tpl->tpl_vars['detail_thumbnail']->value;
} else {
echo $_smarty_tpl->tpl_vars['shareAdvancedUrl']->value;
}?>"
	id="firstImage" style="display: none;" />

<!-- 顶部信息 s -->
<div class="topInfo w1200">
	<div class="wrap fn-clear">
		<div class="loginbox">
			<?php if ($_smarty_tpl->tpl_vars['siteCityInfo']->value&&$_smarty_tpl->tpl_vars['siteCityInfo']->value['count']>1) {?>
			<span class="siteCityInfo"><?php echo $_smarty_tpl->tpl_vars['siteCityInfo']->value['name'];?>
</span>
			<span class="changeCityBtn">
				「<a href="javascript:;"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][78];?>
</a>」 
				<div class="changeCityList">
					<p class="setwidth"></p>
					<div class="boxpd">
						<div class="sj"><i></i></div>
						<div class="box">
							<div class="content fn-clear">
								<p class="tit"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][3];?>
：</p> 
								<ul></ul>
							</div>
							<div class="morecontent fn-hide">
								<dl class="hot">
									<dt><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][79];?>
</dt> 
									<dd></dd>
								</dl>
								<div class="more">
									<dl class="pytit">
										<dt><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][892];?>
</dt> 
										<dd></dd>
									</dl>
									<div class="list"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</span>
			<?php }?>
			<!-- 已登录 -->
			<div class="loginafter fn-clear" id="navLoginBefore" style="display: none;">
				<!-- 这里的内容在下面的js内 -->
			</div>
			<!-- 未登录 -->
			<div class="loginbefore fn-clear" id="navLoginAfter">
				<a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/register.html" class="regist"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][1][0];?>
</a>
				<span class="fn-left">&nbsp;/&nbsp;</span>
				<span class="logint"><a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/login.html"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][2][0];?>
</a></span>
				<?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"siteConfig",'action'=>"getLoginConnect",'return'=>"row1")); $_block_repeat=true; echo loop(array('service'=>"siteConfig",'action'=>"getLoginConnect",'return'=>"row1"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

				<?php if ($_smarty_tpl->tpl_vars['_bindex']->value['row1']<4) {?> <a class="loginconnect"
					href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/api/login.php?type=<?php echo $_smarty_tpl->tpl_vars['row1']->value['code'];?>
" title="<?php echo $_smarty_tpl->tpl_vars['row1']->value['name'];?>
" target="_blank"><i
						class="picon"><img
							src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/api/login/<?php echo $_smarty_tpl->tpl_vars['row1']->value['code'];?>
/img/24.png?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" /></i></a>
					<?php }?>
					<?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"siteConfig",'action'=>"getLoginConnect",'return'=>"row1"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

			</div>
		</div>
		<ul class="menu topbarlink fn-clear">
			<li>
				<a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
" class="m-home" style="color: #f60;"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][0][5];?>
</a>
				<!-- <span class="separ">|</span> -->
			</li>
			<li class="dropdown user" style="padding: 0;">
				<a href="<?php echo $_smarty_tpl->tpl_vars['member_userDomain']->value;?>
" target="_blank" class="title"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][0][7];?>
<i class="picon picon-down"></i></a>
				<div class="submenu">
					<?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)||in_array("tuan",$_smarty_tpl->tpl_vars['installModuleArr']->value)||in_array("shop",$_smarty_tpl->tpl_vars['installModuleArr']->value)||in_array("integral",$_smarty_tpl->tpl_vars['installModuleArr']->value)||in_array("education",$_smarty_tpl->tpl_vars['installModuleArr']->value)||in_array("waimai",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'order'),$_smarty_tpl);?>
"
						target="_blank">我的订单</a><?php }?>
					<a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'collect'),$_smarty_tpl);?>
" 
					target="_blank">我的收藏</a>
					<a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'record'),$_smarty_tpl);?>
"
						target="_blank">我的账户</a>
					<a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'security'),$_smarty_tpl);?>
"
						target="_blank">安全中心</a>
				</div>
			</li>
            <?php if ($_smarty_tpl->tpl_vars['cfg_business_state']->value) {?>
			<li class="dropdown user" style="padding: 0;">
				<a href="<?php echo $_smarty_tpl->tpl_vars['member_busiDomain']->value;?>
" target="_blank" class="title">商家中心<i class="picon picon-down"></i></a>
				<div class="submenu" style="padding-right: 10px;">
					<?php if (in_array("house",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
					<a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/supplier/loupan" target="_blank">楼盘管理平台</a>
					<?php }?>
					<?php if (in_array("job",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
					<a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/supplier/job" target="_blank">招聘管理平台</a>
					<?php }?>
					<?php if (in_array("waimai",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
					<a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/wmsj" target="_blank">外卖管理平台</a>
					<?php }?>
				</div>
			</li>
            <?php }?>
			<li style="margin-right: 4px;" class="navWeb"><a href="<?php echo getUrlPath(array('service'=>"siteConfig",'template'=>"mobile"),$_smarty_tpl);?>
" target="_blank"><i><img style="width: 14px;height: 16px;margin-right: 2px;"
							src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
images/public_top_icon_mobile.png?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" /></i>移动端</a>
							<!-- <span class="separ">|</span> -->
				<div class="pop" style="width: auto;height: 210px;">
					<s></s>
					<div class="listCode">
						<div class="item">
							<img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/qrcode.php?data=<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
">
							<div>移动端网页</div>
						</div>
						<?php if ($_smarty_tpl->tpl_vars['cfg_app_ios_download']->value||$_smarty_tpl->tpl_vars['cfg_app_android_download']->value) {?>
						<div class="item">
							<img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/qrcode.php?data=<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'mobile'),$_smarty_tpl);?>
">
							<div><span><?php echo $_smarty_tpl->tpl_vars['cfg_shortname']->value;?>
</span>App下载</div>
						</div>
						<?php }?>
						<?php if ($_smarty_tpl->tpl_vars['cfg_miniProgramQr']->value) {?>
						<div class="item">
							<img src="<?php echo $_smarty_tpl->tpl_vars['cfg_miniProgramQr']->value;?>
">
							<div>微信小程序</div>
						</div>
						<?php }?>
					</div>
				</div>
			</li>
			<li style="margin-right: 4px;" class="navWX"><a href="javascript:;" style="cursor: default !important;color: #6c6c6c !important;"><i class=""><img style="width: 18px;height: 16px;margin-right: 2px;"
							src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
images/public_top_icon_wechat.png?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" /></i><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][286];?>
</a>
							<!-- <span class="separ">|</span> -->
				<div class="pop" style="left: -26px;">
					<s></s>
					<div class="wxqrcode">
						<img src="<?php echo $_smarty_tpl->tpl_vars['cfg_weixinQr']->value;?>
" width="150" height="150" />
						<div>
							<span><?php echo $_smarty_tpl->tpl_vars['cfg_shortname']->value;?>
</span>微信公众号
						</div>
					</div>
				</div>
			</li>
			<li style="margin-right: 4px;">
				<a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'publish'),$_smarty_tpl);?>
"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][11][2];?>

					<!-- <i class="picon picon-down"></i> -->
				</a>
				<!-- <div class="submenu">
					<?php if (in_array("article",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'article'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][235];?>
</a><?php }?>
					<?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'info'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][236];?>
</a><?php }?>
					<?php if (in_array("house",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'config','action'=>'house'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][11][6];?>
</a><?php }?>
					<?php if (in_array("huodong",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'huodong','template'=>'fabu'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][11][7];?>
</a><?php }?>
					<?php if (in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a href="<?php echo getUrlPath(array('service'=>'tieba','template'=>'fabu'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][11][3];?>
</a><?php }?>
					<?php if (in_array("live",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'live'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][10][28];?>
</a><?php }?> 
					<?php if (in_array("vote",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'vote'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][10][27];?>
</a><?php }?> 
					<?php if (in_array("car",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'car'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['car'][4][31];?>
</a><?php }?> 
					<?php if (in_array("sfcar",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><a
						href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'sfcar'),$_smarty_tpl);?>
"
						target="_blank"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][215];?>
</a><?php }?>
				</div> -->
			</li>
			<li class="dropdown webmap">
				<a href="javascript:;" style="cursor: default !important;color: #6c6c6c !important;"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][271];?>
<i class="picon picon-down"></i></a>
				<div class="submenu">
					<?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module",'type'=>"1")); $_block_repeat=true; echo loop(array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module",'type'=>"1"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

					<a href="<?php echo $_smarty_tpl->tpl_vars['module']->value['url'];?>
" <?php if ($_smarty_tpl->tpl_vars['module']->value['target']) {?> target="_blank" <?php }?> class="moduleItem"
						style="<?php if ($_smarty_tpl->tpl_vars['module']->value['color']) {?> color: <?php echo $_smarty_tpl->tpl_vars['module']->value['color'];?>
;<?php }
if ($_smarty_tpl->tpl_vars['module']->value['bold']) {?> font-weight: 700;<?php }?>"><?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
</a>
					<?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module",'type'=>"1"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

				</div>
			</li>
		</ul>
	</div>
</div>
<!-- 顶部信息 e -->
<?php echo '<script'; ?>
 type="text/template" id="notLoginHtml">
	<div class="loginbefore fn-clear" id="navLoginAfter">
		<a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/register.html" class="regist"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][1][0];?>
</a>
		<span class="fn-left">&nbsp;/&nbsp;</span>
		<span class="logint"><a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/login.html"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][2][0];?>
</a></span>
		<?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"siteConfig",'action'=>"getLoginConnect",'return'=>"row2")); $_block_repeat=true; echo loop(array('service'=>"siteConfig",'action'=>"getLoginConnect",'return'=>"row2"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

		<?php if ($_smarty_tpl->tpl_vars['_bindex']->value['row2']<4) {?>
		<a class="loginconnect" href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/api/login.php?type=<?php echo $_smarty_tpl->tpl_vars['row2']->value['code'];?>
" title="<?php echo $_smarty_tpl->tpl_vars['row2']->value['name'];?>
" target="_blank"><i class="picon"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/api/login/<?php echo $_smarty_tpl->tpl_vars['row2']->value['code'];?>
/img/24.png" /></i></a>
		<?php }?>
		<?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"siteConfig",'action'=>"getLoginConnect",'return'=>"row2"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

	</div>
<?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript">
	$(function () {
		let HN_login_user = $.cookie('HN_login_user');
		if (HN_login_user) { //已登录
			let data = {
				service: 'member',
				action: 'detail'
			};
			ajax(data).then(res => {
				if (res.state == 100) {
					$('#navLoginAfter').hide();
					$('#navLoginBefore').show();
					let userinfo = res.info;
					userDetail = res.info;
					let messDomain = (userinfo.userType == 1 ? userDomain : busiDomain);
					let str = `
						<span class="fn-left">${langData['siteConfig'][0][12]}，</span>
						<a href="${messDomain}" target="_blank">${userinfo.nickname}</a>
						<a href="${messDomain}/message.html?state=0" class="messageNum" style="margin-left: -5px;${userinfo.message > 0 ? '' : 'display:none;'}" target="_blank">(<font color="#ff0000">${userinfo.message}</font>)</a>
						<a href="${masterDomain}/logout.html" class="logout">${langData['siteConfig'][2][6]}</a>
					`;
					// 管理和分割线
					// <a href="${messDomain}" target="_blank">${langData['siteConfig'][6][22]}</a>
					// 	<span class="separ fn-left" style="margin: 0 5px 0 -5px;">|</span>
					$('#navLoginBefore').html(str);
				} else {
					alert(res.info)
				}
			}).catch(error => {
				console.log(error)
			});
		}
	});
<?php echo '</script'; ?>
>
<?php if ($_smarty_tpl->tpl_vars['privatePhone']->value) {?>
<?php echo $_smarty_tpl->getSubTemplate (((string)$_smarty_tpl->tpl_vars['HUONIAOROOT']->value)."/templates/siteConfig/privatePhone.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, null, array(), 0);?>

<?php }?><?php }} ?>
