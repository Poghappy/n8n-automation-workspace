<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-28 12:58:26
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCache.html" */ ?>
<?php /*%%SmartyHeaderCode:8568059676887037274e1b6-58072064%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '96421dd0435d9bdd691767dc715d0eda7ce8e2c7' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCache.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8568059676887037274e1b6-58072064',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'adminPath' => 0,
    'token' => 0,
    'redisState' => 0,
    'redisStateChecked' => 0,
    'redisStateNames' => 0,
    'cfg_memory' => 0,
    'dbList' => 0,
    'db' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_688703727a3ff2_14875790',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_688703727a3ff2_14875790')) {function content_688703727a3ff2_14875790($_smarty_tpl) {?><?php if (!is_callable('smarty_function_html_radios')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_radios.php';
if (!is_callable('smarty_function_html_options')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_options.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>内存优化配置</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<?php echo '<script'; ?>
>
var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";
<?php echo '</script'; ?>
>
</head>

<body>
<div class="alert alert-success" style="margin:10px;"><button type="button" class="close" data-dismiss="alert">×</button>redis缓存配置教程：<a href="https://help.kumanyun.com/help-196-664.html" target="_blank">https://help.kumanyun.com/help-196-664.html</a></div>
<form action="" method="post" name="editform" id="editform" class="editform">
  <input type="hidden" name="token" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
  <dl class="clearfix"><dt><strong>redis缓存：</strong></dt><dd></dd></dl>
  <dl class="clearfix">
    <dt><label for="redisState">启用状态：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"redis[state]",'values'=>$_smarty_tpl->tpl_vars['redisState']->value,'checked'=>$_smarty_tpl->tpl_vars['redisStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['redisStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="name">redis服务器地址：</label></dt>
    <dd>
      <input class="input-large" type="text" name="redis[server]" id="server" data-regex=".{2,30}" maxlength="30" value="<?php echo $_smarty_tpl->tpl_vars['cfg_memory']->value['redis']['server'];?>
" placeholder="127.0.0.1" />
      <span class="input-tips"><s></s>请输入redis服务器地址。</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="port">redis服务器端口：</label></dt>
    <dd>
      <input class="input-large" type="text" name="redis[port]" id="port" data-regex=".{2,6}" maxlength="10" value="<?php echo $_smarty_tpl->tpl_vars['cfg_memory']->value['redis']['port'];?>
" placeholder="6379" />
      <span class="input-tips"><s></s>请输入redis服务器端口。</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="requirepass">requirepass：</label></dt>
    <dd>
      <input class="input-large" type="text" name="redis[requirepass]" id="requirepass" data-regex=".{5,30}" maxlength="30" value="<?php echo $_smarty_tpl->tpl_vars['cfg_memory']->value['redis']['requirepass'];?>
" />
      <span class="input-tips"><s></s>请输入requirepass。</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="prefix">内存变量前缀：</label></dt>
    <dd>
      <input class="input-large" type="text" name="prefix" id="prefix" data-regex="" maxlength="30" value="<?php echo $_smarty_tpl->tpl_vars['cfg_memory']->value['prefix'];?>
" placeholder="huoniao_" />
      <span class="input-tips"><s></s>请输入redis服务器内存变量前缀：</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="db">使用数据库：</label></dt>
    <dd class="radio">
      <label for="db">
        <select name="redis[db]" id="db" class="input-medium">
          <?php echo smarty_function_html_options(array('options'=>$_smarty_tpl->tpl_vars['dbList']->value,'selected'=>$_smarty_tpl->tpl_vars['db']->value),$_smarty_tpl);?>

        </select>
      </label>
      <span class="input-tips" style="display:inline-block;"><s></s>同一台服务器部署多个火鸟系统时请设置不同的变量前缀或数据库</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt>状态：</dt>
    <dd class="singel-line">
      <a href="javascript:;" id="checkRedis">点击检测是否可用</a>
    </dd>
  </dl>
  <dl class="clearfix formbtn">
    <dt>&nbsp;</dt>
    <dd><button class="btn btn-large btn-success" type="submit" name="button" id="btnSubmit">确认提交</button></dd>
  </dl>
</form>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html><?php }} ?>
