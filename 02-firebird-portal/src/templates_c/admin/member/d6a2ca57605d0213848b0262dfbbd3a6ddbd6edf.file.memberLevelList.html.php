<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:02:11
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/member/memberLevelList.html" */ ?>
<?php /*%%SmartyHeaderCode:92187467668861543a694f2-75223189%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'd6a2ca57605d0213848b0262dfbbd3a6ddbd6edf' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/member/memberLevelList.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '92187467668861543a694f2-75223189',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'token' => 0,
    'levelList' => 0,
    'i' => 0,
    'k' => 0,
    'adminPath' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68861543ac6ff2_02399728',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68861543ac6ff2_02399728')) {function content_68861543ac6ff2_02399728($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>会员等级</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

</head>

<body>
<ul class="thead clearfix" style="margin:10px 20px 0!important;">
  <li class="row30 left">&nbsp;&nbsp;&nbsp;&nbsp;等级名称</li>
  <li class="row60 left">图 标</li>
  <li class="row10 left">操 作</li>
</ul>

<form class="list mb50" id="list">
  <input type="hidden" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
  <ul class="root">
  <?php if ($_smarty_tpl->tpl_vars['levelList']->value!='') {?>
    <?php  $_smarty_tpl->tpl_vars['i'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['i']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['levelList']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['i']->key => $_smarty_tpl->tpl_vars['i']->value) {
$_smarty_tpl->tpl_vars['i']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['i']->key;
?>
    <li class="clearfix tr">
      <div class="row30 left">&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" data-id="<?php echo $_smarty_tpl->tpl_vars['i']->value['id'];?>
" value="<?php echo $_smarty_tpl->tpl_vars['i']->value['name'];?>
" /></div>
      <div class="row60 left">
        <?php if ($_smarty_tpl->tpl_vars['i']->value['icon']) {?>
        <img src="<?php echo $_smarty_tpl->tpl_vars['i']->value['iconturl'];?>
" class="img" alt="" style="height:40px;">
        <?php }?>
        <a href="javascript:;" class="upfile">上传图标</a>
        <input type="file" name="Filedata" value="" class="imglist-hidden Filedata hide" id="Filedata_<?php echo $_smarty_tpl->tpl_vars['k']->value;?>
">
        <input type="hidden" name="icon" class="icon" value="<?php echo $_smarty_tpl->tpl_vars['i']->value['icon'];?>
">
      </div>
      <div class="row10 left"><a href="javascript:;" class="del" title="删除">编辑删除</a></div>
    </li>
    <?php } ?>
  <?php }?>
  </ul>
  <div class="tr clearfix">
    <div class="row80 left">&nbsp;&nbsp;<a href="javascript:;" class="add-type" style="display:inline-block;" id="addNew">新增会员等级</a></div>
  </div>
  <button type="button" class="btn btn-success" id="saveBtn">保存</button>
</form>

<?php echo '<script'; ?>
>
  var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";
<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
