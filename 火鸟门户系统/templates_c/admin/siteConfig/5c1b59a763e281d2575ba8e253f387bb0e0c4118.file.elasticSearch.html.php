<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:22:34
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/elasticSearch.html" */ ?>
<?php /*%%SmartyHeaderCode:64063273368860bfa45d2f9-53791689%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '5c1b59a763e281d2575ba8e253f387bb0e0c4118' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/elasticSearch.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '64063273368860bfa45d2f9-53791689',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cssFile' => 0,
    'adminPath' => 0,
    'open' => 0,
    'esStateChecked' => 0,
    'esStateNames' => 0,
    'esConfig' => 0,
    'build' => 0,
    'modules' => 0,
    'v' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860bfa4c32e9_22771618',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860bfa4c32e9_22771618')) {function content_68860bfa4c32e9_22771618($_smarty_tpl) {?><?php if (!is_callable('smarty_function_html_radios')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_radios.php';
?><!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>ElasticSearch配置管理</title>
    <?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

    <?php echo '<script'; ?>
>
        var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";
    <?php echo '</script'; ?>
>
    <style>
        table{
            border: 1px solid #e6e6e6;
            border-collapse: collapse;
            border-spacing: 1px;
        }
        th,td{
            border: 1px solid #e6e6e6;
            padding: 8px 16px;
            text-align: left;
        }
        th{
            background-color: #a9a9a9;
        }
        table tr td{
            word-break: break-all;
        }
    </style>
</head>
<body>

<div class="alert alert-success" style="margin:10px;">
    <button type="button" class="close" data-dismiss="alert">×</button>
    linux系统配置教程：<a href="https://help.kumanyun.com/help-68-782.html" target="_blank">https://help.kumanyun.com/help-68-782.html</a>
    <br>
    windows系统配置教程：<a href="https://help.kumanyun.com/help-68-781.html" target="_blank">https://help.kumanyun.com/help-68-781.html</a>
</div>
<div class="container-fluid">
    <form action="" method="post" name="editform" id="editform" class="editform">
        <dl class="clearfix">
            <dt><label>启用状态：</label></dt>
            <dd class="radio">
                <?php echo smarty_function_html_radios(array('id'=>"esState",'name'=>"open",'values'=>$_smarty_tpl->tpl_vars['open']->value,'checked'=>$_smarty_tpl->tpl_vars['esStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['esStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="port">服务器地址：</label></dt>
            <dd>
                <input class="input-large" type="text" name="host" id="server" data-regex=".{2,6}" maxlength="15"
                       value="<?php echo $_smarty_tpl->tpl_vars['esConfig']->value['host'];?>
" placeholder="127.0.0.1"/>
                <span class="input-tips"><s></s>请输入ES服务器地址。</span>
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="port">服务器端口：</label></dt>
            <dd>
                <input class="input-large" type="text" name="port" id="port" data-regex=".{2,6}" maxlength="10"
                       value="<?php echo $_smarty_tpl->tpl_vars['esConfig']->value['port'];?>
" placeholder="9200"/>
                <span class="input-tips"><s></s>请输入ES服务器端口。</span>
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="requirepass">用户名：</label></dt>
            <dd>
                <input class="input-large" type="text" name="username" id="uname" data-regex=".{5,30}" maxlength="30"
                       value="<?php echo $_smarty_tpl->tpl_vars['esConfig']->value['username'];?>
"/>
                <span class="input-tips"><s></s>请输入用户名。</span>
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="requirepass">用户密码：</label></dt>
            <dd>
                <input class="input-large" type="text" name="password" id="requirepass" data-regex=".{5,30}"
                       maxlength="30" value="<?php echo $_smarty_tpl->tpl_vars['esConfig']->value['password'];?>
"/>
                <span class="input-tips"><s></s>请输入用户密码。</span>
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="index_name">索引名称：</label></dt>
            <dd>
                <input class="input-large" type="text" name="index" id="index_name" data-regex=".{0,30}"
                       maxlength="30" value="<?php echo $_smarty_tpl->tpl_vars['esConfig']->value['index'];?>
" placeholder="huoniao"/>
                <span class="input-tips" style="display:inline-block;"><s></s>多个火鸟系统连接同一台服务器时请设置不同的索引名</span>
            </dd>
        </dl>
        <dl class="clearfix">
            <dt>状态：</dt>
            <dd class="singel-line">
                <a href="javascript:;" id="checkES">点击检测是否可用</a>
            </dd>
        </dl>
        <dl class="clearfix formbtn">
            <dt>&nbsp;</dt>
            <dd>
                <button class="btn btn-large btn-success" type="submit" name="button" id="btnSubmit">确认提交</button>

                <?php if ($_smarty_tpl->tpl_vars['esStateChecked']->value) {?>
                <button style="margin-left: 20px;" class="btn-link" type="button" id="asyncAllData">同步历史数据</button>
                <?php }?>
            </dd>
        </dl>
    </form>
</div>
<div class="container hide">
    <h2 class="text-center">分模块数据同步</h2>
    <br>
    <center>
        <table cellspacing="1">
            <tbody id="syncTable">
            <tr>
                <th>模块</th>
                <th>上次同步时间</th>
                <th>操作</th>
            </tr>
            <?php if ($_smarty_tpl->tpl_vars['build']->value) {?>
            <?php  $_smarty_tpl->tpl_vars['v'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['v']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['modules']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['v']->key => $_smarty_tpl->tpl_vars['v']->value) {
$_smarty_tpl->tpl_vars['v']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['v']->key;
?>
            <tr module="<?php echo $_smarty_tpl->tpl_vars['v']->value['module'];?>
" second="<?php echo $_smarty_tpl->tpl_vars['v']->value['second'];?>
">
                <td><?php echo $_smarty_tpl->tpl_vars['v']->value['description'];?>
</td>
                <td><?php echo $_smarty_tpl->tpl_vars['esConfig']->value[((string)$_smarty_tpl->tpl_vars['v']->value['time'])];?>
</td>
                <td>
                    <button class="btn btn-info">同步</button>
                </td>
            </tr>
            <?php } ?>
            <?php }?>
        </table>
    </center>
    <br>
    <br>
</div>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html><?php }} ?>
