<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 更新中介公司房源数量
 *
 *
 * @version        $Id: house_updateZjuserNums.php 2016-11-4 上午9:54:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__house_zjuser` where `state`=1");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {

		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_sale` WHERE `state` = 1 AND `usertype` = 1 AND `userid`=".$value['id']);
		$saletotalCount = (int)$dsql->dsqlOper($archives, "totalCount");

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zu` WHERE `state` = 1 AND `usertype` = 1 AND `userid`=".$value['id']);
		$zutotalCount = (int)$dsql->dsqlOper($sql, "totalCount");

		$counts = $saletotalCount + $zutotalCount;

		$sql = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `counts` = '$counts' WHERE `id` = ".$value['id']);
		$dsql->dsqlOper($sql, "update");
	}
}
