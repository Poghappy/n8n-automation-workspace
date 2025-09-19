<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 14:49:44
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/store.html" */ ?>
<?php /*%%SmartyHeaderCode:17133554426885cc0870bd55-43231280%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '7a74a00cf1ca5a695d7c5101ae7b160b8b0df6dc' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/store.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '17133554426885cc0870bd55-43231280',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'redirectUrl' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6885cc08757721_11141030',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6885cc08757721_11141030')) {function content_6885cc08757721_11141030($_smarty_tpl) {?><?php if (!is_callable('smarty_modifier_date_format')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/modifier.date_format.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>商店</title>
<style media="screen">
  .redirect {font-size: 16px; padding: 200px 0; font-family: 'microsoft yahei'; font-weight: 700; text-align: center; color: #2366FD;}

  .redirect span {
    display: inline-block;
    vertical-align: middle;
    margin: -5px 15px 0 0;
    width: 20px;
    height: 20px;
    border-width: 5px;
    border-style: solid;
    border-top-color: #fff;
    border-bottom-color: #fff;
    border-left-color: #3275fa;
    border-right-color: #3275fa;
    border-radius: 50%;
    animation: rotate 2s linear infinite; /* 使用 rotate 动画让圆旋转 */
  }
    @keyframes rotate {
        0% {
            transform: rotate(0deg); /* 起始状态为 0 度 */
        }
        100% {
            transform: rotate(360deg); /* 结束状态为 360 度 */
        }
    }
    .copyright {text-align: center; color: #999; font-size: 12px; position: fixed; left: 0; right: 0; bottom: 20px;}
    .copyright a {color: #999; text-decoration: none;}

</style>
</head>
<body>
<div class="redirect"><span></span>正在进入商店，请稍候...</div>
<div class="copyright">&copy; <?php echo smarty_modifier_date_format(time(),"%Y");?>
. <a href="https://www.kumanyun.com" target="_blank">kumanyun.com</a> All Rights Reserved.</div>
<?php echo '<script'; ?>
 type="text/javascript">
if(self.location == top.location){
  location.href = "../index.php?gotopage=siteConfig/store.php";
}else{
  location.href = '<?php echo $_smarty_tpl->tpl_vars['redirectUrl']->value;?>
';
}
<?php echo '</script'; ?>
>
</body>
</html>
<?php }} ?>
