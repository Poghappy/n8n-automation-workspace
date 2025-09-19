<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 22:01:29
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCronAdd.html" */ ?>
<?php /*%%SmartyHeaderCode:16125521666886313979a9b3-41689121%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b8d98c1f63f63dc878692105c83e73a33673de05' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCronAdd.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '16125521666886313979a9b3-41689121',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'pagetitle' => 0,
    'cssFile' => 0,
    'adminPath' => 0,
    'type' => 0,
    'day' => 0,
    'hour' => 0,
    'minute' => 0,
    'now_type' => 0,
    'action' => 0,
    'id' => 0,
    'token' => 0,
    'moduleArr' => 0,
    'm' => 0,
    'module' => 0,
    'title' => 0,
    'fileName' => 0,
    'file' => 0,
    'fileList' => 0,
    'stateopt' => 0,
    'state' => 0,
    'statenames' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_688631397faa90_11718666',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_688631397faa90_11718666')) {function content_688631397faa90_11718666($_smarty_tpl) {?><?php if (!is_callable('smarty_function_html_options')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_options.php';
if (!is_callable('smarty_function_html_radios')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_radios.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title><?php echo $_smarty_tpl->tpl_vars['pagetitle']->value;?>
</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<?php echo '<script'; ?>
>
var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", type = "<?php echo $_smarty_tpl->tpl_vars['type']->value;?>
", day = "<?php echo $_smarty_tpl->tpl_vars['day']->value;?>
", hour = "<?php echo $_smarty_tpl->tpl_vars['hour']->value;?>
", minute = "<?php echo $_smarty_tpl->tpl_vars['minute']->value;?>
", now_type = "<?php echo $_smarty_tpl->tpl_vars['now_type']->value;?>
";
<?php echo '</script'; ?>
>
</head>

<body>
<form action="siteCron.php" method="post" name="editform" id="editform" class="editform">
  <input type="hidden" name="action" id="action" value="<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
" />
  <input type="hidden" name="id" id="id" value="<?php echo $_smarty_tpl->tpl_vars['id']->value;?>
" />
  <input type="hidden" name="token" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
  <dl class="clearfix">
    <dt><label for="module">所属模块：</label></dt>
    <dd>
      <span id="moduleList">
        <select name="module" id="module" class="input-medium">
          <option value="">请选择所属频道</option>
          <?php  $_smarty_tpl->tpl_vars['m'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['m']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['moduleArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['m']->key => $_smarty_tpl->tpl_vars['m']->value) {
$_smarty_tpl->tpl_vars['m']->_loop = true;
?>
          <option value="<?php echo $_smarty_tpl->tpl_vars['m']->value['name'];?>
"<?php if ($_smarty_tpl->tpl_vars['module']->value==$_smarty_tpl->tpl_vars['m']->value['name']) {?> selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['m']->value['title'];?>
</option>
          <?php } ?>
        </select>
      </span>
      <span class="input-tips"><s></s>请选择所属模块</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="title">任务名称：</label></dt>
    <dd>
      <input class="input-xlarge" type="text" name="title" id="title" data-regex=".{1,30}" maxlength="30" value="<?php echo $_smarty_tpl->tpl_vars['title']->value;?>
" />
      <span class="input-tips"><s></s>请输入任务名称，1-30个字</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label>执行时间：</label></dt>
    <dd>
      <select id="type" name="type" class="input-small">
        <option value="month">每月</option>
        <option value="week">每周</option>
        <option value="day">每日</option>
        <option value="hour">每小时</option>
        <option value="now">每隔</option>
      </select>
      <select id="day" name="day" class="input-small" style="display: none;">
        <option value="1">1日</option><option value="2">2日</option><option value="3">3日</option><option value="4">4日</option>
        <option value="5">5日</option><option value="6">6日</option><option value="7">7日</option><option value="8">8日</option>
        <option value="9">9日</option><option value="10">10日</option><option value="11">11日</option><option value="12">12日</option>
        <option value="13">13日</option><option value="14">14日</option><option value="15">15日</option><option value="16">16日</option>
        <option value="17">17日</option><option value="18">18日</option><option value="19">19日</option><option value="20">20日</option>
        <option value="21">21日</option><option value="22">22日</option><option value="23">23日</option><option value="24">24日</option>
        <option value="25">25日</option><option value="26">26日</option><option value="27">27日</option><option value="28">28日</option>
        <option value="29">29日</option><option value="30">30日</option><option value="31">31日</option>
      </select>
      <select id="week" name="week" class="input-small" style="display: none;">
        <option value="1">周一</option>
        <option value="2">周二</option>
        <option value="3">周三</option>
        <option value="4">周四</option>
        <option value="5">周五</option>
        <option value="6">周六</option>
        <option value="0">周日</option>
      </select>
      <select id="hour" name="hour" class="input-small" style="display: none;">
        <option value="0">0点</option><option value="1">1点</option><option value="2">2点</option><option value="3">3点</option>
        <option value="4">4点</option><option value="5">5点</option><option value="6">6点</option><option value="7">7点</option>
        <option value="8">8点</option><option value="9">9点</option><option value="10">10点</option><option value="11">11点</option>
        <option value="12">12点</option><option value="13">13点</option><option value="14">14点</option><option value="15">15点</option>
        <option value="16">16点</option><option value="17">17点</option><option value="18">18点</option><option value="19">19点</option>
        <option value="20">20点</option><option value="21">21点</option><option value="22">22点</option><option value="23">23点</option>
      </select>
      <select id="minute" name="minute" class="input-small" style="display: none;">
        <option value="0">00分</option>
        <option value="10">10分</option>
        <option value="20">20分</option>
        <option value="30">30分</option>
        <option value="40">40分</option>
        <option value="50">50分</option>
      </select>
      <input class="input-mini" type="number" style="display: none;" name="now_time" id="now_time" min="1" onkeyup="value=value.replace(/\D+/ig,'')" value="" />
      <select id="now_type" name="now_type" class="input-small" style="display: none;">
        <option value="minute">分钟</option>
        <option value="hour">小时</option>
        <option value="day">天</option>
      </select>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="file">执行文件：</label></dt>
    <dd>
      <span id="fileList">
        <select name="file" id="file" class="input-xlarge">
          <option value="">请选择执行文件</option>
          <?php echo smarty_function_html_options(array('values'=>$_smarty_tpl->tpl_vars['fileName']->value,'selected'=>$_smarty_tpl->tpl_vars['file']->value,'output'=>$_smarty_tpl->tpl_vars['fileList']->value),$_smarty_tpl);?>

        </select>
      </span>
      <span class="input-tips" style="display: inline-block;"><s></s>请选择任务PHP文件名称，您需要上传相应执行文件到 /include/cron/目录下</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label>显示属性：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"state",'values'=>$_smarty_tpl->tpl_vars['stateopt']->value,'checked'=>$_smarty_tpl->tpl_vars['state']->value,'output'=>$_smarty_tpl->tpl_vars['statenames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

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
