<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 14:48:20
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteClearCache.html" */ ?>
<?php /*%%SmartyHeaderCode:18011162276885cbb426af60-94492095%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '40cacc2c75891542ab129e90ee84ce2e68f4bd65' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteClearCache.html',
      1 => 1753596892,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '18011162276885cbb426af60-94492095',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'redis' => 0,
    'installModuleArr' => 0,
    'HUONIAOROOT' => 0,
    'moduleList' => 0,
    'module' => 0,
    'adminPath' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6885cbb42c37d9_75819668',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6885cbb42c37d9_75819668')) {function content_6885cbb42c37d9_75819668($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>清除页面缓存</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
    /* #modules label {min-width: 85px;} */
    .checkCacheFolderSize {font-size: 12px;}
</style>
</head>

<body>
<form action="?action=do" method="post" name="editform" id="editform" class="editform">
    <dl class="clearfix">
      <dt><label>重要缓存：</label></dt>
      <dd class="radio">
          <?php if ($_smarty_tpl->tpl_vars['redis']->value) {?>
          <label><input type="checkbox" name="memory" value="redis" /><span>redis缓存</span></label><small style="color: #999; font-size: 12px;">(<font color="#ff0000">非必要勿删</font><?php if (in_array("shop",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>，如果商城模块有商品处于活动中状态，清除redis缓存后，请到商品活动管理列表将已审核的商品重新操作已审核，否则将影响下单！<?php }?>)</small>
          <br />
          <?php }?>
          <label><input type="checkbox" name="staticPath" value="1" /><span>纯静态页面</span></label><a href="javascript:;" class="checkCacheFolderSize" data-type="Html">查看当前占用空间</a>&nbsp;&nbsp;<small style="color: #999; font-size: 12px;">(<font color="#ff0000">非必要勿删</font>，如果修改了模板后没有生效，可以尝试勾选此项进行清除，或者手动删除<?php echo $_smarty_tpl->tpl_vars['HUONIAOROOT']->value;?>
/templates_c/html/中的文件)</small>
          <br />
          <label><input type="checkbox" name="staticlog" value="1" /><span>系统日志</span></label><a href="javascript:;" class="checkCacheFolderSize" data-type="Log">查看当前占用空间</a>&nbsp;&nbsp;<small style="color: #999; font-size: 12px;">(<font color="#ff0000">非必要勿删</font>，该日志用于技术人员排查系统问题，存放位置：<?php echo $_smarty_tpl->tpl_vars['HUONIAOROOT']->value;?>
/log/)</small>
      </dd>
    </dl>
  <dl class="clearfix">
    <dt><label>模板缓存：</label></dt>
    <dd class="radio" id="modules">
      <!-- <label><input type="checkbox" name="module[]" value="siteConfig" checked /><span>基本配置</span></label>
      <label><input type="checkbox" name="module[]" value="member" checked /><span>会员中心</span></label>
      <?php  $_smarty_tpl->tpl_vars['module'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['module']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['moduleList']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['module']->key => $_smarty_tpl->tpl_vars['module']->value) {
$_smarty_tpl->tpl_vars['module']->_loop = true;
?>
      <label><input type="checkbox" name="module[]" value="<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
" checked /><span><?php echo $_smarty_tpl->tpl_vars['module']->value['title'];?>
</span></label>
      <?php } ?> -->
      <label><input type="checkbox" name="front" value="1" /><span>前台缓存</span></label><a href="javascript:;" class="checkCacheFolderSize" data-type="Compiled">查看当前占用空间</a>&nbsp;&nbsp;<small style="color: #999; font-size: 12px;">(<font color="#ff0000">非必要勿删</font>，如果修改了模板后没有生效，可以尝试勾选此项进行清除，或者手动删除<?php echo $_smarty_tpl->tpl_vars['HUONIAOROOT']->value;?>
/templates_c/caches/ 和 compiled/ 中的文件)</small><br />
      <label><input type="checkbox" name="type" value="1" /><span>后台缓存</span></label><a href="javascript:;" class="checkCacheFolderSize" data-type="Admin">查看当前占用空间</a><br />
      <label><input type="checkbox" name="static" value="1" checked /><span>静态资源文件<small style="color: #999;"> (主要用于css/js/图标等文件，如果修改了该类型的文件后页面没有生效，可以尝试勾选此项进行清除)</small></span></label>
    </dd>
  </dl>
  <dl class="clearfix formbtn">
    <dt>&nbsp;</dt>
    <dd><button class="btn btn-success" type="submit" name="button" id="btnSubmit">确认清除所选缓存</button><!-- &nbsp;&nbsp;&nbsp;&nbsp;<label><input id="selectAll" type="checkbox" checked /><span>反选</span></label> --></dd>
  </dl>
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
