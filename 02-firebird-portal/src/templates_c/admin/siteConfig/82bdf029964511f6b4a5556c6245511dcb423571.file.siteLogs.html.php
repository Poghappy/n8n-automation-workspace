<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:22:52
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteLogs.html" */ ?>
<?php /*%%SmartyHeaderCode:139972007068860c0c557761-91197646%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '82bdf029964511f6b4a5556c6245511dcb423571' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteLogs.html',
      1 => 1753596890,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '139972007068860c0c557761-91197646',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'max_siteLog_save_day' => 0,
    'adminList' => 0,
    'adminPath' => 0,
    'token' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860c0c5a3b31_72995141',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860c0c5a3b31_72995141')) {function content_68860c0c5a3b31_72995141($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>操作日志管理</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

</head>

<body>
<div class="search">
  <label>搜索：&nbsp;&nbsp;从&nbsp;&nbsp;<input class="input-small" type="text" id="stime" placeholder="开始日期">&nbsp;&nbsp;到&nbsp;&nbsp;<input class="input-small" type="text" id="etime" placeholder="结束日期">&nbsp;&nbsp;</label>
  <select class="chosen-select" id="cadmin" style="width: auto;"></select>
  <input class="input-xlarge" type="search" id="keyword" placeholder="请输入要搜索的关键字">
  <button type="button" class="btn btn-success" id="searchBtn">立即搜索</button>
  <button type="button" class="btn pull-right" id="customConfigBtn"><i class="icon-cog" style="vertical-align: bottom;"></i> 自定义配置</button>
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
    <button class="btn" id="delBtn">删除</button>
    <button class="btn" id="delAll">清空操作日志</button>
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
    <button class="btn dropdown-toggle disabled" data-toggle="dropdown" id="prevBtn">上一页</button>
    <button class="btn dropdown-toggle disabled" data-toggle="dropdown" id="nextBtn">下一页</button>
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
  <li class="row12 left">操作人</li>
  <li class="row25 left">动作</li>
  <li class="row30 left">描述</li>
  <li class="row15">操作IP</li>
  <li class="row15">操作时间</li>
</ul>

<div class="list common mt124" id="list" data-totalpage="1" data-atpage="1"><table><tbody></tbody></table><div id="loading" class="loading hide"></div></div>

<div id="pageInfo" class="pagination pagination-centered"></div>


<?php echo '<script'; ?>
 id="editForm" type="text/html">
    <form action="" class="quick-editForm" name="editForm">
      <dl class="clearfix">
        <dt>日志保存天数：</dt>
        <dd><input class="input-mini" type="text" name="day" id="day" value="<?php echo $_smarty_tpl->tpl_vars['max_siteLog_save_day']->value;?>
" /> 天 <small style="margin-left: 20px; color: #999;">建议180天</small><br /><small style="color: red;">确认后，将自动删除超过该时间的日志记录！</small></dd>
      </dl>
    </form>
<?php echo '</script'; ?>
>


<div class="hide">
  <span id="start"></span>
  <span id="end"></span>
  <span id="keywords"></span>
</div>

<?php echo '<script'; ?>
>var adminList = <?php echo $_smarty_tpl->tpl_vars['adminList']->value;?>
, adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", token = '<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
';<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
