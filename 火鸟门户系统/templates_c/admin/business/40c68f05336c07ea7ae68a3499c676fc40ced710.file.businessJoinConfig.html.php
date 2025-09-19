<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:04:47
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/business/businessJoinConfig.html" */ ?>
<?php /*%%SmartyHeaderCode:141785594688615df5f2c82-64710167%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '40c68f05336c07ea7ae68a3499c676fc40ced710' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/business/businessJoinConfig.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '141785594688615df5f2c82-64710167',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'adminPath' => 0,
    'cfg_pointName' => 0,
    'token' => 0,
    'joinState' => 0,
    'joinStateChecked' => 0,
    'joinStateNames' => 0,
    'joinCheck' => 0,
    'joinCheckChecked' => 0,
    'joinCheckNames' => 0,
    'joinCheckPhone' => 0,
    'joinCheckPhoneChecked' => 0,
    'joinCheckPhoneNames' => 0,
    'editJoinCheck' => 0,
    'editJoinCheckChecked' => 0,
    'editJoinCheckNames' => 0,
    'moduleJoinCheck' => 0,
    'moduleJoinCheckChecked' => 0,
    'moduleJoinCheckNames' => 0,
    'editModuleJoinCheck' => 0,
    'editModuleJoinCheckChecked' => 0,
    'editModuleJoinCheckNames' => 0,
    'joinTimesUnit' => 0,
    'joinTimesUnitChecked' => 0,
    'joinTimesUnitNames' => 0,
    'joinRepeat' => 0,
    'joinRepeatChecked' => 0,
    'joinRepeatNames' => 0,
    'joinCheckMaterialArr' => 0,
    'cfg_businessPrivilegeArr' => 0,
    'module' => 0,
    'businessPrivilege' => 0,
    'cfg_businessStoreModuleArr' => 0,
    'businessStore' => 0,
    'businessPackage' => 0,
    'package' => 0,
    'k' => 0,
    'businessJoinTimes' => 0,
    'times' => 0,
    'businessJoinSale' => 0,
    'sale' => 0,
    'businessJoinRule' => 0,
    'rule' => 0,
    'businessPrivilegeJson' => 0,
    'businessStoreJson' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_688615df70c043_85009709',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_688615df70c043_85009709')) {function content_688615df70c043_85009709($_smarty_tpl) {?><?php if (!is_callable('smarty_function_html_radios')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_radios.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>商家入驻设置</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style media="screen">
  .editform dt {width: 180px;}
  .domain-rules {margin: 0 50px;}
  .domain-rules th {font-size: 14px; line-height: 3em; border-bottom: 1px solid #ededed; padding: 0 5px; text-align: left;}
  .domain-rules td {font-size: 14px; line-height: 3.5em; border-bottom: 1px solid #ededed; padding: 0 5px;}
  .domain-rules .input-append, .domain-rules .input-prepend {margin: 15px 0 0;}
  .domain-rules input {font-size: 16px;}
  .editform dt label.sl {margin-top: -10px;}
  .editform dt small {display: block; margin: -8px 12px 0 0;}
  .editform dt small i {font-style: normal;}

  .priceWrap .table {width: auto;}
  .priceWrap .table th {min-width: 150px; height: 30px; text-align: center; line-height: 30px;}
  .priceWrap .table th:last-child {min-width: 50px;}
  .priceWrap .table td {text-align: center; height: 34px; line-height: 31px;}
  .priceWrap .level {font-size: 18px;}
  .priceWrap .input-append, .input-prepend {margin-bottom: 0;}
  .priceWrap .del {display: inline-block; vertical-align: middle;}
  .priceWrap .input-append select {margin: -5px -6px 0 -6px; border-radius: 0;}
</style>
<?php echo '<script'; ?>
>
var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", cfg_pointName = '<?php echo $_smarty_tpl->tpl_vars['cfg_pointName']->value;?>
';
<?php echo '</script'; ?>
>
<style>body {height: auto;} #cost .input-prepend {margin-right: 10px;}</style>
</head>

<body>

<div class="btn-group config-nav" data-toggle="buttons-radio">
  <button type="button" class="btn active" data-type="config">基本设置</button>
  <!-- <button type="button" class="btn" data-type="package">套餐管理</button> -->
  <button type="button" class="btn" data-type="activity">时长设置</button>
</div>

<div class="info-tips hide" id="infoTip"></div>

<form action="businessJoinConfig.php" method="post" name="editform" id="editform" class="editform">
  <input type="hidden" name="configType" value="config" />
  <input type="hidden" name="token" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
  <div class="item" id="config">

    
    <dl class="clearfix">
        <dt><label>商家入驻功能：</label></dt>
        <dd class="radio">
          <?php echo smarty_function_html_radios(array('name'=>"joinState",'values'=>$_smarty_tpl->tpl_vars['joinState']->value,'checked'=>$_smarty_tpl->tpl_vars['joinStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['joinStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label>商家新入驻：</label></dt>
        <dd class="radio">
          <?php echo smarty_function_html_radios(array('name'=>"joinCheck",'values'=>$_smarty_tpl->tpl_vars['joinCheck']->value,'checked'=>$_smarty_tpl->tpl_vars['joinCheckChecked']->value,'output'=>$_smarty_tpl->tpl_vars['joinCheckNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        </dd>
    </dl>
    <dl class="clearfix hide">
        <dt><label>入驻验证手机：</label></dt>
        <dd class="radio">
            <?php echo smarty_function_html_radios(array('name'=>"joinCheckPhone",'values'=>$_smarty_tpl->tpl_vars['joinCheckPhone']->value,'checked'=>$_smarty_tpl->tpl_vars['joinCheckPhoneChecked']->value,'output'=>$_smarty_tpl->tpl_vars['joinCheckPhoneNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label>修改商家入驻信息：</label></dt>
        <dd class="radio">
            <?php echo smarty_function_html_radios(array('name'=>"editJoinCheck",'values'=>$_smarty_tpl->tpl_vars['editJoinCheck']->value,'checked'=>$_smarty_tpl->tpl_vars['editJoinCheckChecked']->value,'output'=>$_smarty_tpl->tpl_vars['editJoinCheckNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label>模块店铺入驻：</label></dt>
        <dd class="radio">
            <?php echo smarty_function_html_radios(array('name'=>"moduleJoinCheck",'values'=>$_smarty_tpl->tpl_vars['moduleJoinCheck']->value,'checked'=>$_smarty_tpl->tpl_vars['moduleJoinCheckChecked']->value,'output'=>$_smarty_tpl->tpl_vars['moduleJoinCheckNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label>修改模块店铺信息：</label></dt>
        <dd class="radio">
            <?php echo smarty_function_html_radios(array('name'=>"editModuleJoinCheck",'values'=>$_smarty_tpl->tpl_vars['editModuleJoinCheck']->value,'checked'=>$_smarty_tpl->tpl_vars['editModuleJoinCheckChecked']->value,'output'=>$_smarty_tpl->tpl_vars['editModuleJoinCheckNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label>入驻时长单位：</label></dt>
        <dd class="radio">
            <?php echo smarty_function_html_radios(array('name'=>"joinTimesUnit",'values'=>$_smarty_tpl->tpl_vars['joinTimesUnit']->value,'checked'=>$_smarty_tpl->tpl_vars['joinTimesUnitChecked']->value,'output'=>$_smarty_tpl->tpl_vars['joinTimesUnitNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label>企业重复入驻：</label></dt>
        <dd class="radio">
            <?php echo smarty_function_html_radios(array('name'=>"joinRepeat",'values'=>$_smarty_tpl->tpl_vars['joinRepeat']->value,'checked'=>$_smarty_tpl->tpl_vars['joinRepeatChecked']->value,'output'=>$_smarty_tpl->tpl_vars['joinRepeatNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

            <span class="input-tips" style="display:inline-block;"><s></s>选择【不限制】表示一个营业执照可以入驻多个店铺，选择【限制】表示一个营业执照只能入驻一个店铺。<br />该功能只对前台商家自助入驻时生效，后台管理员手动添加商家不受此影响。</span>
        </dd>
    </dl>
    <dl class="clearfix">
        <dt><label>入驻认证材料：</label></dt>
        <dd class="radio">
            <label><input type="checkbox" name="joinCheckMaterial[]" value="business" <?php if (in_array('business',$_smarty_tpl->tpl_vars['joinCheckMaterialArr']->value)) {?>checked="checked"<?php }?>>营业执照</label>
            <label><input type="checkbox" name="joinCheckMaterial[]" value="id" <?php if (in_array('id',$_smarty_tpl->tpl_vars['joinCheckMaterialArr']->value)) {?>checked="checked"<?php }?>>身份证</label>
            <span class="input-tips" style="display:inline-block;"><s></s>如果两个都选中，商家可以根据自己的情况选择其中一种提交。<br />建议开启系统基本参数中聚合数据接口的企业工商数据和身份证识别功能，将有效提升审核准确度！</span>
        </dd>
    </dl>


    <dl class="clearfix" style="margin-top: 30px;">
      <dt style="width: 140px;"><strong style="font-size: 16px;">商家特权：</strong></dt>
      <dd>&nbsp;</dd>
    </dl>
    <dl class="clearfix">
      <dt style="width: 50px;"></dt>
      <dd>
        <div class="priceWrap">
          <table class="table table-hover table-bordered table-striped">
            <thead>
              <tr>
                <th>功能</th>
                <th>自定义显示名称</th>
                <th class="hide">标签</th>
                <th>描述</th>
                <th style="width: 150px;">价格</th>
                <th style="width: 150px;">原价</th>
                <th style="width: 100px;">状态</th>
              </tr>
            </thead>
            <tbody>
              <?php  $_smarty_tpl->tpl_vars['module'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['module']->_loop = false;
 $_smarty_tpl->tpl_vars['name'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['cfg_businessPrivilegeArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['module']->key => $_smarty_tpl->tpl_vars['module']->value) {
$_smarty_tpl->tpl_vars['module']->_loop = true;
 $_smarty_tpl->tpl_vars['name']->value = $_smarty_tpl->tpl_vars['module']->key;
?>
              <tr>
                <td><?php echo $_smarty_tpl->tpl_vars['module']->value['title'];?>
</td>
                <td><input class="input-small" type="text" name="business[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][title]" value="<?php if ($_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['title']) {
echo $_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['title'];
} else {
echo $_smarty_tpl->tpl_vars['module']->value['title'];
}?>"></td>
                <td class="hide"><input class="input-small" type="text" name="business[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][label]" value="<?php echo $_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['label'];?>
"></td>
                <td><textarea  name="business[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][note]"><?php echo $_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['note'];?>
</textarea></td>
                <td><div class="input-append"><input class="input-mini" type="text" name="business[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][price]" value="<?php echo $_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['price'];?>
"><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/<span class="joinTimesUnit">月</span></span></div></td>
                <td><div class="input-append"><input class="input-mini" type="text" name="business[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][mprice]" value="<?php echo $_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['mprice'];?>
"><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/<span class="joinTimesUnit">月</span></span></div></td>
                <td><a style="font-size: 14px;<?php if ($_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['state']) {?> color: #ff0000;<?php }?>" href="javascript:;" class="state" data-state="<?php echo (($tmp = @$_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['state'])===null||$tmp==='' ? 0 : $tmp);?>
"><?php if ($_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['state']) {?>点击启用<?php } else { ?>点击停用<?php }?></a><input type="hidden" name="business[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][state]" value="<?php echo (($tmp = @$_smarty_tpl->tpl_vars['businessPrivilege']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['state'])===null||$tmp==='' ? 0 : $tmp);?>
" /></td>
              </tr>
              <?php } ?>
            </tbody>
          </table>
        </div>
      </dd>
    </dl>

    <dl class="clearfix">
      <dt style="width: 140px;"><strong style="font-size: 16px;">行业特权：</strong></dt>
      <dd>&nbsp;</dd>
    </dl>
    <dl class="clearfix">
      <dt style="width: 50px;"></dt>
      <dd>
        <div class="priceWrap">
          <table class="table table-hover table-bordered table-striped">
            <thead>
              <tr>
                <th>模块</th>
                <th>自定义显示名称</th>
                <th class="hide">标签</th>
                <th>描述</th>
                <th style="width: 150px;">价格</th>
                <th style="width: 150px;">原价</th>
              </tr>
            </thead>
            <tbody>
              <?php  $_smarty_tpl->tpl_vars['module'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['module']->_loop = false;
 $_smarty_tpl->tpl_vars['name'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['cfg_businessStoreModuleArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['module']->key => $_smarty_tpl->tpl_vars['module']->value) {
$_smarty_tpl->tpl_vars['module']->_loop = true;
 $_smarty_tpl->tpl_vars['name']->value = $_smarty_tpl->tpl_vars['module']->key;
?>
              <?php if ($_smarty_tpl->tpl_vars['module']->value['name']!='job') {?>
              <tr>
                <td><?php echo $_smarty_tpl->tpl_vars['module']->value['title'];?>
</td>
                <td><input class="input-small" type="text" name="store[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][title]" value="<?php if ($_smarty_tpl->tpl_vars['businessStore']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['title']) {
echo $_smarty_tpl->tpl_vars['businessStore']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['title'];
} else {
echo $_smarty_tpl->tpl_vars['module']->value['title'];
}?>"></td>
                <td class="hide"><input class="input-small" type="text" name="store[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][label]" value="<?php echo $_smarty_tpl->tpl_vars['businessStore']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['label'];?>
"></td>
                <td><textarea  name="store[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][note]"><?php echo $_smarty_tpl->tpl_vars['businessStore']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['note'];?>
</textarea></td>
                <td><div class="input-append"><input class="input-mini" type="text" name="store[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][price]" value="<?php echo $_smarty_tpl->tpl_vars['businessStore']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['price'];?>
"><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/<span class="joinTimesUnit">月</span></span></div></td>
                <td><div class="input-append"><input class="input-mini" type="text" name="store[<?php echo $_smarty_tpl->tpl_vars['module']->value['name'];?>
][mprice]" value="<?php echo $_smarty_tpl->tpl_vars['businessStore']->value[$_smarty_tpl->tpl_vars['module']->value['name']]['mprice'];?>
"><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/<span class="joinTimesUnit">月</span></span></div></td>
              </tr>
              <?php }?>
              <?php } ?>
            </tbody>
          </table>
        </div>
      </dd>
    </dl>

  </div>

  <!--
  <div class="item hide" id="package">

      <dl class="clearfix">
        <dt><strong style="font-size: 16px;">入驻套餐：</strong></dt>
        <dd>&nbsp;</dd>
      </dl>
      <dl class="clearfix">
        <dt style="width: 50px;"></dt>
        <dd>
          <div class="priceWrap">
            <table class="table table-hover table-bordered table-striped">
              <thead>
                <tr>
                  <th>套餐名</th>
                  <th>图标</th>
                  <th>标签</th>
                  <th class="price">价格</th>
                  <th class="price">原价</th>
                  <th>套餐内容</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="packageBody">

                <?php if ($_smarty_tpl->tpl_vars['businessPackage']->value) {?>
                <?php  $_smarty_tpl->tpl_vars['package'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['package']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['businessPackage']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['package']->key => $_smarty_tpl->tpl_vars['package']->value) {
$_smarty_tpl->tpl_vars['package']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['package']->key;
?>
                <tr>
                  <td><input class="input-small" type="text" name="package[title][]" value="<?php echo $_smarty_tpl->tpl_vars['package']->value['title'];?>
"></td>
                  <td>
                      <?php if ($_smarty_tpl->tpl_vars['package']->value['icon']) {?>
                      <img src="/include/attachment.php?f=<?php echo $_smarty_tpl->tpl_vars['package']->value['icon'];?>
" class="img" alt="" style="height:40px;">
                      <?php }?>
                      <a href="javascript:;" class="upfile" title="上传图标">上传图标</a>
                      <input type="file" name="Filedata" class="imglist-hidden Filedata" style="display: none;" id="Filedata_<?php echo $_smarty_tpl->tpl_vars['k']->value;?>
">
                      <input type="hidden" name="package[icon][]" class="icon" value="<?php echo $_smarty_tpl->tpl_vars['package']->value['icon'];?>
">
                  </td>
                  <td><input class="input-small" type="text" name="package[label][]" value="<?php echo $_smarty_tpl->tpl_vars['package']->value['label'];?>
"></td>
                  <td><div class="input-append"><input class="input-small price" step="0.01" type="number" name="package[price][]" value="<?php echo $_smarty_tpl->tpl_vars['package']->value['price'];?>
"><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/月</span></div></td>
                  <td><div class="input-append"><input class="input-small price" step="0.01" type="number" name="package[mprice][]" value="<?php echo $_smarty_tpl->tpl_vars['package']->value['mprice'];?>
"><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/月</span></div></td>
                  <td><a href="javascript:;" class="manage" title="管理套餐内容">管理套餐内容</a><input type="hidden" name="package[list][]" value="<?php echo $_smarty_tpl->tpl_vars['package']->value['list'];?>
" /></td>
                  <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
                </tr>
                <?php } ?>
                <?php } else { ?>
                <tr>
                  <td><input class="input-small" type="text" name="package[title][]" value=""></td>
                  <td>
                      <a href="javascript:;" class="upfile" title="上传图标">上传图标</a>
                      <input type="file" name="Filedata" class="imglist-hidden Filedata" style="display: none;" id="Filedata_0">
                      <input type="hidden" name="package[icon][]" class="icon" value="">
                  </td>
                  <td><input class="input-small" type="text" name="package[label][]" value="推荐"></td>
                  <td><div class="input-append"><input class="input-small price" step="0.01" type="number" name="package[price][]" value=""><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/月</span></div></td>
                  <td><div class="input-append"><input class="input-small price" step="0.01" type="number" name="package[mprice][]" value=""><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/月</span></div></td>
                  <td><a href="javascript:;" class="manage" title="管理套餐内容">管理套餐内容</a><input type="hidden" name="package[list][]" value="" /></td>
                  <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
                </tr>
                <tr>
                  <td><input class="input-small" type="text" name="package[title][]" value=""></td>
                  <td>
                      <a href="javascript:;" class="upfile" title="上传图标">上传图标</a>
                      <input type="file" name="Filedata" class="imglist-hidden Filedata" style="display: none;" id="Filedata_1">
                      <input type="hidden" name="package[icon][]" class="icon" value="">
                  </td>
                  <td><input class="input-small" type="text" name="package[label][]" value="超值"></td>
                  <td><div class="input-append"><input class="input-small price" step="0.01" type="number" name="package[price][]" value=""><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/月</span></div></td>
                  <td><div class="input-append"><input class="input-small price" step="0.01" type="number" name="package[mprice][]" value=""><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
/月</span></div></td>
                  <td><a href="javascript:;" class="manage" title="管理套餐内容">管理套餐内容</a><input type="hidden" name="package[list][]" value="" /></td>
                  <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
                </tr>
                <?php }?>

              </tbody>
              <tbody>
                <tr>
                  <td colspan="7">
                    <button type="button" class="btn btn-small addPackage">增加一行</button>&nbsp;&nbsp;&nbsp;&nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </dd>
      </dl>
  </div>
  -->

  <div class="item hide" id="activity">

    <!--
      <dl class="clearfix">
        <dt><strong style="font-size: 16px;">开通时长：</strong></dt>
        <dd>&nbsp;</dd>
      </dl>
      <dl class="clearfix">
        <dt style="width: 140px;"></dt>
        <dd>
          <div class="priceWrap">
            <table class="table table-hover table-bordered table-striped">
              <tbody id="businessTimes">
                <?php if ($_smarty_tpl->tpl_vars['businessJoinTimes']->value) {?>
                <?php  $_smarty_tpl->tpl_vars['times'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['times']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['businessJoinTimes']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['times']->key => $_smarty_tpl->tpl_vars['times']->value) {
$_smarty_tpl->tpl_vars['times']->_loop = true;
?>
                <tr>
                  <td><div class="input-append"><input class="input-small" step="1" type="number" name="times[]" value="<?php echo $_smarty_tpl->tpl_vars['times']->value;?>
"><span class="add-on">个月</span></div></td>
                  <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
                </tr>
                <?php } ?>
                <?php } else { ?>
                <tr>
                  <td><div class="input-append"><input class="input-small" step="1" type="number" name="times[]" value=""><span class="add-on">个月</span></div></td>
                  <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
                </tr>
                <?php }?>
              </tbody>
              <tbody>
                <tr>
                  <td colspan="7">
                    <button type="button" class="btn btn-small addTimes">增加一行</button>&nbsp;&nbsp;&nbsp;&nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </dd>
      </dl>

      <dl class="clearfix">
        <dt><strong style="font-size: 16px;">满减：</strong></dt>
        <dd>&nbsp;</dd>
      </dl>
      <dl class="clearfix">
        <dt style="width: 140px;"></dt>
        <dd>
          <div class="priceWrap">
            <table class="table table-hover table-bordered table-striped">
              <tbody id="businessSale">
                <?php if ($_smarty_tpl->tpl_vars['businessJoinSale']->value) {?>
                <?php  $_smarty_tpl->tpl_vars['sale'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['sale']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['businessJoinSale']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['sale']->key => $_smarty_tpl->tpl_vars['sale']->value) {
$_smarty_tpl->tpl_vars['sale']->_loop = true;
?>
                <tr>
                  <td><div class="input-prepend input-append"><span class="add-on">满</span><input class="input-small" step="1" type="number" name="price[]" value="<?php echo $_smarty_tpl->tpl_vars['sale']->value['price'];?>
"><span class="add-on">减</span><input class="input-small" step="1" type="number" name="amount[]" value="<?php echo $_smarty_tpl->tpl_vars['sale']->value['amount'];?>
"><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
</span></div></td>
                  <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
                </tr>
                <?php } ?>
                <?php } else { ?>
                <tr>
                  <td><div class="input-prepend input-append"><span class="add-on">满</span><input class="input-small" step="1" type="number" name="price[]" value=""><span class="add-on">减</span><input class="input-small" step="1" type="number" name="amount[]" value=""><span class="add-on"><?php echo echoCurrency(array('type'=>'short'),$_smarty_tpl);?>
</span></div></td>
                  <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
                </tr>
                <?php }?>
              </tbody>
              <tbody>
                <tr>
                  <td colspan="7">
                    <button type="button" class="btn btn-small addSale">增加一行</button>&nbsp;&nbsp;&nbsp;&nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </dd>
      </dl>
      -->

      <!-- <dl class="clearfix">
        <dt><strong style="font-size: 16px;">送积分：</strong></dt>
        <dd>&nbsp;</dd>
      </dl> -->
      <dl class="clearfix">
        <dt style="width: 50px;"></dt>
        <dd>
          <div class="priceWrap">
            <table class="table table-hover table-bordered table-striped">
              <tbody id="businessRule">
                <?php  $_smarty_tpl->tpl_vars['rule'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['rule']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['businessJoinRule']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['rule']->key => $_smarty_tpl->tpl_vars['rule']->value) {
$_smarty_tpl->tpl_vars['rule']->_loop = true;
?>
                <tr>
                  <td>
                    <div class="input-prepend input-append">
                        <span class="add-on">开通</span><input class="input-mini" step="1" type="text" name="times[]" value="<?php echo $_smarty_tpl->tpl_vars['rule']->value['times'];?>
"><span class="add-on"><span class="joinTimesUnit1">个月</span></span>
                        <span class="add-on" style="margin-left: 10px;">打</span><input class="input-mini" step="1" type="text" name="discount[]" value="<?php echo $_smarty_tpl->tpl_vars['rule']->value['discount'];?>
"><span class="add-on">折</span>
                        <span class="add-on" style="margin-left: 10px;">送</span><input class="input-mini" step="1" type="text" name="point[]" value="<?php echo $_smarty_tpl->tpl_vars['rule']->value['point'];?>
"><span class="add-on"><?php echo $_smarty_tpl->tpl_vars['cfg_pointName']->value;?>
</span>
                    </div>
                  </td>
                  <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
                </tr>
                <?php } ?>
              </tbody>
              <tbody>
                <tr>
                  <td colspan="7">
                    <button type="button" class="btn btn-small addTimes">增加一行</button>&nbsp;&nbsp;&nbsp;&nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </dd>
      </dl>

  </div>

  <dl class="clearfix formbtn">
    <dt>&nbsp;</dt>
    <dd><input class="btn btn-large btn-success" type="submit" name="submit" id="btnSubmit" value="确认提交" /></dd>
  </dl>
</form>

<?php echo '<script'; ?>
 type="text/javascript">
    var businessPrivilege = <?php echo $_smarty_tpl->tpl_vars['businessPrivilegeJson']->value;?>
, businessStore = <?php echo $_smarty_tpl->tpl_vars['businessStoreJson']->value;?>
;
<?php echo '</script'; ?>
>
<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
