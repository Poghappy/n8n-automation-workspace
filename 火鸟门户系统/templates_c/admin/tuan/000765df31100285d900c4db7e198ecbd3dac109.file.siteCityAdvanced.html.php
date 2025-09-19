<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:24:45
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCityAdvanced.html" */ ?>
<?php /*%%SmartyHeaderCode:154318662068860c7d8f14a2-39001032%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '000765df31100285d900c4db7e198ecbd3dac109' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/siteCityAdvanced.html',
      1 => 1753596884,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '154318662068860c7d8f14a2-39001032',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'thumbSize' => 0,
    'thumbType' => 0,
    'adminPath' => 0,
    'action' => 0,
    'cfg_staticVersion' => 0,
    'cid' => 0,
    'token' => 0,
    'moduleArr' => 0,
    'm' => 0,
    'config' => 0,
    'cfg_attachment' => 0,
    'touchTemplate' => 0,
    'badWeatherStateArr' => 0,
    'key' => 0,
    'item' => 0,
    'installModuleArr' => 0,
    'editorFile' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860c7dab8013_14723621',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860c7dab8013_14723621')) {function content_68860c7dab8013_14723621($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>城市分站高级设置</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<?php echo '<script'; ?>
>
    var thumbSize = <?php echo $_smarty_tpl->tpl_vars['thumbSize']->value;?>
, thumbType = "<?php echo $_smarty_tpl->tpl_vars['thumbType']->value;?>
", adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", modelType = action = "<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
", cfg_staticVersion = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
', cid = <?php echo $_smarty_tpl->tpl_vars['cid']->value;?>
;
<?php echo '</script'; ?>
>
<style>
    .advanced {margin-top: 10px; padding-bottom: 20px;}
	.modulelist {position: relative; float: left; margin-left: 20px; width: 183px;}
    .modulelist ul {padding: 0; margin: 0;}
    .modulelist li {width: 85px; float: left; height: 35px; line-height: 35px; background: #c4c4c4; font-size: 14px; margin: 0 1px 1px 0; list-style: none;}
    .modulelist li a {display: block; padding: 0 12px; color: #fff; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;}
    .modulelist li.current {background: #2c75e9;}
    .main {position: relative; overflow: hidden; padding-left: 15px;}
    .tpl-list {padding: 0;}
    .tpl-list h5 {margin: 0;}
</style>
</head>

<body>
<div class="alert alert-success" style="margin:10px 90px 0 20px"><button type="button" class="close" data-dismiss="alert">×</button>提示：此处配置留空不影响使用，系统将调用默认配置信息！</div>

<form action="" method="post" name="editform" id="editform" class="advanced editform clearfix">
    <input type="hidden" name="action" value="<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
" />
    <input type="hidden" name="cid" value="<?php echo $_smarty_tpl->tpl_vars['cid']->value;?>
" />
    <input type="hidden" name="token" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
    <div class="modulelist">
        <ul class="clearfix">
            <li<?php if ($_smarty_tpl->tpl_vars['action']->value=='siteConfig') {?> class="current"<?php }?>><a href="?cid=<?php echo $_smarty_tpl->tpl_vars['cid']->value;?>
&action=siteConfig">系统设置</a></li>
            <li<?php if ($_smarty_tpl->tpl_vars['action']->value=='business') {?> class="current"<?php }?>><a href="?cid=<?php echo $_smarty_tpl->tpl_vars['cid']->value;?>
&action=business">商家设置</a></li>
            <?php  $_smarty_tpl->tpl_vars['m'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['m']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['moduleArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['m']->key => $_smarty_tpl->tpl_vars['m']->value) {
$_smarty_tpl->tpl_vars['m']->_loop = true;
?>
            <li<?php if ($_smarty_tpl->tpl_vars['action']->value==$_smarty_tpl->tpl_vars['m']->value['name']) {?> class="current"<?php }?>><a href="?cid=<?php echo $_smarty_tpl->tpl_vars['cid']->value;?>
&action=<?php echo $_smarty_tpl->tpl_vars['m']->value['name'];?>
" title="<?php echo $_smarty_tpl->tpl_vars['m']->value['title'];?>
"><?php echo $_smarty_tpl->tpl_vars['m']->value['title'];?>
</a></li>
            <?php } ?>
        </ul>
    </div>

    <div class="main">
		<?php if ($_smarty_tpl->tpl_vars['action']->value!='siteConfig'&&$_smarty_tpl->tpl_vars['action']->value!='business') {?>
		<dl class="clearfix">
            <dt><label for="state" class="sl">模块开关：</label></dt>
            <dd>
                <label><input type="radio" name="state" value="0"<?php if (!$_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['state']) {?> checked<?php }?> />启用</label>&nbsp;&nbsp;&nbsp;&nbsp;
                <label><input type="radio" name="state" value="1"<?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['state']) {?> checked<?php }?> />停用</label>
            </dd>
        </dl>
		<?php }?>


        <?php if ($_smarty_tpl->tpl_vars['action']->value=='siteConfig') {?>
        <dl class="clearfix">
            <dt><label for="webname" class="sl">seo标题：</label></dt>
            <dd>
                <input class="input-xxlarge" type="text" name="webname" id="webname" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['webname'];?>
" data-regex=".*" />
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="keywords" class="sl">seo关键词：</label></dt>
            <dd>
                <input class="input-xxlarge" type="text" name="keywords" id="keywords" placeholder="一般不超过100个字" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['keywords'];?>
" data-regex=".*" />
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="description" class="sl">seo描述：</label></dt>
            <dd>
                <textarea name="description" id="description" placeholder="一般不超过200个字" data-regex=".{0,200}"><?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['description'];?>
</textarea>
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label class="sl">自定义LOGO：</label></dt>
            <dd class="thumb fn-clear listImgBox fn-hide">
                <div class="uploadinp filePicker thumbtn<?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['weblogo']!='') {?> hide<?php }?>" id="filePicker1" data-type="logo"  data-count="1" data-size="<?php echo $_smarty_tpl->tpl_vars['thumbSize']->value;?>
" data-imglist=""><div></div><span></span></div>
                <?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['weblogo']!='') {?>
                <ul id="listSection1" class="listSection thumblist fn-clear" style="display:inline-block;"><li id="WU_FILE_0_1"><a href='<?php echo $_smarty_tpl->tpl_vars['cfg_attachment']->value;
echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['weblogo'];?>
' target="_blank" title=""><img alt="" src="<?php echo $_smarty_tpl->tpl_vars['cfg_attachment']->value;
echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['weblogo'];?>
" data-val="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['weblogo'];?>
"/></a><a class="reupload li-rm" href="javascript:;">删除图片</a></li></ul>
                <?php } else { ?>
                <ul id="listSection1" class="listSection thumblist fn-clear"></ul>
                <?php }?>
                <input type="hidden" name="litpic" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['weblogo'];?>
" class="imglist-hidden" id="litpic">
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="hotline" class="sl">咨询热线：</label></dt>
            <dd>
                <input class="input-large" type="text" name="hotline" id="hotline" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['hotline'];?>
" data-regex=".*" />
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="areaCode" class="sl">电话区号：</label></dt>
            <dd>
                <input class="input-small" type="text" name="areaCode" id="areaCode" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['areaCode'];?>
" data-regex=".*" />
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label class="sl">版权信息：</label></dt>
            <dd>
                <?php echo '<script'; ?>
 id="powerby" name="powerby" type="text/plain" style="width:95.4%; height:200px;"><?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['powerby'];?>
<?php echo '</script'; ?>
>
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="statisticscode" class="sl">统计代码：</label></dt>
            <dd>
                <textarea name="statisticscode" id="statisticscode" style="width: 90%; height: 150px;" placeholder="在第三方网站上注册并获得统计代码"><?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['statisticscode'];?>
</textarea>
            </dd>
        </dl>
        <?php } else { ?>
        <dl class="clearfix">
            <dt><label for="title" class="sl">seo标题：</label></dt>
            <dd>
                <input class="input-xxlarge" type="text" name="title" id="title" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['title'];?>
" data-regex=".*" />
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="keywords" class="sl">seo关键词：</label></dt>
            <dd>
                <input class="input-xxlarge" type="text" name="keywords" id="keywords" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['keywords'];?>
" data-regex=".*" />
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label for="description" class="sl">seo描述：</label></dt>
            <dd>
                <textarea name="description" id="description" placeholder="一般不超过200个字" data-regex=".{0,200}"><?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['description'];?>
</textarea>
            </dd>
        </dl>
        <dl class="clearfix">
            <dt><label class="sl">自定义LOGO：</label></dt>
            <dd class="thumb fn-clear listImgBox fn-hide">
                <div class="uploadinp filePicker thumbtn<?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['logo']!='') {?> hide<?php }?>" id="filePicker1" data-type="logo"  data-count="1" data-size="<?php echo $_smarty_tpl->tpl_vars['thumbSize']->value;?>
" data-imglist=""><div></div><span></span></div>
                <?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['logo']!='') {?>
                <ul id="listSection1" class="listSection thumblist fn-clear" style="display:inline-block;"><li id="WU_FILE_0_1"><a href='<?php echo $_smarty_tpl->tpl_vars['cfg_attachment']->value;
echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['logo'];?>
' target="_blank" title=""><img alt="" src="<?php echo $_smarty_tpl->tpl_vars['cfg_attachment']->value;
echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['logo'];?>
" data-val="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['logo'];?>
"/></a><a class="reupload li-rm" href="javascript:;">删除图片</a></li></ul>
                <?php } else { ?>
                <ul id="listSection1" class="listSection thumblist fn-clear"></ul>
                <?php }?>
                <input type="hidden" name="litpic" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['logo'];?>
" class="imglist-hidden" id="litpic">
            </dd>
        </dl>
        <dl class="clearfix">
            <dt></dt>
            <dd>
                <span class="input-tips" style="display: block;"><s></s>注意：请先确认模块设置中是否开启了LOGO自定义选项！</span>
            </dd>
        </dl>
        <?php if ($_smarty_tpl->tpl_vars['action']->value!='business') {?>
        <dl class="clearfix">
            <dt><label for="hotline" class="sl">咨询热线：</label></dt>
            <dd>
                <input class="input-large" type="text" name="hotline" id="hotline" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['hotline'];?>
" data-regex=".*" />
                <span class="input-tips" style="display: inline-block;"><s></s>注意：请先确认模块设置中是否开启了咨询热线自定义选项！</span>
            </dd>
        </dl>
        <?php } else { ?>
        <dl class="clearfix">
            <dt><label for="short_video_promote">短视频推广口令：</label></dt>
            <dd>
              <textarea class="input-xxlarge" rows="3" name="short_video_promote" id="short_video_promote" placeholder="复制抖音/快手等短视频平台的分享链接，用户访问商家店铺主页或者买单页面，会自动记录推广信息，打开抖音或者快手时会有弹窗推广信息展示！" data-regex=".{0,250}"><?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['short_video_promote'];?>
</textarea>
              <span class="input-tips"><s></s>商家可自定义推广信息</span>
            </dd>
          </dl>
        <?php }?>
        <?php }?>
        <div id="tplList">
            <dl class="clearfix">
                <dt><label class="sl">模板风格：</label></dt>
                <dd>
                    <div class="tpl-list">
                        <h5 class="stit"><span class="label label-info">电脑端：</span><?php if ($_smarty_tpl->tpl_vars['action']->value!='siteConfig') {?><label class="routerTips" data-toggle="tooltip" data-placement="bottom" data-original-title="如果模板使用了自定义路由，请勾选此项，程序将不再对url地址做任何拦截处理，选择使用的模板名称前如果有vue标识，表示需要开启此项！"><input type="checkbox" id="router" name="router" value="1"<?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['router']==1) {?> checked<?php }?> />开启自定义路由 <i class="icon-question-sign"></i></label><?php }?></h5>
                        <select class="copyTemplate" id="defaultTplList" data-type="">
                            <option value="">请选择要复制的模板</option>
                        </select>
                        <ul class="clearfix" id="tplListUl"></ul>
                        <input type="hidden" name="template" id="template" value="" />
                    </div>
                    <div class="tpl-list touch">
                        <h5 class="stit"><span class="label label-warning">H5端：</span><?php if ($_smarty_tpl->tpl_vars['action']->value!='siteConfig') {?><label class="routerTips" data-toggle="tooltip" data-placement="bottom" data-original-title="如果模板使用了自定义路由，请勾选此项，程序将不再对url地址做任何拦截处理，选择使用的模板名称前如果有vue标识，表示需要开启此项！"><input type="checkbox" id="touchRouter" name="touchRouter" value="1"<?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['touchRouter']==1) {?> checked<?php }?> />开启自定义路由 <i class="icon-question-sign"></i></label><?php }?></h5>
                        <select class="copyTemplate" id="touchDefaultTplList" data-type="touch">
                            <option value="">请选择要复制的模板</option>
                        </select>
                        <ul class="clearfix" id="touchTplListUl"></ul>
                        <input type="hidden" name="touchTemplate" id="touchTemplate" value="<?php echo $_smarty_tpl->tpl_vars['touchTemplate']->value;?>
" />
                    </div>
                </dd>
            </dl>
        </div>


    <?php if ($_smarty_tpl->tpl_vars['action']->value=='waimai') {?>

    <dl class="clearfix">
        <dt><label for="cityDispatch" class="sl">自动派单：</label></dt>
        <dd>
            <label><input type="checkbox" name="cityDispatch" value="1"<?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cityDispatch']) {?> checked<?php }?> />停用</label>
        </dd>
    </dl>

    <dl class="clearfix">
        <dt><label for="paotuiServiceMoney">跑腿服务费：</label></dt>
        <dd>
            <input class="input-large" type="number" min="0" name="paotuiServiceMoney" id="paotuiServiceMoney" maxlength="2" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['serviceMoney'];?>
" /> 元
        </dd>
    </dl>
    <div class="split_line" style="margin: 20px 0; border-bottom: solid 1px #eee;" ></div>
    <dl class="clearfix">
        <dt><label for="badWeatherStateArr" class="sl">是否开启恶劣天气：</label></dt>
        <dd>

            <?php  $_smarty_tpl->tpl_vars["item"] = new Smarty_Variable; $_smarty_tpl->tpl_vars["item"]->_loop = false;
 $_smarty_tpl->tpl_vars["key"] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['badWeatherStateArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars["item"]->key => $_smarty_tpl->tpl_vars["item"]->value) {
$_smarty_tpl->tpl_vars["item"]->_loop = true;
 $_smarty_tpl->tpl_vars["key"]->value = $_smarty_tpl->tpl_vars["item"]->key;
?>
            <label><input type="radio" name="badWeatherState" value="<?php echo $_smarty_tpl->tpl_vars['key']->value;?>
"<?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['badWeatherState']==$_smarty_tpl->tpl_vars['key']->value) {?> checked<?php }?> /><?php echo $_smarty_tpl->tpl_vars['item']->value;?>
</label><?php if ($_smarty_tpl->tpl_vars['key']->value>=(count($_smarty_tpl->tpl_vars['badWeatherStateArr']->value)-1)) {?>&nbsp;&nbsp;&nbsp;&nbsp;<?php }?>
            <?php } ?>
            <!-- <label><input type="radio" name="state" value="1"<?php if ($_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['state']) {?> checked<?php }?> />停用</label> -->
        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label for="paotuiServiceMoney">恶劣天气费用增加：</label></dt>
        <dd>
            <div class="input-append"><input class="span1 price" type="number" name="badWeatherMoney" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['badWeatherMoney'];?>
"><span class="add-on">元</span></div>
        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label for="paotuiServiceMoney">开始时间：</label></dt>
        <dd>
            <input class="input-large" type="text" name="badWeatherStart" id="badWeatherStart" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['badWeatherStart'];?>
" /> 
        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label for="paotuiServiceMoney">结束时间：</label></dt>
        <dd>
            <input class="input-large" type="text" name="badWeatherEnd" id="badWeatherEnd" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['badWeatherEnd'];?>
" /> 
        </dd>
    </dl>
    <?php }?>


    <?php if ($_smarty_tpl->tpl_vars['action']->value=='siteConfig') {?>
    <dl class="clearfix">
        <dt><label>结算佣金比例：</label></dt>
        <dd>
            <div class="input-prepend input-append">
                <span class="add-on">打赏佣金</span>
                <input class="input-mini" type="text" name="fzrewardFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzrewardFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>

            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">商家买单</span>
                <input class="input-mini" type="text" name="fzbusinessMaidanFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzbusinessMaidanFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>

            <?php if (in_array("tuan",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">团购佣金</span>
                <input class="input-mini" type="text" name="fztuanFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fztuanFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("travel",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">旅游佣金</span>
                <input class="input-mini" type="text" name="fztravelFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fztravelFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("job",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">招聘佣金</span>
                <input class="input-mini" type="text" name="fzjobFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzjobFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("homemaking",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">家政佣金</span>
                <input class="input-mini" type="text" name="fzhomemakingFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzhomemakingFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("education",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append">
                <span class="add-on">教育佣金</span>
                <input class="input-mini" type="text" name="fzeducationFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzeducationFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div><br />
            <?php }?>
            <?php if (in_array("shop",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">商城佣金</span>
                <input class="input-mini" type="text" name="fzshopFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzshopFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("waimai",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">外卖佣金</span>
                <input class="input-mini" type="text" name="fzwaimaiFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzwaimaiFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">跑腿佣金</span>
                <input class="input-mini" type="text" name="fzwaimaiPaotuiFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzwaimaiPaotuiFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("huodong",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">活动佣金</span>
                <input class="input-mini" type="text" name="fzhuodongFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzhuodongFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("live",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">直播佣金</span>
                <input class="input-mini" type="text" name="fzliveFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzliveFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("video",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">视频佣金</span>
                <input class="input-mini" type="text" name="fzvideoFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzvideoFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <?php if (in_array("awardlegou",$_smarty_tpl->tpl_vars['installModuleArr']->value)) {?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">有奖乐购佣金</span>
                <input class="input-mini" type="text" name="fzawardlegouFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fzawardlegouFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <?php }?>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">刷新置顶佣金</span>
                <input class="input-mini" type="text" name="roofFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_roofFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">房产经纪人套餐分佣</span>
                <input class="input-mini" type="text" name="setmealFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_setmealFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">发布信息佣金</span>
                <input class="input-mini" type="text" name="fabulFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fabulFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">会员升级佣金</span>
                <input class="input-mini" type="text" name="levelFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_levelFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">商家入驻佣金</span>
                <input class="input-mini" type="text" name="storeFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_storeFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">分销商入驻佣金</span>
                <input class="input-mini" type="text" name="fenxiaoFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_fenxiaoFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">激励佣金</span>
                <input class="input-mini" type="text" name="jiliFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_jiliFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
            <div class="input-prepend input-append" style="display:block;">
                <span class="add-on">付费查看电话佣金 </span>
                <input class="input-mini" type="text" name="payPhoneFee" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['cfg_payPhoneFee'];?>
">
                <span class="add-on" style="display: inline-block;">%</span>
            </div>
        </dd>
    </dl>
    <div class="thead" style="margin-top: 20px;">&nbsp;&nbsp;绑定独立小程序（使用该功能前，请先确认是否已经购买分站独立小程序服务，以及将该小程序绑定到微信开放平台！）</div>
    <dl class="clearfix">
        <dt><label for="miniProgramName" class="sl">小程序名称：</label></dt>
        <dd>
        <input class="input-xlarge" type="text" name="miniProgramName" id="miniProgramName" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['miniProgramName'];?>
" data-regex=".*" />
        <span class="input-tips"><s></s>请输入小程序名称</span>
        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label for="miniProgramAppid">小程序AppID：</label></dt>
        <dd>
            <input class="input-xlarge" type="text" name="miniProgramAppid" id="miniProgramAppid" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['miniProgramAppid'];?>
" data-regex=".*" />
            <span class="input-tips"><s></s>请输入小程序AppID</span>
        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label for="miniProgramAppsecret">小程序AppSecret：</label></dt>
        <dd>
            <input class="input-xlarge" type="text" name="miniProgramAppsecret" id="miniProgramAppsecret" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['miniProgramAppsecret'];?>
" data-regex=".*" />
            <span class="input-tips"><s></s>请输入小程序AppSecret</span>
        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label for="miniProgramId">原始ID：</label></dt>
        <dd>
            <input class="input-xlarge" type="text" name="miniProgramId" id="miniProgramId" value="<?php echo $_smarty_tpl->tpl_vars['config']->value[$_smarty_tpl->tpl_vars['action']->value]['miniProgramId'];?>
" data-regex=".*" />
            <span class="input-tips"><s></s>请输入小程序原始ID</span>
        </dd>
    </dl>
    <?php }?>

        <dl class="clearfix formbtn">
            <dt>&nbsp;</dt>
            <dd><input class="btn btn-large btn-success" type="submit" name="submit" id="btnSubmit" value="确认提交" /></dd>
        </dl>
    </div>
</form>

<?php echo $_smarty_tpl->tpl_vars['editorFile']->value;?>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
