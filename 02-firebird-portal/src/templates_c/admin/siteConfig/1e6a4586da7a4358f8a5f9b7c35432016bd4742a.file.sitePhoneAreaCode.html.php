<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:18:29
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/sitePhoneAreaCode.html" */ ?>
<?php /*%%SmartyHeaderCode:107709350568860b0570a2f2-11144272%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '1e6a4586da7a4358f8a5f9b7c35432016bd4742a' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/sitePhoneAreaCode.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '107709350568860b0570a2f2-11144272',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'alreadyCode' => 0,
    'c' => 0,
    'internationalPhoneAreaCode' => 0,
    'p' => 0,
    'namesArr' => 0,
    'k' => 0,
    'adminPath' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860b057640d7_10556378',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860b057640d7_10556378')) {function content_68860b057640d7_10556378($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>国际区号管理</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

</head>

<body>
<div class="search" style="padding: 15px 10px;">
  <button type="button" class="btn btn-primary" id="batch">开通国家/地区</button>
</div>

<ul class="thead clearfix" style="position:relative; top:0; left:0; right:0; margin:0 10px;">
  <li class="row2">&nbsp;</li>
  <li class="row20 left">国家/地区</li>
  <li class="row40 left">区号</li>
  <li class="row20">排序</li>
  <li class="row17 left">操作</li>
</ul>

<form class="list mb50" id="list">
  <ul class="root">

      <?php  $_smarty_tpl->tpl_vars['c'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['c']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['alreadyCode']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['c']->key => $_smarty_tpl->tpl_vars['c']->value) {
$_smarty_tpl->tpl_vars['c']->_loop = true;
?>
      <li class="li0" data-val="<?php echo $_smarty_tpl->tpl_vars['c']->value['px'];?>
">
          <div class="tr clearfix tr_2">
              <div class="row2"></div>
              <div class="row20 left"><?php echo $_smarty_tpl->tpl_vars['c']->value['name'];?>
</div>
              <div class="row40 left">+<?php echo $_smarty_tpl->tpl_vars['c']->value['code'];?>
</div>
              <div class="row20"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>
              <div class="row17 left"><a href="javascript:;" class="del" title="删除">删除编辑</a></div>
          </div>
      </li>
      <?php } ?>

  </ul>
</form>

<?php echo '<script'; ?>
 id="addCity" type="text/html">
  <form action="" class="quick-editForm" name="editForm">
    <dl class="clearfix">
      <dd>
        <select id="pBtn" name="pBtn" multiple style="width:235px; height: 300px;">
          <option value="">--请选择--</option>
          <?php  $_smarty_tpl->tpl_vars['p'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['p']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['internationalPhoneAreaCode']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['p']->key => $_smarty_tpl->tpl_vars['p']->value) {
$_smarty_tpl->tpl_vars['p']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['p']->key;
?>
          <?php if (!in_array($_smarty_tpl->tpl_vars['p']->value['name'],$_smarty_tpl->tpl_vars['namesArr']->value)) {?>
          <option value="<?php echo $_smarty_tpl->tpl_vars['k']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['p']->value['name'];?>
&nbsp;&nbsp;(+<?php echo $_smarty_tpl->tpl_vars['p']->value['code'];?>
)</option>
          <?php }?>
          <?php } ?>
        </select>
      </dd>
    </dl>
  </form>
<?php echo '</script'; ?>
>

<?php echo '<script'; ?>
>
  var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", internationalPhoneAreaCode = <?php echo $_smarty_tpl->tpl_vars['internationalPhoneAreaCode']->value;?>
, alreadyCode = <?php echo $_smarty_tpl->tpl_vars['alreadyCode']->value;?>
;
<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
