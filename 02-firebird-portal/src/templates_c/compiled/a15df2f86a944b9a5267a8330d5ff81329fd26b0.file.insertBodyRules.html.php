<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 18:52:48
         compiled from "/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/insertBodyRules.html" */ ?>
<?php /*%%SmartyHeaderCode:206809457568860500216482-59948648%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'a15df2f86a944b9a5267a8330d5ff81329fd26b0' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/insertBodyRules.html',
      1 => 1753611756,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '206809457568860500216482-59948648',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticPath' => 0,
    'errmsg' => 0,
    'nodeId' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860500262452_09610601',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860500262452_09610601')) {function content_68860500262452_09610601($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
    <title>节点内容配置</title>
    <link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/bootstrap.css?v=1531357464">
</head>
<style>
    .caozuo div{
        float: left;
        margin-left: 20px;
    }
    .form{
        margin-left: 20px;
    }
    .err{
        color: #f62c3c;
        margin-left: 20px;
    }
</style>
<?php echo '<script'; ?>
>var staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';<?php echo '</script'; ?>
>

<body>

<?php if (isset($_smarty_tpl->tpl_vars['errmsg']->value)&&$_smarty_tpl->tpl_vars['errmsg']->value!=='') {?>
<div class="err">
    <h4><?php echo $_smarty_tpl->tpl_vars['errmsg']->value;?>
</h4>
</div>
<?php }?>
<div>
        <form class="form" action="./insertBodyRules.php" method="post">
            <input type="hidden" value="<?php echo $_smarty_tpl->tpl_vars['nodeId']->value;?>
" name="node">
            <div style="float: left;">
            	
                <div class="form-group">
                    <label>文章标题开始标记</label>
                    <textarea rows="4" cols="15" name="title_start" style="width: 250px;"></textarea>

                </div>

                <div class="form-group">
                    <label>文章标题结束标记</label>

                    <textarea rows="4" cols="15" name="title_end" style="width: 250px;"></textarea>

                </div>
                <div class="form-group">
                    <label>文章正文开始标记</label>
                    <textarea rows="4" cols="15" name="body_start" style="width: 250px;"></textarea>

                </div>
                <div class="form-group">
                    <label>文章正文结束标记</label>
                    <textarea rows="4" cols="15" name="body_end" style="width: 250px;"></textarea>

                </div>

                <div class="form-group">
                    <label>发布时间开始标记</label>
                    <textarea rows="4" cols="15" name="time_start" style="width: 250px;"></textarea>

                </div>
            </div>
            <div style="float: left; margin-left: 50px;">
                <div class="form-group">
                    <label>发布时间结束标记</label>
                    <textarea rows="4" cols="15" name="time_end" style="width: 250px;"></textarea>

                </div>
                <div class="form-group">
                    <label>文章来源开始标记</label>
                    <textarea rows="4" cols="15" name="source_start" style="width: 250px;"></textarea>

                </div>
                <div class="form-group">
                    <label>文章来源结束标记</label>
                    <textarea rows="4" cols="15" name="source_end" style="width: 250px;"></textarea>

                </div>
                <div class="form-group">
                    <label>文章作者开始标记</label>
                    <textarea rows="4" cols="15" name="author_start" style="width: 250px;"></textarea>

                </div>
                <div class="form-group">
                    <label>文章作者结束标记</label>
                    <textarea rows="4" cols="15" name="author_end" style="width: 250px;"></textarea>

                </div>
            </div>
            <br>
            <button type="submit" class="btn btn-small btn-primary" style="margin-left: 25px;margin-top: 5px;">添加</button>
        </form>



</div>
<div class="caozuo">
    <div></div>
</div>

</body>


<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/core/jquery-1.8.3.min.js?v=1531357464"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/jquery.dialog-4.2.0.js?v=1531357464"><?php echo '</script'; ?>
>
</html><?php }} ?>
