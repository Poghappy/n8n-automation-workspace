<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 20:07:58
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/member/fenxiaoConfig.html" */ ?>
<?php /*%%SmartyHeaderCode:16133793046886169ecb3e21-65564858%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b8e2782739b6866d36c13f07997fafd57e4ffe6b' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/member/fenxiaoConfig.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '16133793046886169ecb3e21-65564858',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'adminPath' => 0,
    'fenxiaoTypeChecked' => 0,
    'token' => 0,
    'fenxiaoName' => 0,
    'fenxiaoState' => 0,
    'fenxiaoStateChecked' => 0,
    'fenxiaoStateNames' => 0,
    'fenxiaoSource' => 0,
    'fenxiaoSourceChecked' => 0,
    'fenxiaoSourceNames' => 0,
    'fenxiaoDeposit' => 0,
    'fenxiaoDepositChecked' => 0,
    'fenxiaoDepositNames' => 0,
    'fenxiaoJoinCheck' => 0,
    'fenxiaoJoinCheckChecked' => 0,
    'fenxiaoJoinCheckNames' => 0,
    'fenxiaoJoinCheckPhone' => 0,
    'fenxiaoJoinCheckPhoneChecked' => 0,
    'fenxiaoJoinCheckPhoneNames' => 0,
    'fenxiaoType' => 0,
    'fenxiaoTypeNames' => 0,
    'fenxiaoZigou' => 0,
    'fenxiaoZigouChecked' => 0,
    'fenxiaoZigouNames' => 0,
    'fenxiaoLevel' => 0,
    'item' => 0,
    'fenxiaoHjType' => 0,
    'fenxiaoHjTypeChecked' => 0,
    'fenxiaoHjTypeNames' => 0,
    'fenxiaoRecAmount' => 0,
    'fenxiaoRecAmountPercent' => 0,
    'fenxiaoAmount' => 0,
    'fabufenxiaoAmount' => 0,
    'livefenxiaoAmount' => 0,
    'memberfenxiaoAmount' => 0,
    'rooffenxiaoAmount' => 0,
    'businessfenxiaoAmount' => 0,
    'cfg_fenxiaoState' => 0,
    'configval' => 0,
    'configlist' => 0,
    'config' => 0,
    'fenxiaoQrType' => 0,
    'fenxiaoQrTypeChecked' => 0,
    'fenxiaoQrTypeNames' => 0,
    'memberBinding' => 0,
    'memberBindingChecked' => 0,
    'memberBindingNames' => 0,
    'fenxiaoOfflineItems' => 0,
    'fenxiaoJoinNote' => 0,
    'fenxiaoNote' => 0,
    'editorFile' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6886169ed6a2e4_50516752',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6886169ed6a2e4_50516752')) {function content_6886169ed6a2e4_50516752($_smarty_tpl) {?><?php if (!is_callable('smarty_function_html_radios')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_radios.php';
if (!is_callable('smarty_function_html_checkboxes')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_checkboxes.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>分销设置</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<?php echo '<script'; ?>
>
var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", modelType = 'member';
<?php echo '</script'; ?>
>
<style>
  .editform dt {width: 200px;}
  .priceWrap .table {width: auto;}
  .priceWrap .table th {min-width: 150px; height: 30px; text-align: center; line-height: 30px;}
  .priceWrap .table th:last-child {min-width: 50px;}
  .priceWrap .table td {text-align: center; height: 34px; line-height: 31px;}
  .priceWrap .input-append, .input-prepend {margin-bottom: 0;}
  .priceWrap .del {display: inline-block; vertical-align: middle;}

  .priceWrap .error {border-color: #a94442; -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075); box-shadow: inset 0 1px 1px rgba(0,0,0,.075);}
  .priceWrap .error:focus {border-color: #843534; -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 6px #ce8483; box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 6px #ce8483;}

  .juli .table th, .juli .table td {font-size: 14px; text-align: left; padding-left: 10px;}
  .juli .table code {font-size: 14px;}

  .exp {padding-left: 0;}
  .exp p {margin-bottom: 5px;}

  .singel td {padding-left: 10px; font-size: 14px;}

  <?php if ($_smarty_tpl->tpl_vars['fenxiaoTypeChecked']->value) {?>
  .type0 {display: none;}
  <?php } else { ?>
  .type1 {display: none;}
  <?php }?>
</style>
</head>

<body>
<div class="alert alert-success" style="margin:10px 100px 0 10px;"><button type="button" class="close" data-dismiss="alert">×</button>分销设置及返佣详细说明：<a href="https://help.kumanyun.com/help-208-712.html" target="_blank">https://help.kumanyun.com/help-208-712.html</a></div>

<form action="" method="post" name="editform" id="editform" class="editform">
  <input type="hidden" name="token" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
  <dl class="clearfix">
    <dt><label for="fenxiaoName">分销名称：</label></dt>
    <dd>
      <input class="input-small" type="text" name="fenxiaoName" id="fenxiaoName" value="<?php echo (($tmp = @$_smarty_tpl->tpl_vars['fenxiaoName']->value)===null||$tmp==='' ? '分销商' : $tmp);?>
" placeholder="分销商" data-regex=".*" />
      <span class="input-tips"><s></s>自定义名称用于全站显示</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoState">分销状态：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoState",'values'=>$_smarty_tpl->tpl_vars['fenxiaoState']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <span class="input-tips" style="display:inline-block;"><s></s>关闭后，分销功能将不能使用！</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoSource">分销来源：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoSource",'values'=>$_smarty_tpl->tpl_vars['fenxiaoSource']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoSourceChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoSourceNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <span class="input-tips" style="display:inline-block;"><s></s>分销佣金的承担方，<a href="javascript:;" class="jsjl">计算公式<i class="icon-question-sign" style="margin-top: 3px; margin-left: 2px;"></i></a></span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoDeposit">资金沉淀：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoDeposit",'values'=>$_smarty_tpl->tpl_vars['fenxiaoDeposit']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoDepositChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoDepositNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <p style="padding-left: 0; font-size: 12px; padding-top: 10px; color: #999;">开启后，商家承担分销佣金时，未分出去的资金将沉淀到平台，不返还给商家，可以在财务中心的资金沉淀记录中查看。<br />如果平台承担分销佣金，不建议开启此功能，如果开启了，会出现平台收入中缺少了沉淀的金额，并且沉淀记录中也无此数据，可以用于平台的灰色收入，不与分站结算。</p>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoJoinCheck">入驻审核：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoJoinCheck",'values'=>$_smarty_tpl->tpl_vars['fenxiaoJoinCheck']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoJoinCheckChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoJoinCheckNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label>入驻验证手机：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoJoinCheckPhone",'values'=>$_smarty_tpl->tpl_vars['fenxiaoJoinCheckPhone']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoJoinCheckPhoneChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoJoinCheckPhoneNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoType">分销模式：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoType",'values'=>$_smarty_tpl->tpl_vars['fenxiaoType']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoTypeChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoTypeNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <span class="input-tips" style="display:inline-block;"><s></s>等级模式：自定义分销等级，每一级都可以领取佣金，入驻免费！<br />固定上级：自定义分销等级名称，佣金只有消费者上级可领取，入驻收费！</span>
    </dd>
  </dl>

  <dl class="clearfix type0">
    <dt><label for="fenxiaoZigou">自购返佣：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoZigou",'values'=>$_smarty_tpl->tpl_vars['fenxiaoZigou']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoZigouChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoZigouNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <span class="input-tips" style="display:inline-block;"><s></s>自己购买也可以拿佣金，开启后自己将变成一级，推荐人变成二级。</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoLevel">分销商等级：</label></dt>
    <dd>
      <div class="priceWrap">
        <table class="table table-hover table-bordered table-striped">
          <thead>
            <tr>
              <th>等级</th>
              <th>佣金比例</th>
			  <th class="type1">入驻费</th>
			  <th class="type1">每月返</th>
			  <th class="type1">返现次数</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="levelList">
            <?php  $_smarty_tpl->tpl_vars["item"] = new Smarty_Variable; $_smarty_tpl->tpl_vars["item"]->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['fenxiaoLevel']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars["item"]->key => $_smarty_tpl->tpl_vars["item"]->value) {
$_smarty_tpl->tpl_vars["item"]->_loop = true;
?>
            <tr>
              <td><input class="input-small name" type="text" name="fenxiaoLevel[name][]" value="<?php echo $_smarty_tpl->tpl_vars['item']->value['name'];?>
"></td>
              <td><div class="input-append"><input class="input-small fee" step="1" max="100" min="0" type="number" name="fenxiaoLevel[fee][]" value="<?php echo $_smarty_tpl->tpl_vars['item']->value['fee'];?>
"><span class="add-on">%</span></div></td>
			  <td class="type1"><div class="input-append"><input class="input-small" step="1" min="0" type="number" name="fenxiaoLevel[amount][]" value="<?php echo $_smarty_tpl->tpl_vars['item']->value['amount'];?>
"><span class="add-on">元</span></div></td>
			  <td class="type1"><div class="input-append"><input class="input-small" step="1" min="0" type="number" name="fenxiaoLevel[back][]" value="<?php echo $_smarty_tpl->tpl_vars['item']->value['back'];?>
"><span class="add-on">元</span></div></td>
			  <td class="type1"><div class="input-append"><input class="input-small" step="1" min="0" type="number" name="fenxiaoLevel[count][]" value="<?php echo $_smarty_tpl->tpl_vars['item']->value['count'];?>
"><span class="add-on">次</span></div></td>
              <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
            </tr>
            <?php } ?>
          </tbody>
          <tbody>
            <tr>
              <td colspan="<?php if ($_smarty_tpl->tpl_vars['fenxiaoTypeChecked']->value) {?>6<?php } else { ?>3<?php }?>">
                <button type="button" class="btn btn-small addLevel" data-type="trial">增加一行</button>&nbsp;&nbsp;&nbsp;&nbsp;
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="input-tips exp type0" style="<?php if (!$_smarty_tpl->tpl_vars['fenxiaoTypeChecked']->value) {?>display: block;<?php }?>">
        <h5>例如：</h5>
        <p>分销商：A、B、C、D、E，在设置了三级分销商的情况下</p>
        <p>群体1：A是B的上级分销商，B是C的上级分销商，C是D的上级分销商，D消费时，则C拿一级佣金，B拿二级佣金，A拿三级佣金</p>
        <p>群体2：B是C的上级分销商，C是D的上级分销商，D是E的上级分销商，E消费时，则D拿一级佣金，C拿二级佣金，B拿三级佣金，以此类推......</p>
      </div>
	  <div class="input-tips exp type1" style="<?php if ($_smarty_tpl->tpl_vars['fenxiaoTypeChecked']->value) {?>display: block;<?php }?>">
		  <h5>例如：</h5>
  		<p>初级合伙人，佣金提成10%，入驻费用1500，每月返现125，一年返完！</p>
      </div>
    </dd>
  </dl>
  </div>
  <dl class="clearfix">
    <dt><label for="fenxiaoRecAmount">邀请分销商入驻得佣金：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoHjType",'values'=>$_smarty_tpl->tpl_vars['fenxiaoHjType']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoHjTypeChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoHjTypeNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoRecAmount">&nbsp;</label></dt>
    <dd class="radio hjType <?php if ($_smarty_tpl->tpl_vars['fenxiaoHjTypeChecked']->value==1) {?>hide<?php }?>">
		<div class="input-prepend input-append">
	        <input class="input-mini" type="number" min="0" name="fenxiaoRecAmount" value="<?php echo $_smarty_tpl->tpl_vars['fenxiaoRecAmount']->value;?>
">
			<span class="add-on" style="display: inline-block;">元</span>
	        <span class="input-tips" style="display:inline-block;"><s></s>成功邀请分销商入驻后获取平台赠送的固定佣金奖励</span>
		</div>
    </dd>
    <dd class="radio hjType <?php if ($_smarty_tpl->tpl_vars['fenxiaoHjTypeChecked']->value==0) {?>hide<?php }?>">
      <div class="input-prepend input-append">
        <input class="input-mini" type="number" min="0" max="100" name="fenxiaoRecAmountPercent" value="<?php echo $_smarty_tpl->tpl_vars['fenxiaoRecAmountPercent']->value;?>
">
        <span class="add-on" style="display: inline-block;">%</span>
        <span class="input-tips" style="display:inline-block;"><s></s>成功邀请分销商入驻后获取平台赠送的入驻费百分比佣金奖励</span>
      </div>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoAmount">默认佣金比例：</label></dt>
    <dd class="radio">
      <div class="input-prepend input-append">
        <!-- <span class="add-on">团购订单</span> -->
        <input class="input-mini" type="number" min="0" name="fenxiaoAmount" value="<?php echo $_smarty_tpl->tpl_vars['fenxiaoAmount']->value;?>
">
        <span class="add-on" style="display: inline-block; vertical-align: middle;">%</span>
        <span class="input-tips" style="display:inline-block;"><s></s>商家承担佣金时，用于分发佣金的金额为商品价格的百分比；<br />平台承担佣金时，用于分发佣金的金额为平台实际收入的百分比；</span>
      </div>
    </dd>
  </dl>

  <dl class="clearfix">
    <dt><label for="fabufenxiaoAmount">发布信息默认佣金：</label></dt>
    <dd class="radio">
      <div class="input-prepend input-append">
        <!-- <span class="add-on">团购订单</span> -->
        <input class="input-mini" type="number" min="0" name="fabufenxiaoAmount" value="<?php echo $_smarty_tpl->tpl_vars['fabufenxiaoAmount']->value;?>
">
        <span class="add-on" style="display: inline-block;">%</span>
        <span class="input-tips" style="display:inline-block;"><s></s>用于分发佣金的金额占发布信息的百分比</span>
      </div>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="livefenxiaoAmount">直播模块默认佣金：</label></dt>
    <dd class="radio">
      <div class="input-prepend input-append">
        <!-- <span class="add-on">团购订单</span> -->
        <input class="input-mini" type="number" min="0" name="livefenxiaoAmount" value="<?php echo $_smarty_tpl->tpl_vars['livefenxiaoAmount']->value;?>
">
        <span class="add-on" style="display: inline-block;">%</span>
        <span class="input-tips" style="display:inline-block;"><s></s>用于分发佣金的金额占直播收入的百分比</span>
      </div>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="memberfenxiaoAmount">会员升级默认佣金：</label></dt>
    <dd class="radio">
      <div class="input-prepend input-append">
        <!-- <span class="add-on">团购订单</span> -->
        <input class="input-mini" type="number" min="0" name="memberfenxiaoAmount" value="<?php echo $_smarty_tpl->tpl_vars['memberfenxiaoAmount']->value;?>
">
        <span class="add-on" style="display: inline-block;">%</span>
        <span class="input-tips" style="display:inline-block;"><s></s>用于分发佣金的金额占升级费用的百分比</span>
      </div>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="rooffenxiaoAmount">刷新置顶默认佣金：</label></dt>
    <dd class="radio">
      <div class="input-prepend input-append">
        <input class="input-mini" type="number" min="0" name="rooffenxiaoAmount" value="<?php echo $_smarty_tpl->tpl_vars['rooffenxiaoAmount']->value;?>
">
        <span class="add-on" style="display: inline-block;">%</span>
        <span class="input-tips" style="display:inline-block;"><s></s>用于分发佣金的金额占刷新置顶费用的百分比</span>
      </div>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoAmount">商家入驻默认佣金：</label></dt>
    <dd class="radio">
      <div class="input-prepend input-append">
        <!-- <span class="add-on">团购订单</span> -->
        <input class="input-mini" type="number" min="0" name="businessfenxiaoAmount" value="<?php echo $_smarty_tpl->tpl_vars['businessfenxiaoAmount']->value;?>
">
        <span class="add-on" style="display: inline-block;">%</span>
        <span class="input-tips" style="display:inline-block;"><s></s>用于分发佣金的金额占入驻费用的百分比</span>
      </div>
    </dd>
  </dl>
  <?php if ($_smarty_tpl->tpl_vars['cfg_fenxiaoState']->value===null) {?>
  <dl class="clearfix">
    <dt><label>商品佣金设为0：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_checkboxes(array('name'=>'config','values'=>$_smarty_tpl->tpl_vars['configval']->value,'output'=>$_smarty_tpl->tpl_vars['configlist']->value,'selected'=>$_smarty_tpl->tpl_vars['config']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <br /><span class="label label-info checkAll">全选</span>
      <br /><p style="margin-top:10px;color:#999;font-size:14px;">勾选后模块已发布商品佣金设置为0，否则使用默认佣金比例</p>
    </dd>
  </dl>
  <?php }?>
  <dl class="clearfix">
    <dt><label for="fenxiaoQrType">推广二维码类型：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"fenxiaoQrType",'values'=>$_smarty_tpl->tpl_vars['fenxiaoQrType']->value,'checked'=>$_smarty_tpl->tpl_vars['fenxiaoQrTypeChecked']->value,'output'=>$_smarty_tpl->tpl_vars['fenxiaoQrTypeNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

    </dd>
  </dl>

  <dl class="clearfix">
    <dt><label for="memberBinding">老会员绑定推荐人：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"memberBinding",'values'=>$_smarty_tpl->tpl_vars['memberBinding']->value,'checked'=>$_smarty_tpl->tpl_vars['memberBindingChecked']->value,'output'=>$_smarty_tpl->tpl_vars['memberBindingNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <span class="input-tips" style="display:inline-block;"><s></s>老会员没有推荐人时，再次通过其他人的分享链接进入网站，自动绑定此推荐人（开启表示会绑定，关闭表示不会绑定）</span>
    </dd>
  </dl>

  <dl class="clearfix">
    <dt><label for="memberBinding">我的团队显示内容：</label></dt>
    <dd class="radio">
      <label style="width: 80px;"><input type="checkbox" name="fenxiaoOfflineItems[]" value="people"<?php if (in_array('people',$_smarty_tpl->tpl_vars['fenxiaoOfflineItems']->value)) {?> checked<?php }?> />推荐人数</label>
      <label style="width: 80px;"><input type="checkbox" name="fenxiaoOfflineItems[]" value="income"<?php if (in_array('income',$_smarty_tpl->tpl_vars['fenxiaoOfflineItems']->value)) {?> checked<?php }?> />带来收益</label>
      <label style="width: 80px;"><input type="checkbox" name="fenxiaoOfflineItems[]" value="phone"<?php if (in_array('phone',$_smarty_tpl->tpl_vars['fenxiaoOfflineItems']->value)) {?> checked<?php }?> />手机号码</label>
      <label style="width: 80px;"><input type="checkbox" name="fenxiaoOfflineItems[]" value="money"<?php if (in_array('money',$_smarty_tpl->tpl_vars['fenxiaoOfflineItems']->value)) {?> checked<?php }?> />账户余额</label>
      <label style="width: 80px;"><input type="checkbox" name="fenxiaoOfflineItems[]" value="point"<?php if (in_array('point',$_smarty_tpl->tpl_vars['fenxiaoOfflineItems']->value)) {?> checked<?php }?> />账户积分</label>
    </dd>
  </dl>

  <dl class="clearfix">
    <dt><label for="fenxiaoJoinNote">入驻分销推广文案：</label></dt>
    <dd><?php echo '<script'; ?>
 id="fenxiaoJoinNote" name="fenxiaoJoinNote" type="text/plain" style="width:85%;height:200px"><?php echo $_smarty_tpl->tpl_vars['fenxiaoJoinNote']->value;?>
<?php echo '</script'; ?>
></dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="fenxiaoNote">推广二维码文案：</label></dt>
    <dd>
		<?php echo '<script'; ?>
 id="fenxiaoNote" name="fenxiaoNote" type="text/plain" style="width:85%;height:200px"><?php echo $_smarty_tpl->tpl_vars['fenxiaoNote']->value;?>
<?php echo '</script'; ?>
>
	</dd>
  </dl>
  <dl class="clearfix formbtn">
    <dt>&nbsp;</dt>
    <dd><input class="btn btn-large btn-success" type="submit" name="submit" id="btnSubmit" value="确认提交" /></dd>
  </dl>
</form>

<?php echo '<script'; ?>
 type="text/templates" id="juli">
    <style>
        .priceWrap .table {width: auto;}
        .priceWrap .table th {min-width: 150px; height: 30px; text-align: center; line-height: 30px;}
        .priceWrap .table th:last-child {min-width: 50px;}
        .priceWrap .table td {text-align: center; height: 34px; line-height: 31px;}
        .priceWrap .input-append, .input-prepend {margin-bottom: 0;}
        .priceWrap .del {display: inline-block; vertical-align: middle;}

        .priceWrap .error {border-color: #a94442; -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075); box-shadow: inset 0 1px 1px rgba(0,0,0,.075);}
        .priceWrap .error:focus {border-color: #843534; -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 6px #ce8483; box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 6px #ce8483;}

        .juli .table th, .juli .table td {font-size: 14px; text-align: left; padding-left: 10px;}
        .juli .table code {font-size: 14px;}
    </style>
    <div class="juli priceWrap">
        
        <ul class="nav nav-tabs" style="margin-bottom:5px;">
            <li class="active"><a href="javascript:;" data-id="ptdj">平台承担&等级模式</a></li>
            <li><a href="javascript:;" data-id="ptgd">平台承担&固定上级</a></li>
            <li><a href="javascript:;" data-id="sjdj">商家承担&等级模式</a></li>
            <li><a href="javascript:;" data-id="sjgd">商家承担&固定上级</a></li>
        </ul>

        <div id="ptdj">
            <table class="table table-hover table-bordered table-striped" style="width: 100%;">
                <thead>
                    <tr>
                        <th align="left" width="450">默认抽佣方式计算公式如下：	</th>
                        <th align="left" width="350">商品独立佣金计算公式如下：	</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>商家收入=<code>E×(1-C)</code></td>
                        <td>商家收入=<code>E×(1-C)</code></td>
                    </tr>
                    <tr>
                        <td>分销总额=<code>E×C×B1</code></td>
                        <td>分销总额=<code>B2</code></td>
                    </tr>
                    <tr>
                        <td>实际分销金额=<code>E×C×B1×(A₁+A₂……+A₄)</code></td>
                        <td>实际分销金额=<code>B2×(A₁+A₂……+A₄)</code></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>资金沉淀：关闭</strong></td>
                    </tr>
                    <tr>
                        <td>分站收入=<code>E×C×D(1-B1×(A₁+A₂……+A₄))</code></td>
                        <td>分站收入=<code>E×C×D</code></td>
                    </tr>
                    <tr>
                        <td>平台收入=<code>E×C×(1-D+D×B1×(A₁+A₂……+A₄)-B1×(A₁+A₂……+A₄))</code></td>
                        <td>平台收入=<code>E×C×(1-D)</code></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>资金沉淀：开启</strong></td>
                    </tr>
                    <tr>
                        <td>分站收入=<code>E×C×D×(1-B1)</code></td>
                        <td>分站收入=<code>(E×C-B2)×D</code></td>
                    </tr>
                    <tr>
                        <td>平台收入=<code>E×C×(1-D+D×B1-B1)</code></td>
                        <td>平台收入=<code>(1-D)×(E×C-B2)</code></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="ptgd" class="hide">
            <table class="table table-hover table-bordered table-striped" style="width: 100%;">
                <thead>
                    <tr>
                        <th align="left" width="450">默认抽佣方式计算公式如下：	</th>
                        <th align="left" width="350">商品独立佣金计算公式如下：	</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>商家收入=<code>E×(1-C)</code></td>
                        <td>商家收入=<code>E×(1-C)</code></td>
                    </tr>
                    <tr>
                        <td>分销商收入=<code>E×C×B1×A</code></td>
                        <td>分销商收入=<code>B2×A</code></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>资金沉淀：关闭</strong></td>
                    </tr>
                    <tr>
                        <td>分站收入=<code>E×C×D×(1-B1×A)</code></td>
                        <td>分站收入=<code>(E×C-B2×A)×D</code></td>
                    </tr>
                    <tr>
                        <td>平台收入=<code>E×C×(1-B1×A)×(1-D)</code></td>
                        <td>平台收入=<code>(1-D)×(E×C-B2×A)</code></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>资金沉淀：开启</strong></td>
                    </tr>
                    <tr>
                        <td>分站收入=<code>E×C×D×(1-B1)</code></td>
                        <td>分站收入=<code>(E×C-B2)×D</code></td>
                    </tr>
                    <tr>
                        <td>平台收入=<code>E×C(1-D+B1×D-B1)</code></td>
                        <td>平台收入=<code>(1-D)×(E×C-B2)</code></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="sjdj" class="hide">
            <table class="table table-hover table-bordered table-striped" style="width: 100%;">
                <thead>
                    <tr>
                        <th align="left" width="450">默认抽佣方式计算公式如下：	</th>
                        <th align="left" width="350">商品独立佣金计算公式如下：	</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>商家收入=<code>E×(1-C)-E×B1×(A₁+A₂……+A₄)</code></td>
                        <td>商家收入=<code>E×(1-C)-B2</code></td>
                    </tr>
                    <tr>
                        <td>分销总额=<code>E×B1</code></td>
                        <td>分销总额=<code>B2</code></td>
                    </tr>
                    <tr>
                        <td>实际分销金额=<code>E×B1×(A₁+A₂……+A₄)</code></td>
                        <td>实际分销金额=<code>B2×(A₁+A₂……+A₄)</code></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>资金沉淀：关闭</strong></td>
                    </tr>
                    <tr>
                        <td>分站收入=<code>E×C×D</code></td>
                        <td>分站收入=<code>E×C×D</code></td>
                    </tr>
                    <tr>
                        <td>平台收入=<code>E×C×(1-D)</code></td>
                        <td>平台收入=<code>E×C×(1-D)</code></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>资金沉淀：开启</strong></td>
                    </tr>
                    <tr>
                        <td>商家收入=<code>E×(1-C)-E×B1</code></td>
                        <td>商家收入=<code>E×(1-C)-B2</code></td>
                    </tr>
                </tbody>
            </table>
        </div>        
        <div id="sjgd" class="hide">
            <table class="table table-hover table-bordered table-striped" style="width: 100%;">
                <thead>
                    <tr>
                        <th align="left" width="450">默认抽佣方式计算公式如下：	</th>
                        <th align="left" width="350">商品独立佣金计算公式如下：	</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>商家收入=<code>E×(1-C-B1×A)</code></td>
                        <td>商家收入=<code>E×(1-C)-B2×A</code></td>
                    </tr>
                    <tr>
                        <td>分销商收入=<code>E×B1×A</code></td>
                        <td>分销商收入=<code>B2×A</code></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>资金沉淀：关闭</strong></td>
                    </tr>
                    <tr>
                        <td>分站收入=<code>E×C×D</code></td>
                        <td>分站收入=<code>E×C×D</code></td>
                    </tr>
                    <tr>
                        <td>平台收入=<code>E×C×(1-D)</code></td>
                        <td>平台收入=<code>E×C×(1-D)</code></td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>资金沉淀：开启</strong></td>
                    </tr>
                    <tr>
                        <td>商家收入=<code>E×(1-C-B1)</code></td>
                        <td>商家收入=<code>E×(1-C)-B2</code></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p>
            <code style="color: #999">【分销等级比例】= <strong>A</strong></code>&nbsp;&nbsp;&nbsp;
            <code style="color: #999">【默认佣金比例】= <strong>B1</strong></code>&nbsp;&nbsp;&nbsp;
            <code style="color: #999">【商品独立佣金】= <strong>B2</strong></code>&nbsp;&nbsp;&nbsp;
            <code style="color: #999">【平台模块抽成】= <strong>C</strong></code>&nbsp;&nbsp;&nbsp;
            <code style="color: #999">【分站模块抽成】= <strong>D</strong>&nbsp;</code>&nbsp;&nbsp;&nbsp;
            <code style="color: #999">【商品销售价格】= <strong>E</strong>&nbsp;</code>
        </p>
    </div>
<?php echo '</script'; ?>
>

<?php echo '<script'; ?>
 type="text/templates" id="trTemp">
  <tr>
    <td><input class="input-small name" type="text" name="fenxiaoLevel[name][]" value="#name"></td>
    <td><div class="input-append"><input class="input-small fee" step="1" max="100" min="0" type="number" name="fenxiaoLevel[fee][]" value="0"><span class="add-on">%</span></div></td>
    <td class="type1"><div class="input-append"><input class="input-small" step="1" min="0" type="number" name="fenxiaoLevel[amount][]" value="0"><span class="add-on">元</span></div></td>
    <td class="type1"><div class="input-append"><input class="input-small" step="1" min="0" type="number" name="fenxiaoLevel[back][]" value="0"><span class="add-on">元</span></div></td>
    <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
  </tr>
<?php echo '</script'; ?>
>

<?php echo $_smarty_tpl->tpl_vars['editorFile']->value;?>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
