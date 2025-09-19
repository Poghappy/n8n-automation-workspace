<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:07:08
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/article/articleType.html" */ ?>
<?php /*%%SmartyHeaderCode:18700958596886085c7c5c59-92956816%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '7eeae7d6029051f2d56ae84dd817477b03acaaee' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/article/articleType.html',
      1 => 1753596916,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '18700958596886085c7c5c59-92956816',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'auditSwitch' => 0,
    'mold' => 0,
    'typeListArr' => 0,
    'action' => 0,
    'adminPath' => 0,
    'moldListArr' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6886085c82c4d5_04775409',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6886085c82c4d5_04775409')) {function content_6886085c82c4d5_04775409($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>新闻分类</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
.list .tr .left em {font-style: normal; margin-right: 5px;}

.btns_group{display: grid; grid-template-columns: repeat(4,1fr);  border-radius: 4px; width: 460px; height: 36px; box-sizing: border-box; margin-left: 20px; margin-top: 10px; overflow: hidden;}
.btns_group .btn{display: flex; align-items: center; justify-content: center; border: solid 1px #DCDFE6; border-radius: 0 !important;}
.btns_group .btn:first-of-type{border-radius: 4px 0 0 4px !important; border-right: none !important;}
.btns_group .btn:last-of-type{border-radius: 0 4px 4px 0 !important; border-left: none !important;}
.btns_group .btn.active{background-color: #409EFF !important; color: #fff;}
</style>
<?php echo '<script'; ?>
>
  var auditSwitch = <?php echo $_smarty_tpl->tpl_vars['auditSwitch']->value;?>
;
  var mold = <?php echo $_smarty_tpl->tpl_vars['mold']->value;?>
;
<?php echo '</script'; ?>
>
</head>

<body>
<div class="btns_group">
    <a href="?mold=0" class="btn<?php if (!$_smarty_tpl->tpl_vars['mold']->value) {?> active<?php }?>">头条分类<span></span></a>
    <a href="?mold=1" class="btn<?php if ($_smarty_tpl->tpl_vars['mold']->value==1) {?> active<?php }?>">图集分类<span></span></a>
    <a href="?mold=2" class="btn<?php if ($_smarty_tpl->tpl_vars['mold']->value==2) {?> active<?php }?>">视频分类<span></span></a>
    <a href="?mold=3" class="btn<?php if ($_smarty_tpl->tpl_vars['mold']->value==3) {?> active<?php }?>">短视频分类<span></span></a>
</div>
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
  <li class="row50 left">分类名称</li>
  <li class="row15">&nbsp;</li>
  <li class="row15">排序</li>
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
  var moldListArr = <?php echo $_smarty_tpl->tpl_vars['moldListArr']->value;?>
;
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
      <dt>拼音：</dt>
      <dd><input class="input-xlarge" type="text" name="pinyin" id="pinyin" maxlength="30" value="" /></dd>
    </dl>
    <dl class="clearfix">
      <dt>首字母：</dt>
      <dd><input class="input-xlarge" type="text" name="py" id="py" maxlength="30" value="" /></dd>
    </dl>
    <dl class="clearfix hide">
      <dt>上级分类：</dt>
      <dd><select name="parentid" id="parentid" class="input-large"></select></dd>
    </dl>
    <dl class="clearfix">
      <dt>seotitle：</dt>
      <dd><input class="input-xlarge" type="text" name="seotitle" id="seotitle" value="" /></dd>
    </dl>
    <dl class="clearfix">
      <dt>keywords：</dt>
      <dd><input class="input-xlarge" type="text" name="keywords" id="keywords" value="" /></dd>
    </dl>
    <dl class="clearfix">
      <dt>description：</dt>
      <dd><textarea name="description" class="input-xlarge" id="description" auditStyle></textarea></dd>
    </dl>
    <?php if ($_smarty_tpl->tpl_vars['auditSwitch']->value) {?>
    <dl class="clearfix">
      <dt>管理员：</dt>
      <dd style="padding-bottom:280px;">
        <select class="chosen-select input-xlarge" name="admin[]" id="Config_type_id" data-placeholder="多选" multiple="multiple" style="width:544px;">
          $adminList
        </select>
      </dd>
    </dl>
    <?php }?>
  </form>
<?php echo '</script'; ?>
>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
