<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 18:22:08
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/member/platForm.html" */ ?>
<?php /*%%SmartyHeaderCode:11611774876885fdd090f927-43309946%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'd6d4e818c10fa36ef107995471e397fa53811de0' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/member/platForm.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '11611774876885fdd090f927-43309946',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'cityArr' => 0,
    'city' => 0,
    'leimuallarr' => 0,
    'k' => 0,
    'v' => 0,
    'adminPath' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6885fdd0967672_55904813',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6885fdd0967672_55904813')) {function content_6885fdd0967672_55904813($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>现金消费管理</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

</head>

<body>
<div class="search">
  <label for="keyword">搜索：</label>
  <select class="chosen-select" id="cityid" style="width: auto;">
    <option value="">选择分站城市</option>
    <?php  $_smarty_tpl->tpl_vars['city'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['city']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['cityArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['city']->key => $_smarty_tpl->tpl_vars['city']->value) {
$_smarty_tpl->tpl_vars['city']->_loop = true;
?>
    <option value="<?php echo $_smarty_tpl->tpl_vars['city']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['city']->value['name'];?>
</option>
    <?php } ?>
  </select>&nbsp;&nbsp;
  <input class="input-xlarge" type="search" id="keyword" placeholder="请输入要搜索的关键字">
  &nbsp;&nbsp;从&nbsp;&nbsp;<input class="input-small" type="text" id="stime" placeholder="开始日期">&nbsp;&nbsp;到&nbsp;&nbsp;<input class="input-small" type="text" id="etime" placeholder="结束日期">&nbsp;&nbsp;
  <button type="button" class="btn btn-success" id="searchBtn">立即搜索</button>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="" class="btn btn-primary" id="export">导出</a>&nbsp;&nbsp;&nbsp;&nbsp;
  <div class="btn-group" id="leimuBtn">
    <button class="btn dropdown-toggle" data-toggle="dropdown">全部信息<span class="caret"></span></button>
    <ul class="dropdown-menu">
      <li><a href="javascript:;" data-id="">全部信息</a></li>
      <?php  $_smarty_tpl->tpl_vars['v'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['v']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['leimuallarr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['v']->key => $_smarty_tpl->tpl_vars['v']->value) {
$_smarty_tpl->tpl_vars['v']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['v']->key;
?>
      <li><a href="javascript:;" data-id="<?php echo $_smarty_tpl->tpl_vars['k']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['v']->value;?>
</a></li>
      <?php } ?>
    </ul>
  </div>
  <div class="btn-group" id="moduleBtn">
    <button class="btn dropdown-toggle" data-toggle="dropdown">全部信息(数量:<span class="totalCount"></span>)(金额:<span class="totalMoney"></span>)</button>
    <ul class="dropdown-menu" id="typeinfolist"></ul>
  </div>
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
    <div class="btn-group" id="stateBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown">全部信息(<span class="totalCount"></span>)<span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="">全部信息(<span class="totalCount"></span>)</a></li>
        <li><a href="javascript:;" data-id="1">充值(<span class="state0"></span>)</a></li>
        <li><a href="javascript:;" data-id="2">佣金(<span class="state1"></span>)</a></li>
      </ul>
    </div>
    <span class="help-inline"><i class="icon-question-sign statisticInfo" style="margin: 3px 0 0 10px;" data-toggle="tooltip" data-placement="bottom" data-original-title="总充值和总佣金中包含手续费，平台纯收入为：总充值+总佣金-总手续费"></i> 总充值：<span id="totalAdd">0</span>&nbsp;&nbsp;&nbsp;&nbsp;总佣金：<span id="totalLess">0</span>&nbsp;&nbsp;&nbsp;&nbsp;总手续费：<span id="totalCharge">0</span></span>
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
  <li class="row10 left">分站</li>
  <li class="row10 left">类目</li>
  <li class="row10 left">会员</li>
  <li class="row25 left">信息</li>
  <li class="row15 left">金额</li>
  <li class="row17 left">时间</li>
  <li class="row10 left">分类</li>
</ul>

<div class="list mt124" id="list" data-totalpage="1" data-atpage="1"><table><tbody></tbody></table><div id="loading" class="loading hide"></div></div>

<div id="pageInfo" class="pagination pagination-centered"></div>

<div class="hide">
  <span id="sKeyword"></span>
  <span id="start"></span>
  <span id="end"></span>
</div>

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
