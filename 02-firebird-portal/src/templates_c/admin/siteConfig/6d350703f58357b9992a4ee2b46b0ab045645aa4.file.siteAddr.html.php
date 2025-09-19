<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:07:16
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteAddr.html" */ ?>
<?php /*%%SmartyHeaderCode:53077215868860864bda0c8-13863060%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '6d350703f58357b9992a4ee2b46b0ab045645aa4' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteAddr.html',
      1 => 1753596886,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '53077215868860864bda0c8-13863060',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'pid' => 0,
    'pname' => 0,
    'areaName' => 0,
    'province' => 0,
    'p' => 0,
    'cid' => 0,
    'cname' => 0,
    'city' => 0,
    'c' => 0,
    'did' => 0,
    'dname' => 0,
    'district' => 0,
    'd' => 0,
    'tid' => 0,
    'tname' => 0,
    'town' => 0,
    'vid' => 0,
    'vname' => 0,
    'village' => 0,
    'cfg_basehost' => 0,
    'typeListArr' => 0,
    'adminPath' => 0,
    'token' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860864c81177_91890347',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860864c81177_91890347')) {function content_68860864c81177_91890347($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>网站地区</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
.list .tr .markditu {margin-left: 50px;}
.tooltip.bottom {white-space: normal;}
.thead li {text-indent: 0;}
</style>
</head>

<body>
<!-- <div class="search" style="position:relative;">
  <label>搜索：<input class="input-xlarge" type="search" id="keyword" placeholder="请输入要搜索的关键字"></label>
  <button type="button" class="btn btn-success" id="searchBtn">搜索</button>
  <button type="button" class="btn btn-danger" id="batch" style="margin-left: 50px;">批量删除</button>
  <div class="tool">
    <a href="javascript:;" class="add-type" style="display:inline-block;" id="addNew_">添加新区域</a>&nbsp;|&nbsp;<a href="javascript:;" id="unfold">全部展开</a>&nbsp;|&nbsp;<a href="javascript:;" id="away">全部收起</a>
  </div>
</div> -->

<div class="search" style="padding: 15px 10px;">
  <label>选择区域：</label>
  <div class="btn-group" id="pBtn" data-id="<?php echo $_smarty_tpl->tpl_vars['pid']->value;?>
">
    <button class="btn dropdown-toggle" data-toggle="dropdown"><?php echo $_smarty_tpl->tpl_vars['pname']->value;?>
<span class="caret"></span></button>
    <ul class="dropdown-menu">
      <li><a href="javascript:;" data-id="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[0];?>
--</a></li>
      <?php if ($_smarty_tpl->tpl_vars['province']->value) {?>
      <?php  $_smarty_tpl->tpl_vars['p'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['p']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['province']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['p']->key => $_smarty_tpl->tpl_vars['p']->value) {
$_smarty_tpl->tpl_vars['p']->_loop = true;
?>
      <li><a href="javascript:;" data-id="<?php echo $_smarty_tpl->tpl_vars['p']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['p']->value['typename'];?>
</a></li>
      <?php } ?>
      <?php }?>
    </ul>
  </div>
  <div class="btn-group" id="cBtn" data-id="<?php echo $_smarty_tpl->tpl_vars['cid']->value;?>
">
    <button class="btn dropdown-toggle" data-toggle="dropdown"><?php echo $_smarty_tpl->tpl_vars['cname']->value;?>
<span class="caret"></span></button>
    <ul class="dropdown-menu">
      <li><a href="javascript:;" data-id="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[1];?>
--</a></li>
      <?php if ($_smarty_tpl->tpl_vars['city']->value) {?>
      <?php  $_smarty_tpl->tpl_vars['c'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['c']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['city']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['c']->key => $_smarty_tpl->tpl_vars['c']->value) {
$_smarty_tpl->tpl_vars['c']->_loop = true;
?>
      <li><a href="javascript:;" data-id="<?php echo $_smarty_tpl->tpl_vars['c']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['c']->value['typename'];?>
</a></li>
      <?php } ?>
      <?php }?>
    </ul>
  </div>
  <div class="btn-group" id="dBtn" data-id="<?php echo $_smarty_tpl->tpl_vars['did']->value;?>
">
    <button class="btn dropdown-toggle" data-toggle="dropdown"><?php echo $_smarty_tpl->tpl_vars['dname']->value;?>
<span class="caret"></span></button>
    <ul class="dropdown-menu">
      <li><a href="javascript:;" data-id="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[2];?>
 --</a></li>
      <?php if ($_smarty_tpl->tpl_vars['district']->value) {?>
      <?php  $_smarty_tpl->tpl_vars['d'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['d']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['district']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['d']->key => $_smarty_tpl->tpl_vars['d']->value) {
$_smarty_tpl->tpl_vars['d']->_loop = true;
?>
      <li><a href="javascript:;" data-id="<?php echo $_smarty_tpl->tpl_vars['d']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['d']->value['typename'];?>
</a></li>
      <?php } ?>
      <?php }?>
    </ul>
  </div>
  <div class="btn-group" id="tBtn" data-id="<?php echo $_smarty_tpl->tpl_vars['tid']->value;?>
">
    <button class="btn dropdown-toggle" data-toggle="dropdown"><?php echo $_smarty_tpl->tpl_vars['tname']->value;?>
<span class="caret"></span></button>
    <ul class="dropdown-menu">
      <li><a href="javascript:;" data-id="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[3];?>
 --</a></li>
      <?php if ($_smarty_tpl->tpl_vars['town']->value) {?>
      <?php  $_smarty_tpl->tpl_vars['d'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['d']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['town']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['d']->key => $_smarty_tpl->tpl_vars['d']->value) {
$_smarty_tpl->tpl_vars['d']->_loop = true;
?>
      <li><a href="javascript:;" data-id="<?php echo $_smarty_tpl->tpl_vars['d']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['d']->value['typename'];?>
</a></li>
      <?php } ?>
      <?php }?>
    </ul>
  </div>
  <div class="btn-group" id="vBtn" data-id="<?php echo $_smarty_tpl->tpl_vars['vid']->value;?>
">
    <button class="btn dropdown-toggle" data-toggle="dropdown"><?php echo $_smarty_tpl->tpl_vars['vname']->value;?>
<span class="caret"></span></button>
    <ul class="dropdown-menu">
      <li><a href="javascript:;" data-id="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[4];?>
 --</a></li>
      <?php if ($_smarty_tpl->tpl_vars['village']->value) {?>
      <?php  $_smarty_tpl->tpl_vars['d'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['d']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['village']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['d']->key => $_smarty_tpl->tpl_vars['d']->value) {
$_smarty_tpl->tpl_vars['d']->_loop = true;
?>
      <li><a href="javascript:;" data-id="<?php echo $_smarty_tpl->tpl_vars['d']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['d']->value['typename'];?>
</a></li>
      <?php } ?>
      <?php }?>
    </ul>
  </div>
  <button type="button" class="btn btn-primary" id="customAreaNameBtn">自定义级别名称</button>
  <button type="button" class="btn ml30" id="import">导入默认数据</button>
  <button type="button" class="btn ml30 btn-danger" id="batch" style="float: right;">批量删除</button>
</div>

<ul class="thead clearfix" style="position:relative; top:0; left:0; right:0; margin:0 10px;">
  <li class="row2">&nbsp;</li>
  <li class="row80 left">名称<small style="margin-left: 152px;" class="lnglatTips" data-toggle="tooltip" data-placement="bottom" title="用于按字母显示/排序">拼音 <i class="icon-question-sign"></i></small></small><small style="margin-left: 80px;"><a href="https://docs.qq.com/sheet/DTXZiYUFrZEdLb2xR" target="_blank">获取城市天气ID</a></small><small class="lnglatTips" style="margin-left: 60px;" data-toggle="tooltip" data-placement="bottom" title="此数据均由系统自动采集获取而来，数据准确度请根据实际使用情况做出调整！">区域经纬度 <i class="icon-question-sign"></i></small></li>
  <li class="row11">排序</li>
  <li class="row7 left">操 作</li>
</ul>

<form class="list mb50" id="list">
  <ul class="root"></ul>
  <div class="tr clearfix">
    <div class="row2"></div>
    <div class="row90 left"><a href="javascript:;" class="add-type" style="display:inline-block;" id="addNew">添加新区域</a></div>
  </div>
</form>
<div class="fix-btn"><button type="button" class="btn btn-success" id="saveBtn">保存</button></div>

<?php echo '<script'; ?>
 id="customAreaNameObj" type="text/html">
    <form action="" class="quick-editForm clearfix" name="editForm" style="padding: 50px 0 50px 50px;">
      <dl class="clearfix" style="float: left; width:130px;">
        <dt style="float: none; text-align: left; display: block;">一级：</dt>
        <dd style="margin-left: 0; padding-left: 0;">
            <input id="area0" type="text" class="input-small" placeholder="默认：省份" value="<?php echo $_smarty_tpl->tpl_vars['areaName']->value[0];?>
" />          
        </dd>
      </dl>
      <dl class="clearfix" style="float: left; width:130px;">
        <dt style="float: none; text-align: left; display: block;">二级：</dt>
        <dd style="margin-left: 0; padding-left: 0;">
            <input id="area1" type="text" class="input-small" placeholder="默认：城市" value="<?php echo $_smarty_tpl->tpl_vars['areaName']->value[1];?>
" />          
        </dd>
      </dl>      
      <dl class="clearfix" style="float: left; width:130px;">
        <dt style="float: none; text-align: left; display: block;">三级：</dt>
        <dd style="margin-left: 0; padding-left: 0;">
            <input id="area2" type="text" class="input-small" placeholder="默认：区县" value="<?php echo $_smarty_tpl->tpl_vars['areaName']->value[2];?>
" />          
        </dd>
      </dl>        
      <dl class="clearfix" style="float: left; width:130px;">
        <dt style="float: none; text-align: left; display: block;">四级：</dt>
        <dd style="margin-left: 0; padding-left: 0;">
            <input id="area3" type="text" class="input-small" placeholder="默认：乡镇" value="<?php echo $_smarty_tpl->tpl_vars['areaName']->value[3];?>
" />          
        </dd>
      </dl>          
      <dl class="clearfix" style="float: left; width:130px;">
        <dt style="float: none; text-align: left; display: block;">五级：</dt>
        <dd style="margin-left: 0; padding-left: 0;">
            <input id="area4" type="text" class="input-small" placeholder="默认：村庄" value="<?php echo $_smarty_tpl->tpl_vars['areaName']->value[4];?>
" />          
        </dd>
      </dl>        
      <dl class="clearfix" style="float: left; width:130px;">
        <dt style="float: none; text-align: left; display: block;">六级：</dt>
        <dd style="margin-left: 0; padding-left: 0;">
            <input id="area5" type="text" class="input-small" placeholder="自定义" value="<?php echo $_smarty_tpl->tpl_vars['areaName']->value[5];?>
" />          
        </dd>
      </dl>
    </form>
<?php echo '</script'; ?>
>

<?php echo '<script'; ?>
>
  var cfg_basehost = '<?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
', typeListArr = <?php echo $_smarty_tpl->tpl_vars['typeListArr']->value;?>
, adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", token = '<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
';
  var areaName = <?php echo json_encode($_smarty_tpl->tpl_vars['areaName']->value);?>
;
<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

<?php echo '<script'; ?>
 type="text/javascript">
$(function(){
  $('.lnglatTips').tooltip();
})
<?php echo '</script'; ?>
>
</body>
</html>
<?php }} ?>
