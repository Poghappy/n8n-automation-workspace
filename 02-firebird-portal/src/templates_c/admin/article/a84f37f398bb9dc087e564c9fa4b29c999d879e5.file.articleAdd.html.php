<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:07:09
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/article/articleAdd.html" */ ?>
<?php /*%%SmartyHeaderCode:17668310676886085df1e0e9-83826249%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'a84f37f398bb9dc087e564c9fa4b29c999d879e5' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/article/articleAdd.html',
      1 => 1753593716,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '17668310676886085df1e0e9-83826249',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'pagetitle' => 0,
    'cssFile' => 0,
    'mold' => 0,
    'thumbSize' => 0,
    'thumbType' => 0,
    'atlasSize' => 0,
    'atlasType' => 0,
    'imglist' => 0,
    'typeListArr' => 0,
    'action' => 0,
    'adminPath' => 0,
    'cfg_staticPath' => 0,
    'cityid' => 0,
    'cityList' => 0,
    'id' => 0,
    'videotype' => 0,
    'media' => 0,
    'media_arctype' => 0,
    'typeMediaListArr' => 0,
    'auditConfig' => 0,
    'dopost' => 0,
    'token' => 0,
    'mold_val' => 0,
    'mold_name' => 0,
    'title' => 0,
    'color' => 0,
    'subtitle' => 0,
    'typename' => 0,
    'typeid' => 0,
    'flag' => 0,
    'flagList' => 0,
    'flagitem' => 0,
    'flags' => 0,
    'redirecturl' => 0,
    'click' => 0,
    'weight' => 0,
    'litpic' => 0,
    'cfg_attachment' => 0,
    'typeset_val' => 0,
    'typeset' => 0,
    'typeset_name' => 0,
    'mediaName' => 0,
    'admin' => 0,
    'media_arctypename' => 0,
    'prop' => 0,
    'source' => 0,
    'writer' => 0,
    'sourceurl' => 0,
    'pubdate' => 0,
    'body' => 0,
    'mbody' => 0,
    'customDelLink' => 0,
    'customAutoLitpic' => 0,
    'videotypeArr' => 0,
    'videotypeNames' => 0,
    'videourl' => 0,
    'video' => 0,
    'hour' => 0,
    'minute' => 0,
    'second' => 0,
    'keywords' => 0,
    'description' => 0,
    'postopt' => 0,
    'notpost' => 0,
    'postnames' => 0,
    'need_audit' => 0,
    'arcrankList' => 0,
    'arcrank' => 0,
    'rewardopt' => 0,
    'reward_switch' => 0,
    'rewardnames' => 0,
    'zhuantList' => 0,
    'zt' => 0,
    'zhuanti_par' => 0,
    'zhuantList2' => 0,
    'zhuanti' => 0,
    'admin_edit' => 0,
    'adminid' => 0,
    'audit_log' => 0,
    'levelID' => 0,
    'audit' => 0,
    'audit_history' => 0,
    'log' => 0,
    'audit_edit' => 0,
    'edit' => 0,
    'audioType' => 0,
    'audioSize' => 0,
    'editorFile' => 0,
    'cfg_staticVersion' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6886085e159778_78181347',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6886085e159778_78181347')) {function content_6886085e159778_78181347($_smarty_tpl) {?><?php if (!is_callable('smarty_function_html_radios')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_radios.php';
if (!is_callable('smarty_function_html_checkboxes')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_checkboxes.php';
if (!is_callable('smarty_modifier_replace')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/modifier.replace.php';
if (!is_callable('smarty_function_html_options')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_options.php';
if (!is_callable('smarty_modifier_date_format')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/modifier.date_format.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title><?php echo $_smarty_tpl->tpl_vars['pagetitle']->value;?>
</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
.content {padding:20px 50px;}
.content table {width:100%;vertical-align:middle; color:#333; font-size:14px; border-left:1px solid #d7d7d7; border-bottom:1px solid #d7d7d7;}
.content table th {height:30px; text-align:center; vertical-align:middle; font-weight:500; border:1px solid #d7d7d7; border-left:none; border-bottom:none; background:#ededed;}
.content table td {padding:5px; min-width:90px; text-align:center; vertical-align:middle; border:1px solid #d7d7d7; border-left:none; border-bottom:none; background:#fff;}
.content table td input {height:15px; margin:0;}
.content tbody > tr:nth-child(odd) > td {background-color: #f9f9f9;}
.content table tr.curr td {background: #eef6ff;}
.content table tr.cancel td, .content table tr.cancel td span {color:#eee !important;}
.content p {margin-top:30px;text-align: center;}
.variable.article_prop{display: block !important;}
.variable.variable-<?php echo $_smarty_tpl->tpl_vars['mold']->value;?>
 {display: block;}
.variable.variable-<?php echo $_smarty_tpl->tpl_vars['mold']->value;?>
.inline {display: inline;}
#listSection1:empty + input + .fg {height:30px;}

/*下拉搜索select2.js覆盖样式*/
.select2-container .select2-choice {height:32px !important;line-height: 32px !important;font-size: 14px;background-image:none !important;
  border-radius: 2px !important;
  background-color: #fff!important;
    border: 1px solid #ccc !important;
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,0.075)!important;
    -moz-box-shadow: inset 0 1px 1px rgba(0,0,0,0.075)!important;
    box-shadow: inset 0 1px 1px rgba(0,0,0,0.075);!important}
.select2-container .select2-choice div {border-radius: 0 2px 2px 0 !important;}

#media_manager + span {display: none;font-size: 14px;}
#media_manager.show {display: inline !important;}
#media_manager.show + span {display: inline;}
.editform .clearfix>dd.fn-clear{overflow: visible;}
.fn-left{float: left; margin-left: 10px;}
.fn-clear::after{clear: both; content: ''; display: block; }
/* .leftOff dd{transform: translateX(-50px);} */
.forSource{display: none !important;}
.reEditItemInfo{display: none;}
.editInfoBox.reEdit .forSource{display: inline-block  !important;}
.editInfoBox.reEdit .reEditItemInfo{display: block  !important;}
.editInfoBox.reEdit .forWriter{display: none;}
</style>
<?php echo '<script'; ?>
>
var thumbSize = <?php echo $_smarty_tpl->tpl_vars['thumbSize']->value;?>
, thumbType = "<?php echo $_smarty_tpl->tpl_vars['thumbType']->value;?>
",  //缩略图配置
	atlasSize = <?php echo $_smarty_tpl->tpl_vars['atlasSize']->value;?>
, atlasType = "<?php echo $_smarty_tpl->tpl_vars['atlasType']->value;?>
", atlasMax = 0;  //图集配置
var imglist = {"list1": <?php echo $_smarty_tpl->tpl_vars['imglist']->value;?>
,},
	typeListArr = <?php echo $_smarty_tpl->tpl_vars['typeListArr']->value;?>
, action = '<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
', modelType = '<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
',
	cfg_term = "pc", adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", staticPath = '<?php echo $_smarty_tpl->tpl_vars['cfg_staticPath']->value;?>
';
var cityid = <?php echo $_smarty_tpl->tpl_vars['cityid']->value;?>
, cityList = <?php echo $_smarty_tpl->tpl_vars['cityList']->value;?>
;
var id = <?php echo (($tmp = @$_smarty_tpl->tpl_vars['id']->value)===null||$tmp==='' ? 0 : $tmp);?>
;
var mold = <?php echo $_smarty_tpl->tpl_vars['mold']->value;?>
;
var detail = {
  videotype: <?php echo (($tmp = @$_smarty_tpl->tpl_vars['videotype']->value)===null||$tmp==='' ? 0 : $tmp);?>
,
  media: <?php echo (($tmp = @$_smarty_tpl->tpl_vars['media']->value)===null||$tmp==='' ? 0 : $tmp);?>
,
  media_arctype: <?php echo (($tmp = @$_smarty_tpl->tpl_vars['media_arctype']->value)===null||$tmp==='' ? 0 : $tmp);?>

};
var typeMediaListArr = <?php echo $_smarty_tpl->tpl_vars['typeMediaListArr']->value;?>
;
<?php echo '</script'; ?>
>
</head>

<body>
<?php if ($_smarty_tpl->tpl_vars['auditConfig']->value['switch']&&$_smarty_tpl->tpl_vars['id']->value) {?>
<div class="btn-group config-nav" data-toggle="buttons-radio" style="margin-bottom:15px;">
  <button type="button" class="btn active" data-type="info">信息内容</button>
  <button type="button" class="btn" data-type="audit">审核流程</button>
  <button type="button" class="btn" data-type="editLog">修改记录</button>
</div>
<?php }?>
<div class="item">
  <form action="" method="post" name="editform" id="editform" class="editform">
    <input type="hidden" name="dopost" id="dopost" value="<?php echo $_smarty_tpl->tpl_vars['dopost']->value;?>
" />
    <input type="hidden" name="id" id="id" value="<?php echo $_smarty_tpl->tpl_vars['id']->value;?>
" />
    <input type="hidden" name="token" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
    <dl class="clearfix">
      <dt><label for="module">城市：</label></dt>
      <dd style="overflow: visible; padding-left: 140px;" >
        <!-- <select class="chosen-select" id="cityid" name="cityid" style="width: auto; min-width: 150px;"></select> -->
		<div class="choseCity">
			<input type="hidden" id="cityid" name="cityid" placeholder="请选择城市分站" value="<?php echo $_smarty_tpl->tpl_vars['cityid']->value;?>
">
		</div>

      </dd>
    </dl>



    <dl class="clearfix">
      <dt>新闻类型：</dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"mold",'values'=>$_smarty_tpl->tpl_vars['mold_val']->value,'checked'=>$_smarty_tpl->tpl_vars['mold']->value,'output'=>$_smarty_tpl->tpl_vars['mold_name']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        <!-- <span class="input-tips" style="display:inline-block;"><s></s>短视频类型仅支持在APP端上传并发布</span> -->
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="title">信息标题：</label></dt>
      <dd>
        <input class="input-xxlarge" type="text" name="title" id="title" data-regex=".{1,60}" maxlength="60" value="<?php echo $_smarty_tpl->tpl_vars['title']->value;?>
" />
        <div class="color_pick"><em style="background:<?php echo $_smarty_tpl->tpl_vars['color']->value;?>
;"></em></div>
        <span class="input-tips"><s></s>请输入信息标题，1-60个汉字</span>
        <input type="hidden" name="color" id="color" value="<?php echo $_smarty_tpl->tpl_vars['color']->value;?>
" />
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="subtitle">短标题：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="subtitle" id="subtitle" data-regex=".{0,36}" maxlength="36" value="<?php echo $_smarty_tpl->tpl_vars['subtitle']->value;?>
" />
        <span class="input-tips"><s></s>请输入简略标题，0-36个汉字</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>信息分类：</dt>
      <dd style="overflow:visible;">
        <div class="btn-group" id="typeBtn" style="margin-left:10px;">
          <button class="btn dropdown-toggle" type="button" data-toggle="dropdown"><?php echo $_smarty_tpl->tpl_vars['typename']->value;?>
<span class="caret"></span></button>
        </div>
        <input type="hidden" name="typeid" id="typeid" value="<?php echo $_smarty_tpl->tpl_vars['typeid']->value;?>
" />
        <span class="input-tips"><s></s>请选择信息分类</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>自定义属性：</dt>
      <dd class="radio"><?php echo smarty_function_html_checkboxes(array('name'=>'flags','values'=>$_smarty_tpl->tpl_vars['flag']->value,'output'=>$_smarty_tpl->tpl_vars['flagList']->value,'selected'=>$_smarty_tpl->tpl_vars['flagitem']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>
</dd>
    </dl>
    <?php if (strpos($_smarty_tpl->tpl_vars['flags']->value,'t')!==false) {?>
    <dl class="clearfix" id="rDiv">
    <?php } else { ?>
    <dl class="clearfix hide" id="rDiv">
    <?php }?>
      <dt><label for="redirecturl">跳转地址：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="redirecturl" id="redirecturl" value="<?php echo $_smarty_tpl->tpl_vars['redirecturl']->value;?>
" data-regex="[a-zA-z]+:\/\/[^\s]+" />
        <span class="input-tips"><s></s>请输入网址，以http://开头</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="click">浏览次数：</label></dt>
      <dd>
        <span><input class="input-mini" type="number" name="click" min="0" id="click" value="<?php echo $_smarty_tpl->tpl_vars['click']->value;?>
" /></span>
        <label class="ml30" for="weight">排序：</label><input class="input-mini" type="number" name="weight" id="weight" min="1" data-regex="[1-9]\d*" value="<?php echo $_smarty_tpl->tpl_vars['weight']->value;?>
" />
        <span class="input-tips"><s></s>必填，排序越大，越排在前面</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>缩略图：</dt>
  		<dd class="thumb clearfix listImgBox">
  			<div class="uploadinp filePicker thumbtn<?php if ($_smarty_tpl->tpl_vars['litpic']->value!='') {?> hide<?php }?>" id="filePicker1" data-type="thumb"  data-count="1" data-size="<?php echo $_smarty_tpl->tpl_vars['thumbSize']->value;?>
" data-imglist=""><div></div><span></span></div>
  			<?php if ($_smarty_tpl->tpl_vars['litpic']->value!='') {?>
  			<ul id="listSection1" class="listSection thumblist clearfix" style="display:inline-block;"><li id="WU_FILE_0_1"><a href='<?php echo $_smarty_tpl->tpl_vars['cfg_attachment']->value;
echo rawurlencode($_smarty_tpl->tpl_vars['litpic']->value);?>
' target="_blank" title=""><img alt="" src="<?php echo $_smarty_tpl->tpl_vars['cfg_attachment']->value;
echo rawurlencode($_smarty_tpl->tpl_vars['litpic']->value);?>
" data-val="<?php echo $_smarty_tpl->tpl_vars['litpic']->value;?>
"/></a><a class="reupload li-rm" href="javascript:;">删除图片</a></li></ul>
  			<?php } else { ?>
  			<ul id="listSection1" class="listSection thumblist clearfix"></ul>
  			<?php }?>
  			<input type="hidden" name="litpic" value="<?php echo $_smarty_tpl->tpl_vars['litpic']->value;?>
" class="imglist-hidden" id="litpic">
        <div class="clearfix fg"></div>
        <p class="variable variable-2 variable-3" style="font-size:14px;color:#999;">本地上传视频时如果不上传缩略图，系统将在提交后自动生成（会有一定延时，如果附件使用远程服务器，需要设置允许跨域请求）</p>
  		</dd>
    </dl>
    <dl class="clearfix variable variable-0">
      <dt>排版方式：</dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"typeset",'values'=>$_smarty_tpl->tpl_vars['typeset_val']->value,'checked'=>$_smarty_tpl->tpl_vars['typeset']->value,'output'=>$_smarty_tpl->tpl_vars['typeset_name']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="media">所属自媒体：</label></dt>
      <dd class="fn-clear">
        <div class="fn-left">
          <input class="input-medium inpBox floatDiv" type="text"  id="mediaText" value="<?php echo $_smarty_tpl->tpl_vars['mediaName']->value;?>
" autocomplete="off" />
          <input name="media" type="hidden" id="media" style="width: 305px" value="<?php echo $_smarty_tpl->tpl_vars['media']->value;?>
" data-value="<?php echo $_smarty_tpl->tpl_vars['mediaName']->value;?>
" />
          <div id="media_list" class="popup_key"></div>
        </div>
        <div class="fn-left">
          <label for="">&nbsp;&nbsp;对应会员：</label>
          <input type="hidden" name="admin" id="admin" value="<?php echo $_smarty_tpl->tpl_vars['admin']->value;?>
" />
          <span class="input-tips"><s></s>请输入网站对应会员名</span>
          <select id="media_manager" class="show">
            <option value="">请先选择所属自媒体</option>
          </select>
        </div>
      
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>栏目：</dt>
      <dd style="overflow:visible;">
        <div class="btn-group" id="typeMediaBtn" style="margin-left:10px;">
          <button class="btn dropdown-toggle" type="button" data-toggle="dropdown"><?php echo $_smarty_tpl->tpl_vars['media_arctypename']->value;?>
<span class="caret"></span></button>
        </div>
        <input type="hidden" name="media_arctype" id="media_arctype" value="<?php echo $_smarty_tpl->tpl_vars['media_arctype']->value;?>
" />
        <span class="input-tips" style="display:inline-block;"><s></s>政企号才有此功能</span>
      </dd>
    </dl>
    <dl class="clearfix variable variable-0 article_prop">
      <dt>性质：</dt>
      <dd class="radio">
        <label><input type="radio" name="article_prop" value="0"<?php if ($_smarty_tpl->tpl_vars['prop']->value==0) {?> checked="checked"<?php }?>>原创</label>&nbsp;&nbsp;
        <label><input type="radio" name="article_prop" value="1"<?php if ($_smarty_tpl->tpl_vars['prop']->value==1) {?> checked="checked"<?php }?>>转载/二改</label>&nbsp;&nbsp;
      </dd>
    </dl>
    <div class="editInfoBox <?php if ($_smarty_tpl->tpl_vars['source']->value) {?>reEdit<?php }?>">
      <dl class="clearfix leftOff ">
        <dt class="forSource"><label for="source">来源：</label></dt>
        <dt class="forWriter"><label for="writer">编辑：</label></dt>
        <dd class="fn-clear">
          <div class="fn-left forSource">
            
            <input class="input-medium" type="text" name="source" id="source" placeholder="信息来源" value="<?php echo $_smarty_tpl->tpl_vars['source']->value;?>
" /><button type="button" class="btn chooseData" data-type="source">选择</button>
          
          </div>
          <div class="fn-left">
            <label for="writer" class="ml30 forSource">编辑：</label>
            <input class="input-xlarge" type="text" name="writer" id="writer" placeholder="信息作者" value="<?php echo $_smarty_tpl->tpl_vars['writer']->value;?>
" />
          </div>
        </dd>
      </dl>
      <dl class="clearfix reEditItemInfo" >
        <dt><label for="writer">来源网址：</label></dt>
        <dd>
          <input class="input-xxlarge" type="text" name="sourceurl" id="sourceurl" placeholder="来源网址" value="<?php echo $_smarty_tpl->tpl_vars['sourceurl']->value;?>
" style="width: 425px;" />
        </dd>
      </dl>
      <dl class="clearfix">
        <dt><label for="writer">发布时间：</label></dt>
        <dd>
          <div class="input-append form_datetime" style="margin: 0;">
              <input class="input-medium" type="text" name="pubdate" id="pubdate" date-language="ch" value="<?php echo $_smarty_tpl->tpl_vars['pubdate']->value;?>
" />
              <span class="add-on"><i class="icon-time"></i></span>
            </div>
        </dd>
      </dl>
    </div>
    
    <!-- 正文 -->
    <dl class="clearfix variable variable-0<?php if ($_smarty_tpl->tpl_vars['id']->value&&($_smarty_tpl->tpl_vars['body']->value||$_smarty_tpl->tpl_vars['mbody']->value)) {?> variable-1<?php }?>">
      <dt>信息内容：</dt>
      <dd>
        <div style="padding: 3px 0 15px;">
          <label><input name="dellink" type="checkbox" id="dellink" value="1"<?php if ($_smarty_tpl->tpl_vars['customDelLink']->value) {?> checked<?php }?> />删除非站内链接</label> <small>[<a href="javascript:;" id="allowurl">配置</a>]</small>
          <label style="margin-left:15px;"><input name="autolitpic" type="checkbox" id="autolitpic" value="1"<?php if ($_smarty_tpl->tpl_vars['customAutoLitpic']->value) {?> checked<?php }?> />提取第一张图片为缩略图</label>
  		<div class="hide">
  	        分页方式：<label><input name="sptype" type="radio" value="hand" id="hand" checked="1" />手动</label>
  	                <label><input name="sptype" type="radio" value="auto" id="auto" />自动</label>
  	        大小：<input class="input-mini" name="spsize" type="text" id="spsize" value="5" size="5" /> K
  		</div>
  		</div>
        <ul class="nav nav-tabs" style="margin-bottom:5px;">
          <li class="active"><a href="#pc">电脑端</a></li>
          <li><a href="#mobile">移动端</a></li>
        </ul>
        <div id="pc">
        	<?php echo '<script'; ?>
 id="body" name="body" type="text/plain" style="width:85%;height:500px"><?php echo $_smarty_tpl->tpl_vars['body']->value;?>
<?php echo '</script'; ?>
>
        </div>
        <div id="mobile" class="hide">
        	<?php echo '<script'; ?>
 id="mbody" name="mbody" type="text/plain" style="width:85%;height:500px"><?php echo $_smarty_tpl->tpl_vars['mbody']->value;?>
<?php echo '</script'; ?>
>
        </div>
      </dd>
    </dl>
    <!-- 图集 -->
    <dl class="clearfix variable variable-1">
      <dt>信息图集：</dt>
  		<dd class="listImgBox hide">
  			<div class="list-holder">
  				<ul id="listSection2" class="clearfix listSection"></ul>
  				<input type="hidden" name="imglist" value='<?php echo $_smarty_tpl->tpl_vars['imglist']->value;?>
' class="imglist-hidden">
  			</div>
  			<div class="btn-section clearfix">
  				<div class="uploadinp filePicker" id="filePicker2" data-type="desc" data-count="999" data-size="<?php echo $_smarty_tpl->tpl_vars['atlasSize']->value;?>
" data-imglist="list1"><div id="flasHolder"></div><span>添加图片</span></div>
  				<div class="upload-tip">
  					<p><a href="javascript:;" class="hide deleteAllAtlas">删除所有</a>&nbsp;&nbsp;<?php echo smarty_modifier_replace(smarty_modifier_replace($_smarty_tpl->tpl_vars['atlasType']->value,"*.",''),";","、");?>
&nbsp;&nbsp;单张最大<?php echo $_smarty_tpl->tpl_vars['atlasSize']->value/1024;?>
M<span class="fileerror"></span></p>
  				</div>
  			</div>
  		</dd>
    </dl>
    
    <dl class="clearfix variable variable-2">
      <dt><label>视频类型：</label></dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"videotype",'values'=>$_smarty_tpl->tpl_vars['videotypeArr']->value,'checked'=>$_smarty_tpl->tpl_vars['videotype']->value,'output'=>$_smarty_tpl->tpl_vars['videotypeNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      </dd>
    </dl>
    <?php if ($_smarty_tpl->tpl_vars['videotype']->value==0) {?>
    <dl class="clearfix variable variable-2 type0">
    <?php } else { ?>
    <dl class="clearfix variable variable-2 hide type0">
    <?php }?>
      <dt>上传视频：</dt>
      <dd>
        <input name="video" type="hidden" id="video" value="<?php if (!$_smarty_tpl->tpl_vars['videotype']->value) {
echo $_smarty_tpl->tpl_vars['videourl']->value;
}?>" />
        <div class="spic<?php if (($_smarty_tpl->tpl_vars['videotype']->value==1||($_smarty_tpl->tpl_vars['video']->value==0&&$_smarty_tpl->tpl_vars['videourl']->value==''))) {?> hide<?php }?>">
          <div class="sholder" id="videoPreview">
            <?php if (!$_smarty_tpl->tpl_vars['videotype']->value&&$_smarty_tpl->tpl_vars['videourl']->value!='') {?>
              <a href="/include/videoPreview.php?f=" data-id="<?php echo $_smarty_tpl->tpl_vars['videourl']->value;?>
">预览视频</a>
            <?php }?>
          </div>
          <a href="javascript:;" class="reupload">重新上传</a>
        </div>
        <iframe src ="/include/upfile.inc.php?mod=<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
&type=video&obj=video&filetype=video" style="width:100%; height:25px;<?php if (!$_smarty_tpl->tpl_vars['videotype']->value&&$_smarty_tpl->tpl_vars['videourl']->value!='') {?> display: none;<?php }?>" scrolling="no" frameborder="0" marginwidth="0" marginheight="0"></iframe>
      </dd>
    </dl>
    <?php if ($_smarty_tpl->tpl_vars['videotype']->value==1) {?>
    <dl class="clearfix variable variable-2 type1">
    <?php } else { ?>
    <dl class="clearfix variable variable-2 hide type1">
    <?php }?>
      <dt><label for="videourl">视频地址：</label></dt>
      <dd><input class="input-xxlarge" type="text" name="videourl" id="videourl" value="<?php if ($_smarty_tpl->tpl_vars['videotype']->value==1) {
echo $_smarty_tpl->tpl_vars['videourl']->value;
}?>" placeholder="目前仅支持第三方平台的通用代码播放" /></dd>
    </dl>
    <?php if ($_smarty_tpl->tpl_vars['videotype']->value==1) {?>
    <dl class="clearfix variable variable-2 type1">
    <?php } else { ?>
    <dl class="clearfix variable variable-2 hide type1">
    <?php }?>
        <dt><label for="hour">视频时长：</label></dt>
        <dd>
        <span>
          <input class="input-mini" type="number" name="hour" min="0" id="hour" value="<?php echo $_smarty_tpl->tpl_vars['hour']->value;?>
" />小时
          <input class="input-mini" type="number" name="minute" min="0" id="minute" value="<?php echo $_smarty_tpl->tpl_vars['minute']->value;?>
" />分钟
          <input class="input-mini" type="number" name="second" min="0" id="second" value="<?php echo $_smarty_tpl->tpl_vars['second']->value;?>
" />秒
        </span>
        </dd>
    </dl>
    
    <dl class="clearfix variable variable-3">
      <dt>视频：</dt>
      <dd>
        <input name="video" type="hidden" id="video3" value="<?php echo $_smarty_tpl->tpl_vars['videourl']->value;?>
" />
        <div class="spic<?php if ($_smarty_tpl->tpl_vars['videotype']->value==1||($_smarty_tpl->tpl_vars['video']->value==0&&$_smarty_tpl->tpl_vars['videourl']->value=='')) {?> hide<?php }?>">
          <div class="sholder" id="videoPreview">
            <?php if ($_smarty_tpl->tpl_vars['videourl']->value!='') {?>
              <a href="/include/videoPreview.php?f=" data-id="<?php echo $_smarty_tpl->tpl_vars['videourl']->value;?>
">预览视频</a>
            <?php }?>
          </div>
          <a href="javascript:;" class="reupload">重新上传</a>
        </div>
        <iframe src ="/include/upfile.inc.php?mod=<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
&type=video&obj=video3&filetype=video" style="width:100%; height:25px;<?php if ($_smarty_tpl->tpl_vars['videourl']->value!='') {?> display: none;<?php }?>" scrolling="no" frameborder="0" marginwidth="0" marginheight="0"></iframe>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="keywords">关键字：</label></dt>
      <dd>
        <input class="input-xxlarge" type="text" name="keywords" id="keywords" data-regex=".{0,50}" maxlength="50" placeholder="用于搜索引擎，50汉字以内" value="<?php echo $_smarty_tpl->tpl_vars['keywords']->value;?>
" />
        <a href="javascript:;" class="autoget variable variable-0 inline" data-type="keywords">自动获取</a>
        <span class="input-tips"><s></s>用于搜索引擎，50汉字以内</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="description">内容摘要：</label></dt>
      <dd>
        <textarea name="description" id="description" placeholder="10~200汉字之内" data-regex=".{0,200}"><?php echo $_smarty_tpl->tpl_vars['description']->value;?>
</textarea>
        <a href="javascript:;" class="autoget variable variable-0 inline" data-type="description">自动获取</a>
        <span class="input-tips"><s></s>10~200汉字之内</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>评论开关：</dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"notpost",'values'=>$_smarty_tpl->tpl_vars['postopt']->value,'checked'=>$_smarty_tpl->tpl_vars['notpost']->value,'output'=>$_smarty_tpl->tpl_vars['postnames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        <?php if ($_smarty_tpl->tpl_vars['need_audit']->value==0||$_smarty_tpl->tpl_vars['need_audit']->value==2) {?>
        <label for="arcrank">阅读权限：
          <select name="arcrank" id="arcrank" class="input-medium">
            <?php echo smarty_function_html_options(array('options'=>$_smarty_tpl->tpl_vars['arcrankList']->value,'selected'=>$_smarty_tpl->tpl_vars['arcrank']->value),$_smarty_tpl);?>

          </select>
        </label>
        <?php }?>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>打赏开关：</dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"reward_switch",'values'=>$_smarty_tpl->tpl_vars['rewardopt']->value,'checked'=>$_smarty_tpl->tpl_vars['reward_switch']->value,'output'=>$_smarty_tpl->tpl_vars['rewardnames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        <span class="input-tips" style="display:inline-block;"><s></s>如果开启打赏，请同时在新闻设置中启用打赏功能</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>专题：</dt>
      <dd>
        <select name="zhuanti" id="zhuanti" class="input-medium">
          <option value="">请选择</option>
          <?php  $_smarty_tpl->tpl_vars["zt"] = new Smarty_Variable; $_smarty_tpl->tpl_vars["zt"]->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['zhuantList']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars["zt"]->key => $_smarty_tpl->tpl_vars["zt"]->value) {
$_smarty_tpl->tpl_vars["zt"]->_loop = true;
?>
          <option value="<?php echo $_smarty_tpl->tpl_vars['zt']->value['id'];?>
"<?php if ($_smarty_tpl->tpl_vars['zt']->value['id']==$_smarty_tpl->tpl_vars['zhuanti_par']->value) {?> selected=""<?php }?>><?php echo $_smarty_tpl->tpl_vars['zt']->value['typename'];?>
</option>
          <?php } ?>
        </select>
        <select name="zhuantitype" id="zhuantitype" class="input-medium">
          <option value="">请选择</option>
          <?php if ($_smarty_tpl->tpl_vars['zhuantList2']->value) {?>
          <?php  $_smarty_tpl->tpl_vars["zt"] = new Smarty_Variable; $_smarty_tpl->tpl_vars["zt"]->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['zhuantList2']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars["zt"]->key => $_smarty_tpl->tpl_vars["zt"]->value) {
$_smarty_tpl->tpl_vars["zt"]->_loop = true;
?>
          <option value="<?php echo $_smarty_tpl->tpl_vars['zt']->value['id'];?>
"<?php if ($_smarty_tpl->tpl_vars['zt']->value['id']==$_smarty_tpl->tpl_vars['zhuanti']->value) {?> selected=""<?php }?>><?php echo $_smarty_tpl->tpl_vars['zt']->value['typename'];?>
</option>
          <?php } ?>
          <?php }?>
        </select>
      </dd>
    </dl>
    
    <?php if ($_smarty_tpl->tpl_vars['admin_edit']->value) {?>
    <dl class="clearfix formbtn">
      <dt>&nbsp;</dt>
      <dd><button class="btn btn-large btn-success" type="submit" name="button" id="btnSubmit">确认提交</button></dd>
    </dl>
    <?php } else { ?>
    <dl class="clearfix formbtn">
      <dt>&nbsp;</dt>
      <dd><button class="btn btn-large btn-success" type="submit" name="button" id="btnSubmit" disabled>确认提交</button></dd>
    </dl>
    <?php }?>
  </form>
</div>
<div class="item hide" id="audit">
  <div class="content">
    <table>
      <thead>
        <tr>
          <th>职位</th>
          <th>审核人</th>
          <th>审核状态</th>
          <th>审核时间</th>
          <th>备注</th>
          <th>操作<?php echo $_smarty_tpl->tpl_vars['adminid']->value;?>
</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($_smarty_tpl->tpl_vars['audit_log']->value) {?>
        <?php  $_smarty_tpl->tpl_vars['audit'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['audit']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['audit_log']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['audit']->key => $_smarty_tpl->tpl_vars['audit']->value) {
$_smarty_tpl->tpl_vars['audit']->_loop = true;
?>
        <tr <?php if ($_smarty_tpl->tpl_vars['levelID']->value==$_smarty_tpl->tpl_vars['audit']->value['id']) {?> class="curr"<?php } elseif (($_smarty_tpl->tpl_vars['audit']->value['or']&&$_smarty_tpl->tpl_vars['audit']->value['ok']&&!$_smarty_tpl->tpl_vars['audit']->value['do'])) {?> class="cancel"<?php }?>>
          <td><?php echo $_smarty_tpl->tpl_vars['audit']->value['typename'];?>
</td>
          <td class="nickname"><?php echo $_smarty_tpl->tpl_vars['audit']->value['nickname'];?>
</td>
          <td class="state"><?php if ($_smarty_tpl->tpl_vars['audit']->value['state']==0) {?><span style="color:#ccc;">待审核</span><?php } elseif ($_smarty_tpl->tpl_vars['audit']->value['state']==1) {?><span style="color:#51a351;">审核通过</span><?php } elseif ($_smarty_tpl->tpl_vars['audit']->value['state']==2) {?><span style="color:#da4f49;">审核拒绝</span><?php }?></td>
          <td class="pubdate"><?php if ($_smarty_tpl->tpl_vars['audit']->value['state']!=0) {
echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['audit']->value['pubdate'],"%Y-%m-%d %H:%M:%S");
}?></td>
          <td class="note"><?php echo $_smarty_tpl->tpl_vars['audit']->value['note'];?>
</td>
          <?php if ($_smarty_tpl->tpl_vars['audit']->value['do']) {?>
          <td>
            <button class="btn btn-small btn-success" type="submit" name="button" id="btnSuccess"<?php if ($_smarty_tpl->tpl_vars['audit']->value['state']==1) {?> disabled<?php }?>>审核通过</button>
            <button class="btn btn-small btn-danger" type="submit" name="button" id="btnRefuse"<?php if ($_smarty_tpl->tpl_vars['audit']->value['state']==2) {?> disabled<?php }?>>审核拒绝</button>
          </td>
          <?php } else { ?>
          <td><span style="color:#ccc;"><?php echo $_smarty_tpl->tpl_vars['audit']->value['doinfo'];?>
</span></td>
          <?php }?>
        </tr>
        <?php } ?>
        <?php } else { ?>
          <tr>
            <td colspan="6">没有审核记录</td>
          </tr>
        <?php }?>
      </tbody>
    </table>
    <?php if ($_smarty_tpl->tpl_vars['audit_history']->value) {?>
    <p class="audit_history">审核记录</p>
    <table>
      <thead>
        <tr>
          <th>职位</th>
          <th>审核人</th>
          <th>详情</th>
          <th>备注</th>
          <th>操作时间</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($_smarty_tpl->tpl_vars['audit_history']->value) {?>
        <?php  $_smarty_tpl->tpl_vars['log'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['log']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['audit_history']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['log']->key => $_smarty_tpl->tpl_vars['log']->value) {
$_smarty_tpl->tpl_vars['log']->_loop = true;
?>
        <tr>
          <td><?php echo $_smarty_tpl->tpl_vars['log']->value['typename'];?>
</td>
          <td class="nickname"><?php echo $_smarty_tpl->tpl_vars['log']->value['nickname'];?>
</td>
          <td><?php if ($_smarty_tpl->tpl_vars['log']->value['oldstate']==0) {?>待审核<?php } elseif ($_smarty_tpl->tpl_vars['log']->value['oldstate']==1) {?>审核通过<?php } elseif ($_smarty_tpl->tpl_vars['log']->value['oldstate']==2) {?>审核拒绝<?php }?> => <?php if ($_smarty_tpl->tpl_vars['log']->value['newstate']==0) {?>待审核<?php } elseif ($_smarty_tpl->tpl_vars['log']->value['newstate']==1) {?>审核通过<?php } elseif ($_smarty_tpl->tpl_vars['log']->value['newstate']==2) {?>审核拒绝<?php }?></td>
          <td><?php echo $_smarty_tpl->tpl_vars['log']->value['note'];?>
</td>
          <td><?php echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['log']->value['pubdate'],"%Y-%m-%d %H:%M:%S");?>
</td>
        </tr>
        <?php } ?>
        <?php }?>
      </tbody>
    </table>
    <?php }?>
  </div>
</div>
<div class="item hide" id="editLog">
  <div class="content">
    <table>
      <thead>
        <tr>
          <th>操作人</th>
          <th>操作时间</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($_smarty_tpl->tpl_vars['audit_edit']->value) {?>
        <?php  $_smarty_tpl->tpl_vars['edit'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['edit']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['audit_edit']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['edit']->key => $_smarty_tpl->tpl_vars['edit']->value) {
$_smarty_tpl->tpl_vars['edit']->_loop = true;
?>
        <tr>
          <td><?php echo $_smarty_tpl->tpl_vars['edit']->value['nickname'];?>
</td>
          <td><?php echo smarty_modifier_date_format($_smarty_tpl->tpl_vars['edit']->value['pubdate'],'%Y-%m-%d %H:%M:%S');?>
</td>
        </tr>
        <?php } ?>
        <?php } else { ?>
        <tr>
          <td colspan="2">暂无记录</td>
        </tr>
        <?php }?>
      </tbody>
    </table>
  </div>
</div>
<dl class="fn-clear hide">
  <dt>音频：</dt>
  <dd class="thumb fn-clear listImgBox">
    <div class="uploadinp filePicker thumbtn" id="filePicker_audio" data-type-real="audio" data-type="filenail" data-mime="<?php echo smarty_modifier_replace($_smarty_tpl->tpl_vars['audioType']->value,";",",");?>
" data-accept="<?php echo $_smarty_tpl->tpl_vars['audioType']->value;?>
" data-count="20" data-size="<?php echo $_smarty_tpl->tpl_vars['audioSize']->value;?>
" data-imglist=""><div></div><span></span></div>
    <ul id="listSection_audio" class="listSection thumblist fn-clear"></ul>
    <input type="hidden" name="" value="" class="imglist-hidden">
  </dd>
</dl>
<?php echo $_smarty_tpl->tpl_vars['editorFile']->value;?>

<?php echo '<script'; ?>
 type='text/javascript' src='/include/ueditor/addCustomizeButton.js?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
'><?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
