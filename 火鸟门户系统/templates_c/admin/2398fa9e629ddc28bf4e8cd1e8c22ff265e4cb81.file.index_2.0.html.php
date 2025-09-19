<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 14:48:21
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/index_2.0.html" */ ?>
<?php /*%%SmartyHeaderCode:10087820336885cbb57bbba5-92039383%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '2398fa9e629ddc28bf4e8cd1e8c22ff265e4cb81' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/index_2.0.html',
      1 => 1753596917,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '10087820336885cbb57bbba5-92039383',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cfg_attachment' => 0,
    'adminPath' => 0,
    'cfg_cookiePre' => 0,
    'huoniaoFounder' => 0,
    'huoniaoOfficial' => 0,
    'bonusName' => 0,
    'gotopage' => 0,
    'nickname' => 0,
    'cfg_adminWaterMark' => 0,
    'permission_data_json' => 0,
    'common_module' => 0,
    'common_function' => 0,
    'collection_function' => 0,
    'siteCityCount' => 0,
    'fenxiaoState' => 0,
    'cfg_pointName' => 0,
    'cfg_basehost' => 0,
    'cfg_staticVersion' => 0,
    'cfg_adminBackgroundColorRgb' => 0,
    'isMobile' => 0,
    'cfg_adminBackgroundColor' => 0,
    'cfg_adminlogo' => 0,
    'cfg_shortname' => 0,
    'permission_data' => 0,
    'username' => 0,
    'groupname' => 0,
    'logintime' => 0,
    'loginip' => 0,
    'update_version' => 0,
    'adminIndex' => 0,
    'cfg_softenname' => 0,
    'server_dir' => 0,
    'php_uname_s' => 0,
    'php_uname_r' => 0,
    'server_software' => 0,
    'max_upload' => 0,
    'PHP_VERSION' => 0,
    'mysqlinfo' => 0,
    'server_time' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6885cbb58efc19_74416875',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6885cbb58efc19_74416875')) {function content_6885cbb58efc19_74416875($_smarty_tpl) {?><!DOCTYPE html>
<!--[if lt IE 10]>
<html class="oldie">
<![endif]-->
<!--[if gte IE 7]>
<html>
<![endif]-->
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
">
<meta name="renderer" content="webkit">
<title>网站管理平台</title>
<?php echo '<script'; ?>
>
if(top.location != location) top.location.href = location.href;  //确保页面不被iframe
var cfg_attachment = '<?php echo $_smarty_tpl->tpl_vars['cfg_attachment']->value;?>
';  //附件预览前缀
var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";  //后台目录相对路径
var cookiePre = '<?php echo $_smarty_tpl->tpl_vars['cfg_cookiePre']->value;?>
';  //cookie前缀
var huoniaoFounder = <?php echo $_smarty_tpl->tpl_vars['huoniaoFounder']->value;?>
;  //是否创始人身份
var huoniaoOfficial = <?php echo $_smarty_tpl->tpl_vars['huoniaoOfficial']->value;?>
;  //是否显示火鸟帮助信息
var bonusName = '<?php echo $_smarty_tpl->tpl_vars['bonusName']->value;?>
';  //购物卡自定义名称
var gotopage = '<?php echo $_smarty_tpl->tpl_vars['gotopage']->value;?>
';  //进入后台后打开指定页面
var adminName = '<?php echo $_smarty_tpl->tpl_vars['nickname']->value;?>
';  //当前登录人真实名称
var adminWaterMark = <?php echo $_smarty_tpl->tpl_vars['cfg_adminWaterMark']->value;?>
;  //是否显示页面水印 0显示 1不显示
var adminPage = 'index';  //当前页面

var permission_data = <?php echo $_smarty_tpl->tpl_vars['permission_data_json']->value;?>
;  //功能权限集合

var common_module = <?php echo $_smarty_tpl->tpl_vars['common_module']->value;?>
;  //管理员常用模块
var common_function = <?php echo $_smarty_tpl->tpl_vars['common_function']->value;?>
;  //管理员最近使用的菜单
var collection_function = <?php echo $_smarty_tpl->tpl_vars['collection_function']->value;?>
;  //管理员收藏的菜单

var siteCityCount = <?php echo $_smarty_tpl->tpl_vars['siteCityCount']->value;?>
;  //已开通的城市分站数量
var fenxiaoState = <?php echo $_smarty_tpl->tpl_vars['fenxiaoState']->value;?>
;  //分销功能状态 0关闭 1开启
var pointName = '<?php echo $_smarty_tpl->tpl_vars['cfg_pointName']->value;?>
';  //积分名称
<?php echo '</script'; ?>
>
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/css/admin/bootstrap.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" />
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/css/admin/common.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" />
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/css/admin/daterangepicker.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" />
<link rel="stylesheet" type="text/css" href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/css/admin/index_2.0.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" />
<style>
    .header-nav li.curr a::after {background: rgba(255, 255, 255, .8);}
    .sub-nav li a:hover, .sub-nav li.curr a, .ccf-manage .ccf-nav li.curr::after, .search-popup .search-nav ul li.curr::after {background: rgba(<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['r'];?>
,<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['g'];?>
,<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['b'];?>
, .8);}
    .sub-nav li a:hover, .sub-nav li.curr a {box-shadow: 0px 5px 15px 0px rgba(<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['r'];?>
,<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['g'];?>
,<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['b'];?>
, .25);}
    .nav-index ul li::before {content: ''; position: absolute; left: 8px; top: 15px; right: 8px; bottom: 15px; background-color: rgba(<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['r'];?>
,<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['g'];?>
,<?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColorRgb']->value['b'];?>
, .06); border-radius: 10px; z-index: -1; opacity: 0; transition: all 0.2s;}
    .nav-index ul li:hover::before {opacity: 1;}
    .inside-page .nav-index ul li::before {background-color: rgba(255, 255, 255, .5); left: 8px; top: 6px; right: 8px; bottom: 6px; border-radius: 8px;}
    .inside-page .nav-index ul li.curr::before {display: none;}
</style>
</head>

<body class="<?php if ($_smarty_tpl->tpl_vars['isMobile']->value) {?>huoniao_mobile<?php }?>">

<!-- 头部 s -->
<header style="background-color: <?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColor']->value;?>
;">
    <div class="logo">
        <img src="<?php if ($_smarty_tpl->tpl_vars['cfg_adminlogo']->value) {
echo changeFileSize(array('url'=>$_smarty_tpl->tpl_vars['cfg_adminlogo']->value,'width'=>270,'height'=>76),$_smarty_tpl);
} else {
echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/logo.png<?php }?>"  alt="<?php echo $_smarty_tpl->tpl_vars['cfg_shortname']->value;?>
" />
    </div>
    <div class="common-function">
        <button class="common-function-btn">常用</button>

        <!-- 常用功能&我的收藏 s -->
        <div class="common-collection-function">
            <div class="ccf-list">
                <div class="common-function-list">
                    <h3>最近使用</h3>
                    <ul>
                        <li>暂无菜单</li>
                    </ul>
                </div>
                <div class="collection-function-list">
                    <h3>我的收藏<em></em></h3>
                    <ul>
                        <li>暂无菜单</li>
                    </ul>
                </div>
            </div>
            <div class="ccf-manage">
                <h3>全部导航菜单<em>&times;</em></h3>
                <div class="ccf-nav">
                    <ul></ul>
                </div>
                <div class="ccf-module-nav">
                    <ul></ul>
                </div>
                <div class="ccf-wrap"></div>
            </div>
        </div>
        <!-- 常用功能&我的收藏 e -->
    </div>
    <div class="header-search">
        <div class="search-input">
            <span class="search-icon"></span>
            <input placeholder="查找功能<?php if ($_smarty_tpl->tpl_vars['huoniaoOfficial']->value) {?>/帮助教程<?php }?>" maxlength="30" height="100%" autocomplete="off" value="" />
            <span class="search-clean">&times;</span>
        </div>
        <div class="search-popup">
            <div class="search-nav">
                <ul>
                    <li class="curr">功能</li>
                    <?php if ($_smarty_tpl->tpl_vars['huoniaoOfficial']->value) {?><li>帮助/教程</li><?php }?>
                </ul>
            </div>
            <div class="search-wrap">
                <div class="search-item curr">
                    <p class="search-loading">搜索中...</p>
                </div>
                <div class="search-item">
                    <p class="search-loading">搜索中...</p>
                </div>
            </div>
        </div>
    </div>
    <ul class="header-nav">
        <li class="curr"><a id="homepage" href="index.php">首页</a></li>
        <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[3]) {?>
        <li><a class="add-page" id="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[3]['id'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[3]['data'][0]['data'][0]['name'];?>
" href="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[3]['data'][0]['data'][0]['url'];?>
">财务中心</a></li>
        <?php }?>
        <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[7]) {?>
        <li><a class="add-page" id="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[7]['id'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[7]['name'];?>
" href="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[7]['url'];?>
">插件管理</a></li>
        <?php }?>
        <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[8]) {?>
        <li><a class="add-page" id="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[8]['id'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[8]['name'];?>
" href="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[8]['url'];?>
"><?php echo $_smarty_tpl->tpl_vars['permission_data']->value[8]['name'];?>
</a></li>
        <?php }?>
    </ul>
    <ul class="header-bar">
        <li class="todo">
            <a href="javascript:;">待办事项<i>0</i></a>
            <div class="notify-popup">
                <s class="arrow"></s>
                <div class="tit"><h3>待办事项</h3><a href="javascript:;" class="sound" title="关闭声音"></a></div>
                <div class="con">
                    <div class="notice-empty">全都处理完咯，暂无其他待办事项</div>
                </div>
            </div>
        </li>
        <li class="homepage">
            <a href="../" target="_blank">网站首页</a>
        </li>
        <li class="user">
            <a href="javascript:;"><span><?php echo $_smarty_tpl->tpl_vars['username']->value;?>
</span><i></i></a>
            <div class="user-area">
                <div class="user-info">
                    <h3><label><?php echo $_smarty_tpl->tpl_vars['username']->value;?>
</label><small><?php echo $_smarty_tpl->tpl_vars['groupname']->value;?>
</small></h3>
                    <div class="user-logout" data-href="exit.php">安全退出</div>
                </div>
                <dl class="user-login-info">
                    <dt>如果账号存在异常，请尽快<a href="member/adminEdit.php" data-name="修改密码" class="add-page">修改密码</a></dt>
                    <dd>上次登录：<span><?php echo $_smarty_tpl->tpl_vars['logintime']->value;?>
</span></dd>
                    <dd>登录IP：<span><?php echo $_smarty_tpl->tpl_vars['loginip']->value;?>
</span></dd>
                    <dd><a href="member/adminLogin.php" data-name="登录记录" class="add-page user-login-log">查看登录记录</a></dd>
                </dl>
            </div>
        </li>
    </ul>
</header>
<div class="headerbg" style="background: linear-gradient(0deg, #F2F7FF 0%, <?php echo $_smarty_tpl->tpl_vars['cfg_adminBackgroundColor']->value;?>
 100%);"></div>

<!-- 头部 e -->

<!-- 侧边 s -->
<aside>
    <ul class="aside-nav">

       <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[1]) {?> 
       <li class="nav-item">
            <a class="add-page" id="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[1]['id'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[1]['data'][0]['data'][0]['name'];?>
" href="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[1]['data'][0]['data'][0]['url'];?>
">
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-user-icon.png" />
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-user-curr-icon.png" />
                <span><?php echo $_smarty_tpl->tpl_vars['permission_data']->value[1]['name'];?>
</span>
            </a>
       </li> 
       <?php }?>
       
       <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[5]) {?> 
       <li class="nav-item">
            <a class="add-page" id="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[5]['id'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[5]['data'][0]['data'][0]['name'];?>
" href="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[5]['data'][0]['data'][0]['url'];?>
">
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-business-icon.png" />
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-business-curr-icon.png" />
                <span><?php echo $_smarty_tpl->tpl_vars['permission_data']->value[5]['name'];?>
</span>
            </a>
       </li> 
       <?php }?>
        
       <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[6]) {?>
       <li class="nav-item">
            <a class="add-page" id="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[6]['id'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[6]['data'][0]['data'][0]['name'];?>
" href="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[6]['data'][0]['data'][0]['url'];?>
">
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-app-icon.png" />
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-app-curr-icon.png" />
                <span><?php echo $_smarty_tpl->tpl_vars['permission_data']->value[6]['name'];?>
</span>
            </a>
       </li> 
       <?php }?>

       <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[4]) {?>
       <li class="nav-item">
            <a class="add-page" id="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[4]['id'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[4]['data'][0]['data'][0]['name'];?>
" href="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[4]['data'][0]['data'][0]['url'];?>
">
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-wechat-icon.png" />
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-wechat-curr-icon.png" />
                <span><?php echo $_smarty_tpl->tpl_vars['permission_data']->value[4]['name'];?>
</span>
            </a>
       </li> 
       <?php }?>

       <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[0]) {?>
       <li class="nav-item">
            <a class="add-page" id="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[0]['id'];?>
" data-name="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[0]['data'][0]['data'][0]['name'];?>
" href="<?php echo $_smarty_tpl->tpl_vars['permission_data']->value[0]['data'][0]['data'][0]['url'];?>
">
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-system-icon.png" />
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-system-curr-icon.png" />
                <span><?php echo $_smarty_tpl->tpl_vars['permission_data']->value[0]['name'];?>
</span>
            </a>
       </li> 
       <?php }?>

       <?php if ($_smarty_tpl->tpl_vars['permission_data']->value[2]) {?>
       <li id="module" class="nav-item">
            <a href="javascript:;">
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-module-icon.png" />
                <img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/aside-module-curr-icon.png" />
                <span>模块</span>
            </a>
       </li> 
       <?php }?>

    </ul>
    <div class="aside-version">
        <span class="current-version" title="<?php if ($_smarty_tpl->tpl_vars['huoniaoFounder']->value) {?>点击检查新版本<?php }?>">版本：<?php echo $_smarty_tpl->tpl_vars['update_version']->value;?>
</span>
    </div>
</aside>

<!-- 模块浮动层 s -->
<div class="module-popup">
    <div class="common-module">
        <div class="module-title">
            <div class="default-title">
                <h3>所有模块</h3>
                <span class="setting-btn">设置</span>
            </div>
            <div class="setting-title">
                <h3>设置常用模块</h3>
                <span class="cancel-btn">取消</span>
                <span class="save-btn">保存</span>
            </div>
        </div>
        <div class="empty-module">
            <span class="empty-plus"></span>
            <p>可设置常用模块，固定在侧边导航快捷管理</p>
        </div>
        <div class="module-list">
            <ul></ul>
        </div>
    </div>
    <div class="default-module">
        <div class="module-list">
            <ul></ul>
        </div>
    </div>
</div>
<!-- 模块浮动层 e -->

<!-- 新版本提示 s -->
<div class="new-version">
    <a class="add-page" data-id="store" data-name="商店" href="siteConfig/store.php">
        <h2>新版本<strong>v1.0</strong></h2>
        <p>发现新版本，点击升级</p>
    </a>
    <span class="close-update">×</span>
</div>
<!-- 新版本提示 e -->

<!-- 二级菜单 -->
<div class="sub-nav">
    <div class="sub-nav-main"></div>
</div>
<!-- 侧边 e -->

<!-- 内容 s -->
<section>

    <!-- 已打开的页面导航 s -->
    <nav class="nav-index">
        <a href="javascript:;" class="nav-back" title="回到上次打开的页面">返回</a>
        <div class="nav-list">
            <ul id="navul"></ul>
        </div>
        <a href="javascript:;" class="nav-tools"></a>
    </nav>

    <ul id="menuNav" class="dropdown-menu"></ul>
    <!-- 已打开的页面导航 e -->

    <!-- 首页数据 s -->
    <div class="container">

        <?php if ($_smarty_tpl->tpl_vars['adminIndex']->value) {?>
        <!-- 收益、会员、商家、分销商 统计 s -->
        <div class="basic-statistics">
            <div class="basic-statistics-item">
                <dl>
                    <dt>收益总计<small>(元)</small></dt>
                    <dd><a class="add-page" data-name="平台收入" data-id="finance" href="member/platForm.php" id="totalIncome">0</a></dd>
                </dl>
                <p class="statistics-info">
                    <span><a class="add-page" data-name="平台收入" data-id="finance" href="member/platForm.php">今日收益 <strong id="todayIncome">0</strong></a></span>
                    <em>|</em>
                    <span><a class="add-page" data-name="平台收入" data-id="finance" href="member/platForm.php">昨日 <strong id="yesterdayIncome">0</strong></a></span>
                </p>
            </div>
            <div class="basic-statistics-item">
                <dl>
                    <dt>会员总计<small>(人)</small></dt>
                    <dd><a class="add-page" data-name="用户列表" href="member/memberList.php" id="totalMember">0</a></dd>
                </dl>
                <p class="statistics-info">
                    <span><a class="add-page" data-name="用户列表" href="member/memberList.php">今日新增 <strong id="todayMember">0</strong></a></span>
                    <em>|</em>
                    <span><a class="add-page" data-name="用户列表" href="member/memberList.php">当前在线 <strong id="onlineMember">0</strong></a></span>
                </p>
            </div>
            <div class="basic-statistics-item">
                <dl>
                    <dt>商家总计<small>(家)</small><span class="else"><a class="add-page" data-name="保障金记录" href="member/bondLog.php">保障金 <strong id="promotion">0</strong></a></span></dt>
                    <dd><a class="add-page" data-name="商家列表" href="business/businessList.php" id="totalBusiness">0</a></dd>
                </dl>
                <p class="statistics-info">
                    <a class="add-page" data-name="商家列表" href="business/businessList.php">
                        <span>今日新增 <strong id="todayBusiness">0</strong></span>
                        <em>|</em>
                        <span>昨日 <strong id="yesterdayBusiness">0</strong></span>
                    </a>
                </p>
            </div>
            <div class="basic-statistics-item">
                <dl>
                    <dt>分销商总计<small>(个)</small></dt>
                    <dd><a class="add-page" data-name="分销商" href="member/fenxiaoUser.php" id="totalFenxiao">0</a></dd>
                </dl>
                <p class="statistics-info">
                    <a class="add-page" data-name="分销商" href="member/fenxiaoUser.php">
                        <span>今日新增 <strong id="todayFenxiao">0</strong></span>
                        <em>|</em>
                        <span>昨日 <strong id="yesterdayFenxiao">0</strong></span>
                    </a>
                </p>
            </div>
        </div>
        <!-- 收益、会员、商家、分销商 统计 e -->

        <div class="data-statistics">
            <div class="left-side">
                <div class="left-side-container">
                    <div class="platform-statistics data-wrap">
                        <div class="platform-left">
                            <div class="data-title">
                                <h3>平台收益<div class="tips">
                                        <s class="tips-icon"></s>
                                        <div class="tips-popup">
                                            <s class="tips-arrow"></s>
                                            <p><font color="#3275FA">平台收益：</font>此项金额为所有已结算收益之和，不包含用户充值、商家保障金、未结算订单等不确定收入，该数据已经扣除支付平台手续费。</p>
                                        </div>
                                    </div>
                                </h3>
                                <div class="summary">
                                    <span class="platform-total">
                                        <small><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</small><strong id="platformIncome">0.00</strong>
                                    </span>
                                    (佣金)
                                </div>
                                <div class="time-box">
                                    <div id="platform-time-chose" class="time-chose">
                                        <span class="week curr">周</span>
                                        <span class="month">月</span>
                                        <span class="self-define" id="reportrange2"><em class="time-in">时间</em><i class="self-chose"></i></span>
                                    </div>
                                </div>
                            </div>
                            <div class="data-show">
                                <div id="platform-chart" class="platform-chart"></div>
                            </div>
                        </div>
                        <div class="platform-right">
                            <div class="data-title">
                                <h3>今日统计</h3>
                                <div class="time-box">
                                    <div id="today-type-chose" class="time-chose">
                                        <span class="curr">入账</span>
                                        <span class="month">出账</span>
                                    </div>
                                    <div id="today-time-chose" class="time-chose">
                                        <span data-type="today" class="curr">今日</span>
                                        <span data-type="month">本月</span>
                                        <span data-type="year">今年</span>
                                    </div>
                                </div>
                            </div>
                            <div class="data-show">

                                <!-- 入账 s -->
                                <div class="entry-obj-0">
                                    <div class="entry-data">
                                        <dl class="entry-amount">
                                            <dt>今日入账金额</dt>
                                            <dd><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
<strong id="platformEntry">0</strong></dd>
                                        </dl>
                                        <dl class="entry-scale">
                                            <dt>
                                                <span><em></em></span>
                                                <span><em></em></span>
                                                <span><em></em></span>
                                            </dt>
                                            <dd>
                                                <span style="width: 33.33%;"></span>
                                                <span style="width: 33.33%;"></span>
                                                <span style="width: 33.33%;"></span>
                                            </dd>
                                        </dl>
                                    </div>
                                    <div class="entry-cell">
                                        <a href="member/moneyLogs.php?type=chongzhi" data-id="finance" data-name="用户余额明细" class="entry-cell-item add-page">
                                            <dl>
                                                <dt>今日用户充值</dt>
                                                <dd>
                                                    <strong><small><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</small><span id="platformRecharge">0</span></strong>
                                                    <p>查看记录</p>
                                                </dd>
                                            </dl>
                                        </a>
                                        <a href="member/platForm.php" data-id="finance" data-name="平台收入" class="entry-cell-item add-page">
                                            <dl>
                                                <dt>今日平台佣金</dt>
                                                <dd>
                                                    <strong><small><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</small><span id="platformCommission">0</span></strong>
                                                    <p>查看记录</p>
                                                </dd>
                                            </dl>
                                        </a>
                                        <a href="member/platForm.php" data-id="finance" data-name="平台收入" class="entry-cell-item add-page">
                                            <dl>
                                                <dt>加盟入驻/套餐</dt>
                                                <dd>
                                                    <strong><small><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</small><span id="platformJoinCommission">0</span></strong>
                                                    <p>查看记录</p>
                                                </dd>
                                            </dl>
                                        </a>
                                    </div>
                                </div>
                                <!-- 入账 e -->

                                <!-- 出账 s -->
                                <div class="entry-obj-1 hide">
                                    <div class="entry-data">
                                        <dl class="entry-amount">
                                            <dt>今日出账金额</dt>
                                            <dd><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
<strong id="platformOutgoing">0</strong></dd>
                                        </dl>
                                        <dl class="entry-scale">
                                            <dt>
                                                <span><em></em>入账金额<?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
<strong id="platformEntry1">0</strong></span>
                                                <span><em></em>出账占比<strong id="platformOutgoingProportion">0.0%</strong></span>
                                            </dt>
                                            <dd>
                                                <span style="width: 50%;"></span>
                                                <span style="width: 50%;"></span>
                                            </dd>
                                        </dl>
                                    </div>
                                    <div class="entry-cell">
                                        <a href="member/withdraw.php" data-id="finance" data-name="提现管理" class="entry-cell-item add-page">
                                            <dl>
                                                <dt>今日用户提现</dt>
                                                <dd>
                                                    <strong><small><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</small><span id="platformWithdraw">0</span></strong>
                                                    <p>查看记录</p>
                                                </dd>
                                            </dl>
                                        </a>
                                        <?php if ($_smarty_tpl->tpl_vars['siteCityCount']->value>1) {?>
                                        <a href="member/commissionCount.php?gettype=substation" data-id="finance" data-name="分站收入" class="entry-cell-item add-page">
                                            <dl>
                                                <dt>城市分站分佣</dt>
                                                <dd>
                                                    <strong><small><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</small><span id="platformSubstation">0</span></strong>
                                                    <p>查看记录</p>
                                                </dd>
                                            </dl>
                                        </a>
                                        <?php }?>
                                        <?php if ($_smarty_tpl->tpl_vars['fenxiaoState']->value==1) {?>
                                        <a href="member/fenxiaoList.php" data-id="finance" data-name="分销商收入" class="entry-cell-item add-page">
                                            <dl>
                                                <dt>分销商分佣</dt>
                                                <dd>
                                                    <strong><small><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</small><span id="platformFenxiao">0</span></strong>
                                                    <p>查看记录</p>
                                                </dd>
                                            </dl>
                                        </a>
                                        <?php }?>
                                    </div>
                                </div>
                                <!-- 出账 e -->

                            </div>
                        </div>
                    </div>

                    <div class="receipt-statistics">
                        <!-- 收支数据分析 s -->
                        <div class="receipt-left data-wrap">
                            <div class="data-title">
                                <h4>收支数据分析</h4>
                                <div class="summary">
                                    <span><em></em>入账</span>
                                    <span><em></em>提现</span>
                                    <?php if ($_smarty_tpl->tpl_vars['siteCityCount']->value>1) {?>
                                    <span><em></em>城市分佣</span>
                                    <?php }?>
                                    <?php if ($_smarty_tpl->tpl_vars['fenxiaoState']->value==1) {?>
                                    <span><em></em>分销</span>
                                    <?php }?>
                                </div>
                                <div class="time-box">
                                    <div id="receipt-time-chose" class="time-chose">
                                        <span data-type="week" class="curr">近1周</span>
                                        <span data-type="month" class="month">近6月</span>
                                    </div>
                                </div>
                            </div>
                            <div class="data-show">
                                <div id="receipt-chart" class="receipt-chart"></div>
                            </div>

                        </div>
                        <!-- 收支数据分析 e -->

                        <!-- 用户充值与提现 s -->
                        <div class="receipt-right data-wrap">
                            <div class="data-title">
                                <h4>用户充值与提现</h4>
                                <div class="summary">
                                    <span><em></em>充值</span>
                                    <span><em></em>提现</span>
                                </div>
                                <div class="time-box">
                                    <div id="withdraw-time-chose" class="time-chose">
                                        <span data-type="week" class="curr">近1周</span>
                                        <span data-type="month">近6月</span>
                                    </div>
                                </div>
                            </div>
                            <div class="data-show">
                                <div id="withdraw-chart" class="receipt-chart"></div>
                            </div>
                        </div>
                        <!-- 用户充值与提现 e -->
                    </div>

                    <!-- 系统信息 s -->
                    <div class="system-info data-wrap">
                        <div class="system-info-title">
                            <div class="system-info-title-left"><span>系统基本参数</span></div>
                            <?php if ($_smarty_tpl->tpl_vars['huoniaoOfficial']->value) {?><div class="system-info-title-right"><span>官方链接指引</span></div><?php }?>
                        </div>
                        <div class="system-info-container clearfix">
                            <?php if ($_smarty_tpl->tpl_vars['huoniaoOfficial']->value) {?>
                            <div class="system-info-container-right">
                                <a href="https://www.kumanyun.com/" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/official-website-icon.png" />火鸟官网</a>
                                <a href="http://bbs.kumanyun.com/" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/official-link-icon.png" />官方论坛</a>
                                <a href="https://help.kumanyun.com/" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/official-link-icon.png" />帮助中心</a>
                                <a href="https://bbs.kumanyun.com/log.html" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/official-link-icon.png" />升级日志</a>
                                <a href="https://www.kumanyun.com/contact.html" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/official-contact-icon.png" />联系我们</a>
                                <a href="https://www.kumanyun.com/my/ticketList.html" target="_blank"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/official-ticket-icon.png" />提交工单</a>
                            </div>
                            <?php }?>
                            <div class="system-info-container-left">
                                <?php if ($_smarty_tpl->tpl_vars['huoniaoOfficial']->value) {?><dl><dt>火鸟系统程序版本</dt><dd class="copy-btn" data-clipboard-text="<?php echo $_smarty_tpl->tpl_vars['cfg_softenname']->value;?>
 <?php echo $_smarty_tpl->tpl_vars['update_version']->value;?>
 Release <?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" title="点击复制"><?php echo $_smarty_tpl->tpl_vars['cfg_softenname']->value;?>
 <?php echo $_smarty_tpl->tpl_vars['update_version']->value;?>
 Release <?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
</dd></dl><?php }?>
                                <dl><dt>网站所在目录</dt><dd class="copy-btn" data-clipboard-text="<?php echo $_smarty_tpl->tpl_vars['server_dir']->value;?>
" title="点击复制"><?php echo $_smarty_tpl->tpl_vars['server_dir']->value;?>
</dd></dl>
                                <dl><dt>操作系统软件信息</dt><dd class="copy-btn" data-clipboard-text="<?php echo $_smarty_tpl->tpl_vars['php_uname_s']->value;?>
 <?php echo $_smarty_tpl->tpl_vars['php_uname_r']->value;?>
/<?php echo $_smarty_tpl->tpl_vars['server_software']->value;?>
" title="点击复制"><?php echo $_smarty_tpl->tpl_vars['php_uname_s']->value;?>
 <?php echo $_smarty_tpl->tpl_vars['php_uname_r']->value;?>
/<?php echo $_smarty_tpl->tpl_vars['server_software']->value;?>
</dd></dl>
                                <dl><dt>最大附件上传大小</dt><dd><?php echo $_smarty_tpl->tpl_vars['max_upload']->value;?>
</dd></dl>
                                <dl><dt>PHP解析引擎版本</dt><dd><?php echo $_smarty_tpl->tpl_vars['PHP_VERSION']->value;?>
</dd></dl>
                                <dl><dt>当前数据库大小</dt><dd><a href="javascript:;" id="getMysqlSize">点击获取</a></dd></dl>
                                <dl><dt>MySql数据库版本</dt><dd><?php echo $_smarty_tpl->tpl_vars['mysqlinfo']->value;?>
</dd></dl>
                                <dl><dt>服务器当前时间</dt><dd><span id="serverTime1" data-val="<?php echo $_smarty_tpl->tpl_vars['server_time']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['server_time']->value;?>
</span></dd></dl>
                            </div>
                        </div>
                    </div>
                    <!-- 系统信息 e -->
                    
                </div>
            </div>
            <div class="right-side data-wrap">
                <div class="data-title">
                    <h3>待办事项<small></small></h3>
                    <div class="notice-tools">
                        <span class="notice-voice" title="关闭提示音"></span>
                        <span class="notice-filter" title="筛选"></span>
                    </div>
                </div>

                <div class="notice-filter-pop">
                    <dl>
                        <dt>隐藏：</dt>
                        <dd>
                            <label class="curr" id="hideZero"><em><?php echo '<?xml';?> version="1.0" encoding="UTF-8"<?php echo '?>';?>
<svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 24L20 34L40 14" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></em>无需处理项<small>(数量为0的)</small></label>
                        </dd>
                    </dl>
                    <dl>
                        <dt>排序：</dt>
                        <dd>
                            <label class="notice-filter-sortby" data-type="type"><em><?php echo '<?xml';?> version="1.0" encoding="UTF-8"<?php echo '?>';?>
<svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 24L20 34L40 14" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></em>按类型</label>
                        </dd>
                    </dl>
                    <dl>
                        <dt>&nbsp;</dt>
                        <dd>
                            <label class="notice-filter-sortby curr" data-type="module"><em><?php echo '<?xml';?> version="1.0" encoding="UTF-8"<?php echo '?>';?>
<svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 24L20 34L40 14" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></em>按模块</label>
                        </dd>
                    </dl>
                </div>

                <div class="notice-wrap">
                    <div class="notice-empty">全都处理完咯，暂无其他待办事项</div>
                </div>
            </div>
        </div>
        <?php } else { ?>
        <div class="no-permission">欢迎进入管理系统，请点击菜单进行操作！</div>
        <?php }?>

    </div>
    <!-- 首页数据 e -->

    
    <!-- iframe s -->
    <div id="iframe">
        
    </div>
    <!-- iframe e -->

</section>
<!-- 内容 e -->


<!-- 平台收益浮动层 s -->
<div class="platform-income-popup">
    <div class="platform-income-popup-wrap">
        <div class="platform-title">
            <h3>平台收益</h3>
            <div class="platform-date">
                <div class="time-chose"><span class="month curr">月</span><span class="year">年</span><span class="self-define" id="reportrange3"><em class="time-in">时间</em><i class="self-chose"></i></span></div>
            </div>
            <span class="platform-close">&times;</span>
        </div>
        <div class="platform-con">
            <div class="platform-con-statistics">
                <span>平台收益(<?php echo echoCurrency(array('type'=>'name'),$_smarty_tpl);?>
)</span>
                <h5><small><?php echo echoCurrency(array('type'=>'symbol'),$_smarty_tpl);?>
</small><strong>0.00</strong><em>(注：用户充值、商家保障金与未结算订单未统计在内)</em></h5>
            </div>
            <div class="platform-charts" id="platform-charts"></div>
            <p class="platform-note"></p>
            <div class="platform-btns">
                <a href="javascript:;" class="platform-btn-download">下载</a>
            </div>
        </div>
    </div>
</div>
<!-- 平台收益浮动层 e -->





<!--[if lt IE 10]>
<div class="update-layer"></div>
<div class="update-frame">
  <h2>非常抱歉，系统暂停对IE9及以下版本浏览器的支持！</h2>
  <h3>我们强烈建议您安装新版本浏览器，点击图标即可下载。</h3>
  <p><img src="/static/images/admin/save.gif" />下列软件均通过安全检测，您可放心安装</p>
  <ul>
    <li><a href="https://www.google.cn/intl/zh-CN/chrome/" target="_blank"><img src="/static/images/admin/browser/chrome.gif" />Chrome</a></li>
    <li><a href="http://www.firefox.com.cn/" target="_blank"><img src="/static/images/admin/browser/firefox.gif" />火狐</a></li>
    <li><a href="https://www.microsoft.com/zh-cn/edge/home" target="_blank"><img src="/static/images/admin/browser/edge.png" />Edge</a></li>
    <li><a href="https://browser.360.cn/se/" target="_blank"><img src="/static/images/admin/browser/360.gif" />360浏览器</a></li>
    <li><a href="https://ie.sogou.com/" target="_blank"><img src="/static/images/admin/browser/sogou.gif" />搜狗浏览器</a></li>
    <li><a href="https://browser.qq.com/" target="_blank"><img src="/static/images/admin/browser/qq.gif" />QQ浏览器</a></li>
  </ul>
  <p class="tip">双核浏览器请切换至 <strong>极速模式</strong>。  <a href="http://jingyan.baidu.com/article/22a299b539f4b19e18376a5b.html" target="_blank">如何开启</a>？</p>
</div>
<!--<![endif]-->

<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/core/jquery-1.8.3.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/ui/bootstrap.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/ui/echarts/echarts.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/ui/jquery.dragsort-0.5.1.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/ui/jquery.dialog-4.2.0.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/ui/jquery.colorPicker.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/ui/jquery-rightMenu.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/ui/clipboard.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/admin/common.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/publicAddr.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/admin/moment.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/admin/daterangepicker.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/admin/index_2.0.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
</body>
</html>
<?php }} ?>
