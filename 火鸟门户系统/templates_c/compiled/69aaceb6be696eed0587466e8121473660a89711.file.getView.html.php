<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:04:35
         compiled from "/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/getView.html" */ ?>
<?php /*%%SmartyHeaderCode:363508721688607c34add72-83170434%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '69aaceb6be696eed0587466e8121473660a89711' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/include/plugins/4/tpl/getView.html',
      1 => 1753611756,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '363508721688607c34add72-83170434',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticPath' => 0,
    'errmsg' => 0,
    'node_id' => 0,
    'type' => 0,
    'nodes' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_688607c3502f86_08462392',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_688607c3502f86_08462392')) {function content_688607c3502f86_08462392($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
    <title>开始采集任务</title>
    <link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
css/admin/bootstrap.css">
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
</style><?php echo '<script'; ?>
>var staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';<?php echo '</script'; ?>
>


<body style="margin-top: 20px;margin-left: 5px;">

<?php if (isset($_smarty_tpl->tpl_vars['errmsg']->value)&&$_smarty_tpl->tpl_vars['errmsg']->value!=='') {?>
<div class="err">
    <h4><?php echo $_smarty_tpl->tpl_vars['errmsg']->value;?>
</h4>
</div>
<?php }?>
<div>
    <div style="float: left">
        <form class="form" action="./getUrl.php?node=<?php echo $_smarty_tpl->tpl_vars['node_id']->value;?>
&type=<?php echo $_smarty_tpl->tpl_vars['type']->value;?>
" method="post" name="form1" id="form1" onsubmit="return checkInput()">
          <table class="table table-bordered">
              <tr>
                  <td>采集节点</td>
                  <td class="node_id"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['nodename'];?>
</td>
              </tr>
              <input type="hidden" value="<?php echo $_smarty_tpl->tpl_vars['nodes']->value['id'];?>
" name="node_id">
              <?php if ($_smarty_tpl->tpl_vars['type']->value==3) {?>
              <tr>
                  <td>采集列表页</td>
                  <td class="rules"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['list_page_url'][0];?>
</td>
              </tr>

              <?php } else { ?>
              <tr>
                  <td>列表页匹配规则</td>
                  <td class="rules"><?php echo $_smarty_tpl->tpl_vars['nodes']->value['list_page_url_rule'];?>
</td>
              </tr>

              <tr>
                  <td>采集页数</td>
                  <td>第 <input type="text" value="1" name="page_start" style="width:40px; height: 20px;">
                      页&nbsp;~&nbsp;第 <input type="text" value="5" name="page_end" style="width:40px; height: 20px;"> 页
                      <span style="margin-left: 20px;"><a class="btn btn-small btn-default" onclick="testPiPei()">测试匹配</a></span>
                  </td>

              </tr>
              <?php }?>



          </table>
            <div>
                <button type="submit" class="btn btn-small btn-primary">下一步</button>&nbsp;&nbsp;
                <a class="btn btn-small btn-primary" href="./index.php">返回</a>

            </div>
        </form>
    </div>


</div>
<div class="caozuo">
    <div></div>
</div>
<?php if ($_smarty_tpl->tpl_vars['type']->value!=3) {?>
<?php echo '<script'; ?>
>

    function checkInput(){
        var start = $("input[name=page_start]").val();
        var end = $("input[name=page_end]").val();

        var is = checkPageIs(start, end);
        if(!is) return false;
    }


    function testPiPei() {
        var start = $("input[name=page_start]").val();
        var end = $("input[name=page_end]").val();
        var node_id = $("input[name=node_id]").val();

        var is = checkPageIs(start, end);
        if(is === false){
            return;
        } else{
            $.ajax({
                type: "GET",
                url: "./index.php?start=" + start + "&end=" + end + "&node=" + node_id,
                data: {

                },
                async:false,
                dataType: "json",
                success: function(res){
                    if(res.code == 200){
                        alert(res.data);
                    }
                }
            })
        }

    }

    function checkPageIs(start, end) {

        if(start == 0 || end == 0){
            alert("开始页数必须大于等于1，结束页数必须大于0");
            return false;
        }
        if(end < start){
            alert("尾页必须大于或者等于首页");
            return false;
        }
        return true;
    }
<?php echo '</script'; ?>
>
<?php }?>
</body>
<?php echo '<script'; ?>
 src="<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
js/core/jquery-1.8.3.min.js?v=1531357464"><?php echo '</script'; ?>
>
</html><?php }} ?>
