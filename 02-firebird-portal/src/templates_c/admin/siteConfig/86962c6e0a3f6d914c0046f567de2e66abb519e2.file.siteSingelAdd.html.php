<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:10:39
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteSingelAdd.html" */ ?>
<?php /*%%SmartyHeaderCode:1879207726886173fc8a603-19315294%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '86962c6e0a3f6d914c0046f567de2e66abb519e2' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteSingelAdd.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1879207726886173fc8a603-19315294',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'pagetitle' => 0,
    'cssFile' => 0,
    'atlasSize' => 0,
    'atlasType' => 0,
    'adminPath' => 0,
    'action' => 0,
    'dopost' => 0,
    'id' => 0,
    'token' => 0,
    'title' => 0,
    'body' => 0,
    'editorFile' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6886173fcd78e6_55124251',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6886173fcd78e6_55124251')) {function content_6886173fcd78e6_55124251($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title><?php echo $_smarty_tpl->tpl_vars['pagetitle']->value;?>
</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<?php echo '<script'; ?>
>
var atlasSize = <?php echo $_smarty_tpl->tpl_vars['atlasSize']->value;?>
, atlasType = "<?php echo $_smarty_tpl->tpl_vars['atlasType']->value;?>
", atlasMax = 0,  //图集配置
	adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", action = '<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
', modelType = 'siteConfig';
<?php echo '</script'; ?>
>
</head>

<body>
<form action="" method="post" name="editform" id="editform" class="editform">
  <input type="hidden" name="dopost" id="dopost" value="<?php echo $_smarty_tpl->tpl_vars['dopost']->value;?>
" />
  <input type="hidden" name="id" id="id" value="<?php echo $_smarty_tpl->tpl_vars['id']->value;?>
" />
  <input type="hidden" name="token" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
  <dl class="clearfix">
    <dt><label for="title">信息标题：</label></dt>
    <dd>
      <input class="input-xxlarge" type="text" name="title" id="title" data-regex=".{1,60}" maxlength="60" value="<?php echo $_smarty_tpl->tpl_vars['title']->value;?>
" />
      <span class="input-tips"><s></s>请输入信息标题，60个汉字以内</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt>信息内容：</dt>
    <dd>
      <?php echo '<script'; ?>
 id="body" name="body" type="text/plain" style="width:85%;height:500px"><?php echo $_smarty_tpl->tpl_vars['body']->value;?>
<?php echo '</script'; ?>
>
    </dd>
  </dl>
  <dl class="clearfix formbtn">
    <dt>&nbsp;</dt>
    <dd><button class="btn btn-large btn-success" type="submit" name="button" id="btnSubmit">确认提交</button></dd>
  </dl>
</form>

<?php echo $_smarty_tpl->tpl_vars['editorFile']->value;?>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
