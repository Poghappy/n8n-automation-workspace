<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 19:25:44
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/wechat/wechatConfig.html" */ ?>
<?php /*%%SmartyHeaderCode:43215511568860cb83cba15-23221911%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '4837a2e6099b504c4e2d91dee99e19e9da05d581' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/wechat/wechatConfig.html',
      1 => 1753596880,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '43215511568860cb83cba15-23221911',
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
    'token' => 0,
    'typeState' => 0,
    'typeStateChecked' => 0,
    'typeStateNames' => 0,
    'cfg_basehost' => 0,
    'wechatToken' => 0,
    'wechatAppid' => 0,
    'wechatAppsecret' => 0,
    'loginState' => 0,
    'loginStateChecked' => 0,
    'loginStateNames' => 0,
    'bindState' => 0,
    'bindStateChecked' => 0,
    'bindStateNames' => 0,
    'redirectState' => 0,
    'redirectStateChecked' => 0,
    'redirectStateNames' => 0,
    'posterState' => 0,
    'posterStateChecked' => 0,
    'posterStateNames' => 0,
    'wechatTips' => 0,
    'wechatTipsChecked' => 0,
    'wechatTipsNames' => 0,
    'wechatName' => 0,
    'wechatCode' => 0,
    'wechatQr' => 0,
    'map_amap' => 0,
    'map_amap_jscode' => 0,
    'map_amap_server' => 0,
    'miniProgramName' => 0,
    'miniProgramAppid' => 0,
    'miniProgramAppsecret' => 0,
    'miniProgramId' => 0,
    'useWxMiniProgramLoginState' => 0,
    'useWxMiniProgramLoginStateChecked' => 0,
    'useWxMiniProgramLoginStateNames' => 0,
    'miniProgramLocationAuthState' => 0,
    'miniProgramLocationAuthStateChecked' => 0,
    'miniProgramLocationAuthStateNames' => 0,
    'cfg_staticVersion' => 0,
    'miniProgramLoginProfileState' => 0,
    'miniProgramLoginProfileStateChecked' => 0,
    'miniProgramLoginProfileStateNames' => 0,
    'iosVirtualPaymentState' => 0,
    'iosVirtualPaymentStateChecked' => 0,
    'iosVirtualPaymentStateNames' => 0,
    'iosVirtualPaymentTip' => 0,
    'miniProgramBindPhoneState' => 0,
    'miniProgramBindPhoneStateChecked' => 0,
    'miniProgramBindPhoneStateNames' => 0,
    'miniProgramQr' => 0,
    'touchTplList' => 0,
    'touchTemplate' => 0,
    'tplItem' => 0,
    'disabledModuleArr' => 0,
    'disabledModule' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_68860cb853a1a1_84849898',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_68860cb853a1a1_84849898')) {function content_68860cb853a1a1_84849898($_smarty_tpl) {?><?php if (!is_callable('smarty_function_html_radios')) include '/www/wwwroot/hawaiihub.net/include/tpl/plugins/function.html_radios.php';
?><!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $_smarty_tpl->tpl_vars['cfg_soft_lang']->value;?>
" />
<title>微信基本设置</title>
<?php echo $_smarty_tpl->tpl_vars['cssFile']->value;?>

<?php echo '<script'; ?>
>
var thumbSize = <?php echo $_smarty_tpl->tpl_vars['thumbSize']->value;?>
, thumbType = "<?php echo $_smarty_tpl->tpl_vars['thumbType']->value;?>
";
var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", action = "wechat";
<?php echo '</script'; ?>
>
<style media="screen">
    .thead {margin: 20px 10px;}
    .weixinQr img,.miniProgramQr img{width: 94px; height: 94px; margin-left: -4px;}.editform dt{width: 220px;}.editform dt label.sl{margin-top: -10px;}.editform dt small{display: block; margin: -8px 12px 0 0;}.editform dt small i{font-style: normal;}
    .tpl-list.touch{margin-bottom: 20px;margin-top: 0px;margin-left: 0px;padding-left:0px;}
</style>
</head>

<body>
<div class="alert alert-success" style="margin:10px 10px 0;"><button type="button" class="close" data-dismiss="alert">×</button>微信配置教程：<a href="https://help.kumanyun.com/help-50-9.html" target="_blank">https://help.kumanyun.com/help-50-9.html</a><br />注意：打通微信公众平台后，请不要随意变更AppId，否则会导致已经使用微信登录过的账号失效！</div>

<form action="" method="post" name="editform" id="editform" class="editform">
  <input type="hidden" name="token" id="token" value="<?php echo $_smarty_tpl->tpl_vars['token']->value;?>
" />
  <div class="thead" style="margin-top: 0;">&nbsp;&nbsp;服务器配置</div>
    <dl class="clearfix">
      <dt><label>登录确认：</label></dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"wechatType",'values'=>$_smarty_tpl->tpl_vars['typeState']->value,'checked'=>$_smarty_tpl->tpl_vars['typeStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['typeStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

        <span class="input-tips" style="display: inline-block;"><s></s>如果开通了APP或者小程序，请选择【需要确认】，否则会再创建一个新的用户！</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label>服务器URL：</label></dt>
      <dd style="padding-top: 10px;">
        <span style="font-size: 14px;"><?php echo $_smarty_tpl->tpl_vars['cfg_basehost']->value;?>
/api/weixin/</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="wechatToken">服务器Token：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="wechatToken" id="wechatToken" value="<?php echo $_smarty_tpl->tpl_vars['wechatToken']->value;?>
" data-regex=".*" />
        <span class="input-tips"><s></s>请输入服务器配置Token</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="wechatAppid">开发者AppID：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="wechatAppid" id="wechatAppid" value="<?php echo $_smarty_tpl->tpl_vars['wechatAppid']->value;?>
" data-regex=".*" />
        <span class="input-tips"><s></s>请输入开发者AppID</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label for="wechatAppsecret">开发者AppSecret：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="wechatAppsecret" id="wechatAppsecret" value="<?php echo $_smarty_tpl->tpl_vars['wechatAppsecret']->value;?>
" data-regex=".*" />
        <span class="input-tips"><s></s>请输入开发者AppSecret</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label>微信访问自动登录：</label></dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"wechatAutoLogin",'values'=>$_smarty_tpl->tpl_vars['loginState']->value,'checked'=>$_smarty_tpl->tpl_vars['loginStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['loginStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

		<span class="input-tips" style="display: inline-block;"><s></s>如果开通了APP或者小程序，请选择【关闭】，否则会再创建一个新的用户，<font color="#ff0000">开启后，小程序将无法使用支付功能！</font><br />如果分站或者模块绑定独立域名后，不支持微信自动登录！</span>
      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label>微信注册必须绑定手机：</label></dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"wechatBindPhone",'values'=>$_smarty_tpl->tpl_vars['bindState']->value,'checked'=>$_smarty_tpl->tpl_vars['bindStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['bindStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label>图文消息跳转方式：</label></dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"wechatRedirect",'values'=>$_smarty_tpl->tpl_vars['redirectState']->value,'checked'=>$_smarty_tpl->tpl_vars['redirectStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['redirectStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label>海报二维码：</label></dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"wechatPoster",'values'=>$_smarty_tpl->tpl_vars['posterState']->value,'checked'=>$_smarty_tpl->tpl_vars['posterStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['posterStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      </dd>
    </dl>
    <dl class="clearfix">
      <dt><label>关注公众号提示：</label></dt>
      <dd class="radio">
        <?php echo smarty_function_html_radios(array('name'=>"wechatTips",'values'=>$_smarty_tpl->tpl_vars['wechatTips']->value,'checked'=>$_smarty_tpl->tpl_vars['wechatTipsChecked']->value,'output'=>$_smarty_tpl->tpl_vars['wechatTipsNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      </dd>
    </dl>
  <div class="thead" style="margin-top: 20px;">&nbsp;&nbsp;基本配置</div>
  <dl class="clearfix">
    <dt><label for="wechatName" class="sl">公众号名称：</label><small><i>{</i><i>#$</i>cfg_weixinName<i>#}</i></small></dt>
    <dd>
      <input class="input-xlarge" type="text" name="wechatName" id="wechatName" value="<?php echo $_smarty_tpl->tpl_vars['wechatName']->value;?>
" data-regex=".*" />
      <span class="input-tips"><s></s>请输入公众号名称</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label for="wechatCode" class="sl">微信号：</label><small><i>{</i><i>#$</i>cfg_weixinCode<i>#}</i></small></dt>
    <dd>
      <input class="input-xlarge" type="text" name="wechatCode" id="wechatCode" value="<?php echo $_smarty_tpl->tpl_vars['wechatCode']->value;?>
" data-regex=".*" />
      <span class="input-tips"><s></s>请输入微信号</span>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label class="sl">二维码：</label><small><i>{</i><i>#$</i>cfg_weixinQr<i>#}</i></small></dt>
    <dd class="weixinQr">
      <input name="wechatQr" type="hidden" id="wechatQr" value="<?php echo $_smarty_tpl->tpl_vars['wechatQr']->value;?>
" />
      <div class="spic<?php if ($_smarty_tpl->tpl_vars['wechatQr']->value=='') {?> hide<?php }?>">
        <div class="sholder"><?php if ($_smarty_tpl->tpl_vars['wechatQr']->value) {?><img src="/include/attachment.php?f=<?php echo $_smarty_tpl->tpl_vars['wechatQr']->value;?>
" /><?php }?></div>
        <a href="javascript:;" class="reupload"<?php if ($_smarty_tpl->tpl_vars['wechatQr']->value) {?> style="display: inline-block;"<?php }?>>重新上传</a>
      </div>
      <iframe src ="/include/upfile.inc.php?mod=siteConfig&type=card&obj=wechatQr" style="width:100%; height:25px;<?php if ($_smarty_tpl->tpl_vars['wechatQr']->value) {?> display:none;<?php }?>" scrolling="no" frameborder="0" marginwidth="0" marginheight="0" ></iframe>
    </dd>
  </dl>
  <dl class="clearfix hide">
    <dt><label for="mapkey_amap">高德地图API密钥：</label></dt>
    <dd>
      <div class="input-prepend input-append">
        <span class="add-on">Web端(JS API) Key：</span>
        <input class="input-xlarge" type="text" name="mapkey_amap" id="mapkey_amap" value="<?php echo $_smarty_tpl->tpl_vars['map_amap']->value;?>
" />
        <div class="btn-group"><a href="http://lbs.amap.com/dev/key/app" class="btn" target="_blank">申请高德地图密钥 <i class="icon-share-alt"></i></a></div>
        <span class="input-tips" style="display: inline-block; color: red; margin-left: 20px;"><s></s>如不配置，微信端将无法定位！</span>
      </div>
      <br />
      <div class="input-prepend input-append">
        <span class="add-on">Web端(JS API) 安全密钥：</span>
        <input class="input-xlarge" type="text" name="mapkey_amap_jscode" id="mapkey_amap_jscode" value="<?php echo $_smarty_tpl->tpl_vars['map_amap_jscode']->value;?>
" />
        <div class="btn-group"><a href="http://lbs.amap.com/dev/key/app" class="btn" target="_blank">申请高德地图密钥 <i class="icon-share-alt"></i></a></div>
        <span class="input-tips" style="display: inline-block; color: red; margin-left: 20px;"><s></s>如不配置，微信端将无法定位！</span>
      </div>
      <br />
      <div class="input-prepend input-append">
        <span class="add-on">Web服务：</span>
        <input class="input-xlarge" type="text" name="mapkey_amap_server" id="mapkey_amap_server" value="<?php echo $_smarty_tpl->tpl_vars['map_amap_server']->value;?>
" />
        <div class="btn-group"><a href="http://lbs.amap.com/dev/key/app" class="btn" target="_blank">申请高德地图密钥 <i class="icon-share-alt"></i></a></div>
        <span class="input-tips" style="display: inline-block; color: red; margin-left: 20px;"><s></s>如不配置，微信端将无法定位！</span>
      </div>
    </dd>
  </dl>
  <div class="thead" style="margin-top: 20px;">&nbsp;&nbsp;小程序配置</div>
  <dl class="clearfix">
    <dt><label for="miniProgramName" class="sl">小程序名称：</label><small><i>{</i><i>#$</i>cfg_miniProgramName<i>#}</i></small></dt>
    <dd>
      <input class="input-xlarge" type="text" name="miniProgramName" id="miniProgramName" value="<?php echo $_smarty_tpl->tpl_vars['miniProgramName']->value;?>
" data-regex=".*" />
      <span class="input-tips"><s></s>请输入小程序名称</span>
    </dd>
  </dl>
  <dl class="clearfix">
      <dt><label for="miniProgramAppid">小程序AppID：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="miniProgramAppid" id="miniProgramAppid" value="<?php echo $_smarty_tpl->tpl_vars['miniProgramAppid']->value;?>
" data-regex=".*" />
        <span class="input-tips"><s></s>请输入小程序AppID</span>
      </dd>
  </dl>
  <dl class="clearfix">
      <dt><label for="miniProgramAppsecret">小程序AppSecret：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="miniProgramAppsecret" id="miniProgramAppsecret" value="<?php echo $_smarty_tpl->tpl_vars['miniProgramAppsecret']->value;?>
" data-regex=".*" />
        <span class="input-tips"><s></s>请输入小程序AppSecret</span>
      </dd>
  </dl>
  <dl class="clearfix">
      <dt><label for="miniProgramId">原始ID：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="miniProgramId" id="miniProgramId" value="<?php echo $_smarty_tpl->tpl_vars['miniProgramId']->value;?>
" data-regex=".*" />
        <span class="input-tips"><s></s>请输入小程序原始ID</span>
      </dd>
  </dl>
  <dl class="clearfix">
    <dt><label>使用微信原生登录：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"useWxMiniProgramLogin",'values'=>$_smarty_tpl->tpl_vars['useWxMiniProgramLoginState']->value,'checked'=>$_smarty_tpl->tpl_vars['useWxMiniProgramLoginStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['useWxMiniProgramLoginStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <p style="padding-left: 0; font-size: 12px; padding-top: 10px; color: #999;">由于微信小程序于2023年8月26日起（<a href="https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html" target="_blank">查看官方收费说明</a>），对手机号快速验证组件进行付费使用，开启此功能前，请确保【手机号快速验证组件】的资源包余量充足，否则将导致用户端登录失败！<br />建议开启此功能，可以让用户的登录流程体验更加流畅。<br />关闭此功能将会对用户的多端登录、提现、微信模板消息等和微信相关的功能受到影响，关闭后将自动使用账号密码的方式进行登录。</p>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label>获取当前位置接口权限：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"miniProgramLocationAuth",'values'=>$_smarty_tpl->tpl_vars['miniProgramLocationAuthState']->value,'checked'=>$_smarty_tpl->tpl_vars['miniProgramLocationAuthStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['miniProgramLocationAuthStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <p style="padding-left: 0; font-size: 12px; padding-top: 10px; color: #999;">说明：无感自动获取当前位置需要申请<code>wx.getLocation</code>接口权限，<font color="red">如果没有申请下来，不要选择此项！</font><br />申请地址：<a href="https://mp.weixin.qq.com/" target="_blank">进入微信小程序管理平台</a> => 开发与服务 => 开发管理 => 接口设置，<a href="https://obs.kumanyun.com/upfile/getLocationAuthGuide.png?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" target="_blank">查看指引</a><br />注意：如果接口权限申请下来前已经上架过小程序，权限申请下来后，需要重新上架小程序，审核成功并发布上线后再到这里选择无感自动获取，保存并清除缓存后生效！</p>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label>登录后引导进入个人资料页：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"miniProgramLoginProfile",'values'=>$_smarty_tpl->tpl_vars['miniProgramLoginProfileState']->value,'checked'=>$_smarty_tpl->tpl_vars['miniProgramLoginProfileStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['miniProgramLoginProfileStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <p style="padding-left: 0; font-size: 12px; padding-top: 10px; color: #999;">微信小程序的新规则在登录时不再提供头像和昵称服务，所以新用户在使用微信小程序登录后，系统会使用默认灰色头像和手机号码的(前3位****后4位)做为昵称。<br />如果需要引导用户在登录后跳转到个人资料页维护头像和昵称，可以开启此功能！<br />注意：开启后只对没有维护过头像和昵称的用户生效！</p>
    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label>iOS端虚拟支付功能：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"iosVirtualPaymentState",'values'=>$_smarty_tpl->tpl_vars['iosVirtualPaymentState']->value,'checked'=>$_smarty_tpl->tpl_vars['iosVirtualPaymentStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['iosVirtualPaymentStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

      <p style="padding-left: 0; font-size: 12px; padding-top: 10px; color: #999;">微信小程序对于iOS虚拟支付的规范要求：<a href="https://developers.weixin.qq.com/community/operate/detail/1006" target="_blank">https://developers.weixin.qq.com/community/operate/detail/1006</a><br />影响范围：充值、打赏、付费看视频、用户激励、付费查看电话、开通会员、入驻商家开通、续费模块、开通付费分销商、刷新、置顶、发布收费、经纪人购买套餐等业务</p>
    </dd>
  </dl>
  <dl class="clearfix">
      <dt><label for="iosVirtualPaymentTip">禁用iOS端虚拟支付提示：</label></dt>
      <dd>
        <input class="input-xlarge" type="text" name="iosVirtualPaymentTip" id="iosVirtualPaymentTip" value="<?php echo $_smarty_tpl->tpl_vars['iosVirtualPaymentTip']->value;?>
" data-regex=".*" />
        <p style="padding-left: 0; font-size: 12px; padding-top: 10px; color: #999;">一句话提示，如：十分抱歉，由于相关规范，iOS小程序不支持该功能。</p>
      </dd>
  </dl>
  <!-- https://developers.weixin.qq.com/community/develop/doc/00022c683e8a80b29bed2142b56c01 -->
  <!-- 2022.12.12后，新版本不再支持获取微信昵称和头像，须强制获取手机号码 -->
  <dl class="clearfix hide">
    <dt><label>登录时获取手机号码：</label></dt>
    <dd class="radio">
      <?php echo smarty_function_html_radios(array('name'=>"miniProgramBindPhone",'values'=>$_smarty_tpl->tpl_vars['miniProgramBindPhoneState']->value,'checked'=>$_smarty_tpl->tpl_vars['miniProgramBindPhoneStateChecked']->value,'output'=>$_smarty_tpl->tpl_vars['miniProgramBindPhoneStateNames']->value,'separator'=>"&nbsp;&nbsp;"),$_smarty_tpl);?>

    </dd>
  </dl>
  <dl class="clearfix">
    <dt><label class="sl">二维码：</label><small><i>{</i><i>#$</i>cfg_miniProgramQr<i>#}</i></small></dt>
    <dd class="miniProgramQr">
      <input name="miniProgramQr" type="hidden" id="miniProgramQr" value="<?php echo $_smarty_tpl->tpl_vars['miniProgramQr']->value;?>
" />
      <div class="spic<?php if ($_smarty_tpl->tpl_vars['miniProgramQr']->value=='') {?> hide<?php }?>">
        <div class="sholder"><?php if ($_smarty_tpl->tpl_vars['miniProgramQr']->value) {?><img src="/include/attachment.php?f=<?php echo $_smarty_tpl->tpl_vars['miniProgramQr']->value;?>
" /><?php }?></div>
        <a href="javascript:;" class="reupload"<?php if ($_smarty_tpl->tpl_vars['miniProgramQr']->value) {?> style="display: inline-block;"<?php }?>>重新上传</a>
      </div>
      <iframe src ="/include/upfile.inc.php?mod=siteConfig&type=card&obj=miniProgramQr" style="width:100%; height:25px;<?php if ($_smarty_tpl->tpl_vars['miniProgramQr']->value) {?> display:none;<?php }?>" scrolling="no" frameborder="0" marginwidth="0" marginheight="0" ></iframe>
    </dd>
  </dl>
  <dl class="clearfix" id="tplList">
    <dt><label>首页模板设置：<br /><small></small>&nbsp;&nbsp;&nbsp;</label></dt>
    <dd>
        <div class="tpl-list touch">
            <ul class="clearfix">
            <?php  $_smarty_tpl->tpl_vars['tplItem'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['tplItem']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['touchTplList']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['tplItem']->key => $_smarty_tpl->tpl_vars['tplItem']->value) {
$_smarty_tpl->tpl_vars['tplItem']->_loop = true;
?>
            <li class="<?php if ($_smarty_tpl->tpl_vars['touchTemplate']->value==$_smarty_tpl->tpl_vars['tplItem']->value['directory']) {?> current<?php }
if ($_smarty_tpl->tpl_vars['disabledModuleArr']->value&&in_array($_smarty_tpl->tpl_vars['tplItem']->value['directory'],$_smarty_tpl->tpl_vars['disabledModuleArr']->value)) {?> disabled<?php }?>">
                <a href="javascript:;" <?php if ($_smarty_tpl->tpl_vars['tplItem']->value['tplname']=='diy') {?>style="cursor: default;"<?php }?> data-id="<?php echo $_smarty_tpl->tpl_vars['tplItem']->value['directory'];?>
" data-title="<?php echo $_smarty_tpl->tpl_vars['tplItem']->value['tplname'];?>
" class="img" title="模板名称：<?php if ($_smarty_tpl->tpl_vars['tplItem']->value['tplname']=='diy') {?>DIY模板<?php } else {
echo $_smarty_tpl->tpl_vars['tplItem']->value['tplname'];
}?>&#10;版权所有：<?php echo $_smarty_tpl->tpl_vars['tplItem']->value['copyright'];?>
"><img src="<?php if ($_smarty_tpl->tpl_vars['tplItem']->value['tplname']=='diy') {?>/static/images/admin/diy_template_icon.png?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;
} else {
echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
../static/images/admin/platform/wxminiprogram/<?php echo $_smarty_tpl->tpl_vars['tplItem']->value['directory'];?>
/preview.jpg?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;
}?>" /></a>
                <p>
                <?php if ($_smarty_tpl->tpl_vars['tplItem']->value['tplname']!='diy') {?>
                <span title="<?php echo $_smarty_tpl->tpl_vars['tplItem']->value['tplname'];?>
"><?php echo $_smarty_tpl->tpl_vars['tplItem']->value['tplname'];?>
(<?php echo $_smarty_tpl->tpl_vars['tplItem']->value['directory'];?>
)</span><br />
                <?php } else { ?>
                <span>DIY模板</span><br />
                <?php }?>
                <a href="javascript:;" class="choose"><?php if ($_smarty_tpl->tpl_vars['touchTemplate']->value==$_smarty_tpl->tpl_vars['tplItem']->value['directory']) {?>取消首页<?php } else { ?>设为首页<?php }?></a>
                <?php if ($_smarty_tpl->tpl_vars['tplItem']->value['directory']=='skin1') {?>
                <br /><a href="https://help.kumanyun.com/help-66-779.html" target="_blank" style="display: inline-block; margin-top: 15px;">广告位</a>
                <?php } elseif ($_smarty_tpl->tpl_vars['tplItem']->value['directory']=='skin2') {?>
                <br /><a href="https://help.kumanyun.com/help-87-785.html" target="_blank" style="display: inline-block; margin-top: 15px;">广告位</a><br />
                <a href="https://help.kumanyun.com/help-134-784.html" target="_blank">自定义配置教程</a>
                <?php }?>
                <?php if ($_smarty_tpl->tpl_vars['tplItem']->value['tplname']=='diy') {?>
                <br /><a href="../siteConfig/sitePageDiy.php?platform=wxmini" target="_blank" class="edit">装修页面</a>
                <?php }?>
                </p>
            </li>
            <?php } ?>
            </ul>
            <input type="hidden" name="touchTemplate" id="touchTemplate" value="<?php echo $_smarty_tpl->tpl_vars['touchTemplate']->value;?>
" />
            <input type="hidden" name="disabledModule" id="disabledModule" value="<?php echo $_smarty_tpl->tpl_vars['disabledModule']->value;?>
" />
        </div>
        <p class="help-inline" style="padding-left: 0; font-size: 12px;">不选择小程序模板默认将使用H5端首页；<br />使用自定义风格模板前请更新火鸟门户微信小程序到最新版本！</p>
    </dd>
  </dl>
  <dl class="clearfix formbtn">
    <dt>&nbsp;</dt>
    <dd>
        <input class="btn btn-large btn-success" type="submit" name="submit" id="btnSubmit" value="确认提交" />
    </dd>
  </dl>
</form>

<?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

</body>
</html>
<?php }} ?>
