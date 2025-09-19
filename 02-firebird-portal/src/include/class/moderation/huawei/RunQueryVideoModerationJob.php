<?php
namespace HuaweiCloud\SDK\Moderation\V3\Model;
require_once __DIR__."/vendor/autoload.php";
use HuaweiCloud\SDK\Core\Auth\BasicCredentials;
use HuaweiCloud\SDK\Core\Http\HttpConfig;
use HuaweiCloud\SDK\Core\Exceptions\ConnectionException;
use HuaweiCloud\SDK\Core\Exceptions\RequestTimeoutException;
use HuaweiCloud\SDK\Core\Exceptions\ServiceResponseException;
use HuaweiCloud\SDK\Moderation\V3\ModerationClient;

class HuaweiCloudQueryVideoModerationJob{

    public function exec(string $ak,string $sk,string $projectId,string $endpoint,string $jobId){
        $credentials = new BasicCredentials($ak,$sk,$projectId);
        $config = HttpConfig::getDefaultConfig();
        $config->setIgnoreSslVerification(true);

        $client = ModerationClient::newBuilder(new ModerationClient)
            ->withHttpConfig($config)
            ->withEndpoint($endpoint)
            ->withCredentials($credentials)
            ->build();
        $request = new RunQueryVideoModerationJobRequest();
        $request->setJobId($jobId);  //视频作业识别id
        try {
            $response = $client->RunQueryVideoModerationJob($request);
            return $response;
        } catch (ConnectionException $e) {
            return false;
            $msg = $e->getMessage();
            echo "\n". $msg ."\n";
        } catch (RequestTimeoutException $e) {
            return false;
            $msg = $e->getMessage();
            echo "\n". $msg ."\n";
        } catch (ServiceResponseException $e) {
            return false;
            echo "\n";
            echo $e->getHttpStatusCode(). "\n";
            echo $e->getRequestId(). "\n";
            echo $e->getErrorCode() . "\n";
            echo $e->getErrorMsg() . "\n";
        }
    }
}