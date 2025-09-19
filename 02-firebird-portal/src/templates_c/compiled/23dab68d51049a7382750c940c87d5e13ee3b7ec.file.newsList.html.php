<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 18:58:30
         compiled from "/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/newsList.html" */ ?>
<?php /*%%SmartyHeaderCode:8716367368860656a13066-06665299%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '23dab68d51049a7382750c940c87d5e13ee3b7ec' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/newsList.html',
      1 => 1753611756,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8716367368860656a13066-06665299',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticPath' => 0,
    'node_id' => 0,
    'list' => 0,
    'news' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860656a9a774_35258697',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860656a9a774_35258697')) {function content_68860656a9a774_35258697($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
    <title>已抓取新闻列表</title>
    <link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/bootstrap.css">
</head>
<style>


</style>
<body style="margin-left: 20px; margin-right: 20px;">
<div>
<div><h4>已抓取新闻列表</h4></div>
<div style="float: left;"><h5><a class="btn btn-small btn-primary" href="./index.php">返回主页</a></h5></div>
<div style="float: left; margin-left: 30px;"><h5><a class="btn btn-small btn-primary" href="./index.php?export=<?php echo $_smarty_tpl->tpl_vars['node_id']->value;?>
">发布内容</a></h5></div>
</div>
<?php echo '<script'; ?>
>var staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';<?php echo '</script'; ?>
>

<table class="table table-bordered">

    <th>新闻正文</th>
    <th>新闻标题</th>
    <th>来源</th>
    <th>作者</th>
    <th>发布时间</th>
    <th>操作</th>
    <?php  $_smarty_tpl->tpl_vars['news'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['news']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['list']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['news']->key => $_smarty_tpl->tpl_vars['news']->value) {
$_smarty_tpl->tpl_vars['news']->_loop = true;
?>

    <tr class="trss">
        <!--<td>-->
            <!--<?php echo $_smarty_tpl->tpl_vars['news']->value['node_id'];?>
-->
            <!---->
        <!--</td>-->
        <td><input type="text" value="<?php echo $_smarty_tpl->tpl_vars['news']->value['content'];?>
" disabled></td>
        <td><input type="text" value="<?php echo $_smarty_tpl->tpl_vars['news']->value['title'];?>
" disabled></td>
        <td><input type="text" value="<?php echo $_smarty_tpl->tpl_vars['news']->value['source'];?>
" disabled></td>
        <td><input type="text" value="<?php echo $_smarty_tpl->tpl_vars['news']->value['author'];?>
" disabled></td>
        <td><input type="text" value="<?php echo $_smarty_tpl->tpl_vars['news']->value['times'];?>
" disabled></td>
        <td><a href="#"  onclick="deleteNews(<?php echo $_smarty_tpl->tpl_vars['news']->value['id'];?>
)">删除</a></td>
    </tr>
    <?php } ?>
</table>


</body>
<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/core/jquery-1.8.3.min.js?v=1531357464"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/jquery.dialog-4.2.0.js?v=1531357464"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
>
function deleteNews(id) {
    if(confirm("确定删除该条新闻？")){
        $.get("./index.php?getNewsList=del&del=" + id, function(result){
            if(result.code == 200){
                window.location.reload();
            }else{
                alert(result.msg);
            }
        });
    }
}
<?php echo '</script'; ?>
>


</html><?php }} ?>
