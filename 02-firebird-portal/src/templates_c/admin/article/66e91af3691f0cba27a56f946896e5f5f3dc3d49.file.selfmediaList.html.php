<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:07:05
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/article/selfmediaList.html" */ ?>
<?php /*%%SmartyHeaderCode:33141677468860859ee6a36-28965781%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '66e91af3691f0cba27a56f946896e5f5f3dc3d49' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/article/selfmediaList.html',
      1 => 1753593716,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '33141677468860859ee6a36-28965781',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'notice' => 0,
    'action' => 0,
    'typeListArr' => 0,
    'cityList' => 0,
    'adminPath' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860859f3aa81_88954314',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860859f3aa81_88954314')) {function content_68860859f3aa81_88954314($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>管理自媒体</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
  .fg {margin:5px 0;border-top: 1px solid #ccc;}
  #list .photo {float: left;height:50px;width:auto;max-width: 50px;border-radius:2px;margin-right: 5px;}
  .list td .item {background-position: -217px -6px;}
</style>
</head>

<body>
<div class="search">
  <label>搜索：<input class="input-xlarge" type="search" id="keyword" placeholder="请输入要搜索的关键字"></label>
  <div class="btn-group" id="typeBtn" data-id="">
    <button class="btn dropdown-toggle" data-toggle="dropdown">全部类型<span class="caret"></span></button>
  </div>
  <!-- <select class="chosen-select" id="cityList" style="width: auto;"></select> -->
  
  <div class="choseCity"><input type="hidden" id="cityid" name="cityid" placeholder="请选择城市分站" value=""></div>
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
        <li class="fg"></li>
        <li><a href="javascript:;" data-id="1">入驻待审核(<span class="totalGray_join"></span>)</a></li>
        <li><a href="javascript:;" data-id="2">入驻已审核(<span class="totalAudit_join"></span>)</a></li>
        <li><a href="javascript:;" data-id="3">入驻拒绝审核(<span class="totalRefuse_join"></span>)</a></li>
        <li class="fg"></li>
        <li><a href="javascript:;" data-id="4">资料更新待审核(<span class="totalGray_update"></span>)</a></li>
      </ul>
    </div>
    <div class="btn-group hide" id="batchAudit">
      <button class="btn dropdown-toggle" data-toggle="dropdown">批量审核<span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="入驻待审核">入驻待审核</a></li>
        <li><a href="javascript:;" data-id="入驻已审核">入驻已审核</a></li>
        <li><a href="javascript:;" data-id="入驻拒绝审核">入驻拒绝审核</a></li>
        <li><a href="javascript:;" data-id="资料更新审核通过">资料更新审核通过</a></li>
        <!-- <li><a href="javascript:;" data-id="资料更新待审核">资料更新待审核</a></li> -->
        <li><a href="javascript:;" data-id="资料更新审核拒绝">资料更新审核拒绝</a></li>
      </ul>
    </div>
    <a href="selfmediaAdd.php?action=<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
" class="btn btn-primary" id="addNew">添加自媒体</a>
    <a href="selfmediaField.php" class="btn btn-primary" id="manageField">管理自媒体领域</a>
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
  <li class="row17">类型/名称</li>
  <li class="row10">会员</li>
  <li class="row10">城市</li>
  <li class="row15">审核状态</li>
  <li class="row15">资料修改</li>
  <li class="row15">时间</li>
  <li class="row15">操作</li>
</ul>

<div class="list mt124" id="list" data-totalpage="1" data-atpage="1"><table><tbody></tbody></table><div id="loading" class="loading hide"></div></div>

<div id="pageInfo" class="pagination pagination-centered"></div>

<div class="hide">
  <span id="sKeyword"></span>
  <span id="sType"></span>
</div>

<?php echo '<script'; ?>
>
  var typeListArr = <?php echo $_smarty_tpl->tpl_vars['typeListArr']->value;?>
, cityList = <?php echo $_smarty_tpl->tpl_vars['cityList']->value;?>
, action = '<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
', adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";
<?php echo '</script'; ?>
>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
