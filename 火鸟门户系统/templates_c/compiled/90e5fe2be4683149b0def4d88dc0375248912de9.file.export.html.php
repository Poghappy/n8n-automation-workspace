<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:05:43
         compiled from "/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/export.html" */ ?>
<?php /*%%SmartyHeaderCode:42815858868860807a5a646-82876409%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '90e5fe2be4683149b0def4d88dc0375248912de9' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/export.html',
      1 => 1753611756,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '42815858868860807a5a646-82876409',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticPath' => 0,
    'typeListArr' => 0,
    'cityList' => 0,
    'errmsg' => 0,
    'node_id' => 0,
    'count' => 0,
    'mod' => 0,
    'cityid' => 0,
    'domain' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860807ab9ee6_51916445',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860807ab9ee6_51916445')) {function content_68860807ab9ee6_51916445($_smarty_tpl) {?><!DOCTYPE html>

<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <title>发布信息</title>
    <link rel='stylesheet' type='text/css' href='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/datetimepicker.css?v=1531357464' />
    <link rel='stylesheet' type='text/css' href='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/common.css?v=1531357464' />
    <link rel='stylesheet' type='text/css' href='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/bootstrap.css?v=1531357464' />
    <link rel='stylesheet' type='text/css' href='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/ui/jquery.chosen.css?v=1531357464'/>
    <link rel='stylesheet' type='text/css' href='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/chosen.min.css?v=1531357464'/>



    <?php echo '<script'; ?>
>

        var
            typeListArr = <?php echo $_smarty_tpl->tpl_vars['typeListArr']->value;?>
, action = 'article', modelType = 'article',
            cfg_term = "pc", adminPath = "../", staticPath = '';
        var cityid = 0, cityList = <?php echo $_smarty_tpl->tpl_vars['cityList']->value;?>
;
        var id = 0;
        var mold = 0;
        var detail = {
          videotype: 0,
          media: 0,
          media_arctype: 0
        };
    <?php echo '</script'; ?>
>
    <?php echo '<script'; ?>
>var staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';<?php echo '</script'; ?>
>

<body style="margin-left: 22px;margin-right: 22px; margin-top: 10px;">
<h4>发布新闻</h4>
<?php if (isset($_smarty_tpl->tpl_vars['errmsg']->value)&&$_smarty_tpl->tpl_vars['errmsg']->value!=='') {?>
<div class="err">
    <h4><?php echo $_smarty_tpl->tpl_vars['errmsg']->value;?>
</h4>
</div>
<?php }?>

<div class="item">
    <form action="" method="post" id="exportForm">
            <table class="table table-bordered" style="width: 600px;">
                <input type="hidden" value="<?php echo $_smarty_tpl->tpl_vars['node_id']->value;?>
" name="node_id">
                <tr>
                    <td>当前可导出条数：</td>
                    <td><?php echo $_smarty_tpl->tpl_vars['count']->value;?>
</td>
                </tr>
                <tr>
                    <td>选择模块：</td>
                    <td>
                        <dd style="margin-left: 0; overflow: visible;">
                            <select class="chosen-select" id="mod" name="mod" style="width: auto; min-width: 150px;">
                                <option value="article"<?php if ($_smarty_tpl->tpl_vars['mod']->value=='article') {?> selected<?php }?>>新闻资讯</option>
                                <option value="house"<?php if ($_smarty_tpl->tpl_vars['mod']->value=='house') {?> selected<?php }?>>房产门户</option>
                            </select>
                        </dd>
                    </td>
                </tr>
                <tr>
                    <td>选择城市：</td>
                    <td>
                        <dd style="margin-left: 0; overflow: visible;">
                            <div class="choseCity">
                    			<input type="hidden" id="cityid" name="cityid" placeholder="请选择城市分站" value="<?php echo $_smarty_tpl->tpl_vars['cityid']->value;?>
">
                    		</div>
                        </dd>

                    </td>
                </tr>
                <tr>
                    <td>导出分类：</td>
                    <td>
                        <dd style="margin-left: 0; overflow:visible;">
                            <div class="btn-group" id="typeBtn">
                                <button class="btn dropdown-toggle" type="button" data-toggle="dropdown">选择分类<span class="caret"></span></button>
                                <ul class="dropdown-menu"></ul></div>
                            <input type="hidden" name="typeid" id="typeid" value="0">
                            <span class="input-tips"><s></s>请选择信息分类</span>
                        </dd>
                    </td>
                </tr>

                <tr>
                    <td>每批导出数量</td>
                    <td><input type="text" name="totle" value="20"> 条</td>
                </tr>
                <tr>
                    <td>每批导出间隔</td>
                    <td><input type="text" name="times" value="1"> 秒</td>
                </tr>
            </table>



        </form>


<div style="display: none;">
    <div id="body"></div>
    <div id="mbody"></div>
    <div class="form_datetime"><span class="add-on"></span></div>
</div>


    <button class="btn btn-small btn-primary" style="margin-left: 0px;" onclick="startExports()">开始导出</button>
    <a class="btn btn-small btn-primary" type="submit" style="margin-left: 20px;" href="./index.php">返回主界面</a>

</div>

<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['domain']->value;?>
/include/lang/zh-CN.js?v=1588216826'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['domain']->value;?>
/include/ueditor/ueditor.config.js?v=14'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['domain']->value;?>
/include/ueditor/ueditor.all.js?v=14'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/core/jquery-1.8.3.min.js?v=1531357464'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/admin/common.js?v=1531357464'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/bootstrap.min.js?v=1531357464'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/chosen.jquery.min.js?v=1531357464'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/bootstrap-datetimepicker.min.js?v=1531357464'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/ui/jquery.colorPicker.js?v=1531357464'><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 type='text/javascript' src='<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/admin/article/articleAdd.js?v=1531357464'><?php echo '</script'; ?>
>

<?php echo '<script'; ?>
>
    function startExports() {
        var totle  = $("input[name=node_id]").val();
        var time  = $("input[name=times]").val();
        if(!totle || !time){
            alert("请填写每批导出数量和导出间隔");return;
        }
        var ndoeID = $("input[name=node_id]").val();
        var url = './index.php?export=' + ndoeID + '&';
        var datas = $('#exportForm').serialize();
        var  urls = url+datas;

        var times = $("input[name=times]").val();
        timeOutStart(urls, times);
    }

    function timeOutStart(urls, times) {
        $.ajax({
            type: "get",
            dataType: "json",
            url: urls,
            data: '',
            async:false,
            success: function (res) {
                console.log(res);
                if(res.code !== 201){

                    setTimeout(function(){
                        timeOutStart(urls, times);
                    }, times*1000);

                }else{
                    alert(res.msg);
                }
            }
        });

    }

    $(function(){
        $('#mod').change(function(){
            location.href = '?export=<?php echo $_smarty_tpl->tpl_vars['node_id']->value;?>
&mod=' + $(this).val();
        });
    });

<?php echo '</script'; ?>
>
<?php }} ?>
