import {
	IExecuteFunctions,
	IN8nHttpFullResponse,
	INodeType,
	INodeTypeDescription,
	NodeOperationError, NodeTypeAndVersion,
} from 'n8n-workflow';
import { INodeExecutionData } from 'n8n-workflow/dist/Interfaces';
import WechatMsgSignUtils from '../help/utils/WechatMsgSignUtils';
import xmlConvert from "xml-js";

export class WechatOfficialAccountResponseNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wechat Official Account Response',
		name: 'wechatOfficialAccountResponseNode',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:icon.png',
		description: "Wechat Official Account Response",
		group: ['transform'],
		version: 1,
		defaults: {
			name: 'Wechat Official Account Response',
		},
		// @ts-ignore
		inputs: ['main'],
		// @ts-ignore
		outputs: ['main'],
		properties: [
			{
				displayName: '响应数据格式',
				name: 'dataFormat',
				type: 'options',
				options: [
					{
						name: 'XML',
						value: 'xml',
					},
					{
						name: 'JSON',
						value: 'json',
					},
				],
				default: 'xml',
			},
			{
				displayName: '响应数据',
				name: 'content',
				type: 'string',
				default: '',
				typeOptions: { rows: 5 },
				required: true,
				displayOptions: {
					show: {
						dataFormat: ['xml'],
					}
				},
			},
			{
				displayName: '响应数据',
				name: 'content',
				type: 'string',
				default: '',
				typeOptions: { rows: 5 },
				displayOptions: {
					show: {
						dataFormat: ['json'],
					}
				},
				required: true,
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const parentNodes = this.getParentNodes(this.getNode().name);
		const trigger = parentNodes.find(
			(node) => node.type.includes('wechatOfficialAccountTrigger'),
		) as NodeTypeAndVersion;
		if (!trigger) {
			throw new NodeOperationError(
				this.getNode(),
				'No connected Wechat Official Account Trigger node found',
			);
		}

		const content = this.getNodeParameter('content', 0) as string;
		const dataFormat = this.getNodeParameter('dataFormat', 0, 'xml') as string;

		const workflowData = this.getWorkflowStaticData('global');
		if (!workflowData) {
			throw new NodeOperationError(this.getNode(), 'No workflow data found');
		}

		const signatureType = workflowData?.signatureType as string;
		let body: any;
		let data: any;
		if (signatureType === 'aes'){
			const token = workflowData.token as string;
			const aesKey = workflowData.aesKey as string;
			const appId = workflowData.appId as string;
			data = WechatMsgSignUtils.encryptResponse(content, aesKey, token, appId);
			body = data;

			if (dataFormat === 'xml') {
				body = xmlConvert.js2xml({
					xml: body
				}, {
					indentCdata: true,
					compact: true,
					ignoreComment: true,
					spaces: 4,
					textFn: (value: any, currentElementName: string, currentElementObj: any) => {
						if (typeof currentElementObj !== 'string') return value
						return `<![CDATA[${value}]]>`
					}
				})
			}
		}else{
			// 明文
			body = content;
			data = {
				content: content,
			}
		}

		const response: IN8nHttpFullResponse = {
			headers: {},
			statusCode: 200,
			body: body,
		};

		console.log('sendResponse', response);

		this.sendResponse(response);

		return [this.helpers.returnJsonArray(data)];
	}
}
