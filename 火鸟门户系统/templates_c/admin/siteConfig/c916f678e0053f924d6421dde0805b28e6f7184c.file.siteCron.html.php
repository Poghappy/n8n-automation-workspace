<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:52:43
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCron.html" */ ?>
<?php /*%%SmartyHeaderCode:7208804776886211b2a37d1-78875186%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'c916f678e0053f924d6421dde0805b28e6f7184c' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCron.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '7208804776886211b2a37d1-78875186',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'moduleArr' => 0,
    'module' => 0,
    'cfg_cronType' => 0,
    'list' => 0,
    'l' => 0,
    'adminPath' => 0,
    'token' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6886211b310236_10961664',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6886211b310236_10961664')) {function content_6886211b310236_10961664($_smarty_tpl) {?><?php if (!is_callable('smarty_modifier_date_format')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/modifier.date_format.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>计划任务管理</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
    .setting, .setting label {display: inline-block;}
    .setting {margin-left: 50px;}
    .setting label {margin: 0 10px 0 0;}
    .setting label input[type=radio] {margin-right: 0;}
	.list td a {font-size: 14px;}
</style>
</head>

<body>
<div class="alert alert-success" style="margin:10px;"><button type="button" class="close" data-dismiss="alert">×</button>配置教程：<a href="https://help.kumanyun.com/help-70-753.html" target="_blank">https://help.kumanyun.com/help-70-753.html</a></div>
<div class="filter clearfix" style="padding-top: 10px;">
  <div class="f-left">
    <div class="btn-group" id="selectBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown"><span class="check"></span><span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="1">全选</a></li>
        <li><a href="javascript:;" data-id="0">不选</a></li>
      </ul>
    </div>
    <button class="btn btn-success hide" id="openBtn" data-type="开启">开启</button>
    <button class="btn btn-danger hide" id="closeBtn" data-type="停用">停用</button>
    <button class="btn btn-inverse hide" id="delBtn">删除</button>
    <div class="btn-group" id="moduleBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown">频道<span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="">全部</a></li>
        <?php  $_smarty_tpl->tpl_vars['module'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['module']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['moduleArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['module']->key => $_smarty_tpl->tpl_vars['module']->value) {
$_smarty_tpl->tpl_vars['module']->_loop = true;
?>
        <li><a href="javascript:;" data-id="<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
"><?php echo $_smarty_tpl->tpl_vars['module']->value['title'];?>
</a></li>
        <?php } ?>
      </ul>
    </div>
    <div class="btn-group operBtn">
        <button class="btn dropdown-toggle" data-toggle="dropdown">更多操作<span class="caret"></span></button>
        <ul class="dropdown-menu">
          <li><a href="javascript:;" id="deleteRepeat" title="此操作可以将重复的计划任务自动合并为一条">一键删除重复的任务</a></li>
          <li><a href="javascript:;" id="deleteInvalid" title="此操作可以将不存在或已卸载的模块计划任务自动删除">一键删除无效的任务</a></li>
          <li><a href="javascript:;" id="deleteStop" title="此操作可以将已经停用的计划任务批量删除">一键删除停用的任务</a></li>
        </ul>
    </div>
    <button class="btn btn-primary" id="addNew">新增计划任务</button>
    <div class="setting">
        <label class="statusTips" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="程序内置方式会影响系统性能，推荐使用服务器端Shell方式，体验更好！"><i class="icon-question-sign" style="margin-top: 4px;"></i>
        执行方式：</label><label><input type="radio" name="state" value="1"<?php if ($_smarty_tpl->tpl_vars['cfg_cronType']->value) {?> checked<?php }?> /> 程序内置</label>
        <label><input type="radio" name="state" value="0"<?php if (!$_smarty_tpl->tpl_vars['cfg_cronType']->value) {?> checked<?php }?> /> 服务器端Shell (<font color="#1dc11d">推荐</font>)</label><a href="https://help.kumanyun.com/help-70-753.html" target="_blank">配置教程</a>&nbsp;&nbsp;&nbsp;&nbsp;
        <button class="btn btn-small btn-success" id="save">保存</button>
    </div>
  </div>
</div>

<ul class="thead t100 clearfix">
  <li class="row3">&nbsp;</li>
  <li class="row12 left">频道</li>
  <li class="row20 left">名称</li>
  <li class="row15 left">任务周期</li>
  <li class="row15 left">上次执行时间</li>
  <li class="row15 left">下次执行时间</li>
  <li class="row10">状态</li>
  <li class="row10">操作</li>
</ul>

<div class="list common mt124" id="list" data-totalpage="1" data-atpage="1">
  <table>
    <tbody>
      <?php  $_smarty_tpl->tpl_vars['l'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['l']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['list']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['l']->key => $_smarty_tpl->tpl_vars['l']->value) {
$_smarty_tpl->tpl_vars['l']->_loop = true;
?>
      <tr data-id="<?php echo $_smarty_tpl->tpl_vars['l']->value['id'];?>
" data-type="<?php echo $_smarty_tpl->tpl_vars['l']->value['moduleName'];?>
">
        <td class="row3"><span class="check"></span></td>
        <td class="row12 left"><?php echo $_smarty_tpl->tpl_vars['l']->value['moduleTitle'];?>
</td>
        <td class="row20 left"><?php echo $_smarty_tpl->tpl_vars['l']->value['title'];?>
<br /><small><?php echo $_smarty_tpl->tpl_vars['l']->value['file'];?>
.php</small></td>
        <td class="row15 left"><?php echo $_smarty_tpl->tpl_vars['l']->value['cycle'];?>
</td>
        <td class="row15 left"><?php echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['l']->value['ltime'],"%Y-%m-%d %H:%M:%S");?>
</td>
        <td class="row15 left"><?php echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['l']->value['ntime'],"%Y-%m-%d %H:%M:%S");?>
</td>
        <td class="row10 state"><?php echo $_smarty_tpl->tpl_vars['l']->value['state'];?>
<span class="more"><s></s></span></td>
        <td class="row10"><a href="siteCron.php?action=edit&id=<?php echo $_smarty_tpl->tpl_vars['l']->value['id'];?>
" title="编辑<?php echo $_smarty_tpl->tpl_vars['l']->value['title'];?>
计划任务" class="edit">编辑</a><a href="javascript:;" class="run" title="手动执行">执行</a><a href="javascript:;" title="删除" class="del">删除</a></td>
      </tr>
      <?php } ?>
    </tbody>
  </table>
</div>

<?php echo '<script'; ?>
>var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", token = '<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
';<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

<?php echo '<script'; ?>
 type="text/javascript">
    $(function(){
        $('.statusTips').tooltip();
    })
<?php echo '</script'; ?>
>
</body>
</html>
<?php }} ?>
