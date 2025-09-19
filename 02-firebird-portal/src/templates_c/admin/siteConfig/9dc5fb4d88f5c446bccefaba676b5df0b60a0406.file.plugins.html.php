<?php /* Smarty version Smarty-3.1.21-dev, created on 2025-07-27 14:55:22
         compiled from "/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/plugins.html" */ ?>
<?php /*%%SmartyHeaderCode:15958912596885cd5a389a03-33360518%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '9dc5fb4d88f5c446bccefaba676b5df0b60a0406' => 
    array (
      0 => '/www/wwwroot/hawaiihub.net/admin/templates/siteConfig/plugins.html',
      1 => 1753593705,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '15958912596885cd5a389a03-33360518',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'cfg_staticVersion' => 0,
    'adminPath' => 0,
    'adminRoute' => 0,
    'jsFile' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_6885cd5a3ded52_07310942',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_6885cd5a3ded52_07310942')) {function content_6885cd5a3ded52_07310942($_smarty_tpl) {?><!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="/static/css/core/base.css" media="all"/>
    <link rel="stylesheet" href="/static/css/ui/element_ui_index.css">
    <link rel="stylesheet" type="text/css" href="/static/css/admin/plugins.css?v=<?php echo $_smarty_tpl->tpl_vars['cfg_staticVersion']->value;?>
" media="all" />
    <?php echo '<script'; ?>
 src="/static/js/vue/vue.min.js"><?php echo '</script'; ?>
>
    <?php echo '<script'; ?>
 src="/static/js/vue/axios.min.js"><?php echo '</script'; ?>
>
    <?php echo '<script'; ?>
 src="/static/js/ui/element_ui_index.js"><?php echo '</script'; ?>
>
    <title>插件管理</title>
    <style>
      [v-cloak] {
        display: none;
      }
    </style>
    <?php echo '<script'; ?>
>
     var adminPath = "<?php echo $_smarty_tpl->tpl_vars['adminPath']->value;?>
", adminRoute = '<?php echo $_smarty_tpl->tpl_vars['adminRoute']->value;?>
';
    <?php echo '</script'; ?>
>
  </head>
  <body>
    <div id="app" v-cloak>
      <div class="container fn-clear">
        <div class="main fn-clear">
          <div class="main-tab fn-clear">
            <div class="main-tab-left">
              <span>{{isUnInstall?'卸载插件':'插件管理'}}</span>
              <div class="uninstall-btn" @click="uninstallPlugin" v-show="!isUnInstall">
                <img src="/static/images/admin/uninstall.png" alt="">
                <span>卸载插件</span>
              </div>
              <div class="uninstall-btn" @click="uninstallPlugin" v-show="isUnInstall" style="background-color: #409EFF;">
                <span style="color: #fff">完成</span>
              </div>
            </div>
            <div class="main-tab-right">
              <div class="searchPlugin-input">
                <img src="/static/images/admin/search.png" alt="">
                <input type="text" placeholder="搜索插件" @keyup.enter="searchPlugin" v-model="keyword">
              </div>
              <button class="searchPlugin-btn" @click="searchPlugin" >搜索</button>
              <button class="searchPlugin-more" v-show="!isUnInstall" @click="installNew">获取更多插件</button>
            </div>
          </div>
          <div class="main-content" v-loading="loading">
            <div class="listBox">
              <ul class="main-content-my sameUl fn-clear" v-if="!noData">
                <li v-for="(item,index) in pluginsList" :key="item.id">
                  <div class="imgDiv"><img :src="item.litpic || (defaultImageUrl + item.pid + '.png')" alt="" onerror="this.src='/static/images/404.jpg'"></div>
                  <div class="titlteDiv">
                    <span>{{item.title}}</span>
                    <span>{{item.version}}</span>
                  </div>
                  <div class="description">
                    <span :title="item.description">{{item.description}}</span>
                  </div>
                  <a @click="enterLink(item,$event)" :href="'/include/plugins/'+item.pid+'/index.php?adminRoute='+adminRoute" class="my-plugin-install enter-uninstall" v-show="!isUnInstall" target="_blank">
                      <span>进入插件</span>
                      <div class="arrow">
                        <span></span>
                        <span></span>
                      </div>
                  </a>
                  <div class="my-plugin-install uninstall-box installBg" v-show="isUnInstall" @click="uninstallBtn(item.id)">
                    <span class="uninstall-span">{{item.id == deleteId?unInstallText:'卸载'}}</span>
                    <div class="uninstall-img">
                      <img src="/static/images/admin/uninstall_red.png" alt="">
                    </div>
                  </div>
                </li>
              </ul>
              <div class="noData" v-else="noData">暂无相关信息</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <?php echo $_smarty_tpl->tpl_vars['jsFile']->value;?>

  </body>
</html>
<?php }} ?>
