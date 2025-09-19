<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 18:44:47
         compiled from "/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/index.html" */ ?>
<?php /*%%SmartyHeaderCode:1275694206886031fb88702-34450998%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'f902a48134c42b640c6e866f52e3719e760c9cf1' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/index.html',
      1 => 1753611756,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1275694206886031fb88702-34450998',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticPath' => 0,
    'nodes' => 0,
    'id' => 0,
    'node' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6886031fbef0a1_83264799',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6886031fbef0a1_83264799')) {function content_6886031fbef0a1_83264799($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
    <title>采集节点管理</title>
    <link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/bootstrap.css">
</head>
<style>
    .caozuo div{
        float: left;
        margin-left: 5px;
    }
    a{
        text-decoration:none;
    }
    body{
        margin-left: 20px;
        margin-right: 20px;
    }
</style>

<?php echo '<script'; ?>
>var staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';<?php echo '</script'; ?>
>
<body>
<table class="table table-bordered" style="margin-left: 5px;">
    <div style="margin-left: 5px;"><h4>采集节点管理</h4></div>
    <th>编号</th>
    <th>节点名称</th>
    <th>针对规则</th>
    <th>创建时间</th>
    <th>操作</th>

    <?php  $_smarty_tpl->tpl_vars['node'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['node']->_loop = false;
 $_smarty_tpl->tpl_vars['id'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['nodes']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['node']->key => $_smarty_tpl->tpl_vars['node']->value) {
$_smarty_tpl->tpl_vars['node']->_loop = true;
 $_smarty_tpl->tpl_vars['id']->value = $_smarty_tpl->tpl_vars['node']->key;
?>
        <tr>
            <td><?php echo $_smarty_tpl->tpl_vars['id']->value+1;?>
</td>
            <td><a href="./index.php?getNewsList=<?php echo $_smarty_tpl->tpl_vars['node']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['node']->value['nodename'];?>
</a></td>
            <td>
                <?php if ($_smarty_tpl->tpl_vars['node']->value['type']==1) {?>
                采集多个页面
                <?php } elseif ($_smarty_tpl->tpl_vars['node']->value['type']==2) {?>
                采集接口
                <?php } else { ?>
                采集单个页面
                <?php }?>
            </td>
            <td><?php echo date("Y-m-d H:i:s",$_smarty_tpl->tpl_vars['node']->value['created_at']);?>
</td>
            <td>
                <a href="./index.php?getView=<?php echo $_smarty_tpl->tpl_vars['node']->value['id'];?>
&type=<?php echo $_smarty_tpl->tpl_vars['node']->value['type'];?>
">采集</a>&nbsp;&nbsp;
                <a href="./index.php?changeNode=<?php echo $_smarty_tpl->tpl_vars['node']->value['id'];?>
">更改</a>&nbsp;&nbsp;
                <a href="" data-node="<?php echo $_smarty_tpl->tpl_vars['node']->value['id'];?>
" onclick="deleteNode($(this))">删除</a>&nbsp;&nbsp;
                <a href="./index.php?export=<?php echo $_smarty_tpl->tpl_vars['node']->value['id'];?>
">发布</a>
            </td>
        </tr>
    <?php } ?>


</table>
<div class="caozuo">
    <div><a class="btn btn-small btn-primary" href="./insertNode.php">添加任务</a></div>
</div>

</body>
<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/core/jquery-1.8.3.min.js?v=1531357464"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
>

    
    function deleteNode(e) {
        if(confirm("确定删除该节点下面的所有内容？")){
            var nodeId = e.attr("data-node");
            $.get("./index.php?delete="+nodeId, function(result){
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
