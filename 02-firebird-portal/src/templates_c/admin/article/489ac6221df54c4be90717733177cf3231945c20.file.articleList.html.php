<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-28 10:56:08
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/article/articleList.html" */ ?>
<?php /*%%SmartyHeaderCode:12512165386886e6c884faf4-84038574%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '489ac6221df54c4be90717733177cf3231945c20' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/article/articleList.html',
      1 => 1753593716,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '12512165386886e6c884faf4-84038574',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_soft_lang' => 0,
    'cssFile' => 0,
    'need_audit' => 0,
    'zhuanti' => 0,
    'zhuantiName' => 0,
    'recycle' => 0,
    'notice' => 0,
    'action' => 0,
    'typeListArr' => 0,
    'cityList' => 0,
    'adminPath' => 0,
    'moldListArr' => 0,
    'ztTypeListArr' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6886e6c8902416_42906637',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6886e6c8902416_42906637')) {function content_6886e6c8902416_42906637($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>管理文章</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<?php echo '<script'; ?>
>
  var need_audit = <?php echo $_smarty_tpl->tpl_vars['need_audit']->value;?>
;
<?php echo '</script'; ?>
>
</head>

<body>
<div class="search">
  <label>搜索：<input class="input-large" type="search" id="keyword" placeholder="请输入关键字，指定用户#123" title="输入#用户ID，可以快速搜索"></label>
  发布日期&nbsp;&nbsp;<input class="input-small" type="text" id="stime" placeholder="开始日期" autocomplete="off">&nbsp;到&nbsp;<input class="input-small" type="text" id="etime" placeholder="结束日期" autocomplete="off">
  <div class="btn-group" id="typeBtnMold" data-id="">
    <button class="btn dropdown-toggle" data-toggle="dropdown">全部类型<span class="caret"></span></button>
  </div>
  <div class="btn-group" id="typeBtn" data-id="">
    <button class="btn dropdown-toggle" data-toggle="dropdown">全部分类<span class="caret"></span></button>
  </div>
  <div class="btn-group" id="typeBtnZt" data-id="<?php echo $_smarty_tpl->tpl_vars['zhuanti']->value;?>
">
    <button class="btn dropdown-toggle" data-toggle="dropdown"><?php echo (($tmp = @mb_substr($_smarty_tpl->tpl_vars['zhuantiName']->value,0,10,'utf8'))===null||$tmp==='' ? '全部专题' : $tmp);?>
<span class="caret"></span></button>
  </div>
  <!-- <select class="chosen-select" id="cityList" style="width: auto;"></select> -->
  <div class="choseCity"><input type="hidden" id="cityid" name="cityid" placeholder="请选择城市分站" value=""></div>
  <button type="button" class="btn btn-success" id="searchBtn">立即搜索</button>
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
    <button class="btn" data-toggle="dropdown" id="delBtn">删除</button>
    <button class="btn" data-toggle="dropdown" id="revertBtn">还原</button>
    <button class="btn" data-toggle="dropdown" id="fullyDelBtn">彻底删除</button>
    <?php if ($_smarty_tpl->tpl_vars['recycle']->value!=1) {?>
    <div class="btn-group" id="stateBtn"<?php if ($_smarty_tpl->tpl_vars['notice']->value) {?> data-id="0"<?php }?>>
      <?php if ($_smarty_tpl->tpl_vars['notice']->value) {?>
      <button class="btn dropdown-toggle" data-toggle="dropdown">待审核(<span class="totalGray"></span>)<span class="caret"></span></button>
      <?php } else { ?>
      <button class="btn dropdown-toggle" data-toggle="dropdown">全部信息(<span class="totalCount"></span>)<span class="caret"></span></button>
      <?php }?>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="">全部信息(<span class="totalCount"></span>)</a></li>
        <li><a href="javascript:;" data-id="0">待审核(<span class="totalGray"></span>)</a></li>
        <li><a href="javascript:;" data-id="1">已审核(<span class="totalAudit"></span>)</a></li>
        <li><a href="javascript:;" data-id="2">拒绝审核(<span class="totalRefuse"></span>)</a></li>
      </ul>
    </div>
    <?php }?>
    <div class="btn-group" id="propertyBtn">
      <button class="btn dropdown-toggle" data-toggle="dropdown">查看属性<span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="">全部</a></li>
        <li><a href="javascript:;" data-id="p">带图</a></li>
        <li><a href="javascript:;" data-id="h">头条</a></li>
        <li><a href="javascript:;" data-id="r">推荐</a></li>
        <li><a href="javascript:;" data-id="b">加粗</a></li>
        <li><a href="javascript:;" data-id="t">跳转</a></li>
      </ul>
    </div>
    <button class="btn" data-toggle="dropdown" id="addProperty">添加属性</button>
    <button class="btn" data-toggle="dropdown" id="delProperty">删除属性</button>
    <div class="btn-group hide" id="batchAudit">
      <button class="btn dropdown-toggle" data-toggle="dropdown">批量审核<span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a href="javascript:;" data-id="待审核">待审核</a></li>
        <li><a href="javascript:;" data-id="已审核">已审核</a></li>
        <li><a href="javascript:;" data-id="拒绝审核">拒绝审核</a></li>
      </ul>
    </div>
    <button class="btn" data-toggle="dropdown" id="moveBtn">移动</button>
    <button style="display: none;" class="btn" data-toggle="dropdown" id="recycleBtn"<?php if ($_smarty_tpl->tpl_vars['recycle']->value==1) {?> data-id="1"<?php }?>>回收站</button>
    <?php if ($_smarty_tpl->tpl_vars['recycle']->value!=1) {?><a href="articleAdd.php?action=<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
" class="btn btn-primary" id="addNew">添加<?php if ($_smarty_tpl->tpl_vars['action']->value=="article") {?>新闻<?php } else { ?>图片<?php }?></a><?php }?>
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
    <button class="btn disabled" data-toggle="dropdown" id="prevBtn">上一页</button>
    <button class="btn disabled" data-toggle="dropdown" id="nextBtn">下一页</button>
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
  <li class="row20">标题</li>
  <li class="row5"><?php if ($_smarty_tpl->tpl_vars['recycle']->value!=1) {?>修改<?php } else { ?>还原<?php }?></li>
  <li class="row12">分类</li>
  <li class="row5"><?php if ($_smarty_tpl->tpl_vars['recycle']->value!=1) {?>城市<?php } else { ?>&nbsp;<?php }?></li>
  <li class="row15"><?php if ($_smarty_tpl->tpl_vars['recycle']->value!=1) {?>审核状态<?php } else { ?>&nbsp;<?php }?></li>
  <li class="row10">发布者</li>
  <li class="row15">时间</li>
  <li class="row10">打赏</li>
  <li class="row5">删除</li>
</ul>

<div class="list mt124" id="list" data-totalpage="1" data-atpage="1"><table><tbody></tbody></table><div id="loading" class="loading hide"></div></div>

<div id="pageInfo" class="pagination pagination-centered"></div>

<div class="hide">
  <span id="sKeyword"></span>
  <span id="sType"></span>
  <span id="mType"></span>
  <span id="zType"><?php echo $_smarty_tpl->tpl_vars['zhuanti']->value;?>
</span>
  <span id="start"></span>
  <span id="end"></span>
</div>

<?php echo '<script'; ?>
>
  var typeListArr = <?php echo $_smarty_tpl->tpl_vars['typeListArr']->value;?>
, cityList = <?php echo $_smarty_tpl->tpl_vars['cityList']->value;?>
, action = '<?php echo $_smarty_tpl->tpl_vars['action']->value;?>
', adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
";
  var moldListArr = <?php echo $_smarty_tpl->tpl_vars['moldListArr']->value;?>
;
  var ztTypeListArr = <?php echo $_smarty_tpl->tpl_vars['ztTypeListArr']->value;?>
;
<?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 id="quickEdit" type="text/html">
  <form action="" class="quick-editForm" name="editForm">
    <dl class="clearfix">
      <dt>所属栏目：</dt>
      <dd>
        <select id="typeid" name="typeid"></select>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>标题：</dt>
      <dd><input type="text" id="title" name="title" /></dd>
    </dl>
    <dl class="clearfix">
      <dt>简略标题：</dt>
      <dd><input type="text" id="subtitle" name="subtitle" /></dd>
    </dl>
    <dl class="clearfix">
      <dt>自定义属性：</dt>
      <dd class="clearfix">
        <label><input type="checkbox" name="flags[]" value="h" />头条[h]</label>&nbsp;&nbsp;
        <label><input type="checkbox" name="flags[]" value="r" />推荐[r]</label>&nbsp;&nbsp;
        <label><input type="checkbox" name="flags[]" value="b" />加粗[b]</label>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt>阅读权限：</dt>
      <dd>
        <select id="arcrank" name="arcrank">
          <option value="0">等待审核</option>
          <option value="1" selected="selected">审核通过</option>
          <option value="2">审核拒绝</option>
        </select>
      </dd>
    </dl>
  </form>
<?php echo '</script'; ?>
>

<?php echo '<script'; ?>
 id="propertyForm" type="text/html">
  <form action="" class="quick-editForm" name="editForm">
    <dl class="clearfix">
      <dt>自定义属性：</dt>
      <dd class="clearfix">
        <label><input type="checkbox" name="flags" value="h" />头条[h]</label>&nbsp;&nbsp;
        <label><input type="checkbox" name="flags" value="r" />推荐[r]</label>&nbsp;&nbsp;
        <label><input type="checkbox" name="flags" value="b" />加粗[b]</label>
      </dd>
    </dl>
  </form>
<?php echo '</script'; ?>
>

<?php echo '<script'; ?>
 id="moveForm" type="text/html">
  <form action="" class="quick-editForm" name="editForm">
    <dl class="clearfix">
      <dt>目标栏目：</dt>
      <dd>
        <select id="typeid"></select>
      </dd>
    </dl>
  </form>
<?php echo '</script'; ?>
>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
