<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:06:43
         compiled from "/www/wwwroot/hawaiihub.net/templates/siteConfig/public_location.html" */ ?>
<?php /*%%SmartyHeaderCode:4573760426886165358d3f8-88170193%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '30a5d7ce8ac2e961d4783720c7473ed611377304' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/templates/siteConfig/public_location.html',
      1 => 1753598770,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '4573760426886165358d3f8-88170193',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'site_map' => 0,
    'site_map_key' => 0,
    'template' => 0,
    'amap_jscode' => 0,
    'cfg_staticVersion' => 0,
    'http_domestic' => 0,
    'pageMapType' => 0,
    'site_map_apiFile' => 0,
    'cfg_staticPath' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_688616535b0fa7_65484636',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_688616535b0fa7_65484636')) {function content_688616535b0fa7_65484636($_smarty_tpl) {?><?php if (!is_callable('smarty_modifier_replace')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/modifier.replace.php';
?><?php echo '<script'; ?>
>
  	var site_map = "<?php echo $_smarty_tpl->tpl_vars['site_map']->value;?>
", site_map_key = '<?php echo $_smarty_tpl->tpl_vars['site_map_key']->value;?>
';
	var temp = '<?php echo $_smarty_tpl->tpl_vars['template']->value;?>
'
<?php echo '</script'; ?>
>
<?php if ($_smarty_tpl->tpl_vars['site_map']->value=="amap") {?>
<?php echo $_smarty_tpl->tpl_vars['amap_jscode']->value;?>
 
<?php }?>

<?php echo '<script'; ?>
 src="https://res.wx.qq.com/open/js/jweixin-1.3.2.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>

<?php if (($_smarty_tpl->tpl_vars['site_map']->value!="google"&&$_smarty_tpl->tpl_vars['http_domestic']->value==1)||$_smarty_tpl->tpl_vars['http_domestic']->value==0||$_smarty_tpl->tpl_vars['template']->value=='mapPosi') {?>
<?php echo '<script'; ?>
 type="text/javascript" src="<?php if ($_smarty_tpl->tpl_vars['pageMapType']->value=='webgl'&&$_smarty_tpl->tpl_vars['site_map']->value=='baidu') {
echo smarty_modifier_replace($_smarty_tpl->tpl_vars['site_map_apiFile']->value,'2.0','1.0');?>
&type=webgl<?php } else {
echo $_smarty_tpl->tpl_vars['site_map_apiFile']->value;
}?>"><?php echo '</script'; ?>
>
<?php }?>

<?php if ($_smarty_tpl->tpl_vars['site_map']->value=="qq") {?>
<?php echo '<script'; ?>
 type="text/javascript" src="https://3gimg.qq.com/lightmap/components/geolocation/geolocation.min.js" charset="utf-8"><?php echo '</script'; ?>
>
<?php }?>



<?php echo '<script'; ?>
 type="text/javascript" src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/publicLocation.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
"><?php echo '</script'; ?>
>
<?php }} ?>
