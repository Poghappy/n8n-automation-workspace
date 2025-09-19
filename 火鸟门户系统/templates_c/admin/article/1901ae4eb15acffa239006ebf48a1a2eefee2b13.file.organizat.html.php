<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:06:56
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/organizat.html" */ ?>
<?php /*%%SmartyHeaderCode:195670930868860850c2b448-03068382%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '1901ae4eb15acffa239006ebf48a1a2eefee2b13' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/organizat.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '195670930868860850c2b448-03068382',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'typeListArr' => 0,
    'action' => 0,
    'adminPath' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860850c76ec0_32353621',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860850c76ec0_32353621')) {function content_68860850c76ec0_32353621($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>组织框架</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
.list .tr .left em {font-style: normal; margin-right: 5px;}

</style>
</head>

<body>
<div class="search" style="position:relative;">
  <label>搜索：<input class="input-xlarge" type="search" id="keyword" placeholder="请输入要搜索的关键字"></label>
  <button type="button" class="btn btn-success" id="searchBtn">搜索</button>
  <button type="button" class="btn btn-danger" id="batch" style="margin-left: 50px;">批量删除</button>
  <div class="tool">
    <a href="javascript:;" class="add-type" style="display:inline-block;" id="addNew_">添加新分类</a>&nbsp;|&nbsp;<a href="javascript:;" id="unfold">全部展开</a>&nbsp;|&nbsp;<a href="javascript:;" id="away">全部收起</a>
  </div>
</div>

<ul class="thead clearfix" style="position:relative; top:0; left:0; right:0; margin:0 10px;">
  <li class="row3">&nbsp;</li>
  <li class="row60 left">分类名称</li>
  <li class="row20">排序</li>
  <li class="row17 left">&nbsp;&nbsp;操 作</li>
</ul>

<form class="list mb50" id="list" style="margin-top:-10px;">
  <ul class="root"></ul>
  <div class="tr clearfix">
    <div class="row3"></div>
    <div class="row80 left"><a href="javascript:;" class="add-type" style="display:inline-block;" id="addNew">添加新分类</a></div>
  </div>
</form>
<div class="fix-btn"><button type="button" class="btn btn-success" id="saveBtn">保存</button></div>

<?php echo '<script'; ?>
>
  var typeListArr = <?php echo $_smarty_tpl->tpl_vars['typeListArr']->value;?>
, action = '<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
', adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";
  var chosenJs = '/static/js/ui/chosen.jquery.min.js';
  var chosenCss = '/static/css/ui/jquery.chosen.css';
<?php echo '</script'; ?>
>

<?php echo '<script'; ?>
 id="editForm" type="text/html">
  <form action="" class="quick-editForm" name="editForm">
    <dl class="clearfix">
      <dt>分类名称：</dt>
      <dd><input class="input-xlarge" type="text" name="typename" id="typename" maxlength="30" value="" /></dd>
    </dl>
    <dl class="clearfix">
      <dt>绑定管理员：</dt>
      <dd style="padding-bottom:280px;">
        <select class="chosen-select" name="admin[]" id="Config_type_id" data-placeholder="多选" multiple="multiple" style="width:540px;">
          $adminList
        </select>
      </dd>
    </dl>
  </form>
<?php echo '</script'; ?>
>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
