<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 15:07:11
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/member/memberList.html" */ ?>
<?php /*%%SmartyHeaderCode:18482191516885d01fb48915-67677392%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '84c9a1e0f003921d63d236f40d8bfcd5d5ce1f16' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/member/memberList.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '18482191516885d01fb48915-67677392',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'levelList' => 0,
    'level' => 0,
    'regFromList' => 0,
    'code' => 0,
    'name' => 0,
    'payname' => 0,
    'notice' => 0,
    'off' => 0,
    'nicknameAudit' => 0,
    'photoAudit' => 0,
    'personalAuth' => 0,
    'companyAuth' => 0,
    'adminPath' => 0,
    'is_cancellation' => 0,
    'cityArr' => 0,
    'cfg_pointName' => 0,
    'cfg_fenxiaoName' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6885d01fbf5740_15549546',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6885d01fbf5740_15549546')) {function content_6885d01fbf5740_15549546($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>会员列表</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<style>
.list td {font-size: 15px;}
.list td small {font-size: 90%;}
.thead li{font-size: 14px;}
.thead li .moneyA,.thead li .pointA,.thead li .bonusA,.thead li .recomdA{color: #999;text-decoration: none;}
.thead li .moneyA.curr,.thead li .pointA.curr,.thead li .bonusA.curr,.thead li .recomdA.curr{color: #2672ec;}
.thead li .moneyA i,.thead li .pointA i,.thead li .bonusA i,.thead li .recomdA i{display: inline-block;width: 18px;height: 20px;background: url(/static/images/ui/chosen-sprite.png) no-repeat -2px 3px;margin-left: 2px;}
.thead li .moneyA.up i,.thead li .pointA.up i,.thead li .bonusA.up i,.thead li .recomdA.up i{background: url(/static/images/ui/chosen-sprite.png) no-repeat -20px 3px;}
.uaccount {padding: 0px 4px; margin-right: 3px; display: inline-block; line-height: 16px; vertical-align: middle; margin-top: -1px; color: #b1b1b1; width: 35px; text-align-last: justify;}
</style>
</head>
<body>
<div class="search">
  <label>搜索：</label>
   <div class="choseCity"><input type="hidden" id="cityid" name="cityid" placeholder="请选择城市分站" value=""></div>
  <select class="chosen-select" id="ctype" style="width: 95px;">
    <option value="">会员类型</option>
    <option value="">全部</option>
    <option value="1">个人</option>
    <option value="2">企业</option>
  </select>
  <select class="chosen-select" id="clevel" style="width: 110px;">
    <option value="">会员等级</option>
    <option value="">所有等级</option>
    <option value="0">普通会员</option>
    <?php  $_smarty_tpl->tpl_vars['level'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['level']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['levelList']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['level']->key => $_smarty_tpl->tpl_vars['level']->value) {
$_smarty_tpl->tpl_vars['level']->_loop = true;
?>
    <option value="<?php echo $_smarty_tpl->tpl_vars['level']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['level']->value['name'];?>
</option>
    <?php } ?>
  </select>
  <select class="chosen-select" id="regfrom" style="width: 110px;">
    <option value="">注册来源</option>
    <option value="">全部来源</option>
    <?php  $_smarty_tpl->tpl_vars['name'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['name']->_loop = false;
 $_smarty_tpl->tpl_vars['code'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['regFromList']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['name']->key => $_smarty_tpl->tpl_vars['name']->value) {
$_smarty_tpl->tpl_vars['name']->_loop = true;
 $_smarty_tpl->tpl_vars['code']->value = $_smarty_tpl->tpl_vars['name']->key;
?>
    <option value="<?php echo $_smarty_tpl->tpl_vars['code']->value;?>
"><?php echo $_smarty_tpl->tpl_vars['name']->value;?>
</option>
    <?php } ?>
  </select>
  &nbsp;&nbsp;注册日期&nbsp;&nbsp;<input class="input-small" type="text" id="stime" placeholder="开始日期">&nbsp;&nbsp;到&nbsp;&nbsp;<input class="input-small" type="text" id="etime" placeholder="结束日期">&nbsp;&nbsp;
  <input class="input-large" type="search" id="keyword" placeholder="请输入关键字，指定用户#123" title="输入#用户ID，可以快速搜索">
  <div style="padding-top: 5px;">
      <label>余额：</label> <input class="input-mini" type="text" id="samount" placeholder="金额">&nbsp;&nbsp;-&nbsp;&nbsp;<input class="input-mini" type="text" id="eamount" placeholder="金额">&nbsp;&nbsp;
      &nbsp;&nbsp;积分：<input class="input-mini" type="text" id="spoint" placeholder="数值">&nbsp;&nbsp;-&nbsp;&nbsp;<input class="input-mini" type="text" id="epoint" placeholder="数值">&nbsp;&nbsp;
      &nbsp;&nbsp;<?php echo $_smarty_tpl->tpl_vars['payname']->value;?>
：<input class="input-mini" type="text" id="sbonus" placeholder="数值">&nbsp;&nbsp;-&nbsp;&nbsp;<input class="input-mini" type="text" id="ebonus" placeholder="数值">&nbsp;&nbsp;
      <button type="button" class="btn btn-success" id="searchBtn">立即搜索</button>&nbsp;&nbsp;
      <a href="memberList.php?dopost=getList&do=export" id="export" class="btn btn-warning">导出会员数据</a>
  </div>
</div>

<div class="filter clearfix">
  <div class="f-left">
    <div class="btn-group" id="selectBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown"><span class="check"></span><span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="1">全选</a></li>
        <li><a href="javascript:;" data-id="0">不选</a></li>
      </ul>
    </div>
    <button class="btn" id="delBtn">删除</button>
    <div class="btn-group" id="stateBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown">全部信息(<span class="totalCount">...</span>)<span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="">全部信息(<span class="totalCount">...</span>)</a></li>
        <li><a href="javascript:;" data-id="0">未审核(<span class="totalGray">...</span>)</a></li>
        <li><a href="javascript:;" data-id="1">正常(<span class="normal">...</span>)</a></li>
        <li><a href="javascript:;" data-id="2">审核拒绝(<span class="lock">...</span>)</a></li>
        <li><a href="javascript:;" data-id="online">在线(<span class="online">...</span>)</a></li>
        <li><a href="javascript:;" data-id="qiyeweikt">企业未开店铺(<span class="qiyeweikt">...</span>)</a></li>
        <li><a href="javascript:;" data-id="3">已关注微信公众号(<span class="wechat_subscribe">...</span>)</a></li>
        <li><a href="javascript:;" data-id="4">未关注微信公众号(<span class="nowechat_subscribe">...</span>)</a></li>
        <li><a href="javascript:;" data-id="5">机器人(<span class="totalRobot">...</span>)</a></li>
        <li class="divider"></li>
        <li><a href="javascript:;" data-id="noopr">余额统计(<span class="allmoney">...</span>)</a></li>
        <li><a href="javascript:;" data-id="noopr">积分统计(<span class="allPoint">...</span>)</a></li>
        <li><a href="javascript:;" data-id="noopr"><?php echo $_smarty_tpl->tpl_vars['payname']->value;?>
统计(<span class="allBonus">...</span>)</a></li>
      </ul>
    </div>
    <div class="btn-group" id="pendBtn"<?php if ($_smarty_tpl->tpl_vars['notice']->value&&!$_smarty_tpl->tpl_vars['off']->value&&!$_smarty_tpl->tpl_vars['nicknameAudit']->value&&!$_smarty_tpl->tpl_vars['photoAudit']->value&&!$_smarty_tpl->tpl_vars['personalAuth']->value&&!$_smarty_tpl->tpl_vars['companyAuth']->value) {?> data-id="0"<?php }
if ($_smarty_tpl->tpl_vars['personalAuth']->value) {?> data-id="1"<?php }
if ($_smarty_tpl->tpl_vars['companyAuth']->value) {?> data-id="2"<?php }
if ($_smarty_tpl->tpl_vars['off']->value) {?> data-id="3"<?php }
if ($_smarty_tpl->tpl_vars['nicknameAudit']->value) {?> data-id="4"<?php }
if ($_smarty_tpl->tpl_vars['photoAudit']->value) {?> data-id="5"<?php }?>>
      <button class="btn dropdown-toggle" data-toggle="dropdown"><?php if ($_smarty_tpl->tpl_vars['personalAuth']->value) {?>个人实名待认证<?php } elseif ($_smarty_tpl->tpl_vars['companyAuth']->value) {?>公司待认证<?php } elseif ($_smarty_tpl->tpl_vars['off']->value) {?>账户注销<?php } elseif ($_smarty_tpl->tpl_vars['nicknameAudit']->value) {?>昵称审核<?php } elseif ($_smarty_tpl->tpl_vars['photoAudit']->value) {?>头像审核<?php } else { ?>待办事项<?php }?>(<span class="<?php if ($_smarty_tpl->tpl_vars['off']->value) {?>cancellation<?php } elseif ($_smarty_tpl->tpl_vars['personalAuth']->value) {?>pendPerson<?php } elseif ($_smarty_tpl->tpl_vars['companyAuth']->value) {?>pendCompany<?php } elseif ($_smarty_tpl->tpl_vars['nicknameAudit']->value) {?>nicknameAudit<?php } elseif ($_smarty_tpl->tpl_vars['photoAudit']->value) {?>photoAudit<?php } else { ?>totalPend<?php }?>">...</span>)<span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="0">全部待办信息(<span class="totalPend">...</span>)</a></li>
        <li><a href="javascript:;" data-id="1">个人实名待认证(<span class="pendPerson">...</span>)</a></li>
        <li><a href="javascript:;" data-id="2">公司待认证(<span class="pendCompany">...</span>)</a></li>
        <li><a href="javascript:;" data-id="3">账户注销(<span class="cancellation">...</span>)</a></li>
        <li><a href="javascript:;" data-id="4">昵称审核(<span class="nicknameAudit">...</span>)</a></li>
        <li><a href="javascript:;" data-id="5">头像审核(<span class="photoAudit">...</span>)</a></li>
      </ul>
    </div>
    <a href="javascript:;" id="updateAccount" class="btn">更新账户余额</a>
    <a href="memberList.php?dopost=Add" class="btn btn-primary" id="addNew">添加会员</a>
  </div>
  <div class="f-right">
    <div class="btn-group" id="pageBtn" data-id="20">
      <button class="btn dropdown-toggle" data-toggle="dropdown">每页20条<span class="caret"></span></button>
      <ul class="dropdown-menu pull-right">
        <li><a href="javascript:;" data-id="10">每页10条</a></li>
        <li><a href="javascript:;" data-id="15">每页15条</a></li>
        <li><a href="javascript:;" data-id="20">每页20条</a></li>
        <li><a href="javascript:;" data-id="30">每页30条</a></li>
        <li><a href="javascript:;" data-id="50">每页50条</a></li>
        <li><a href="javascript:;" data-id="100">每页100条</a></li>
      </ul>
    </div>
    <button class="btn dropdown-toggle disabled" data-toggle="dropdown" id="prevBtn">上一页</button>
    <button class="btn dropdown-toggle disabled" data-toggle="dropdown" id="nextBtn">下一页</button>
    <div class="btn-group" id="paginationBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown">1/1页<span class="caret"></span></button>
      <ul class="dropdown-menu" style="left:auto; right:0;">
        <li><a href="javascript:;" data-id="1">第1页</a></li>
      </ul>
    </div>
  </div>
</div>

<ul class="thead t100 clearfix">
  <li class="row3">&nbsp;</li>
  <li class="row6 left">类型</li>
  <li class="row20 left">用户名/昵称</li>
  <li class="row15 left">真名/公司名/<a href="javascript:;" class="recomdA" title="按推荐人数从多到少排序">推荐人数<i></i></a></li>
  <li class="row13 left">邮箱/电话</li>
  <li class="row13 left"><a href="javascript:;" class="moneyA">余额<i></i></a>/&nbsp;<a href="javascript:;" class="pointA">积分<i></i></a>/&nbsp;<a href="javascript:;" class="bonusA"><?php echo $_smarty_tpl->tpl_vars['payname']->value;?>
<i></i></a></li>
  <li class="row12 left">注册/上次登录</li>
  <li class="row10">状态</li>
  <li class="row8">操作</li>
</ul>

<div class="list common mt124" id="list" data-totalpage="1" data-atpage="1"><table><tbody></tbody></table><div id="loading" class="loading hide"></div></div>

<div id="pageInfo" class="pagination pagination-centered"></div>

<?php echo '<script'; ?>
 id="updateAccountHtml" type="text/html">
    <form action="" class="quick-editForm" name="editForm">
      <dl class="clearfix">
        <dt>操作范围：</dt>
        <dd class="clearfix">
            <label><input type="radio" name="fanwei" value="0" checked />系统所有会员&nbsp;&nbsp;<small style="color: red;" title="容易造成超时，导致一部分成功，一部分失败，操作前先设置好PHP的超时时间为不限制！">会员多时不建议使用！</small></label><br />
            <label><input type="radio" name="fanwei" value="1" />符合筛选条件的会员</label><br />
            <label><input type="radio" name="fanwei" value="2" />已选择的会员</label>
        </dd>
      </dl>
      <dl class="clearfix">
        <dt>操作账户：</dt>
        <dd class="clearfix">
            <label><input type="radio" name="account" value="money" checked />余额</label>&nbsp;&nbsp;
            <label><input type="radio" name="account" value="point" />积分</label>&nbsp;&nbsp;
            <label><input type="radio" name="account" value="bonus" /><?php echo $_smarty_tpl->tpl_vars['payname']->value;?>
</label>
        </dd>
      </dl>
      <dl class="clearfix">
        <dt>操作内容：</dt>
        <dd class="clearfix">
            <label><input type="radio" name="oper" value="1" checked />增加</label>&nbsp;&nbsp;
            <label><input type="radio" name="oper" value="0" />减少</label>
            <input type="number" min="0" class="input-mini" id="updateAccountAmount" name="amount" placeholder="金额" />
        </dd>
      </dl>
      <dl class="clearfix">
        <dt>操作说明：</dt>
        <dd><input type="text" id="updateAccountNote" name="note" placeholder="" /></dd>
      </dl>
      <dl class="clearfix">
        <dt>变动提醒：</dt>
        <dd class="clearfix">
            <label><input type="radio" name="notify" value="1" checked />发送</label>&nbsp;&nbsp;
            <label><input type="radio" name="notify" value="0" />不发送</label>
        </dd>
      </dl>
    </form>
<?php echo '</script'; ?>
>

<div class="hide">
  <span id="sKeyword"></span>
  <span id="start"></span>
  <span id="end"></span>
  <span id="startmoney"></span>
  <span id="endmoney"></span>
  <span id="startpoint"></span>
  <span id="endpoint"></span>
  <span id="startbonus"></span>
  <span id="endbonus"></span>
  <span id="orderMoney"></span>
  <span id="orderPoint"></span>
  <span id="orderBonus"></span>
  <span id="recomdOrder"></span>
</div>

<?php echo '<script'; ?>
>
var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";
var is_cancellation = '<?php echo $_smarty_tpl->tpl_vars['is_cancellation']->value;?>
';
var cityList = <?php echo json_encode($_smarty_tpl->tpl_vars['cityArr']->value);?>
;
var pointname = '<?php echo $_smarty_tpl->tpl_vars['cfg_pointName']->value;?>
', payname = '<?php echo $_smarty_tpl->tpl_vars['payname']->value;?>
';
var fenxiaoName = '<?php echo $_smarty_tpl->tpl_vars['cfg_fenxiaoName']->value;?>
';
<?php echo '</script'; ?>
>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
