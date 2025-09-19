<?php 
if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 *
 * 每分钟执行的计划任务
 * 1. 企业会员是否到期
 * 2. 简历推荐是否到期
 * 3. 职位普通推荐+超级推荐职位是否到期
 * 4. 职位智能推荐 包含免费刷新和付费刷新逻辑
 * 
 */
 /**
  * 企业会员到期处理
  */
$now = GetMkTime(time());
//会员过期置为1，部分字段重置为零

$default = array(); //默认配置
$cityids = array(); //有配置的分站ID合集

//查询出所有分站的配置
$sql = $dsql->SetQuery("SELECT `id`, `cityid`, `totalPublishCount_user`, `dayPublishCount_user`, `normalRefreshCount_user`, `resumePackagePoint_user`, `smsCount_user` FROM `#@__zhaopin_config`");
$results = $dsql->dsqlOper($sql, "results");

//循环每个分站的配置，记录下默认配置和已经执行过的分站
if ($results != null && is_array($results)) {
	foreach ($results as $item) {
		$cityid = (int)$item['cityid'];

		//如果cityid为0，就记录下来
		if ($cityid == 0) {
			$default = $item;
			continue;
		}

		//保存每次循环的cityid
		$cityids[] = $cityid;

		$configInfo = $item;

		$totalPublishCount_user = (int)$configInfo['totalPublishCount_user']; //发布总数_普通用户
		$dayPublishCount_user = (int)$configInfo['dayPublishCount_user']; //每日发布信息条数_普通用户
		$normalRefreshCount_user = (int)$configInfo['normalRefreshCount_user']; //免费手动刷新信息次数_普通用户

		$where = " AND `cityid` = ".$cityid;

		$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `levelExpired` = 1, `account_smartRefreshCount` = 0, `account_resumePackagePoint` = 0, `account_balancePackage` = 0, `account_totalPublishCount` = ".$totalPublishCount_user.", `account_dayPublishCount` = ".$dayPublishCount_user.", `account_normalRefreshCount` = ".$normalRefreshCount_user.", `status` = 7, `time_lastFollow` = ".$now.", `lastFollowInfo` = '会员已过期，会员状态修改为：会员到期未续费', `send_levelExpired` = 1  WHERE `levelExpired` = 0 AND `levelType` != 0 AND `time_levelEnd` <= $now".$where);
		$dsql->dsqlOper($sql, "update");
	}
}

//根据默认配置，把其他分站的逻辑再执行一面
if ($default != null) {
	//如果有已经执行的分站ID，则筛选没有执行的分站ID，否则就执行全部的分站
	$where = '';
	if ($cityids != null) {
		$where = " AND `cityid` NOT IN (".join(', ', $cityids).")";
	}

	$configInfo = $default;

	$totalPublishCount_user = (int)$configInfo['totalPublishCount_user']; //发布总数_普通用户
	$dayPublishCount_user = (int)$configInfo['dayPublishCount_user']; //每日发布信息条数_普通用户
	$normalRefreshCount_user = (int)$configInfo['normalRefreshCount_user']; //免费手动刷新信息次数_普通用户

	$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `levelExpired` = 1, `account_smartRefreshCount` = 0, `account_resumePackagePoint` = 0, `account_balancePackage` = 0, `account_totalPublishCount` = ".$totalPublishCount_user.", `account_dayPublishCount` = ".$dayPublishCount_user.", `account_normalRefreshCount` = ".$normalRefreshCount_user.", `status` = 7, `time_lastFollow` = ".$now.", `lastFollowInfo` = '会员已过期，会员状态修改为：会员到期未续费', `send_levelExpired` = 1  WHERE `levelExpired` = 0 AND `levelType` != 0 AND `time_levelEnd` <= $now".$where);
	$dsql->dsqlOper($sql, "update");
}

/**
 * 推荐简历到期处理
 */
$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume` SET `rec_status` = 2, `send_recExpired` = 1 WHERE `rec_status` = 1 AND `time_recExpire` <= $now");
$dsql->dsqlOper($sql, "update");

/**
 * 检测[普通推荐+超级推荐]的职位到期处理
 */
$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `rec_status` = 2, `send_recExpired` = 1 WHERE `rec_type` != 0 AND `rec_status` = 1 AND `time_recExpire` <= {$now}");

$dsql->dsqlOper($sql, "update");


/**
 * 职位智能刷新 包含免费刷新和付费刷新逻辑
 */
$today = GetMkTime(date('Y-m-d'));
$sql = $dsql->SetQuery("SELECT `id`, `cid`, `cityid`, `userid`, `time_update`, `smartRefresh_free`, `smartRefresh_numBuy`, `smartRefresh_nextTime`, `smartRefresh_lastTime`, `smartRefresh_frequency` FROM `#@__zhaopin_post` where `smartRefresh_status` = 1 AND `smartRefresh_numBuy` > 0 AND `smartRefresh_nextTime` <= $now"); //设置了自动刷新并且有刷新次数
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		if($value['smartRefresh_free']){ //免费智能刷新
			//企业智能刷新额度
			$sql = $dsql->SetQuery("SELECT `account_smartRefreshCount`, `levelType` FROM `#@__zhaopin_company` WHERE `id` = {$value['cid']}");
			$company = $dsql->dsqlOper($sql, "results");
			if(!$company) continue;
			$company = $company[0];
			$levelType = $company['levelType'];
			$smartRefreshTotal = (int)$company['account_smartRefreshCount'];
			if($levelType == 0){//免费用户为入驻时首次赠送
				//免费用户扣除赠送的智能刷新次数
				$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET  `account_smartRefreshCount` = account_smartRefreshCount -1 WHERE `id` = {$value['cid']} AND `account_smartRefreshCount` > 0");
				$dsql->dsqlOper($sql, "update");

				//已使用的刷新数量
				$sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__zhaopin_service_log` WHERE `type` = 6 AND `cid` = {$value['cid']}"); 
				$total = $dsql->getOne($sql);
				$refreshTotal = $total ? (int)$total : 0;
				if($refreshTotal >= $smartRefreshTotal){
					$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `smartRefresh_status` = 0 WHERE `id` = {$value['id']}");
					$dsql->dsqlOper($sql, "update");
					continue;
				}
				//设置为智能刷新时用的频率
				$nextTime = $now + ($value['smartRefresh_frequency'] * 3600);
			} else { 
				//会员中的为每日赠送
				//已使用的刷新数量
				$sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__zhaopin_service_log` WHERE `addtime` >= $today AND `type` = 6 AND `cid` = {$value['cid']}"); 
				$total = $dsql->getOne($sql);
				$refreshTotal = $total ? (int)$total : 0;
				if($refreshTotal >= $smartRefreshTotal){
					$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `smartRefresh_status` = 0 WHERE `id` = {$value['id']}");
					$dsql->dsqlOper($sql, "update");
					continue;
				}

				//当天职位是否刷新过
				// $sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__zhaopin_service_log` WHERE `addtime` >= $today AND `type` = 6 AND `cid` = {$value['cid']} AND `paramid` = {$value['id']}"); 
				// $total = $dsql->getOne($sql);
				// $logTotal = $total ? (int)$total : 0;
				// if($logTotal){
				// 	continue;
				// }
				//第二天
				// $nextTime = $now + 86400;
				$nextTime = $now + ($value['smartRefresh_frequency'] * 3600);
			}

			//更新时间
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET  `time_update` = $now, `smartRefresh_lastTime` = $now, `smartRefresh_nextTime` = $nextTime WHERE `id` = {$value['id']}");
			$dsql->dsqlOper($sql, "update");

			//增加智能刷新记录
			$data = array('type'=>6, 'cid'=>(int)$value['cid'], 'userid' =>(int)$value['userid'], 'addtime'=>$now, 'expireTime'=>0, 'paramid'=>$value['id'], 'num'=>1, 'sort'=>0, 'cityid'=>$value['cityid'] );
			$sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_service_log` (" . join(', ', array_keys($data)) . ") VALUES (" . join(', ', array_values($data)) . ")");
			$dsql->dsqlOper($sql, "lastid");

		} else {
			//付费购买的智能刷新
			$nextTime = $now + ($value['smartRefresh_frequency'] * 3600);

			//如果智能刷新次数本次用完，就增加消息通知发送状态
			$sendField = '';
			if ($value['smartRefresh_numBuy'] == 1) {
				$sendField = ', `send_smartRefreshEnd` = 1';
			}

			//更新次数，时间
			$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `smartRefresh_numBuy` = smartRefresh_numBuy - 1, `smartRefresh_lastTime` = $now, `smartRefresh_nextTime` = $nextTime, `time_update` = $now".$sendField." WHERE `id` = {$value['id']} AND `smartRefresh_numBuy` > 0");
			$dsql->dsqlOper($sql, "update");

			//增加智能刷新记录
			$data = array('type'=>6, 'cid'=>(int)$value['cid'], 'userid'=>(int)$value['userid'], 'addtime'=>$now, 'expireTime'=>0, 'paramid'=>$value['id'], 'num'=>1, 'sort'=>1, 'cityid'=>$value['cityid'] );
			$sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_service_log` (" . join(', ', array_keys($data)) . ") VALUES (" . join(', ', array_values($data)) . ")");
			$dsql->dsqlOper($sql, "lastid");
		}
	}
}

/**
 * 面试邀请到期处理
 */
$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_interview_log` SET `status` = 3 WHERE `status` < 3 AND `interviewTime` <= $now");
$dsql->dsqlOper($sql, "update");


/**
 * 职位推荐到期发送消息通知
 */
//查询待发送消息通知的职位记录
$sql = $dsql->SetQuery("SELECT `id`,`userid`,`title`,`rec_type`,`rec_sort` FROM `#@__zhaopin_post` WHERE `send_recExpired` = 1 ORDER BY `id` ASC");
$sendPosts = $dsql->dsqlOper($sql,"results");

if($sendPosts != null && is_array($sendPosts)){
    foreach ($sendPosts as $v){

		//职位详情链接
		$param = array(
			"service"  => "zhaopin",
			"template" => "postDetail",
			"id" => $v['id']
		);

		$rec = '普通推荐';
		if ($v['rec_type'] == 2) {
			$rec = '超级推荐第'.(int)$v['rec_sort'].'位';
		}

		//查询会员昵称
		$username = '';
		$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$v['userid']);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret != null && is_array($ret)){
			$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
		}

		//网站名称
		global $cfg_webname;
		global $siteCityName;
		$webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));

		//自定义配置
		$config = array(
			"webname" => $webname,
			"username" => $username,
			"title" => $v['title'],
			"rec" => $rec,
			"time" => date("Y-m-d H:i:s",GetMkTime(time())),
			"url" => getUrlPath($param),
			"fields" => array(
				'keyword1' => '推荐职位',
				'keyword2' => '推荐类型',
				'keyword3' => '到期时间'
			)
		);

		//先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `send_recExpired` = 0 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

		//后发通知，防止出现重复发送的问题
		updateMemberNotice($v['userid'], "城市招聘-职位推荐到期通知", $param, $config);
    }
}

/**
 * 简历推荐到期发送消息通知
 */
//查询待发送消息通知的简历记录
$sql = $dsql->SetQuery("SELECT `id`,`userid`,`name` FROM `#@__zhaopin_resume` WHERE `send_recExpired` = 1 ORDER BY `id` ASC");
$sendResumes = $dsql->dsqlOper($sql,"results");

if($sendResumes != null && is_array($sendResumes)){
    foreach ($sendResumes as $v){

		//职位详情链接
		$param = array(
			"service"  => "zhaopin",
			"template" => "resumeDetail",
			"id" => $v['id']
		);

		$rec = '普通推荐';

		//查询会员昵称
		$username = '';
		$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$v['userid']);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret != null && is_array($ret)){
			$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
		}

		//网站名称
		global $cfg_webname;
		global $siteCityName;
		$webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));

		//自定义配置
		$config = array(
			"webname" => $webname,
			"username" => $username,
			"title" => $v['name'],
			"rec" => $rec,
			"time" => date("Y-m-d H:i:s",GetMkTime(time())),
			"url" => getUrlPath($param),
			"fields" => array(
				'keyword1' => '推荐简历',
				'keyword2' => '推荐类型',
				'keyword3' => '到期时间'
			)
		);

		//先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume` SET `send_recExpired` = 0 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

		//后发通知，防止出现重复发送的问题
		updateMemberNotice($v['userid'], "城市招聘-简历推荐到期通知", $param, $config);
    }
}

/**
 * 职位智能刷新次数用尽发送消息通知
 */
//查询待发送消息通知的职位记录
$sql = $dsql->SetQuery("SELECT `id`,`userid`,`title` FROM `#@__zhaopin_post` WHERE `send_smartRefreshEnd` = 1 ORDER BY `id` ASC");
$sendPosts = $dsql->dsqlOper($sql,"results");

if($sendPosts != null && is_array($sendPosts)){
    foreach ($sendPosts as $v){

		//职位详情链接
		$param = array(
			"service"  => "zhaopin",
			"template" => "postDetail",
			"id" => $v['id']
		);

		//查询会员昵称
		$username = '';
		$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$v['userid']);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret != null && is_array($ret)){
			$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
		}

		//网站名称
		global $cfg_webname;
		global $siteCityName;
		$webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));

		//自定义配置
		$config = array(
			"webname" => $webname,
			"username" => $username,
			"title" => $v['title'],
			"time" => date("Y-m-d H:i:s",GetMkTime(time())),
			"url" => getUrlPath($param),
			"fields" => array(
				'keyword1' => '职位名称',
				'keyword2' => '到期时间',
			)
		);

		//先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_post` SET `send_smartRefreshEnd` = 0 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

		//后发通知，防止出现重复发送的问题
		updateMemberNotice($v['userid'], "城市招聘-职位智能刷新次数用尽通知", $param, $config);
    }
}

/**
 * 会员到期发送消息通知
 */
//查询待发送消息通知的会员
$sql = $dsql->SetQuery("SELECT `id`,`userid`,`title`,`levelType` FROM `#@__zhaopin_company` WHERE `send_levelExpired` = 1 ORDER BY `id` ASC");
$sendCompanys = $dsql->dsqlOper($sql,"results");

if($sendCompanys != null && is_array($sendCompanys)){
    foreach ($sendCompanys as $v){

		//企业详情链接
		$param = array(
			"service"  => "zhaopin",
			"template" => "companyDetail",
			"id" => $v['id']
		);

		//查询会员昵称
		$username = '';
		$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$v['userid']);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret != null && is_array($ret)){
			$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
		}

		//会员类型
		$title = '认证会员';
		if ($v['levelType'] == 1) {
			$title = '名企会员';
		}

		//网站名称
		global $cfg_webname;
		global $siteCityName;
		$webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));

		//自定义配置
		$config = array(
			"webname" => $webname,
			"username" => $username,
			"company" => $v['title'],
			"title" => $title,
			"time" => date("Y-m-d H:i:s",GetMkTime(time())),
			"url" => getUrlPath($param),
			"fields" => array(
				'keyword1' => '企业名称',
				'keyword2' => '会员类型',
				'keyword3' => '到期时间',
			)
		);

		//先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `send_levelExpired` = 0 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

		//后发通知，防止出现重复发送的问题
		updateMemberNotice($v['userid'], "城市招聘-企业会员到期通知", $param, $config);
    }
}