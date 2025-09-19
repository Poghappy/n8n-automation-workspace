<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 更新中介公司房源数量
 *
 *
 * @version        $Id: house_updateZjcomNums.php 2016-11-4 上午9:54:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__house_zjcom` where `store_switch` = 1 and `state`=1");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {

		$zjcom = $value['id'];

		$arcSale = $dsql->SetQuery("SELECT count(s.`id`) AS countSale FROM `#@__house_sale` s WHERE `state`=1 and `userid` in(SELECT z.`id` FROM `#@__house_zjuser` z WHERE z.`zjcom` = ".$zjcom.")");
		$saletotalCount = $dsql->dsqlOper($arcSale, "results");

		$arcZu = $dsql->SetQuery("SELECT count(z.`id`) AS countZu FROM `#@__house_zu` z WHERE `state`=1 and  `userid` in(SELECT z.`id` FROM `#@__house_zjuser` z WHERE z.`zjcom` = ".$zjcom.")");
		$zutotalCount = $dsql->dsqlOper($arcZu, "results");

		$counts = (int)($saletotalCount[0]['countSale'] + $zutotalCount[0]['countZu']);

		$sql = $dsql->SetQuery("UPDATE `#@__house_zjcom` SET `counts` = '$counts' WHERE `id` = ".$zjcom);
		$dsql->dsqlOper($sql, "update");
	}
}
