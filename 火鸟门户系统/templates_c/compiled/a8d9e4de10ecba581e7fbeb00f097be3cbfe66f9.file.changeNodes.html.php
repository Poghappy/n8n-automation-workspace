<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:02:13
         compiled from "/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/changeNodes.html" */ ?>
<?php /*%%SmartyHeaderCode:268133401688607354e9983-90427040%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'a8d9e4de10ecba581e7fbeb00f097be3cbfe66f9' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/changeNodes.html',
      1 => 1753611756,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '268133401688607354e9983-90427040',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticPath' => 0,
    'errmsg' => 0,
    'nodes' => 0,
    'node_rules' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6886073556ad08_62429212',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6886073556ad08_62429212')) {function content_6886073556ad08_62429212($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
    <title>更改节点</title>
    <link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/bootstrap.css?v=1531357464">
</head>
<style>

</style>
<?php echo '<script'; ?>
>var staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';<?php echo '</script'; ?>
>

<body style="margin-left: 22px;margin-top: 5px;">

<?php if (isset($_smarty_tpl->tpl_vars['errmsg']->value)&&$_smarty_tpl->tpl_vars['errmsg']->value!=='') {?>
<div class="err">
    <h4><?php echo $_smarty_tpl->tpl_vars['errmsg']->value;?>
</h4>
</div>
<?php }?>
<div>
    <div style="float: left">
        <form class="form" action="./insertNode.php" method="post" name="form1" id="form1">
            <input type="hidden" name="node_id" value="<?php echo $_smarty_tpl->tpl_vars['nodes']->value['id'];?>
">
            <div class="form-group">
                <label>节点名称</label>
                <input type="text" name="nodename" class="form-control" value="<?php echo $_smarty_tpl->tpl_vars['nodes']->value['nodename'];?>
">
            </div>
            <div class="form-group">
                <label>针对类型</label>
                <select name="type" id="">
                    <option value="1" <?php if ($_smarty_tpl->tpl_vars['nodes']->value['type']==1) {?> selected <?php }?>>采集多个页面</option>
                    <option value="2" <?php if ($_smarty_tpl->tpl_vars['nodes']->value['type']==2) {?> selected <?php }?>>采集接口</option>
                    <option value="3" <?php if ($_smarty_tpl->tpl_vars['nodes']->value['type']==3) {?> selected <?php }?>>采集单个页面</option>
                </select>
            </div>
            <?php if ($_smarty_tpl->tpl_vars['nodes']->value['type']==3) {?>
            <div class="form-group">
                <label>列表页url</label>

                <textarea rows="3" cols="15" name="list_page_url[]"  id="list_page_url" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['list_page_url'][0];?>
</textarea>

            </div>
            <?php }?>

            <?php if ($_smarty_tpl->tpl_vars['nodes']->value['type']!=3) {?>
            <div class="form-group">
                <label>列表页url匹配规则</label>
                <textarea rows="3" cols="15" name="list_page_url_rule" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['list_page_url_rule'];?>
</textarea>
            </div>
            <?php }?>
            <div class="form-group">
                <label>开始标记</label>
                <textarea rows="3" cols="15" name="list_start_sign" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['list_start_sign'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>结束标记</label>
                <textarea rows="3" cols="15" name="list_end_sign" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['list_end_sign'];?>
</textarea>

            </div>

            <div class="form-group">
                <label>必须包含</label>
                <textarea rows="3" cols="15" name="must_include" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['must_include'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>必须不包含</label>
                <textarea rows="3" cols="15" name="not_include" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['not_include'];?>
</textarea>

            </div>
            <div class="form-group" style="margin-top: 10px;">
                <button type="submit" class="btn btn-small btn-primary">提交更改</button>
            </div>
        </form>
    </div>

    <div style="float: left; margin-left: 150px;">
        <form class="form" action="./insertBodyRules.php" method="post" name="form2" id="form2">
            <input type="hidden" value="<?php echo $_smarty_tpl->tpl_vars['node_rules']->value['node_id'];?>
" name="node">
            <input type="hidden" value="<?php echo $_smarty_tpl->tpl_vars['node_rules']->value['id'];?>
" name="update_id">
            <div class="form-group">
                <label>文章正文开始标记</label>
                <textarea rows="3" cols="15" name="body_start" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['body_start'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>文章正文结束标记</label>
                <textarea rows="3" cols="15" name="body_end" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['body_end'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>文章标题开始标记</label>
                <textarea rows="3" cols="15" name="title_start" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['title_start'];?>
</textarea>

            </div>

            <div class="form-group">
                <label>文章标题结束标记</label>
                <textarea rows="3" cols="15" name="title_end" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['title_end'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>发布时间开始标记</label>
                <textarea rows="3" cols="15" name="time_start" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['time_start'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>发布时间结束标记</label>
                <textarea rows="3" cols="15" name="time_end" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['time_end'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>文章来源开始标记</label>
                <textarea rows="3" cols="15" name="source_start" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['source_start'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>文章来源结束标记</label>
                <textarea rows="3" cols="15" name="source_end" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['source_end'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>文章作者开始标记</label>
                <textarea rows="3" cols="15" name="author_start" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['author_start'];?>
</textarea>

            </div>
            <div class="form-group">
                <label>文章作者结束标记</label>
                <textarea rows="3" cols="15" name="author_end" style="width: 250px;"><?php echo $_smarty_tpl->tpl_vars['node_rules']->value['author_end'];?>
</textarea>

            </div>
            <div class="form-group"  style="margin-top: 10px;">
                <button type="submit" class="btn btn-small btn-primary">提交更改</button>
            </div>
        </form>
    
    </div>

    <div style="float:left;margin-left: 50px;margin-top: 29px;">
        <a href="./index.php" class="btn btn-small btn-primary">返回主页</a>
    </div>
</div>
<div class="caozuo">
    <div></div>
</div>
<?php echo '<script'; ?>
>
    

    
<?php echo '</script'; ?>
>
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
