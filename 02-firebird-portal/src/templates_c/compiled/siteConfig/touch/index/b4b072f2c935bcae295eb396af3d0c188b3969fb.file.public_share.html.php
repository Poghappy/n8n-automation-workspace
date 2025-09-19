<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:06:42
         compiled from "/www/wwwroot/hawaiihub.net/templates/siteConfig/public_share.html" */ ?>
<?php /*%%SmartyHeaderCode:176788207168861652b2d475-45741697%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b4b072f2c935bcae295eb396af3d0c188b3969fb' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/templates/siteConfig/public_share.html',
      1 => 1753598765,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '176788207168861652b2d475-45741697',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'pageGrayCss' => 0,
    'site_map' => 0,
    'amap_jscode' => 0,
    'wxjssdk_appId' => 0,
    'wxjssdk_timestamp' => 0,
    'wxjssdk_nonceStr' => 0,
    'wxjssdk_signature' => 0,
    'Share_description' => 0,
    'Share_title' => 0,
    'Share_img' => 0,
    'Share_url' => 0,
    'cfg_staticPath' => 0,
    'isByteMiniprogram' => 0,
    'needByte' => 0,
    'cfg_staticVersion' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68861652b4c512_15374558',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68861652b4c512_15374558')) {function content_68861652b4c512_15374558($_smarty_tpl) {?><?php echo $_smarty_tpl->tpl_vars['pageGrayCss']->value;?>
 
<?php if ($_smarty_tpl->tpl_vars['site_map']->value=="amap") {?>
<?php echo $_smarty_tpl->tpl_vars['amap_jscode']->value;?>
 
<?php }?>

<?php echo '<script'; ?>
 type="text/javascript">
	var wxconfig = {
		"appId": '<?php echo $_smarty_tpl->tpl_vars['wxjssdk_appId']->value;?>
',
		"timestamp": '<?php echo $_smarty_tpl->tpl_vars['wxjssdk_timestamp']->value;?>
',
		"nonceStr": '<?php echo $_smarty_tpl->tpl_vars['wxjssdk_nonceStr']->value;?>
',
		"signature": '<?php echo $_smarty_tpl->tpl_vars['wxjssdk_signature']->value;?>
',
		"description": '<?php echo $_smarty_tpl->tpl_vars['Share_description']->value;?>
',
		"title": '<?php echo $_smarty_tpl->tpl_vars['Share_title']->value;?>
',
		"imgUrl":'<?php echo $_smarty_tpl->tpl_vars['Share_img']->value;?>
',
		"link": '<?php echo $_smarty_tpl->tpl_vars['Share_url']->value;?>
',
	};
    document.head.appendChild(document.createElement('script')).src = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/publicShare.js?v=' + ~(-new Date());
	// document.write(unescape("%3Cscript src='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/publicShare.js?v="+~(-new Date())+"'type='text/javascript'%3E%3C/script%3E"));
<?php echo '</script'; ?>
>

<?php if ($_smarty_tpl->tpl_vars['isByteMiniprogram']->value&&!$_smarty_tpl->tpl_vars['needByte']->value) {?>
<?php echo '<script'; ?>
 src="https://lf3-cdn-tos.bytegoofy.com/goofy/developer/jssdk/jssdk-1.2.1.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" type="text/javascript"><?php echo '</script'; ?>
>
<?php }?><?php }} ?>
