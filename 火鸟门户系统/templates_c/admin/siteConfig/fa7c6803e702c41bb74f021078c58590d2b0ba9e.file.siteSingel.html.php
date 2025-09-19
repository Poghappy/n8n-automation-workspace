<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:10:31
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteSingel.html" */ ?>
<?php /*%%SmartyHeaderCode:76352474068861737c68fe0-80166314%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'fa7c6803e702c41bb74f021078c58590d2b0ba9e' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteSingel.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '76352474068861737c68fe0-80166314',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'pagetitle' => 0,
    'cssFile' => 0,
    'action' => 0,
    'ptitle' => 0,
    'adminPath' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68861737cb0436_05877944',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68861737cb0436_05877944')) {function content_68861737cb0436_05877944($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title><?php echo $_smarty_tpl->tpl_vars['pagetitle']->value;?>
</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

</head>

<body>
<div class="search">
  <label>搜索：<input class="input-xlarge" type="search" id="keyword" placeholder="请输入要搜索的关键字"></label>
  <button type="button" class="btn btn-success" id="searchBtn">立即搜索</button>
  <?php if ($_smarty_tpl->tpl_vars['action']->value=='agree') {?>
  <button class="btn ml30" onclick="importDefaultData_()">导入默认数据</button>
  <?php }?>
</div>

<div class="filter clearfix">
  <div class="f-left">
    <div class="btn-group" id="selectBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown"><span class="check"></span><span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="1">全选</a></li>
        <li><a href="javascript:;" data-id="0">不选</a></li>
      </ul>
    </div>
    <button class="btn" data-toggle="dropdown" id="delBtn">删除</button>
    <a href="siteSingel.php?dopost=Add&action=<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
" class="btn btn-primary" id="addNew">新增<?php echo $_smarty_tpl->tpl_vars['ptitle']->value;?>
</a>
  </div>
  <div class="f-right">
    <div class="btn-group" id="pageBtn" data-id="20">
      <button class="btn dropdown-toggle" data-toggle="dropdown">每页20条<span class="caret"></span></button>
      <ul class="dropdown-menu pull-right">
        <li><a href="javascript:;" data-id="10">每页10条</a></li>
        <li><a href="javascript:;" data-id="15">每页15条</a></li>
        <li><a href="javascript:;" data-id="20">每页20条</a></li>
        <li><a href="javascript:;" data-id="30">每页30条</a></li>
        <li><a href="javascript:;" data-id="50">每页50条</a></li>
        <li><a href="javascript:;" data-id="100">每页100条</a></li>
      </ul>
    </div>
    <button class="btn disabled" data-toggle="dropdown" id="prevBtn">上一页</button>
    <button class="btn disabled" data-toggle="dropdown" id="nextBtn">下一页</button>
    <div class="btn-group" id="paginationBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown">1/1页<span class="caret"></span></button>
      <ul class="dropdown-menu" style="left:auto; right:0;">
        <li><a href="javascript:;" data-id="1">第1页</a></li>
      </ul>
    </div>
  </div>
</div>

<ul class="thead t100 clearfix">
  <li class="row3">&nbsp;</li>
  <li class="row60 left">标 题</li>
  <li class="row25">发布时间</li>
  <li class="row12">操 作</li>
</ul>

<div class="list mt124" id="list" data-totalpage="1" data-atpage="1"><table><tbody></tbody></table><div id="loading" class="loading hide"></div></div>

<div id="pageInfo" class="pagination pagination-centered"></div>

<div class="hide">
  <span id="sKeyword"></span>
</div>

<?php echo '<script'; ?>
>
  var action = "<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
", adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";
<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html><?php }} ?>
