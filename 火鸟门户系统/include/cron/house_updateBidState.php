<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 更新已结束的竞价信息
 *
 *
 * @version        $Id: house_updateBidState.php 2016-11-4 上午9:54:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

$sql = $dsql->SetQuery("UPDATE `#@__house_sale` SET `isbid` = 0, `bid_price` = 0, `bid_start` = 0, `bid_end` = 0 WHERE `bid_end` < $time");
$dsql->dsqlOper($sql, "update");

$sql = $dsql->SetQuery("UPDATE `#@__house_zu` SET `isbid` = 0, `bid_price` = 0, `bid_start` = 0, `bid_end` = 0 WHERE `bid_end` < $time");
$dsql->dsqlOper($sql, "update");

$sql = $dsql->SetQuery("UPDATE `#@__house_xzl` SET `isbid` = 0, `bid_price` = 0, `bid_start` = 0, `bid_end` = 0 WHERE `bid_end` < $time");
$dsql->dsqlOper($sql, "update");

$sql = $dsql->SetQuery("UPDATE `#@__house_sp` SET `isbid` = 0, `bid_price` = 0, `bid_start` = 0, `bid_end` = 0 WHERE `bid_end` < $time");
$dsql->dsqlOper($sql, "update");

$sql = $dsql->SetQuery("UPDATE `#@__house_cf` SET `isbid` = 0, `bid_price` = 0, `bid_start` = 0, `bid_end` = 0 WHERE `bid_end` < $time");
$dsql->dsqlOper($sql, "update");
