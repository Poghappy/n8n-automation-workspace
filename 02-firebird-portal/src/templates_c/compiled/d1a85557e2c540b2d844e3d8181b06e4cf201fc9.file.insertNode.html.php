<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 18:48:36
         compiled from "/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/insertNode.html" */ ?>
<?php /*%%SmartyHeaderCode:209693187168860404624ef7-13222531%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'd1a85557e2c540b2d844e3d8181b06e4cf201fc9' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/insertNode.html',
      1 => 1753611756,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '209693187168860404624ef7-13222531',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticPath' => 0,
    'errmsg' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860404670e47_04803549',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860404670e47_04803549')) {function content_68860404670e47_04803549($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
    <title>采集节点管理</title>
    <link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/bootstrap.css?v=1531357464">
</head>
<style>

    .form{
        margin-left: 20px;
    }
    .err{
        color: #f62c3c;
        margin-left: 20px;
    }
    label{
        margin-top: 5px;
    }
    .inputLeft{
        float: left;
    }
    .inputRight{
        float: left;
        margin-left: 50px;
    }
    .buttonContent{
        margin-top: 30px;
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
    <div style="float: left">
             <form class="form" action="./insertNode.php" method="post" onsubmit="return checkData()">
         <div class="inputLeft">
            <div class="form-group">
                <label>节点名称</label>
                <input type="text" name="nodename" class="form-control">
            </div>
            <div class="form-group">
                <label>针对类型&nbsp;<span style="color: #f62c3c">*</span></label>
                <select name="type" id="type" onchange="changeType()">
                    <option value="0">请选择</option>
                    <option value="1">采集多个页面</option>
                    <option value="2">采集接口</option>
                    <option value="3">采集单个页面</option>
                </select>
            </div>
             <div class="form-group list_page_url" style="display: block">
                 <label>指定HTML列表页URL</label>

                 <textarea rows="4" cols="15" name="list_page_url[]" id="list_page_url" style="width: 250px;"></textarea>

             </div>

             <div class="form-group list_page_url_rule" style="display: block">
                 <label>列表页url匹配规则(通配符(*)，例如：http://xxx.com/news/page_(*).js)</label>
                 <textarea rows="4" cols="15" name="list_page_url_rule" style="width: 250px;"></textarea>

             </div>
            <div class="form-group">
                <label>开始标记</label>
                <textarea rows="4" cols="15" name="list_start_sign" style="width: 250px;"></textarea>

            </div>
            <div class="form-group">
                <label>结束标记</label>
                <textarea rows="4" cols="15" name="list_end_sign" style="width: 250px;"></textarea>

            </div>
        </div>
        <div class="inputRight">
            <div class="form-group">
                <label>URL中必须包含的字符串</label>
                <textarea rows="4" cols="15" name="must_include" style="width: 250px;"></textarea>

            </div>
            <div class="form-group">
                <label>URL中必须不包含的字符串</label>
                <textarea rows="4" cols="15" name="not_include" style="width: 250px;"></textarea>

            </div>
            <div class="buttonContent">
            <button type="submit" class="btn btn-small btn-primary">进入下一步</button>&nbsp;&nbsp;&nbsp;
            <a type="submit" class="btn btn-small btn-primary" onclick="javascript: history.go(-1);">返回</a>
            </div>
        </div>
        <br>

    </form>
    </div>


</div>

<?php echo '<script'; ?>
>


    function changeType() {
        var type = $('#type option:selected').val();

        if(type == 1){
            //多个界面
            $(".list_page_url").css('display', 'none');
            $(".list_page_url_rule").css('display', 'block');
        }else if(type == 2){
            //采集接口（带有通配符）
            $(".list_page_url").css('display', 'none');
            $(".list_page_url_rule").css('display', 'block');
        }else if(type == 3){
            //采集单个html
            $(".list_page_url").css('display', 'block');
            $(".list_page_url_rule").css('display', 'none');
        }
    }


    function checkData() {
        var type = $('#type option:selected').val();
        var list_page_url = $("#list_page_url").val();
        var list_page_url_rule = $("input[name=list_page_url_rule]").val();
        if (!type) {
            alert("请选择采集类型");
        }

    }
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
