<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:04:38
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/business/businessList.html" */ ?>
<?php /*%%SmartyHeaderCode:655706608688615d64d5269-65767532%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'a4c03abd60f45488078024907932460036786886' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/business/businessList.html',
      1 => 1753596914,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '655706608688615d64d5269-65767532',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'businessJoinConfig' => 0,
    'index' => 0,
    'config' => 0,
    'notice' => 0,
    'typeListArr' => 0,
    'adminPath' => 0,
    'cityArr' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_688615d653eaa0_06766772',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_688615d653eaa0_06766772')) {function content_688615d653eaa0_06766772($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>管理商家信息</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
.state_expired0 {color:#ccc;}
</style>
</head>

<body>
    <div class="alert alert-success" style="margin:10px 20px 0 20px!important;"><button type="button" class="close" data-dismiss="alert">×</button>系统升级到v8.5版本后，需要对数据进行转换，否则商家之前入驻的套餐特权将无法使用，查看教程：<a href="https://help.kumanyun.com/help-261-1182.html" target="_blank">https://help.kumanyun.com/help-261-1182.html</a></div>

<div class="search">
  <label>搜索：
 <div class="choseCity"><input type="hidden" id="cityid" name="cityid" placeholder="请选择城市分站" value=""></div>
  <!-- <select class="chosen-select" id="package" style="width: auto;">
    <option value="">选择入驻套餐</option>
    <option value="-1">自选套餐</option>
    <?php  $_smarty_tpl->tpl_vars['config'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['config']->_loop = false;
 $_smarty_tpl->tpl_vars['index'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['businessJoinConfig']->value['package']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['config']->key => $_smarty_tpl->tpl_vars['config']->value) {
$_smarty_tpl->tpl_vars['config']->_loop = true;
 $_smarty_tpl->tpl_vars['index']->value = $_smarty_tpl->tpl_vars['config']->key;
?>
    <option value="<?php echo $_smarty_tpl->tpl_vars['index']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['config']->value['title'];?>
</option>
    <?php } ?>
  </select>&nbsp;&nbsp; -->
  <div class="btn-group" id="typeBtn" data-id="">
    <button class="btn dropdown-toggle" data-toggle="dropdown">全部分类<span class="caret"></span></button>
  </div>
  <select class="chosen-select" id="items" style="width: auto;">
    <option value="">选择筛选条件</option>
    <option value="top">置顶</option>
    <option value="wxpay">微信商户</option>
    <option value="alipay">支付宝商户</option>
    <option value="icbc">E商通商户</option>
    <option value="speaker">买单喇叭</option>
    <option value="promotion">有保障金</option>
  </select>
  &nbsp;&nbsp;入驻时间&nbsp;&nbsp;<input class="input-small" type="text" id="stime" placeholder="开始时间">&nbsp;&nbsp;到&nbsp;&nbsp;<input class="input-small" type="text" id="etime" placeholder="结束时间">&nbsp;&nbsp;
  <input class="input-xlarge" type="search" id="keyword" placeholder="请输入要搜索的关键字"></label>
  <button type="button" class="btn btn-success" id="searchBtn">立即搜索</button>
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
    <div class="btn-group" id="stateBtn"<?php if ($_smarty_tpl->tpl_vars['notice']->value) {?> data-id="0"<?php }?>>
      <?php if ($_smarty_tpl->tpl_vars['notice']->value) {?>
      <button class="btn dropdown-toggle" data-toggle="dropdown">待审核(<span class="totalGray"></span>)<span class="caret"></span></button>
      <?php } else { ?>
      <button class="btn dropdown-toggle" data-toggle="dropdown">全部信息(<span class="totalCount"></span>)<span class="caret"></span></button>
      <?php }?>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="">全部信息(<span class="totalCount"></span>)</a></li>
        <li><a href="javascript:;" data-id="0">待审核(<span class="totalGray"></span>)</a></li>
        <li><a href="javascript:;" data-id="1">已审核(<span class="totalAudit"></span>)</a></li>
        <li><a href="javascript:;" data-id="2">拒绝审核(<span class="totalRefuse"></span>)</a></li>
      </ul>
    </div>
    <div class="btn-group hide" id="batchAudit">
      <button class="btn dropdown-toggle" data-toggle="dropdown">批量审核<span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="待审核">待审核</a></li>
        <li><a href="javascript:;" data-id="已审核">已审核</a></li>
        <li><a href="javascript:;" data-id="拒绝审核">拒绝审核</a></li>
      </ul>
    </div>
    <a href="businessAdd.php?dopost=add" class="btn btn-primary" id="addNew">新增商家</a>
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
  <li class="row10 left">所在分站</li>
  <li class="row35 left">店铺名称</li>
  <li class="row15 left">会员/电话</li>
  <li class="row15 left">类目/入驻时间</li>
  <li class="row10">状态</li>
  <li class="row12">&nbsp;操作</li>
</ul>

<div class="list mt124" id="list" data-totalpage="1" data-atpage="1"><table><tbody></tbody></table><div id="loading" class="loading hide"></div></div>

<div id="pageInfo" class="pagination pagination-centered"></div>

<div class="hide">
  <span id="sKeyword"></span>
  <span id="sType"></span>
  <span id="sPackage"></span>
  <span id="sItems"></span>
  <span id="start"></span>
  <span id="end"></span>
</div>

<?php echo '<script'; ?>
>
  var typeListArr = <?php echo $_smarty_tpl->tpl_vars['typeListArr']->value;?>
, adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
",cityList = <?php echo json_encode($_smarty_tpl->tpl_vars['cityArr']->value);?>
;
<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
