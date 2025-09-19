<?php   
if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 按小时执行计划任务
 * 数据统计 近7日发布数量  近7日刷新次数 近7日简历下载数量 近7日订单金额
 * 
 */


/**
 * 数据统计
 * 近7日发布数量 近7日刷新次数 近7日简历下载数量 近7日订单金额
 */
$startTime = strtotime('-7 days');
$sql = $dsql->SetQuery("SELECT `id` FROM `#@__zhaopin_company` WHERE `del` = 0");
$ret = $dsql->dsqlOper($sql, "results");
if(is_array($ret) && count($ret) > 0){
	$cid = $ret[0]['id'];
	$data = array();
	//近7日发布数量
	$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__zhaopin_post` WHERE `cid` = {$cid} AND `time_add` >= {$startTime}"); //有效的数据
	$total = $dsql->getOne($sql);
	$publishTotal = $total ? (int) $total : 0;

	//近7日刷新次数
	$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__zhaopin_service_log` WHERE `cid` = {$cid} AND `type` in (5, 6)  AND `addtime` >= {$startTime}"); //有效的数据
	$total = $dsql->getOne($sql);
	$refreshTotal = $total ? (int) $total : 0;

	//近7日简历下载数量
	$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__zhaopin_resume_download_log` WHERE `cid` = {$cid} AND `addtime` >= {$startTime}"); //有效的数据
	$total = $dsql->getOne($sql);
	$downloadTotal = $total ? (int) $total : 0;

	//近7日订单金额
	$sql = $dsql->SetQuery("SELECT sum(`amount`) total FROM `#@__zhaopin_order` WHERE `cid` = {$cid} AND `addtime` >= {$startTime}"); //有效的数据
	$total = $dsql->getOne($sql);
	$amountTotal = $total ? (int) $total : 0;

    //更新数据
	$sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `week_release` = {$publishTotal}, `week_refresh` = {$refreshTotal}, `week_download` = {$downloadTotal}, `week_amount` = {$amountTotal}  WHERE `id` = {$cid}");
	$dsql->dsqlOper($sql, "update");
}