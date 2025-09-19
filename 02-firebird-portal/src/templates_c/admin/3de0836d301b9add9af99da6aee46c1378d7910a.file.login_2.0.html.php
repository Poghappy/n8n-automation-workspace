<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 18:19:10
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/login_2.0.html" */ ?>
<?php /*%%SmartyHeaderCode:9793715406885fd1e9dd222-46399016%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '3de0836d301b9add9af99da6aee46c1378d7910a' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/login_2.0.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '9793715406885fd1e9dd222-46399016',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cfg_basehost' => 0,
    'cfg_staticVersion' => 0,
    'cfg_geetest' => 0,
    'isMobile' => 0,
    'cfg_weblogo' => 0,
    'cfg_shortname' => 0,
    'gotopage' => 0,
    'langList' => 0,
    'cfg_secureAccess' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6885fd1ea50ee5_04771276',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6885fd1ea50ee5_04771276')) {function content_6885fd1ea50ee5_04771276($_smarty_tpl) {?><?php if (!is_callable('smarty_modifier_date_format')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/modifier.date_format.php';
?><!DOCTYPE html>
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
<link href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/css/admin/bootstrap.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" rel="stylesheet" />
<link href="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/css/admin/login_2.0.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" rel="stylesheet" />
<?php echo '<script'; ?>
>
    var geetest = <?php echo $_smarty_tpl->tpl_vars['cfg_geetest']->value;?>
;
<?php echo '</script'; ?>
>
</head>

<body <?php if ($_smarty_tpl->tpl_vars['isMobile']->value) {?>class="huoniao_mobile"<?php }?>>
<header>
    <div class="wrap">
        <h1><img src="<?php if ($_smarty_tpl->tpl_vars['cfg_weblogo']->value) {
echo $_smarty_tpl->tpl_vars['cfg_weblogo']->value;
} else {
echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/logo.png<?php }?>" alt="<?php echo $_smarty_tpl->tpl_vars['cfg_shortname']->value;?>
" /></h1>
    </div>
</header>
<section class="wrap clearfix">
    <div class="left">
        <div class="title">
            <h2>欢迎进入网站管理后台</h2>
            <p>专注地方互联网信息服务</p>
        </div>
        <div class="secure-tip">
            <h5><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/login-secure-tip.png" />安全提示</h5>
            <p>1、为保证您的帐户安全，请不要在公共场合保存登录信息，退出系统时请注销登录 <br />2、尽量避免多人使用同一帐号，系统会自动锁定</p>
        </div>
    </div>
    <div class="right">

        <ul class="tabs">
            <li class="curr">账密登录</li>
            <li>手机验证码</li>
            <li class="wechat">微信登录</li>
        </ul>

        <div class="error-msg">请输入帐户名</div>

        <form method="post" id="login-form">
            <input type="hidden" name="gotopage" id="gotopage" value="<?php echo $_smarty_tpl->tpl_vars['gotopage']->value;?>
" />

            <!-- 账密登录 s -->
            <div class="item curr">
                <div class="field">
                    <span class="icon icon-userid"></span>
                    <input type="text" name="userid" id="userid" placeholder="请输入帐号" autocomplete="off" />
                </div>
                <div class="field">
                    <span class="icon icon-pwd"></span>
                    <input type="password" name="pwd" id="pwd" placeholder="请输入密码" />
                    <span id="eyes" title="显示密码"></span>
                </div>
            </div>
            <!-- 账密登录 e -->

            <!-- 手机验证码 s -->
            <div class="item">
                <div class="field">
                    <span class="icon icon-phone"></span>
                    <input type="text" name="phone" id="phone" placeholder="请输入手机号" maxlength="20" oninput="value=value.replace(/[^\d]/g,'')" />
                </div>
                <div class="field">
                    <span class="icon icon-pwd"></span>
                    <input type="text" name="code" id="code" placeholder="请输入验证码" autocomplete="off" maxlength="6" />
                    <span class="send-btn">发送验证码</span>
                    <button style="display: none;" id="button" type="button"></button>
                </div>
            </div>
            <!-- 手机验证码 e -->

            <!-- 微信登录 s -->
            <div class="item">
                <iframe id="loginIframe" src="" data-src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/api/login.php?type=wechat&notclose=1&getopenid=admin_login" frameborder="0" scrolling="no" width="100%" height="280px"></iframe>
            </div>
            <!-- 微信登录 e -->
            <button type="submit" class="btn">立即登录</button>
        </form>

        <div class="other">
            <h5><span>其他登录方式</span></h5>
            <div class="btns">
                <p class="wechat"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/api/login/wechat/img/100.png" />微信扫码登录</p>
                <p class="normal"><img src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/images/admin/2.0/login-switch.png" />账密、手机号登录</p>
            </div>
        </div>

    </div>
</section>
<footer>
    版权所有 © <?php echo smarty_modifier_date_format(time(),"%Y");?>
 <?php echo $_smarty_tpl->tpl_vars['cfg_shortname']->value;?>
. All rights reserved.
    <hidden><br /><a href="https://ihuoniao.cn" target="_blank">火鸟门户系统</a>@<a href="https://www.kumanyun.com" target="_target">苏州酷曼软件技术有限公司</a> 提供技术支持</hidden>
</footer>

<!-- 错误信息提示 -->
<div class="error-tips">
    <div class="container">
        <span class="close"></span>
        <span class="icon"></span>
        <p class="info"></p>
        <button>确定</button>
    </div>
</div>


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
/include/lang/<?php echo $_smarty_tpl->tpl_vars['langList']->value['currCode'];?>
.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/core/jquery-1.9.0.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/ui/jquery.toggle-password.min.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php if ($_smarty_tpl->tpl_vars['cfg_geetest']->value) {?>
<?php if ($_smarty_tpl->tpl_vars['cfg_geetest']->value==1) {?>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_secureAccess']->value;?>
static.geetest.com/static/tools/gt.js"><?php echo '</script'; ?>
>
<?php }?>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/captchaVerify.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php }?>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/static/js/admin/login_2.0.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
</body>
</html>
<?php }} ?>
