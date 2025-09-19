
# 安装教程
## docker安装
> 其他命令参考n8n官方文档
```shell
docker run -it --rm --name n8ntest \
-p 15678:5678 \
-v 【替换为下载的编辑器UI目录】:/usr/local/lib/node_modules/n8n/node_modules/n8n-editor-ui/dist \
-v ~/.n8n:/home/node/.n8n \
-e N8N_DEFAULT_LOCALE=zh-CN \
-e N8N_SECURE_COOKIE=false \
n8nio/n8n
```

## docker-compose安装
> 请切换到对应版本的tag后，在执行
```shell
# 拉取代码
git clone https://github.com/other-blowsnow/n8n-i18n-chinese
cd n8n-i18n-chinese
# 只支持 1.86.1+以上使用该方法
git checkout n8n@1.86.1
# 运行
docker-compose up
``` 

## npx本地启动n8n替换安装
> 其他本地方式启动的话参考这个即可
1. 找到路径：C:\Users\xxxxxx\AppData\Local\npm-cache\_npx\n8n\node_modules\n8n-editor-ui\dist
2. 下载对应版本editor-ui.tar.gz文件
4. 解压到 dist目录下替换
5. 设置环境变量 N8N_DEFAULT_LOCALE=zh-CN，自行咨询AI设置方法
6. 重启 n8n 服务

# 单个节点翻译
## 节点属性翻译
n8n-nodes-base.nodes.[节点名称].nodeView.[属性名称].[displayName/description/hint/placeholder]
## 节点options属性翻译
n8n-nodes-base.nodes.[节点名称].nodeView.[属性名称].options.[选项名称].[displayName/description]
## 示例
```json
{
    "n8n-nodes-base": {
        "nodes": {
            "code": {
                "nodeView": {
                    "notice": {
                        "displayName": "输入<code> $ </code> <a target=\"_ blank\" href=\"https: //docs.n8n.io/code-examples/methods-variables-reference--reference/\">特殊vars/methods </a>。通过使用<code> console.log()</code>语句进行调试，并在浏览器控制台中查看其输出。"
                    }
                }
            }
        }
    }
}
```
## debug
浏览器搜索关键词 inputLabelDisplayName，断点 nodeText

# 原理
> editor-ui是支持i18n的，但是未开放语言包

1. 手动添加 zh-CN.json 到 editor-ui `/src/plugins/i18n/locales/` 里面，然后重新编译
2. 环境里面设置语言即可正常使用中文  `N8N_DEFAULT_LOCALE=zh-CN`

# 参考n8n官方i18n介绍
https://github.com/n8n-io/n8n/blob/master/packages/frontend/%40n8n/i18n/docs/README.md

# 添加其他语言包
请PR 语言文件到 languages 目录下，github action会在下一个n8n版本自动打包

# 语言环境变量
> 其他语言参考：https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language

N8N_DEFAULT_LOCALE=zh-CN
