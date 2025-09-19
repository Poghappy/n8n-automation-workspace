<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 15:08:47
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCity.html" */ ?>
<?php /*%%SmartyHeaderCode:11813497676885d07fe22523-66698690%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b4b3fa2d02a3fdb63865b91ac847a16446bcf62d' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCity.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '11813497676885d07fe22523-66698690',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'domainCount' => 0,
    'cityCount' => 0,
    'cfg_sameAddr_state' => 0,
    'cfg_sameAddr_group' => 0,
    'cfg_sameAddr_nearby' => 0,
    'areaName' => 0,
    'province' => 0,
    'p' => 0,
    'domaintype' => 0,
    'domaintypeChecked' => 0,
    'domaintypeNames' => 0,
    'basehost' => 0,
    'level_1' => 0,
    'level_2' => 0,
    'level_3' => 0,
    'level_4' => 0,
    'cfg_auto_location' => 0,
    'adminPath' => 0,
    'token' => 0,
    'domainArr' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6885d07fed6b71_64537147',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6885d07fed6b71_64537147')) {function content_6885d07fed6b71_64537147($_smarty_tpl) {?><?php if (!is_callable('smarty_function_html_radios')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_radios.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>分站城市管理</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
    .setting, .setting label {display: inline-block;}
    .setting {margin-left: 50px;}
    .setting label {margin: 0 10px 0 0;}
    .setting label input[type=radio] {margin-right: 0; border-radius: 50%;}
	.list td a {font-size: 14px;}
    .input-append, .input-prepend {white-space: normal;}
    .quick-editForm dl {margin-bottom: 15px;}
</style>
</head>

<body>
<div class="alert alert-success" style="margin:10px 100px 0 10px;"><button type="button" class="close" data-dismiss="alert">×</button>注意：系统开通多个分站城市后，模块将不支持绑定独立域名或者二级域名，只有一个分站城市，模块可以绑定独立域名或者二级域名！</div>

<div class="search clearfix" style="padding: 10px 20px 0!important;">
  <div class="btn-group" id="selectBtn" style="margin-bottom: 10px;">
  	<button class="btn dropdown-toggle" data-toggle="dropdown"><span class="check"></span><span class="caret"></span></button>
  	<ul class="dropdown-menu">
  	  <li><a href="javascript:;" data-id="1">全选</a></li>
  	  <li><a href="javascript:;" data-id="0">不选</a></li>
  	</ul>
  </div>
  <div class="btn-group operBtn" style="margin-bottom: 10px;">
    <button class="btn dropdown-toggle" data-toggle="dropdown">批量操作<span class="caret"></span></button>
    <ul class="dropdown-menu">
      <li><a href="javascript:;" data-id="0">主域名</a></li>
      <li><a href="javascript:;" data-id="1">子域名</a></li>
      <li><a href="javascript:;" data-id="2">子目录</a></li>
	  <li class="divider"></li>
      <li><a href="javascript:;" data-id="3">启用</a></li>
      <li><a href="javascript:;" data-id="4">停用</a></li>
	  <li class="divider"></li>
      <li><a href="javascript:;" data-id="5">删除</a></li>
      <li class="divider"></li>
      <li><a href="javascript:;" data-id="6" style="font-weight: 700; color: red;">清空所有城市</a></li>
    </ul>
  </div>
  <button type="button" class="btn btn-success btn-save" style="margin-bottom: 10px;">保存全部</button>
  <button type="button" class="btn btn-primary ml30" style="margin-bottom: 10px;">开通城市</button>
  <span class="help-inline" style="margin-bottom: 10px;">已开通 <u><?php echo $_smarty_tpl->tpl_vars['domainCount']->value;?>
</u> 个城市<?php if ($_smarty_tpl->tpl_vars['cityCount']->value!=$_smarty_tpl->tpl_vars['domainCount']->value) {?>，启用中 <u><?php echo $_smarty_tpl->tpl_vars['cityCount']->value;?>
</u> 个。<?php }?></span>
    <div class="setting" style="float: right; margin-bottom: 10px;">
        <div class="search" style="position:relative; display: inline-block; margin: 0 20px 0 0!important; padding: 0!important;">
            <input class="input-medium" type="search" id="keyword" placeholder="请输入要搜索的关键字">
            <button type="button" class="btn btn-success" id="searchBtn">搜索</button>
        </div>

        <button type="button" class="btn" id="customConfigBtn"><i class="icon-cog" style="vertical-align: bottom;"></i> 自定义配置</button>
        <!-- <div class="input-prepend input-append" style="margin-bottom:0;">
            <span class="add-on statusTips" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="举例说明：开通了苏州分站，再开通昆山（归属于苏州管辖的县级市）分站，此时是否需要隐藏苏州分站下的昆山区域">
                &nbsp;<i class="icon-question-sign" style="margin-top: 3px;"></i>重复区域&nbsp;
            </span>
            <span class="add-on">
                &nbsp;
                <label><input type="radio" name="state" value="1"<?php if ($_smarty_tpl->tpl_vars['cfg_sameAddr_state']->value) {?> checked<?php }?> /> 显示</label>
                <label><input type="radio" name="state" value="0"<?php if (!$_smarty_tpl->tpl_vars['cfg_sameAddr_state']->value) {?> checked<?php }?> /> 隐藏</label>
            </span>
        </div>

        <div class="input-prepend input-append" style="margin: 0 0 0 10px;">
            <span class="add-on statusTips" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="此功能只在移动端生效；默认为按分站城市的首字母排序显示；按省为优先显示省份信息，点击省份再显示下级分站城市；注意：按省分组后，前台页面分站选择功能必须点到最后一级，比如：开通了[苏州]分站，又开通了[苏州]的下级城市[吴江]分站，这种情况[苏州]站将失效，必须选择进入到[吴江]！">
                &nbsp;<i class="icon-question-sign" style="margin-top: 3px;"></i>城市分组&nbsp;
            </span>
            <span class="add-on">
                &nbsp;
                <label><input type="radio" name="group" value="0"<?php if (!$_smarty_tpl->tpl_vars['cfg_sameAddr_group']->value) {?> checked<?php }?> /> 默认</label>
                <label><input type="radio" name="group" value="1"<?php if ($_smarty_tpl->tpl_vars['cfg_sameAddr_group']->value) {?> checked<?php }?> /> 按省</label>
            </span>
        </div>

        <div class="input-prepend input-append" style="margin: 0 0 0 10px;">
            <span class="add-on statusTips" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="当选择按省分组时，切换城市页面的热门城市将显示当前定位城市的周边指定范围内的分站信息，如果周边没有开通的分站，则恢复显示热门城市；">
                &nbsp;<i class="icon-question-sign" style="margin-top: 3px;"></i>周边范围&nbsp;
            </span>
            <input class="span1" id="nearby" name="nearby" type="text" value="<?php echo $_smarty_tpl->tpl_vars['cfg_sameAddr_nearby']->value;?>
" />
            <span class="add-on">公里</span>
        </div>
        &nbsp;&nbsp;
        <button class="btn btn-small btn-success" id="save">保存</button> -->
    </div>
</div>
<ul class="thead clearfix" style="position:relative; top:0; left:0; right:0; margin:10px 10px 0;">
  <li class="row3">&nbsp;</li>
  <li class="row5">ID</li>
  <li class="row17 left">城市名称</li>
  <li class="row10 left">类型</li>
  <li class="row25 left">域名</li>
  <li class="row40 left">操作</li>
</ul>
<div class="list mt124" id="list"><table><tbody><tr><td style="height:200px;" align="center">加载中...</td></tr></tbody></table></div>
<div class="search">
  <div class="btn-group dropup operBtn">
    <button class="btn dropdown-toggle" data-toggle="dropdown">批量操作<span class="caret"></span></button>
    <ul class="dropdown-menu">
		<li><a href="javascript:;" data-id="0">主域名</a></li>
        <li><a href="javascript:;" data-id="1">子域名</a></li>
        <li><a href="javascript:;" data-id="2">子目录</a></li>
  	  <li class="divider"></li>
        <li><a href="javascript:;" data-id="3">启用</a></li>
        <li><a href="javascript:;" data-id="4">停用</a></li>
  	  <li class="divider"></li>
        <li><a href="javascript:;" data-id="5">删除</a></li>
  	  <li class="divider"></li>
        <li><a href="javascript:;" data-id="6" style="font-weight: 700; color: red;">清空所有城市</a></li>
    </ul>
  </div>
  <button type="button" class="btn btn-success btn-save">保存全部</button>
  <button type="button" class="btn btn-primary ml30">开通城市</button>
</div>

<?php echo '<script'; ?>
 id="addCity" type="text/html">
  <form action="" class="quick-editForm" name="editForm">
    <blockquote style="margin-top: 10px;">
        <p>手动添加：</p>
    </blockquote>
    <dl class="clearfix">
      <dt>所属城市：</dt>
      <dd>
        <select id="pBtn" name="pBtn" style="width:130px;">
          <option value="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[0];?>
--</option>
          <?php if ($_smarty_tpl->tpl_vars['province']->value) {?>
          <?php  $_smarty_tpl->tpl_vars['p'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['p']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['province']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['p']->key => $_smarty_tpl->tpl_vars['p']->value) {
$_smarty_tpl->tpl_vars['p']->_loop = true;
?>
          <option value="<?php echo $_smarty_tpl->tpl_vars['p']->value['id'];?>
" data-pinyin="<?php echo $_smarty_tpl->tpl_vars['p']->value['pinyin'];?>
"><?php echo $_smarty_tpl->tpl_vars['p']->value['typename'];?>
</option>
          <?php } ?>
          <?php }?>
        </select>
        <select id="cBtn" name="cBtn" style="width:130px;">
          <option value="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[1];?>
--</option>
        </select>
        <select id="xBtn" name="xBtn" style="width:130px;">
          <option value="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[2];?>
--</option>
        </select>
        <select id="tBtn" name="xBtn" style="width:130px;">
          <option value="">--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[3];?>
--</option>
        </select>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>域名类型：</dt>
      <dd class="clearfix">
        <?php echo smarty_function_html_radios(array('name'=>"domaintype",'values'=>$_smarty_tpl->tpl_vars['domaintype']->value,'checked'=>$_smarty_tpl->tpl_vars['domaintypeChecked']->value,'output'=>$_smarty_tpl->tpl_vars['domaintypeNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      </dd>
    </dl>
    <dl class="clearfix">
      <dt>绑定域名：</dt>
      <dd>
        <div class="input-prepend input-append">
          <span class="add-on">http://<?php echo $_smarty_tpl->tpl_vars['basehost']->value;?>
</span>
          <input class="input-mini" type="text" name="domain" id="domain" />
          <span class="add-on" style="display:none;"></span>
        </div>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>&nbsp;</dt>
      <dd>
        <button type="button" class="btn btn-success" id="kaitongCity">确认开通</button>
      </dd>
    </dl>
    <?php if ($_smarty_tpl->tpl_vars['level_1']->value>0||$_smarty_tpl->tpl_vars['level_2']->value>0||$_smarty_tpl->tpl_vars['level_3']->value>0||$_smarty_tpl->tpl_vars['level_4']->value>0) {?>
    <hr />
    <blockquote>
        <p>批量开通：</p>
        <p style="font-size: 12px; color: #666; padding-top: 3px;">默认以子目录和城市全拼为域名，请根据实际情况开通，<abbr title="开通太多会影响系统性能，造成数据加载时间长，页面打开速度慢等情况。">不建议开通太多分站！</abbr></p>
    </blockquote>
    <p class="text-center bulkAdd">
        <button class="btn btn-small" data-level="1" type="button">所有<?php echo $_smarty_tpl->tpl_vars['areaName']->value[0];?>
(<?php echo $_smarty_tpl->tpl_vars['level_1']->value;?>
个)</button> - 
        <button class="btn btn-small" data-level="2" type="button">所有<?php echo $_smarty_tpl->tpl_vars['areaName']->value[1];?>
(<?php echo $_smarty_tpl->tpl_vars['level_2']->value;?>
个)</button> - 
        <button class="btn btn-small" data-level="3" type="button">所有<?php echo $_smarty_tpl->tpl_vars['areaName']->value[2];?>
(<?php echo $_smarty_tpl->tpl_vars['level_3']->value;?>
个)</button>
        <!-- <button class="btn btn-small" data-level="4" type="button">所有<?php echo $_smarty_tpl->tpl_vars['areaName']->value[3];?>
(<?php echo $_smarty_tpl->tpl_vars['level_4']->value;?>
个)</button> -->
    </p>
    <hr />
    <div class="buldList" style="padding-left: 15px;">
        <select class="input-medium" name="p1" id="p1" multiple="multiple" size="10">
            <option value="" disabled>--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[0];?>
--</option>
            <?php if ($_smarty_tpl->tpl_vars['province']->value) {?>
            <?php  $_smarty_tpl->tpl_vars['p'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['p']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['province']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['p']->key => $_smarty_tpl->tpl_vars['p']->value) {
$_smarty_tpl->tpl_vars['p']->_loop = true;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['p']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['p']->value['typename'];?>
</option>
            <?php } ?>
            <?php }?>
        </select>
        <span class="ds_arrow"> - </span>
        <select class="input-medium" name="p2" id="p2" multiple="multiple" size="10">
            <option value="" disabled>--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[1];?>
--</option>
        </select>
        <span class="ds_arrow"> - </span>
        <select class="input-medium" name="p3" id="p3" multiple="multiple" size="10">
            <option value="" disabled>--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[2];?>
--</option>
        </select>
        <span class="ds_arrow"> - </span>
        <select class="input-medium" name="p4" id="p4" multiple="multiple" size="10">
            <option value="" disabled>--<?php echo $_smarty_tpl->tpl_vars['areaName']->value[3];?>
--</option>
        </select>
    </div>
    <p style="padding: 5px 0 0 15px; color: #999;"><i class="icon-question-sign" style="margin-top: 3px;"></i><small>按Ctrl/Shift键可多选，单选可以加载下级城市，多选只能开通当前选中的城市！</small></p>
    <?php }?>
  </form>
<?php echo '</script'; ?>
>


<?php echo '<script'; ?>
 id="editForm" type="text/html">
  <form action="" class="quick-editForm" name="editForm">
    <dl class="clearfix">
      <dt class="statusTips" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="关闭后，移动端将不再自动定位当前分站并隐藏选择分站页面的当前定位"><i class="icon-question-sign" style="margin-top: 3px;"></i> 自动定位：</dt>
      <dd><label><input type="radio" name="auto_location" value="0"<?php if (!$_smarty_tpl->tpl_vars['cfg_auto_location']->value) {?> checked<?php }?>>开启</label><label style="margin-left: 15px;"><input type="radio" name="auto_location" value="1"<?php if ($_smarty_tpl->tpl_vars['cfg_auto_location']->value) {?> checked<?php }?>>关闭</label></dd>
    </dl>
    <dl class="clearfix">
      <dt class="statusTips" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="举例说明：开通了苏州分站，再开通昆山（归属于苏州管辖的县级市）分站，此时是否需要隐藏苏州分站下的昆山区域"><i class="icon-question-sign" style="margin-top: 3px;"></i> 重复区域：</dt>
      <dd><label><input type="radio" name="state" value="1"<?php if ($_smarty_tpl->tpl_vars['cfg_sameAddr_state']->value) {?> checked<?php }?>>显示</label><label style="margin-left: 15px;"><input type="radio" name="state" value="0"<?php if (!$_smarty_tpl->tpl_vars['cfg_sameAddr_state']->value) {?> checked<?php }?>>隐藏</label></dd>
    </dl>
    <dl class="clearfix">
      <dt class="statusTips" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="此功能只在移动端生效；默认为按分站城市的首字母排序显示；按省为优先显示省份信息，点击省份再显示下级分站城市；注意：按省分组后，前台页面分站选择功能必须点到最后一级，比如：开通了[苏州]分站，又开通了[苏州]的下级城市[吴江]分站，这种情况[苏州]站将失效，必须选择进入到[吴江]！"><i class="icon-question-sign" style="margin-top: 3px;"></i> 城市分组：</dt>
      <dd><label><input type="radio" name="group" value="0"<?php if (!$_smarty_tpl->tpl_vars['cfg_sameAddr_group']->value) {?> checked<?php }?>>默认</label><label style="margin-left: 15px;"><input type="radio" name="group" value="1"<?php if ($_smarty_tpl->tpl_vars['cfg_sameAddr_group']->value) {?> checked<?php }?>>按省</label></dd>
    </dl>
    <dl class="clearfix">
      <dt class="statusTips" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="当选择按省分组时，切换城市页面的热门城市将显示当前定位城市的周边指定范围内的分站信息，如果周边没有开通的分站，则恢复显示热门城市；"><i class="icon-question-sign" style="margin-top: 3px;"></i> 周边范围：</dt>
      <dd><input class="input-mini" type="text" name="nearby" id="nearby" value="<?php echo $_smarty_tpl->tpl_vars['cfg_sameAddr_nearby']->value;?>
" /> 公里</dd>
    </dl>
  </form>
<?php echo '</script'; ?>
>


<?php echo '<script'; ?>
>var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", subdomain = '<?php echo $_smarty_tpl->tpl_vars['basehost']->value;?>
', token = '<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
', domainArr = <?php echo $_smarty_tpl->tpl_vars['domainArr']->value;?>
, areaName_0 = '<?php echo $_smarty_tpl->tpl_vars['areaName']->value[0];?>
', areaName_1 = '<?php echo $_smarty_tpl->tpl_vars['areaName']->value[1];?>
', areaName_2 = '<?php echo $_smarty_tpl->tpl_vars['areaName']->value[2];?>
', areaName_3 = '<?php echo $_smarty_tpl->tpl_vars['areaName']->value[3];?>
';<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

<?php echo '<script'; ?>
 type="text/javascript">
    $(function(){
        $('.statusTips').tooltip();
    })
<?php echo '</script'; ?>
>
</body>
</html>
<?php }} ?>
