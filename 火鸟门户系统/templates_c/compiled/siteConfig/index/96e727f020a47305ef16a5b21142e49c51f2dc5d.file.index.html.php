<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:29:14
         compiled from "/www/wwwroot/hawaiihub.net/templates/siteConfig/skin10/index.html" */ ?>
<?php /*%%SmartyHeaderCode:195691307268861b9a6dfef2-79406488%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '96e727f020a47305ef16a5b21142e49c51f2dc5d' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/templates/siteConfig/skin10/index.html',
      1 => 1753593708,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '195691307268861b9a6dfef2-79406488',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cfg_webname' => 0,
    'cfg_keywords' => 0,
    'cfg_description' => 0,
    'cfg_basehost' => 0,
    'cfg_staticPath' => 0,
    'cfg_staticVersion' => 0,
    'templets_skin' => 0,
    'cfg_hideUrl' => 0,
    'HUONIAOROOT' => 0,
    'installModuleArr' => 0,
    'article_channelDomain' => 0,
    'article_pagesize' => 0,
    'atype' => 0,
    'image_channelDomain' => 0,
    'image_channelName' => 0,
    'video_channelDomain' => 0,
    'video_channelName' => 0,
    'info_channelDomain' => 0,
    'house_channelDomain' => 0,
    'cfg_subway_state' => 0,
    'cfg_subway_title' => 0,
    'job_channelDomain' => 0,
    'renovation_channelDomain' => 0,
    'cfg_weblogo' => 0,
    'cfg_shortname' => 0,
    'cfg_hotline' => 0,
    'cfg_app_ios_download' => 0,
    'cfg_app_android_download' => 0,
    'cfg_appname' => 0,
    'cfg_weixinQr' => 0,
    'cfg_weixinName' => 0,
    'cfg_miniProgramQr' => 0,
    'cfg_miniProgramName' => 0,
    'langData' => 0,
    'module' => 0,
    'keywords' => 0,
    '_bindex' => 0,
    'hotkeywords' => 0,
    'channel' => 0,
    'notice' => 0,
    'alist' => 0,
    'tuan_channelDomain' => 0,
    'tuan_channelName' => 0,
    'quanjing_channelDomain' => 0,
    'quanjing_channelName' => 0,
    'circle_channelDomain' => 0,
    'live_channelDomain' => 0,
    'live_channelName' => 0,
    'cfg_business_state' => 0,
    'business_channelDomain' => 0,
    'member_busiDomain' => 0,
    'list' => 0,
    'k' => 0,
    'sub' => 0,
    'huodong_channelDomain' => 0,
    'huodong_channelName' => 0,
    'info_channelName' => 0,
    'ilist' => 0,
    'userinfo' => 0,
    'shop_channelDomain' => 0,
    'masterDomain' => 0,
    'post' => 0,
    'resume' => 0,
    'company' => 0,
    'slist' => 0,
    'broker' => 0,
    'zlist' => 0,
    'demand1' => 0,
    'demand2' => 0,
    'cfg_kefu_pc_url' => 0,
    'cfg_server_qq' => 0,
    'qq' => 0,
    'qk' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68861b9ac36cb0_45090861',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68861b9ac36cb0_45090861')) {function content_68861b9ac36cb0_45090861($_smarty_tpl) {?><?php if (!is_callable('smarty_modifier_date_format')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/modifier.date_format.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
">
<meta http-equiv="X-UA-Compatible" content="IE=EDGE">
<title><?php echo $_smarty_tpl->tpl_vars['cfg_webname']->value;?>
</title>
<meta name="keywords" content="<?php echo $_smarty_tpl->tpl_vars['cfg_keywords']->value;?>
" />
<meta name="description" content="<?php echo $_smarty_tpl->tpl_vars['cfg_description']->value;?>
" />
<link rel="shortcut icon" href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/favicon.ico" type="image/x-icon" />
<link rel="stylesheet" type="text/css" media="all" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/core/base.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" />
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
css/index.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" />
<link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/ui/swiper.min.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
">
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/core/jquery-1.8.3.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript">
  var masterDomain = '<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
', staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';
  var hideFileUrl = '<?php echo $_smarty_tpl->tpl_vars['cfg_hideUrl']->value;?>
';
<?php echo '</script'; ?>
>
</head>

<body class="w1200">
<?php echo $_smarty_tpl->getSubTemplate (((string)$_smarty_tpl->tpl_vars['HUONIAOROOT']->value)."/templates/siteConfig/top1.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, null, array(), 0);?>


<!-- 广告位 s -->
<div class="ad-con FestivalAD_header">
  <?php echo getMyAd(array('title'=>"首页_模板十_电脑端_广告一"),$_smarty_tpl);?>

</div>
<!-- 广告位 e -->

<!-- 模块链接 s-->
<div class="module-con fn-clear">

  <?php if (in_array("article",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <!-- 资讯 -->
  <div class="box-con">
    <div class="t-title"><a href="<?php echo $_smarty_tpl->tpl_vars['article_channelDomain']->value;?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/t-zixun.png" /></a></div>
    <ul class="fn-clear">
      <?php $_smarty_tpl->tpl_vars['article_pagesize'] = new Smarty_variable(5, null, 0);?>
      <?php if (in_array("image",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <?php $_smarty_tpl->tpl_vars['article_pagesize'] = new Smarty_variable($_smarty_tpl->tpl_vars['article_pagesize']->value-1, null, 0);?>
      <?php }?>
      <?php if (in_array("video",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <?php $_smarty_tpl->tpl_vars['article_pagesize'] = new Smarty_variable($_smarty_tpl->tpl_vars['article_pagesize']->value-1, null, 0);?>
      <?php }?>
      <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"article",'action'=>"type",'return'=>"atype",'pageSize'=>$_smarty_tpl->tpl_vars['article_pagesize']->value)); $_block_repeat=true; echo loop(array('service'=>"article",'action'=>"type",'return'=>"atype",'pageSize'=>$_smarty_tpl->tpl_vars['article_pagesize']->value), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

      <li><a href="<?php echo $_smarty_tpl->tpl_vars['atype']->value['url'];?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['atype']->value['typename'];?>
</a></li>
      <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"article",'action'=>"type",'return'=>"atype",'pageSize'=>$_smarty_tpl->tpl_vars['article_pagesize']->value), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      <?php if (in_array("image",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><li><a href="<?php echo $_smarty_tpl->tpl_vars['image_channelDomain']->value;?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['image_channelName']->value;?>
</a></li><?php }?>
      <?php if (in_array("video",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?><li><a href="<?php echo $_smarty_tpl->tpl_vars['video_channelDomain']->value;?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['video_channelName']->value;?>
</a></li><?php }?>
      <li><a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'article'),$_smarty_tpl);?>
" target="_blank">我要投稿</a></li>
    </ul>
  </div>
  <?php }?>

  <?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <!-- 二手 -->
  <div class="box-con">
    <div class="t-title"><a href="<?php echo $_smarty_tpl->tpl_vars['info_channelDomain']->value;?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/t-ershou.png" /></a></div>
    <ul class="fn-clear">
      <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"info",'action'=>"type",'return'=>"atype",'pageSize'=>6)); $_block_repeat=true; echo loop(array('service'=>"info",'action'=>"type",'return'=>"atype",'pageSize'=>6), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

      <li><a href="<?php echo $_smarty_tpl->tpl_vars['atype']->value['url'];?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['atype']->value['typename'];?>
</a></li>
      <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"info",'action'=>"type",'return'=>"atype",'pageSize'=>6), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

    </ul>
  </div>
  <?php }?>

  <?php if (in_array("house",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <!-- 房产 -->
  <div class="box-con">
    <div class="t-title"><a href="<?php echo $_smarty_tpl->tpl_vars['house_channelDomain']->value;?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/t-fangchan.png" /></a></div>
    <ul class="fn-clear">
      <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'loupan'),$_smarty_tpl);?>
" target="_blank">找新开盘</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'sale'),$_smarty_tpl);?>
" target="_blank">找出售房</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'zu'),$_smarty_tpl);?>
" target="_blank">找出租房</a></li>
      <?php if ($_smarty_tpl->tpl_vars['cfg_subway_state']->value) {?>
      <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'loupan','param'=>'from=subway'),$_smarty_tpl);?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['cfg_subway_title']->value;?>
</a></li>
      <?php } else { ?>
      <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'demand'),$_smarty_tpl);?>
" target="_blank">求租求购</a></li>
      <?php }?>
      <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'map','action'=>'loupan'),$_smarty_tpl);?>
" target="_blank">地图找房</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'house-sale'),$_smarty_tpl);?>
" target="_blank">发布房源</a></li>
    </ul>
  </div>
  <?php }?>

  <?php if (in_array("job",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <!-- 招聘 -->
  <div class="box-con">
    <div class="t-title"><a href="<?php echo $_smarty_tpl->tpl_vars['job_channelDomain']->value;?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/t-zhaopin.png" /></a></div>
    <ul class="fn-clear">
      <li><a href="<?php echo getUrlPath(array('service'=>'job','template'=>'job-list'),$_smarty_tpl);?>
" target="_blank">最新职位</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'job','template'=>'company-list','param'=>'famous=1'),$_smarty_tpl);?>
" target="_blank">知名企业</a></li>
      <li><a href="/supplier/job/add_post.html" target="_blank">发布招聘</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'job','template'=>'talent'),$_smarty_tpl);?>
" target="_blank">最新简历</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'job','template'=>'news'),$_smarty_tpl);?>
" target="_blank">求职指南</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'job','action'=>'resume'),$_smarty_tpl);?>
" target="_blank">更新简历</a></li>
    </ul>
  </div>
  <?php }?>

  <?php if (in_array("renovation",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <!-- 装修 -->
  <div class="box-con">
    <div class="t-title"><a href="<?php echo $_smarty_tpl->tpl_vars['renovation_channelDomain']->value;?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/t-zhuangxiu.png" /></a></div>
    <ul class="fn-clear">
      <li><a href="<?php echo $_smarty_tpl->tpl_vars['renovation_channelDomain']->value;?>
" target="_blank">免费设计</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'case'),$_smarty_tpl);?>
" target="_blank">装修案例</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'designer'),$_smarty_tpl);?>
" target="_blank">设计师</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'company'),$_smarty_tpl);?>
" target="_blank">装修公司</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'raiders'),$_smarty_tpl);?>
" target="_blank">装修攻略</a></li>
      <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'zwj'),$_smarty_tpl);?>
" target="_blank">找我家</a></li>
    </ul>
  </div>
  <?php }?>

</div>
<!-- 模块链接 e-->


<!-- 导航 s-->
<div class="fixedwrap">
  <div class="fixedpane">
    <!-- head s -->
    <div class="wrap header fn-clear">
      <div class="logo">
        <a href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
" title="<?php echo $_smarty_tpl->tpl_vars['cfg_webname']->value;?>
"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_weblogo']->value;?>
" alt="<?php echo $_smarty_tpl->tpl_vars['cfg_webname']->value;?>
"><h2><?php echo $_smarty_tpl->tpl_vars['cfg_shortname']->value;?>
</h2></a>
      </div>

      <div class="kefu"><s><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/changecity_tel.png"></s><p>客服热线</p><?php echo $_smarty_tpl->tpl_vars['cfg_hotline']->value;?>
</div>
      <div class="app-con fn-clear">
        <div class="icon-box app">
            <a href="<?php echo getUrlPath(array('service'=>"siteConfig",'template'=>"mobile"),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/app.png"></a>
            <p><a href="<?php echo getUrlPath(array('service'=>"siteConfig",'template'=>"mobile"),$_smarty_tpl);?>
" target="_blank">移动端</a></p>
            <div class="down app-down fn-clear">
                <div class="con-box">
                  <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/qrcode.php?data=<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
" >
                  <p>扫码访问</p>
                </div>
                <?php if ($_smarty_tpl->tpl_vars['cfg_app_ios_download']->value||$_smarty_tpl->tpl_vars['cfg_app_android_download']->value) {?>
                <div class="con-box">
                  <a href="<?php echo getUrlPath(array('service'=>"siteConfig",'template'=>"mobile"),$_smarty_tpl);?>
" target="_blank">
                    <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/qrcode.php?data=<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'mobile'),$_smarty_tpl);?>
" >
                    <p>移动端app下载：<br /><?php echo $_smarty_tpl->tpl_vars['cfg_appname']->value;?>
</p>
                  </a>
                </div>
                <?php }?>
            </div>
        </div>
        <div class="icon-box wx">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/weixin.png">
            <p>微信端</p>
            <div class="down wx-down fn-clear">
                <div class="con-box">
                  <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/qrcode.php?data=<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
" >
                  <p>扫码访问</p>
                </div>
                <?php if ($_smarty_tpl->tpl_vars['cfg_weixinQr']->value) {?>
                <div class="con-box">
                  <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_weixinQr']->value;?>
" >
                  <p>微信公众平台：<br /><?php echo $_smarty_tpl->tpl_vars['cfg_weixinName']->value;?>
</p>
                </div>
                <?php }?>
                <?php if ($_smarty_tpl->tpl_vars['cfg_miniProgramQr']->value) {?>
                <div class="con-box">
                  <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_miniProgramQr']->value;?>
" >
                  <p>微信小程序：<br /><?php echo $_smarty_tpl->tpl_vars['cfg_miniProgramName']->value;?>
</p>
                </div>
                <?php }?>
            </div>
        </div>

      </div>

      <div class="searchwrap y-linear">
        <div class="search">
          <div class="type">
            <dl class="">
              <dt><a href="javascript:;" class="keytype"> 口碑商家 </a><em></em></dt>
              <dd>
                <div class="ModuleBox">
                    
                    <a href="javascript:;" data-id="0" data-module="business"><span><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][43];?>
</span></a>
                    <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module")); $_block_repeat=true; echo loop(array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

                    <?php if ($_smarty_tpl->tpl_vars['module']->value['code']=="house") {?>
                    <a href="javascript:;" data-id="1" data-module="<?php echo $_smarty_tpl->tpl_vars['module']->value['code'];?>
">
                        <span><?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
</span>
                        <div class="MoudleNav fn-clear">
                            <i></i>
                            <ul class="fn-clear">
                                <li data-type="loupan"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][775];?>
</li>  
                                <li data-type="community"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][44];?>
</li>  
                                <li data-type="store"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][448];?>
</li>  
                                <li data-type="sale"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][218];?>
</li>  
                                <li data-type="zu"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][219];?>
</li>  
                                <li data-type="xzl"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][220];?>
</li>  
                                <li data-type="sp"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][221];?>
</li>  
                                <li data-type="cf"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][905];?>
</li>  
                            </ul>
                        </div>
                    </a>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="job") {?>
                    <a href="javascript:;" data-id="1" data-module="<?php echo $_smarty_tpl->tpl_vars['module']->value['code'];?>
">
                        <span><?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
</span>
                        <div class="MoudleNav jobMoudle fn-clear">
                            <i></i>
                            <ul class="fn-clear">
                                <li data-type="job-list"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][16][27];?>
</li>   
                                <li data-type="company-list"><?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][19][778];?>
</li>   
                            </ul>
                        </div>
                    </a>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="waimai") {?>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="special") {?>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="website") {?>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="integral") {?>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="sfcar") {?>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="circle") {?>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="task") {?>
                    <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=="awardlegou") {?>
                    <?php } else { ?>
                    <a href="javascript:;" data-id="0" data-module="<?php echo $_smarty_tpl->tpl_vars['module']->value['code'];?>
"><span><?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
</span></a>
                    <?php }?>
                    <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

                </div>
              </dd>
            </dl>
          </div>
          <div class="FormBox">
            <form action="<?php echo getUrlPath(array('service'=>'business','template'=>'list'),$_smarty_tpl);?>
" class="form business">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
                <div class="hotkey">
                    <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"siteConfig",'module'=>"index",'action'=>"hotkeywords",'return'=>"hotkeywords")); $_block_repeat=true; echo loop(array('service'=>"siteConfig",'module'=>"index",'action'=>"hotkeywords",'return'=>"hotkeywords"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

                    <?php if ($_smarty_tpl->tpl_vars['_bindex']->value['hotkeywords']<=3) {?>
                    <a href="<?php echo $_smarty_tpl->tpl_vars['hotkeywords']->value['href'];?>
"<?php if ($_smarty_tpl->tpl_vars['hotkeywords']->value['target']==0) {?> target="_blank"<?php }?>><?php echo $_smarty_tpl->tpl_vars['hotkeywords']->value['keyword'];?>
</a>
                    <?php }?>
                    <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"siteConfig",'module'=>"index",'action'=>"hotkeywords",'return'=>"hotkeywords"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

                </div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">   
            </form>
            <?php if (in_array("article",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>'article','template'=>'search'),$_smarty_tpl);?>
" class="form article <?php if ($_smarty_tpl->tpl_vars['channel']->value=="article") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][46];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>   
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("image",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>'image','template'=>'search'),$_smarty_tpl);?>
" class="form image fn-hide">
                <div class="inputbox">
                    <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][46];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div> 
                </div>
                <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>'info','template'=>'list'),$_smarty_tpl);?>
" class="form info <?php if ($_smarty_tpl->tpl_vars['channel']->value=="info") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][47];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>    
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("tuan",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"tuan",'template'=>"list"),$_smarty_tpl);?>
" class="form tuan fn-hide">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="search_keyword" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][48];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>    
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("house",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="" class="form house HouseForm fn-hide" onsubmit="return false;">
                <div class="inputbox">
                    <div class="inpbox"><input type="text" name="search_keyword" id="HouseSearch" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][46];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>  
                </div>
                <input type="submit" class="submit HouseSeacher_btn" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("shop",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"shop",'template'=>"list"),$_smarty_tpl);?>
" class="form shop fn-hide">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][49];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>     
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("job",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="" class="form job HouseForm fn-hide" onsubmit="return false;">
                <div class="inputbox">
                    <div class="inpbox"><input type="text" name="keyword" id="JobSearch" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][46];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>   
                </div>
                <input type="submit" class="submit JobSeacher_btn" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("video",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"video",'template'=>"list"),$_smarty_tpl);?>
" class="form video fn-hide">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][46];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>   
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("huangye",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"huangye",'template'=>"list"),$_smarty_tpl);?>
" class="form huangye <?php if ($_smarty_tpl->tpl_vars['channel']->value=="huangye") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][50];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>   
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("vote",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"vote",'template'=>"search"),$_smarty_tpl);?>
" class="form vote <?php if ($_smarty_tpl->tpl_vars['channel']->value=="vote") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][52];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>   
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"tieba",'template'=>"list"),$_smarty_tpl);?>
" class="form tieba <?php if ($_smarty_tpl->tpl_vars['channel']->value=="tieba") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][51];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>     
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("huodong",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"huodong",'template'=>"list"),$_smarty_tpl);?>
" class="form huodong fn-hide">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][53];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>    
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("live",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"live",'template'=>"search"),$_smarty_tpl);?>
" class="form live <?php if ($_smarty_tpl->tpl_vars['channel']->value=="live") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][54];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>     
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("quanjing",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"quanjing",'template'=>"list"),$_smarty_tpl);?>
" class="form quanjing <?php if ($_smarty_tpl->tpl_vars['channel']->value=="quanjing") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][37][55];?>
" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>    
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("education",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"education",'template'=>"list"),$_smarty_tpl);?>
" class="form education <?php if ($_smarty_tpl->tpl_vars['channel']->value=="education") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("pension",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"pension",'template'=>"store"),$_smarty_tpl);?>
" class="form pension <?php if ($_smarty_tpl->tpl_vars['channel']->value=="pension") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("travel",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"travel",'template'=>"hotel"),$_smarty_tpl);?>
" class="form travel <?php if ($_smarty_tpl->tpl_vars['channel']->value=="travel") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("homemaking",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"homemaking",'template'=>"list"),$_smarty_tpl);?>
" class="form homemaking <?php if ($_smarty_tpl->tpl_vars['channel']->value=="homemaking") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("paimai",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"paimai",'template'=>"list"),$_smarty_tpl);?>
" class="form paimai <?php if ($_smarty_tpl->tpl_vars['channel']->value=="paimai") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("dating",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"dating",'template'=>"samecity"),$_smarty_tpl);?>
" class="form dating <?php if ($_smarty_tpl->tpl_vars['channel']->value=="dating") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("marry",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"marry",'template'=>"search_list"),$_smarty_tpl);?>
" class="form marry <?php if ($_smarty_tpl->tpl_vars['channel']->value=="marry") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <input type="hidden" name="contype" value="1" />
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("paper",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"paper",'template'=>"search_list"),$_smarty_tpl);?>
" class="form paper <?php if ($_smarty_tpl->tpl_vars['channel']->value=="paper") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("renovation",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"renovation",'template'=>"company"),$_smarty_tpl);?>
" class="form renovation <?php if ($_smarty_tpl->tpl_vars['channel']->value=="renovation") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
            <?php if (in_array("car",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <form action="<?php echo getUrlPath(array('service'=>"car",'template'=>"list"),$_smarty_tpl);?>
" class="form car <?php if ($_smarty_tpl->tpl_vars['channel']->value=="car") {
} else { ?>fn-hide<?php }?>">
            <div class="inputbox">
                <div class="inpbox"><input type="text" name="keywords" class="searchkey" placeholder="请输入要搜索的关键字" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" /></div>
            </div>
            <input type="submit" class="submit" value="<?php echo $_smarty_tpl->tpl_vars['langData']->value['siteConfig'][6][109];?>
">     
            </form>
            <?php }?>
        </div>
        </div>
      </div>
    </div>
    <!-- head e -->

    <div class="nav-con n-linear">
      <div class="wrap">
        <ul class="fn-clear">
          <?php $_smarty_tpl->tpl_vars['i'] = new Smarty_variable(0, null, 0);?>
          <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module",'type'=>"1")); $_block_repeat=true; echo loop(array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module",'type'=>"1"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

          <li>
            <a href="<?php echo $_smarty_tpl->tpl_vars['module']->value['url'];?>
"<?php if ($_smarty_tpl->tpl_vars['module']->value['target']) {?> target="_blank"<?php }?> style="<?php if ($_smarty_tpl->tpl_vars['module']->value['color']) {?> color: <?php echo $_smarty_tpl->tpl_vars['module']->value['color'];?>
;<?php }
if ($_smarty_tpl->tpl_vars['module']->value['bold']) {?> font-weight: 700;<?php }?>"><?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
</a>
            <?php if ($_smarty_tpl->tpl_vars['module']->value['code']=='article') {?>
            <ul class="li-down">
              <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"article",'action'=>"type",'return'=>"atype")); $_block_repeat=true; echo loop(array('service'=>"article",'action'=>"type",'return'=>"atype"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

              <li><a href="<?php echo $_smarty_tpl->tpl_vars['atype']->value['url'];?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['atype']->value['typename'];?>
</a></li>
              <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"article",'action'=>"type",'return'=>"atype"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

            </ul>
            <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=='info') {?>
            <ul class="li-down">
              <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"info",'action'=>"type",'return'=>"atype")); $_block_repeat=true; echo loop(array('service'=>"info",'action'=>"type",'return'=>"atype"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

              <li><a href="<?php echo $_smarty_tpl->tpl_vars['atype']->value['url'];?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['atype']->value['typename'];?>
</a></li>
              <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"info",'action'=>"type",'return'=>"atype"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

            </ul>
  					<?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=='house') {?>
            <ul class="li-down">
              <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'zu'),$_smarty_tpl);?>
" target="_blank">找出租房</a></li>
              <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'sale'),$_smarty_tpl);?>
" target="_blank">找二手房</a></li>
              <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'map','action'=>'loupan'),$_smarty_tpl);?>
" target="_blank">地图找房</a></li>
              <?php if ($_smarty_tpl->tpl_vars['cfg_subway_state']->value) {?><li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'loupan','param'=>'from=subway'),$_smarty_tpl);?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['cfg_subway_title']->value;?>
</a></li><?php }?>
              <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'demand'),$_smarty_tpl);?>
" target="_blank">求租求购</a></li>
            </ul>
  					<?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=='job') {?>
            <ul class="li-down">
                <li><a href="<?php echo getUrlPath(array('service'=>'job','template'=>'job-list'),$_smarty_tpl);?>
" target="_blank">最新职位</a></li>
                <li><a href="<?php echo getUrlPath(array('service'=>'job','template'=>'talent'),$_smarty_tpl);?>
" target="_blank">人才库</a></li>
                <li><a href="<?php echo getUrlPath(array('service'=>'job','template'=>'zhaopinhui'),$_smarty_tpl);?>
" target="_blank">招聘会</a></li>
                <li><a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'job','action'=>'resume'),$_smarty_tpl);?>
" target="_blank">我要找工作</a></li>
                <li><a href="/supplier/job" target="_blank">企业招聘</a></li>
            </ul>
  					<?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=='renovation') {?>
            <ul class="li-down">
              <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'albums'),$_smarty_tpl);?>
" target="_blank">效果图</a></li>
              <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'case'),$_smarty_tpl);?>
" target="_blank">装修案例</a></li>
              <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'company'),$_smarty_tpl);?>
" target="_blank">找专家</a></li>
              <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'zwj'),$_smarty_tpl);?>
" target="_blank">找小区</a></li>
              <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'designer'),$_smarty_tpl);?>
" target="_blank">设计师</a></li>
              <li><a href="<?php echo getUrlPath(array('service'=>'renovation','template'=>'zb-fabu'),$_smarty_tpl);?>
" target="_blank">装修招标</a></li>
            </ul>
            <?php } elseif ($_smarty_tpl->tpl_vars['module']->value['code']=='image') {?>
            <ul class="li-down">
              <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"image",'action'=>"type",'return'=>"atype")); $_block_repeat=true; echo loop(array('service'=>"image",'action'=>"type",'return'=>"atype"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

              <li><a href="<?php echo $_smarty_tpl->tpl_vars['atype']->value['url'];?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['atype']->value['typename'];?>
</a></li>
              <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"image",'action'=>"type",'return'=>"atype"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

            </ul>
            <?php }?>
          </li>
          <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"siteConfig",'action'=>"siteModule",'return'=>"module",'type'=>"1"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

        </ul>
      </div>
    </div>

  </div>
</div>

<!-- 广告位 s -->
<div class="ad-con">
  <?php echo getMyAd(array('title'=>"首页_模板十_电脑端_广告二"),$_smarty_tpl);?>

</div>
<!-- 广告位 e -->

<?php if (in_array("article",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
<!-- 资讯 -->
<div class="mainBox wrap fn-clear">
  <!-- 焦点图 s-->
  <div class="PicFocus">
    <div class="slideBox slideBox1">
      <div class="slidewrap">
        <div class="slide">
          <div class="bd"><?php echo getMyAd(array('title'=>"首页_模板十_电脑端_广告三",'type'=>"slide"),$_smarty_tpl);?>
</div>
          <div class="hd"><ul></ul></div>
        </div>
        <a href="javascript:;" class="prev"></a>
        <a href="javascript:;" class="next"></a>
      </div>
    </div>
  </div>
  <!-- 焦点图 e-->

  <!-- 顶部新闻盒子 s-->
  <div class="NewsBox">
    <div class="Newslead fn-clear">
      <span>头条推荐</span>
      <i></i>
      <div class="notice" id="notice">
        <ul>
          <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"siteConfig",'action'=>"notice",'return'=>"notice",'pageSize'=>"10")); $_block_repeat=true; echo loop(array('service'=>"siteConfig",'action'=>"notice",'return'=>"notice",'pageSize'=>"10"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

          <li><a href="<?php echo $_smarty_tpl->tpl_vars['notice']->value['url'];?>
" target="_blank" title="<?php echo $_smarty_tpl->tpl_vars['notice']->value['title'];?>
"><?php echo $_smarty_tpl->tpl_vars['notice']->value['title'];?>
</a></li>
          <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"siteConfig",'action'=>"notice",'return'=>"notice",'pageSize'=>"10"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

        </ul>
      </div>
    </div>
    <div class="NewsList">
      <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"h",'page'=>"1",'pageSize'=>"1")); $_block_repeat=true; echo loop(array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"h",'page'=>"1",'pageSize'=>"1"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

      <h3><a href="<?php echo $_smarty_tpl->tpl_vars['alist']->value['url'];?>
" target="_blank" title="<?php echo preg_replace('!<[^>]*?>!', ' ', $_smarty_tpl->tpl_vars['alist']->value['title']);?>
"><?php echo $_smarty_tpl->tpl_vars['alist']->value['title'];?>
</a></h3>
      <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"h",'page'=>"1",'pageSize'=>"1"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      <ul>
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"r",'page'=>"1",'pageSize'=>"4")); $_block_repeat=true; echo loop(array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"r",'page'=>"1",'pageSize'=>"4"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

        <li><a href="<?php echo $_smarty_tpl->tpl_vars['alist']->value['url'];?>
" target="_blank" title="<?php echo preg_replace('!<[^>]*?>!', ' ', $_smarty_tpl->tpl_vars['alist']->value['title']);?>
"><span>•</span><?php echo $_smarty_tpl->tpl_vars['alist']->value['title'];?>
</a></li>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"r",'page'=>"1",'pageSize'=>"4"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      </ul>
      <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"h",'page'=>"2",'pageSize'=>"1")); $_block_repeat=true; echo loop(array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"h",'page'=>"2",'pageSize'=>"1"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

      <h3><a href="<?php echo $_smarty_tpl->tpl_vars['alist']->value['url'];?>
" target="_blank" title="<?php echo preg_replace('!<[^>]*?>!', ' ', $_smarty_tpl->tpl_vars['alist']->value['title']);?>
"><?php echo $_smarty_tpl->tpl_vars['alist']->value['title'];?>
</a></h3>
      <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"h",'page'=>"2",'pageSize'=>"1"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      <ul>
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"r",'page'=>"2",'pageSize'=>"4")); $_block_repeat=true; echo loop(array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"r",'page'=>"2",'pageSize'=>"4"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

        <li><a href="<?php echo $_smarty_tpl->tpl_vars['alist']->value['url'];?>
" target="_blank" title="<?php echo preg_replace('!<[^>]*?>!', ' ', $_smarty_tpl->tpl_vars['alist']->value['title']);?>
"><span>•</span><?php echo $_smarty_tpl->tpl_vars['alist']->value['title'];?>
</a></li>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"article",'action'=>"alist",'isAjax'=>"1",'return'=>"alist",'flag'=>"r",'page'=>"2",'pageSize'=>"4"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      </ul>
    </div>
  </div>
  <!-- 顶部新闻盒子 e-->
</div>
<?php }?>

<!-- 模块区域 s-->
<div class="module-box fn-clear">
  <?php if (in_array("tuan",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <div class="con-box con-bg1"><a href="<?php echo $_smarty_tpl->tpl_vars['tuan_channelDomain']->value;?>
" target="_blank"><i></i><span><?php echo $_smarty_tpl->tpl_vars['tuan_channelName']->value;?>
</span></a></div>
  <?php }?>
  <?php if (in_array("quanjing",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <div class="con-box con-bg2"><a href="<?php echo $_smarty_tpl->tpl_vars['quanjing_channelDomain']->value;?>
" target="_blank"><i></i><span><?php echo $_smarty_tpl->tpl_vars['quanjing_channelName']->value;?>
</span></a></div>
  <?php }?>
  <?php if (in_array("circle",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <div class="con-box con-bg3"><a href="<?php echo $_smarty_tpl->tpl_vars['circle_channelDomain']->value;?>
" target="_blank"><i></i><span>秒拍短视频</span></a></div>
  <?php }?>
  <?php if (in_array("live",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
  <div class="con-box con-bg4"><a href="<?php echo $_smarty_tpl->tpl_vars['live_channelDomain']->value;?>
" target="_blank"><i></i><span><?php echo $_smarty_tpl->tpl_vars['live_channelName']->value;?>
</span></a></div>
  <?php }?>
</div>
<!-- 模块区域 e-->

<?php if ($_smarty_tpl->tpl_vars['cfg_business_state']->value) {?>
<!-- 推荐商家 s -->
<div class="recommend-box wrap fn-clear">
  <div class="top-box fn-clear">
    <span class="rec-buss">推荐商家</span>
    <ul class="fn-clear">
      <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"business",'action'=>"type",'return'=>"atype",'pageSize'=>"10")); $_block_repeat=true; echo loop(array('service'=>"business",'action'=>"type",'return'=>"atype",'pageSize'=>"10"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

      <li><a href="<?php echo getUrlPath(array('service'=>'business','template'=>'list','param'=>"typeid=".((string)$_smarty_tpl->tpl_vars['atype']->value['id'])),$_smarty_tpl);?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['atype']->value['typename'];?>
</a></li>
      <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"business",'action'=>"type",'return'=>"atype",'pageSize'=>"10"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

    </ul>
    <a href="<?php echo $_smarty_tpl->tpl_vars['business_channelDomain']->value;?>
" target="_blank" class="more">更多商家 >></a>
    <a href="<?php echo $_smarty_tpl->tpl_vars['member_busiDomain']->value;?>
" target="_blank" class="ruzhu-buss btn-linear">入驻商家</a>
  </div>

  <div class="buss-con">
    <div class="slideBox slideBox00">
      <div class="bd">
        <ul class="fn-clear">
          <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"business",'action'=>'blist','return'=>'list','store'=>'2','pageSize'=>"15")); $_block_repeat=true; echo loop(array('service'=>"business",'action'=>'blist','return'=>'list','store'=>'2','pageSize'=>"15"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

          <li>
            <a href="<?php echo $_smarty_tpl->tpl_vars['list']->value['url'];?>
" target="_blank">
              <div class="slide-img">
                <img src="<?php echo $_smarty_tpl->tpl_vars['list']->value['logo'];?>
" onerror="this.src='/static/images/shop.png'">
                <div class="slide-code"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/qrcode.php?data=<?php echo $_smarty_tpl->tpl_vars['list']->value['url'];?>
" /></div>
                <?php if ($_smarty_tpl->tpl_vars['list']->value['panor']>0) {?><div class="slide-mark mark1">全景</div><?php }?>
                <?php if ($_smarty_tpl->tpl_vars['list']->value['video']>0) {?><div class="slide-mark mark2">视频</div><?php }?>
              </div>
              <div class="slide-title fn-clear">
                <span class="s-title" title="<?php echo $_smarty_tpl->tpl_vars['list']->value['title'];?>
"><?php echo $_smarty_tpl->tpl_vars['list']->value['title'];?>
</span>
                <?php if ($_smarty_tpl->tpl_vars['list']->value['waimai']==1) {?><span class="s-tip tip1" title="外卖">外</span><?php }?>
                <?php  $_smarty_tpl->tpl_vars['sub'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['sub']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['list']->value['auth']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['sub']->key => $_smarty_tpl->tpl_vars['sub']->value) {
$_smarty_tpl->tpl_vars['sub']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['sub']->key;
?>
                <?php if ($_smarty_tpl->tpl_vars['k']->value<3) {?>
                <span class="s-tip tip<?php echo $_smarty_tpl->tpl_vars['k']->value+2;?>
" title="<?php echo $_smarty_tpl->tpl_vars['sub']->value['typename'];?>
"><?php echo $_smarty_tpl->tpl_vars['sub']->value['jc'];?>
</span>
                <?php }?>
                <?php } ?>
              </div>
              <!-- <?php if ($_smarty_tpl->tpl_vars['list']->value['tel']) {?><p class="slide-tel">电话：<?php echo $_smarty_tpl->tpl_vars['list']->value['tel'];?>
</p><?php }?> -->
            </a>
          </li>
          <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"business",'action'=>'blist','return'=>'list','store'=>'2','pageSize'=>"15"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

        </ul>
      </div>
      <div class="hd">
        <ul class="fn-clear"></ul>
      </div>
    </div>
  </div>

</div>
<!-- 推荐商家 e -->
<?php }?>

<?php if (in_array("huodong",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
<!-- 同城活动 s -->
<div class="recommend-box activity-box wrap fn-clear">
  <a href="<?php echo $_smarty_tpl->tpl_vars['huodong_channelDomain']->value;?>
" target="_blank" class="ac-more"></a>
  <div class="activity-title"><?php echo $_smarty_tpl->tpl_vars['huodong_channelName']->value;?>
</div>
  <div class="activity-con">
    <div class="slideBox slideBox3" >
      <div class="bd">
        <ul class="fn-clear">
          <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"huodong",'action'=>'hlist','return'=>'list','pageSize'=>'12')); $_block_repeat=true; echo loop(array('service'=>"huodong",'action'=>'hlist','return'=>'list','pageSize'=>'12'), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

          <li>
            <a href="<?php echo $_smarty_tpl->tpl_vars['list']->value['url'];?>
" target="_blank">
              <div class="slide-img"><img src="<?php echo $_smarty_tpl->tpl_vars['list']->value['litpic'];?>
" ></div>
              <div class="slide-title"><?php echo $_smarty_tpl->tpl_vars['list']->value['title'];?>
</div>
              <p class="slide-time">截止时间：<?php echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['list']->value['end'],"%Y-%m-%d %H:%M");?>
</p>
              <p class="slide-baoming">已报名 <span class="s-num"><?php echo $_smarty_tpl->tpl_vars['list']->value['reg'];?>
</span>人   <span class="baoming">我要报名</span></p>
            </a>
          </li>
          <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"huodong",'action'=>'hlist','return'=>'list','pageSize'=>'12'), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

        </ul>
      </div>
      <a class="prev" href="javascript:;"></a>
      <a class="next" href="javascript:;"></a>
    </div>
  </div>
</div>
<!-- 同城活动 e -->
<?php }?>

<?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
<!-- 二手 s -->
<div class="recommend-info info wrap fn-clear">
  <div class="box-left">
    <div class="top-box fn-clear">
        <span class="rec-buss"><?php echo $_smarty_tpl->tpl_vars['info_channelName']->value;?>
</span>
        <ul class="fn-clear">
            <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"info",'action'=>"type",'return'=>"atype",'pageSize'=>"8")); $_block_repeat=true; echo loop(array('service'=>"info",'action'=>"type",'return'=>"atype",'pageSize'=>"8"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

            <li><a href="<?php echo getUrlPath(array('service'=>'info','template'=>'list','param'=>"typeid=".((string)$_smarty_tpl->tpl_vars['atype']->value['id'])),$_smarty_tpl);?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['atype']->value['typename'];?>
</a></li>
            <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"info",'action'=>"type",'return'=>"atype",'pageSize'=>"8"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

        </ul>
      <a href="<?php echo $_smarty_tpl->tpl_vars['info_channelDomain']->value;?>
" target="_blank" class="more">更多</a>
      <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'info'),$_smarty_tpl);?>
" target="_blank" class="fabu btn-linear">发布二手</a>
    </div>
    
    <div class="info-con show">
      <div class="picture-con fn-clear">
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"info",'action'=>"ilist_v2",'return'=>"alist",'thumb'=>"1",'pageSize'=>"6")); $_block_repeat=true; echo loop(array('service'=>"info",'action'=>"ilist_v2",'return'=>"alist",'thumb'=>"1",'pageSize'=>"6"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

        <div class="picture"><a href="<?php echo $_smarty_tpl->tpl_vars['alist']->value['url'];?>
" title="<?php echo preg_replace('!<[^>]*?>!', ' ', $_smarty_tpl->tpl_vars['alist']->value['title']);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['alist']->value['litpic'];?>
"><p><?php echo $_smarty_tpl->tpl_vars['alist']->value['title'];?>
</p></a></div>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"info",'action'=>"ilist_v2",'return'=>"alist",'thumb'=>"1",'pageSize'=>"6"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      </div>
      <div class="news-list fn-clear">
        <ul class="ul-1">
          <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"info",'action'=>"ilist_v2",'return'=>"alist",'pageSize'=>"14",'orderby'=>"1")); $_block_repeat=true; echo loop(array('service'=>"info",'action'=>"ilist_v2",'return'=>"alist",'pageSize'=>"14",'orderby'=>"1"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

          <li class="fn-clear">
            <a href="<?php echo $_smarty_tpl->tpl_vars['alist']->value['url'];?>
" title="<?php echo preg_replace('!<[^>]*?>!', ' ', $_smarty_tpl->tpl_vars['alist']->value['title']);?>
" target="_blank">
              <span class="cir">• </span>
              <span class="info"><?php echo $_smarty_tpl->tpl_vars['alist']->value['title'];?>
</span>
              <span class="news-time"><?php echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['alist']->value['pubdate'],"%Y-%m");?>
</span>
              <?php if ($_smarty_tpl->tpl_vars['alist']->value['top']) {?><span class="n-tip tip1">顶</span><?php }?>
              <?php if ($_smarty_tpl->tpl_vars['alist']->value['fire']) {?><span class="n-tip tip2">火</span><?php }?>
              <?php if ($_smarty_tpl->tpl_vars['alist']->value['rec']) {?><span class="n-tip tip3">荐</span><?php }?>
            </a>
          </li>
          <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"info",'action'=>"ilist_v2",'return'=>"alist",'pageSize'=>"14",'orderby'=>"1"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

        </ul>
      </div>
    </div>

  </div>

  <div class="box-right">
    <div class="top-box fn-clear">
      <span class="buy-info">推荐信息</span>
      <a href="<?php echo $_smarty_tpl->tpl_vars['info_channelDomain']->value;?>
" target="_blank" class="more">查看更多>></a>
    </div>
    <div class="right-con">
      <ul>
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"info",'action'=>"ilist_v2",'return'=>"ilist",'rec'=>"1",'pageSize'=>"6")); $_block_repeat=true; echo loop(array('service'=>"info",'action'=>"ilist_v2",'return'=>"ilist",'rec'=>"1",'pageSize'=>"6"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

        <li class="fn-clear">
          <a href="<?php echo $_smarty_tpl->tpl_vars['ilist']->value['url'];?>
" target="_blank" title="<?php echo preg_replace('!<[^>]*?>!', ' ', $_smarty_tpl->tpl_vars['ilist']->value['title']);?>
">
            <div class="li-left">
              <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/top<?php echo $_smarty_tpl->tpl_vars['_bindex']->value['ilist'];?>
.png" alt="">
            </div>
            <div class="li-right">
              <h4><?php echo $_smarty_tpl->tpl_vars['ilist']->value['title'];?>
</h4>
              <p><i></i><?php if ($_smarty_tpl->tpl_vars['userinfo']->value) {
if ($_smarty_tpl->tpl_vars['ilist']->value['tel']=='请使用隐私号'||$_smarty_tpl->tpl_vars['ilist']->value['tel']=='请先付费') {?>点击查看<?php } else {
echo $_smarty_tpl->tpl_vars['ilist']->value['tel'];
}
} else { ?>登录后显示<?php }?><span><?php echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['ilist']->value['pubdate'],"%Y.%m.%d");?>
</span></p>
            </div>
          </a>
        </li>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"info",'action'=>"ilist_v2",'return'=>"ilist",'rec'=>"1",'pageSize'=>"6"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      </ul>
    </div>
  </div>

</div>
<!-- 二手 e -->
<?php }?>

<?php if (in_array("tuan",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
<!-- 推荐团购 s -->
<div class="recommend-box tuan-box wrap fn-clear">
  <div class="top-box fn-clear">
    <span class="rec-buss">推荐团购</span>
    <a href="<?php echo $_smarty_tpl->tpl_vars['tuan_channelDomain']->value;?>
" target="_blank" class="more">更多团购 >></a>
    <a href="<?php echo getUrlPath(array('service'=>'member','template'=>'fabu','action'=>'tuan'),$_smarty_tpl);?>
" target="_blank" class="fabu tuan btn-linear">发布团购</a>
  </div>

  <div class="tuan-con fn-clear">
    <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"tuan",'action'=>"tlist",'return'=>"list",'pageSize'=>"5")); $_block_repeat=true; echo loop(array('service'=>"tuan",'action'=>"tlist",'return'=>"list",'pageSize'=>"5"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

    <div class="main-tuan">
      <a href="<?php echo $_smarty_tpl->tpl_vars['list']->value['url'];?>
" target="_blank" title="<?php echo $_smarty_tpl->tpl_vars['list']->value['title'];?>
">
        <div class="slide-img"><img src="<?php echo $_smarty_tpl->tpl_vars['list']->value['litpic'];?>
" /></div>
        <div class="slide-title"><?php echo $_smarty_tpl->tpl_vars['list']->value['title'];?>
</div>
        <p class="slide-sell"> <span class="symbol"><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</span> <?php echo $_smarty_tpl->tpl_vars['list']->value['price'];?>
 <span class="y-price"><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);
echo $_smarty_tpl->tpl_vars['list']->value['market'];?>
</span><span class="al-sell">已售 <span class="s-num"><?php echo $_smarty_tpl->tpl_vars['list']->value['sale'];?>
</span></span></p>
      </a>
    </div>
    <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"tuan",'action'=>"tlist",'return'=>"list",'pageSize'=>"5"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

  </div>
</div>
<!-- 推荐团购 e -->
<?php }?>

<!-- 广告位 s -->
<div class="ad-con">
  <?php echo getMyAd(array('title'=>"首页_模板十_电脑端_广告四"),$_smarty_tpl);?>

</div>
<!-- 广告位 e -->

<?php if (in_array("shop",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
<!-- 推荐商品 s -->
<div class="recommend-info goods-box tuan-box wrap fn-clear shop-box">
  <!-- <div class="box-left"> -->
  <div class="top-box fn-clear">
    <span class="rec-buss">商城新品</span>
    <a href="<?php echo $_smarty_tpl->tpl_vars['shop_channelDomain']->value;?>
" target="_blank" class="more">查看更多>></a>
  </div>

  <div class="tuan-con goods-con show fn-clear">
    <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"shop",'action'=>"slist",'return'=>"list",'orderby'=>"5",'pageSize'=>"5")); $_block_repeat=true; echo loop(array('service'=>"shop",'action'=>"slist",'return'=>"list",'orderby'=>"5",'pageSize'=>"5"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

    <div class="main-tuan">
      <a href="<?php echo $_smarty_tpl->tpl_vars['list']->value['url'];?>
" target="_blank" title="<?php echo $_smarty_tpl->tpl_vars['list']->value['title'];?>
">
        <div class="slide-img"><img src="<?php echo $_smarty_tpl->tpl_vars['list']->value['litpic'];?>
" ></div>
        <div class="slide-title"><?php echo $_smarty_tpl->tpl_vars['list']->value['title'];?>
</div>
        <p class="slide-sell"> <span class="symbol"><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</span> <?php echo $_smarty_tpl->tpl_vars['list']->value['price'];?>
 <span class="y-price"><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);
echo $_smarty_tpl->tpl_vars['list']->value['mprice'];?>
</span><span class="al-sell">已售 <span class="s-num"><?php echo $_smarty_tpl->tpl_vars['list']->value['sales'];?>
</span></span></p>
      </a>
    </div>
    <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"shop",'action'=>"slist",'return'=>"list",'orderby'=>"5",'pageSize'=>"5"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

  </div>

</div>
<!-- 推荐商品 e -->
<?php }?>

<?php if (in_array("job",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
<!-- 企业招聘 s -->
<div class="recommend-info job-box wrap fn-clear">
  <div class="top-box fn-clear">
    <ul class="fn-clear">
      <li class="active">企业招聘</li>
      <li>求职简历 <span class="hot"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/j-hot.png"></span></li>
    </ul>
    <a href="<?php echo getUrlPath(array('service'=>'job','template'=>'job-list'),$_smarty_tpl);?>
" target="_blank" class="more">查看更多 >></a>
    <a href="<?php echo $_smarty_tpl->tpl_vars['masterDomain']->value;?>
/supplier/job/add_post.html" target="_blank" class="fabu job btn-linear">发布职位</a>
  </div>
  <!-- 企业招聘 -->
  <div class="job-con show">
    <ul class=" fn-clear">
      <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"job",'action'=>"postList",'return'=>"post",'pageSize'=>"9")); $_block_repeat=true; echo loop(array('service'=>"job",'action'=>"postList",'return'=>"post",'pageSize'=>"9"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

      <li>
        <a href="<?php echo $_smarty_tpl->tpl_vars['post']->value['url'];?>
" target="_blank">
          <h4 class="fn-clear">
            <span class="info"><?php echo $_smarty_tpl->tpl_vars['post']->value['title'];?>
</span>
            <?php if (strstr($_smarty_tpl->tpl_vars['post']->value['property'],'h')) {?><span class="j-tip tip1">热</span><?php }?>
            <?php if (strstr($_smarty_tpl->tpl_vars['post']->value['property'],'u')) {?><span class="j-tip tip2">急</span><?php }?>
            <?php if (strstr($_smarty_tpl->tpl_vars['post']->value['property'],'r')) {?><span class="j-tip tip3">荐</span><?php }?>
          </h4>
          <p>
            <span class="pay"><?php echo $_smarty_tpl->tpl_vars['post']->value['show_salary'];?>
</span> 
            <?php if ($_smarty_tpl->tpl_vars['post']->value['job_addr_detail']) {?><span class="address"><?php echo $_smarty_tpl->tpl_vars['post']->value['job_addr_detail']['addrName'][count($_smarty_tpl->tpl_vars['post']->value['job_addr_detail']['addrName'])-1];?>
</span> <?php }?>
            <span class="jingyan"><?php echo $_smarty_tpl->tpl_vars['post']->value['experience'];?>
</span> 
            <span class="xueli"><?php echo $_smarty_tpl->tpl_vars['post']->value['educational'];?>
</span>
          </p>
        </a>
      </li>
      <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"job",'action'=>"postList",'return'=>"post",'pageSize'=>"9"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

    </ul>
  </div>
  <!-- 求职简历 -->
  <div class="job-con jianli">
    <ul class="fn-clear">
      <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"job",'action'=>"resumeList",'return'=>"resume",'pageSize'=>"6")); $_block_repeat=true; echo loop(array('service'=>"job",'action'=>"resumeList",'return'=>"resume",'pageSize'=>"6"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

      <li>
        <a href="<?php echo $_smarty_tpl->tpl_vars['resume']->value['url'];?>
" target="_blank">
          <div class="li-left"><img src="<?php echo $_smarty_tpl->tpl_vars['resume']->value['photo_url'];?>
" onerror="this.src='/static/images/noPhoto_100.jpg'"></div>
          <div class="li-right">
            <h3><?php echo $_smarty_tpl->tpl_vars['resume']->value['name'];?>
</h3>
            <h4><?php if ($_smarty_tpl->tpl_vars['resume']->value['sex']==0) {?>男<?php } else { ?>女<?php }?>    <?php echo $_smarty_tpl->tpl_vars['resume']->value['age'];?>
岁   <?php echo $_smarty_tpl->tpl_vars['resume']->value['workyear'];?>
年   <?php echo $_smarty_tpl->tpl_vars['resume']->value['educational'];?>
</h4>
            <p>
              期望薪资：
              <span style="padding: 0;">
                <?php if ($_smarty_tpl->tpl_vars['resume']->value['min_salary']&&$_smarty_tpl->tpl_vars['resume']->value['max_salary']) {
echo $_smarty_tpl->tpl_vars['resume']->value['min_salary'];?>
-<?php echo $_smarty_tpl->tpl_vars['resume']->value['max_salary'];?>

                <?php } elseif ($_smarty_tpl->tpl_vars['resume']->value['min_salary']) {?>
                <?php echo $_smarty_tpl->tpl_vars['resume']->value['min_salary'];?>
以上
                <?php } elseif ($_smarty_tpl->tpl_vars['resume']->value['max_salary']) {?>
                <?php echo $_smarty_tpl->tpl_vars['resume']->value['min_salary'];?>

                <?php } else { ?>面议<?php }?></span>
            </p>
            <p class="pos">期望职位：<?php echo $_smarty_tpl->tpl_vars['resume']->value['job_name'][0];?>
</p>
            <p>期望地点：<?php echo $_smarty_tpl->tpl_vars['resume']->value['addr_list_Name'][0];?>
 <?php echo $_smarty_tpl->tpl_vars['resume']->value['addr_list_Name'][1];?>
</p>
          </div>
        </a>
      </li>
      <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"job",'action'=>"resumeList",'return'=>"resume",'pageSize'=>"6"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

    </ul>
  </div>
</div>
<!-- 企业招聘 e -->

<!-- 最新入驻企业 s -->
<div class="recommend-box tuan-box wrap fn-clear">
  <div class="top-box fn-clear">
    <span class="rec-buss">最新入驻企业</span>
    <a href="<?php echo getUrlPath(array('service'=>'job','template'=>'company-list'),$_smarty_tpl);?>
" target="_blank" class="more">查看更多 >></a>
    <a href="<?php echo $_smarty_tpl->tpl_vars['masterDomain']->value;?>
/supplier/job/company_info.html" target="_blank" class="fabu tuan btn-linear">企业入驻</a>
  </div>

  <div class="qiye-con fn-clear">
    <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"job",'action'=>"companyList",'return'=>"company",'pageSize'=>"6")); $_block_repeat=true; echo loop(array('service'=>"job",'action'=>"companyList",'return'=>"company",'pageSize'=>"6"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

    <div class="main-box box<?php echo $_smarty_tpl->tpl_vars['_bindex']->value['company'];?>
">
      <a href="<?php echo $_smarty_tpl->tpl_vars['company']->value['url'];?>
" target="_blank" title="<?php echo $_smarty_tpl->tpl_vars['company']->value['title'];?>
"><img src="<?php echo $_smarty_tpl->tpl_vars['company']->value['logo_url'];?>
" class='jc-logo'></a>
      <div class="main-cover fn-clear">
        <div class="c-left"><a href="<?php echo $_smarty_tpl->tpl_vars['company']->value['url'];?>
" target="_blank" title="<?php echo $_smarty_tpl->tpl_vars['company']->value['title'];?>
"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/qrcode.php?data=<?php echo $_smarty_tpl->tpl_vars['company']->value['url'];?>
" alt=""></a></div>
        <div class="c-right">
          <h4><a href="<?php echo $_smarty_tpl->tpl_vars['company']->value['url'];?>
" target="_blank" title="<?php echo $_smarty_tpl->tpl_vars['company']->value['title'];?>
"><?php echo $_smarty_tpl->tpl_vars['company']->value['title'];?>
</a></h4>
          <p><span><a href="<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['company']->value['id'];?>
<?php $_tmp1=ob_get_clean();?><?php echo getUrlPath(array('service'=>'job','template'=>'company-job','id'=>$_tmp1),$_smarty_tpl);?>
" target="_blank">职位  <?php echo $_smarty_tpl->tpl_vars['company']->value['pcount'];?>
</a></span> <span><a href="<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['company']->value['id'];?>
<?php $_tmp2=ob_get_clean();?><?php echo getUrlPath(array('service'=>'job','template'=>'company-salary','id'=>$_tmp2),$_smarty_tpl);?>
" target="_blank">工资  <?php echo $_smarty_tpl->tpl_vars['company']->value['salary_avg'];?>
</a></span> <span><a href="<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['company']->value['id'];?>
<?php $_tmp3=ob_get_clean();?><?php echo getUrlPath(array('service'=>'job','template'=>'company-album','id'=>$_tmp3),$_smarty_tpl);?>
" target="_blank">相册  <?php echo count($_smarty_tpl->tpl_vars['company']->value['pics']);?>
</a></span> </p>
          <p class="zhiwei">招聘职位
            <?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['company']->value['id'];?>
<?php $_tmp4=ob_get_clean();?><?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"job",'action'=>"postList",'return'=>"post",'company'=>$_tmp4,'pageSize'=>"4")); $_block_repeat=true; echo loop(array('service'=>"job",'action'=>"postList",'return'=>"post",'company'=>$_tmp4,'pageSize'=>"4"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

            <a href="<?php echo $_smarty_tpl->tpl_vars['post']->value['url'];?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['post']->value['title'];?>
</a>、
            <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"job",'action'=>"postList",'return'=>"post",'company'=>$_tmp4,'pageSize'=>"4"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

          </p>
          <p class="p-see"><a href="<?php echo $_smarty_tpl->tpl_vars['company']->value['url'];?>
" target="_blank" class="btn-qy">企业主页</a> <a href="<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['company']->value['id'];?>
<?php $_tmp5=ob_get_clean();?><?php echo getUrlPath(array('service'=>'job','template'=>'company-job','id'=>$_tmp5,'scroll'=>1),$_smarty_tpl);?>
" target="_blank" class="all">查看该企业的全部职位 >></a></p>
        </div>
      </div>
    </div>
    <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"job",'action'=>"companyList",'return'=>"company",'pageSize'=>"6"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

</div>

</div>
<!-- 最新入驻企业 e -->
<?php }?>

<!-- 广告位 s -->
<div class="ad-con">
  <?php echo getMyAd(array('title'=>"首页_模板十_电脑端_广告五"),$_smarty_tpl);?>

</div>
<!-- 广告位 e -->

<?php if (in_array("house",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
<!-- 推荐二手房 s -->
<div class="recommend-box house-box house1 wrap fn-clear">
  <div class="box-left">
    <div class="top-box fn-clear">
      <span class="rec-buss">推荐二手房</span>
      <ul class="fn-clear">
        <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'sale','param'=>'type=1'),$_smarty_tpl);?>
" target="_blank">个人房源</a></li>
        <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'sale','param'=>'type=2'),$_smarty_tpl);?>
" target="_blank">中介房源</a></li>
        <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'map-sale'),$_smarty_tpl);?>
" target="_blank">地图找二手房</a></li>
      </ul>
      <a href="<?php echo getUrlPath(array('service'=>'house','template'=>'sale'),$_smarty_tpl);?>
" target="_blank" class="more">查看更多>></a>
      <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'house-sale'),$_smarty_tpl);?>
" target="_blank" class="ruzhu-buss btn-house btn-linear">我要卖房</a>
    </div>
    <div class="house-con h-con1 show">
      <ul class="fn-clear">
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"house",'action'=>'saleList','return'=>'slist','pageSize'=>"8")); $_block_repeat=true; echo loop(array('service'=>"house",'action'=>'saleList','return'=>'slist','pageSize'=>"8"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

        <li>
          <a href="<?php echo $_smarty_tpl->tpl_vars['slist']->value['url'];?>
" target="_blank">
            <div class="slide-img">
              <img src="<?php echo $_smarty_tpl->tpl_vars['slist']->value['litpic'];?>
" >
            </div>
            <div class="slide-title"><?php echo $_smarty_tpl->tpl_vars['slist']->value['title'];?>
</div>
            <p class="slide-price"><?php if ($_smarty_tpl->tpl_vars['slist']->value['price']>0) {?><span class="symbol"><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</span> <?php echo $_smarty_tpl->tpl_vars['slist']->value['price'];?>
万 <?php } else { ?>面议<?php }?></p>
            <p class="slide-info"><?php echo $_smarty_tpl->tpl_vars['slist']->value['room'];?>
  <?php echo $_smarty_tpl->tpl_vars['slist']->value['area'];
echo echoCurrency(array('type'=>'areaname'),$_smarty_tpl);?>
</p>
          </a>
        </li>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"house",'action'=>'saleList','return'=>'slist','pageSize'=>"8"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      </ul>
    </div>
  </div>

  <div class="box-right">
    <div class="top-box fn-clear">
      <span class="peo-info">房产经纪人</span>
      <a href="<?php echo getUrlPath(array('service'=>'house','template'=>'broker'),$_smarty_tpl);?>
" target="_blank" class="more">查看更多>></a>
    </div>
    <div class="right-con">
      <div class="slideBox slideBox4" >
        <div class="bd">
          <ul class="fn-clear">
            <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"house",'action'=>"zjUserList",'return'=>"broker",'pageSize'=>"12")); $_block_repeat=true; echo loop(array('service'=>"house",'action'=>"zjUserList",'return'=>"broker",'pageSize'=>"12"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

            <li>
              <div class="li-box">
                <div class="h-left"><a href="<?php echo $_smarty_tpl->tpl_vars['broker']->value['url'];?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['broker']->value['litpic'];?>
" ></a></div>
                <div class="h-right">
                  <h4><a href="<?php echo $_smarty_tpl->tpl_vars['broker']->value['url'];?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['broker']->value['nickname'];?>
</a> <a href="<?php echo $_smarty_tpl->tpl_vars['broker']->value['url'];?>
" class="btn" target="_blank">店铺</a></h4>
                  <p><span>区域：</span><a href="<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['broker']->value['areaid'];?>
<?php $_tmp6=ob_get_clean();?><?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['broker']->value['addrid'];?>
<?php $_tmp7=ob_get_clean();?><?php echo getUrlPath(array('service'=>'house','template'=>'broker','addrid'=>$_tmp6,'business'=>$_tmp7),$_smarty_tpl);?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['broker']->value['address'][count($_smarty_tpl->tpl_vars['broker']->value['address'])-1];?>
</a></p>
                  <p><span>电话：</span><span class="h-color"><?php echo $_smarty_tpl->tpl_vars['broker']->value['phone'];?>
</span></p>
                  <p><span>房源：</span><a href="<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['broker']->value['id'];?>
<?php $_tmp8=ob_get_clean();?><?php echo getUrlPath(array('service'=>'house','template'=>'broker-detail','id'=>$_tmp8,'tpl'=>'zu'),$_smarty_tpl);?>
" target="_blank">出租<span class="h-color"><?php echo $_smarty_tpl->tpl_vars['broker']->value['zuCount'];?>
</span>套</a> <a href="<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['broker']->value['id'];?>
<?php $_tmp9=ob_get_clean();?><?php echo getUrlPath(array('service'=>'house','template'=>'broker-detail','id'=>$_tmp9,'tpl'=>'sale'),$_smarty_tpl);?>
" target="_blank">出售<span class="h-color"><?php echo $_smarty_tpl->tpl_vars['broker']->value['saleCount'];?>
</span>套</a></p>
                </div>
              </div>
            </li>
            <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"house",'action'=>"zjUserList",'return'=>"broker",'pageSize'=>"12"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

          </ul>
        </div>
        <div class="hd"><ul class="fn-clear"></ul></div>
      </div>
    </div>
  </div>
</div>
<!-- 推荐二手房 e -->

<!-- 广告位 s -->
<div class="ad-con">
  <?php echo getMyAd(array('title'=>"首页_模板十_电脑端_广告六"),$_smarty_tpl);?>

</div>
<!-- 广告位 e -->

<!-- 推荐出租房 s -->
<div class="recommend-box house-box house2 wrap fn-clear">
  <div class="box-left">
    <div class="top-box fn-clear">
      <span class="rec-buss">推荐出租房</span>
      <ul class="fn-clear">
        <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'zu','param'=>'type=1'),$_smarty_tpl);?>
" target="_blank">个人房源</a></li>
        <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'zu','param'=>'type=2'),$_smarty_tpl);?>
" target="_blank">中介房源</a></li>
        <li><a href="<?php echo getUrlPath(array('service'=>'house','template'=>'map-zu'),$_smarty_tpl);?>
" target="_blank">地图找出租房</a></li>
      </ul>
      <a href="<?php echo getUrlPath(array('service'=>'house','template'=>'zu'),$_smarty_tpl);?>
" target="_blank" class="more">查看更多>> </a>
      <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'house-zu'),$_smarty_tpl);?>
" target="_blank" class="ruzhu-buss btn-house btn-linear">发布租房</a>
    </div>
    <div class="house-con h-con2 show">
      <ul class="fn-clear">
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"house",'action'=>'zuList','return'=>'zlist','pageSize'=>"8")); $_block_repeat=true; echo loop(array('service'=>"house",'action'=>'zuList','return'=>'zlist','pageSize'=>"8"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

        <li>
          <a href="<?php echo $_smarty_tpl->tpl_vars['zlist']->value['url'];?>
" target="_blank">
            <div class="slide-img"><img src="<?php echo $_smarty_tpl->tpl_vars['zlist']->value['litpic'];?>
" ></div>
            <div class="slide-title"><?php echo $_smarty_tpl->tpl_vars['zlist']->value['title'];?>
</div>
            <p class="slide-info"><?php echo $_smarty_tpl->tpl_vars['zlist']->value['room'];?>
  <?php echo $_smarty_tpl->tpl_vars['zlist']->value['area'];
echo echoCurrency(array('type'=>'areaname'),$_smarty_tpl);?>
</p>
            <p class="slide-price"><span class="h-pos"><a href="<?php ob_start();?><?php echo $_smarty_tpl->tpl_vars['zlist']->value['addrid'];?>
<?php $_tmp10=ob_get_clean();?><?php echo getUrlPath(array('service'=>'house','template'=>'zu','addrid'=>0,'business'=>$_tmp10),$_smarty_tpl);?>
" target="_blank"><?php echo $_smarty_tpl->tpl_vars['zlist']->value['addr'][count($_smarty_tpl->tpl_vars['zlist']->value['addr'])-1];?>
</a></span><span class="h-price"><span class="symbol"><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</span> <?php echo $_smarty_tpl->tpl_vars['zlist']->value['price'];?>
/月 </span></p>
          </a>
        </li>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"house",'action'=>'zuList','return'=>'zlist','pageSize'=>"8"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      </ul>
    </div>
  </div>

  <div class="box-right house-info">
    <div class="top-box fn-clear">
      <ul class="fn-clear">
        <li class="active">最新求租</li>
        <li>最新求购</li>
      </ul>
      <a href="<?php echo getUrlPath(array('service'=>'house','template'=>'demand'),$_smarty_tpl);?>
" target="_blank" class="more">查看更多>></a>
    </div>
    <div class="right-con h-info show">
      <ul>
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"house",'action'=>'demand','return'=>'demand1','typeid'=>'0','rentype'=>"1",'pageSize'=>"7")); $_block_repeat=true; echo loop(array('service'=>"house",'action'=>'demand','return'=>'demand1','typeid'=>'0','rentype'=>"1",'pageSize'=>"7"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

        <li class="fn-clear">
          <a href="<?php echo getUrlPath(array('service'=>'house','template'=>'demand','param'=>'type=0'),$_smarty_tpl);?>
" target="_blank">
            <div class="li-left"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/top<?php echo $_smarty_tpl->tpl_vars['_bindex']->value['demand1'];?>
.png" alt=""></div>
            <div class="li-right">
              <h4><?php echo $_smarty_tpl->tpl_vars['demand1']->value['title'];?>
</h4>
              <p><i></i><?php if ($_smarty_tpl->tpl_vars['userinfo']->value) {
echo $_smarty_tpl->tpl_vars['demand1']->value['contact'];
} else { ?>登录后显示<?php }?>  <span><?php echo $_smarty_tpl->tpl_vars['demand1']->value['pubdate'];?>
</span></p>
            </div>
          </a>
        </li>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"house",'action'=>'demand','return'=>'demand1','typeid'=>'0','rentype'=>"1",'pageSize'=>"7"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      </ul>
    </div>
    <div class="right-con h-info">
      <ul>
        <?php $_smarty_tpl->smarty->_tag_stack[] = array('loop', array('service'=>"house",'action'=>'demand','return'=>'demand2','typeid'=>'1','rentype'=>"1",'pageSize'=>"7")); $_block_repeat=true; echo loop(array('service'=>"house",'action'=>'demand','return'=>'demand2','typeid'=>'1','rentype'=>"1",'pageSize'=>"7"), null, $_smarty_tpl, $_block_repeat);while ($_block_repeat) { ob_start();?>

        <li class="fn-clear">
          <a href="<?php echo getUrlPath(array('service'=>'house','template'=>'demand','param'=>'type=1'),$_smarty_tpl);?>
" target="_blank">
            <div class="li-left"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/top<?php echo $_smarty_tpl->tpl_vars['_bindex']->value['demand2'];?>
.png" alt=""></div>
            <div class="li-right">
              <h4><?php echo $_smarty_tpl->tpl_vars['demand2']->value['title'];?>
</h4>
              <p><i></i><?php if ($_smarty_tpl->tpl_vars['userinfo']->value) {
echo $_smarty_tpl->tpl_vars['demand2']->value['contact'];
} else { ?>登录后显示<?php }?>  <span><?php echo $_smarty_tpl->tpl_vars['demand2']->value['pubdate'];?>
</span></p>
            </div>
          </a>
        </li>
        <?php $_block_content = ob_get_clean(); $_block_repeat=false; echo loop(array('service'=>"house",'action'=>'demand','return'=>'demand2','typeid'=>'1','rentype'=>"1",'pageSize'=>"7"), $_block_content, $_smarty_tpl, $_block_repeat); } array_pop($_smarty_tpl->smarty->_tag_stack);?>

      </ul>
    </div>
  </div>

</div>
<!-- 推荐出租房 e -->
<?php }?>

<!-- 悬浮 s-->
<div class="kefu-box">
  <div class="con-box">
    <div class="k-con">
      <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/s-qq.png" alt="">
      <p>QQ咨询 </p>
    </div>
    <div class="k-con k-cover"></div>
    <div class="qq-con public-con f-box">
      <s></s>
      <div class="q-box fn-clear">
        <div class="q-left">
          <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/q-kefu.png" alt="">
        </div>
        <div class="q-right">
          <h4>在线客服</h4>
          <p class="p-time">服务时间   9:00—18:00</p>
        </div>
      </div>
      <ul class="fn-clear">
        <?php if ($_smarty_tpl->tpl_vars['cfg_kefu_pc_url']->value) {?>
        <li><a href="<?php echo $_smarty_tpl->tpl_vars['cfg_kefu_pc_url']->value;?>
" target="_blank" id="qmkf"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/k-qq.png" alt=""><span>在线客服</span></a></li>
        <?php }?>
        <?php if ($_smarty_tpl->tpl_vars['cfg_server_qq']->value) {?>
        <?php  $_smarty_tpl->tpl_vars['qq'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['qq']->_loop = false;
 $_smarty_tpl->tpl_vars['qk'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['cfg_server_qq']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['qq']->key => $_smarty_tpl->tpl_vars['qq']->value) {
$_smarty_tpl->tpl_vars['qq']->_loop = true;
 $_smarty_tpl->tpl_vars['qk']->value = $_smarty_tpl->tpl_vars['qq']->key;
?>
        <li><a href="http://wpa.qq.com/msgrd?v=3&uin=<?php echo $_smarty_tpl->tpl_vars['qq']->value;?>
&site=qq&menu=yes" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/k-qq.png" alt=""><span>QQ客服<?php echo $_smarty_tpl->tpl_vars['qk']->value+1;?>
</span></a></li>
        <?php } ?>
        <?php }?>
      </ul>
    </div>
  </div>
  <div class="con-box">
    <div class="k-con">
      <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/s-tel.png" alt="">
      <p>客服电话 </p>
    </div>
    <div class="cover f-box fn-clear">
      <div class="c-left">
        <p class="p1">欢迎来电咨询</p>
        <p class="p2"><?php echo $_smarty_tpl->tpl_vars['cfg_hotline']->value;?>
</p>
      </div>
      <div class="c-right">
        <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/s-tel1.png" alt="">
      </div>
    </div>
  </div>

  <div class="con-box">
    <div class="k-con">
      <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/s-fabu.png" alt="">
      <p>发布信息 </p>
    </div>
    <div class="k-con k-cover"></div>
    <div class="pub-con fabu-con f-box">
      <div class="f-top">发布信息</div>
      <ul class="fb-list fn-clear">
        <?php if (in_array("article",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li>
          <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'article'),$_smarty_tpl);?>
" target="_blank">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/f-icon01.png" alt=""><p>资讯投稿</p>
          </a>
        </li>
        <?php }?>
        <?php if (in_array("tieba",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li>
          <a href="<?php echo getUrlPath(array('service'=>'tieba','template'=>'fabu'),$_smarty_tpl);?>
" target="_blank">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/f-icon02.png" alt=""><p>发布贴子</p>
          </a>
        </li>
        <?php }?>
        <?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li>
          <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'info'),$_smarty_tpl);?>
" target="_blank">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/f-icon03.png" alt=""><p>发布二手</p>
          </a>
        </li>
        <?php }?>
        <?php if (in_array("house",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li class="house">
          <a href="javascript:;">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/f-icon04.png" alt=""><p>发布房源</p><s></s>
          </a>
          <div class="sub-fi" >
            <div class="pos-item">
              <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'house-sale'),$_smarty_tpl);?>
" target="_blank">二手房</a>
              <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'house-zu'),$_smarty_tpl);?>
" target="_blank">租房</a>
              <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'house-sp'),$_smarty_tpl);?>
" target="_blank">商铺</a>
              <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'house-cf'),$_smarty_tpl);?>
" target="_blank">厂房/仓库</a>
              <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu','action'=>'house-xzl'),$_smarty_tpl);?>
" target="_blank">写字楼</a>
            </div>
          </div>
        </li>
        <?php }?>
        <?php if (in_array("job",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li>
          <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'job','action'=>'resume'),$_smarty_tpl);?>
" target="_blank">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/f-icon05.png" alt=""><p>发布简历</p>
          </a>
        </li>
        <?php }?>
        <?php if (in_array("dating",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li>
          <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'dating','action'=>'profile'),$_smarty_tpl);?>
" target="_blank">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/f-icon06.png" alt=""><p>找对象</p>
          </a>
        </li>
        <?php }?>
        <?php if (in_array("huodong",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li>
          <a href="<?php echo getUrlPath(array('service'=>'huodong','template'=>'fabu'),$_smarty_tpl);?>
" target="_blank">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/f-icon07.png" alt=""><p>发布活动</p>
          </a>
        </li>
        <?php }?>
        <?php if (in_array("vote",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li>
          <a href="<?php echo getUrlPath(array('service'=>'member','type'=>'user','template'=>'fabu-vote'),$_smarty_tpl);?>
" target="_blank">
            <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/f-icon08.png" alt=""><p>发布投票</p>
          </a>
        </li>
        <?php }?>
      </ul>
    </div>
  </div>

  <div class="con-box">
    <div class="k-con">
      <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/s-ruzhu.png" alt="">
      <p>商家入驻 </p>
    </div>
    <div class="k-con k-cover"></div>
    <div class="pub-con bu-con f-box">
      <div class="f-top">商家入驻</div>
      <ul class="fb-list fn-clear">
        <li><a href="<?php echo $_smarty_tpl->tpl_vars['member_busiDomain']->value;?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon02.png" alt=""><p>商家店铺</p></a></li>
        <?php if (in_array("tuan",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon01.png" alt=""><p>团购秒杀</p></a></li>
        <?php }?>
        <?php if (in_array("huangye",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon03.png" alt=""><p>黄页114</p></a></li>
        <?php }?>
        <?php if (in_array("waimai",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon04.png" alt=""><p>美食外卖</p></a></li>
        <?php }?>
        <?php if (in_array("house",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon05.png" alt=""><p>房产中介</p></a></li>
        <?php }?>
        <?php if (in_array("website",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon06.png" alt=""><p>企业建站</p></a></li>
        <?php }?>
        <?php if (in_array("shop",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon07.png" alt=""><p>商城店铺</p></a></li>
        <?php }?>
        <?php if (in_array("renovation",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon08.png" alt=""><p>装修公司</p></a></li>
        <?php }?>
        <?php if (in_array("job",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon09.png" alt=""><p>招聘企业</p></a></li>
        <?php }?>
        <?php if (in_array("info",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
        <li><a href="<?php echo getUrlPath(array('service'=>'member','template'=>'module'),$_smarty_tpl);?>
" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/b-icon10.png" alt=""><p>二手信息</p></a></li>
        <?php }?>
      </ul>
    </div>
  </div>

  <div class="con-box">
    <div class="k-con">
      <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/s-weixin.png" alt="">
      <p>微信</p>
    </div>
    <div class="k-con k-cover"></div>
    <div class="public-con wx-con f-box">
      <s></s>
      <div class="c-box">
        <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/include/qrcode.php?data=<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
" >
        <p>扫码访问</p>
      </div>
      <div class="c-box">
        <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_weixinQr']->value;?>
" >
        <p>微信公众平台：<br /><?php echo $_smarty_tpl->tpl_vars['cfg_weixinName']->value;?>
</p>
      </div>
      <div class="c-box">
        <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_miniProgramQr']->value;?>
" >
        <p>微信小程序：<br /><?php echo $_smarty_tpl->tpl_vars['cfg_miniProgramName']->value;?>
</p>
      </div>
    </div>
  </div>

  <div class="con-box">
    <a href="<?php echo getUrlPath(array('service'=>'siteConfig','template'=>'about'),$_smarty_tpl);?>
" target="_blank">
      <div class="k-con">
        <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/s-contact.png" alt="">
        <p>联系我们 </p>
      </div>
      <div class="k-con k-cover"></div>
    </a>
  </div>

  <div class="con-box goTop">
    <div class="k-con">
      <img src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
images/s-back.png" alt="">
      <p>返回顶部 </p>
    </div>
    <div class="k-con k-cover"></div>
  </div>

</div>
<!-- 悬浮 e-->

<!--底部-->
<?php echo $_smarty_tpl->getSubTemplate ("../../siteConfig/public_foot_v3.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, null, array('module'=>'siteConfig','theme'=>'gray'), 0);?>


<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/common.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/jquery.SuperSlide.2.1.1.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/jquery.qrcode.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['templets_skin']->value;?>
js/index.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript">
$(function(){
  if($('.Background_Advertising').size() > 0){
    $('.nav-con').css({'width': '1200px'});
  }
  $('#Background_closed').click(function(){
    $('.nav-con').css({'width': '100%'});
  });
});
<?php echo '</script'; ?>
>
</body>
</html>
<?php }} ?>
