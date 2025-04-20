import type { IExecuteFunctions } from 'n8n-workflow';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType
} from 'n8n-workflow';
import Exa from 'exa-js';

export class ExaNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Exa',
		name: 'exa',
		icon: 'file:exa.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Exa API',
		defaults: {
			name: 'Exa',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'exaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Search',
						value: 'search',
					},
					{
						name: 'Find Similar',
						value: 'findSimilar',
					},
					{
						name: 'Get Content',
						value: 'getContents',
					},
					{
						name: 'Answer',
						value: 'answer',
					},
				],
				default: 'search',
			},
			// Search Operation
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search for content',
						action: 'Search for content',
					},
					{
						name: 'Search and Get Contents',
						value: 'searchAndContents',
						description: 'Search and retrieve content',
						action: 'Search and get contents',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				default: '',
				description: 'The search query',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				options: [
					{
						displayName: 'Use Autoprompt',
						name: 'useAutoprompt',
						type: 'boolean',
						default: false,
						description: 'Whether to use autoprompt for the query',
					},
					{
						displayName: 'Number of Results',
						name: 'numResults',
						type: 'number',
						default: 10,
						description: 'The number of results to return',
					},
					{
						displayName: 'Start Published Date',
						name: 'startPublishedDate',
						type: 'string',
						default: '',
						description: 'The start date for filtering results (YYYY-MM-DD)',
					},
					{
						displayName: 'End Published Date',
						name: 'endPublishedDate',
						type: 'string',
						default: '',
						description: 'The end date for filtering results (YYYY-MM-DD)',
					},
					{
						displayName: 'Include Domains',
						name: 'includeDomains',
						type: 'string',
						default: '',
						description: 'Comma-separated list of domains to include',
					},
				],
			},
			// Find Similar Operation
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['findSimilar'],
					},
				},
				options: [
					{
						name: 'Find Similar',
						value: 'findSimilar',
						description: 'Find similar content',
						action: 'Find similar content',
					},
					{
						name: 'Find Similar and Get Contents',
						value: 'findSimilarAndContents',
						description: 'Find similar content and retrieve it',
						action: 'Find similar content and get contents',
					},
				],
				default: 'findSimilar',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['findSimilar'],
					},
				},
				default: '',
				description: 'The URL to find similar content for',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['findSimilar'],
					},
				},
				options: [
					{
						displayName: 'Exclude Source Domain',
						name: 'excludeSourceDomain',
						type: 'boolean',
						default: false,
						description: 'Whether to exclude the source domain from results',
					},
					{
						displayName: 'Number of Results',
						name: 'numResults',
						type: 'number',
						default: 10,
						description: 'The number of results to return',
					},
				],
			},
			// Get Contents Operation
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['getContents'],
					},
				},
				options: [
					{
						name: 'Get Contents',
						value: 'getContents',
						description: 'Get contents of URLs',
						// eslint-disable-next-line n8n-nodes-base/node-param-operation-option-action-miscased
						action: 'Get contents of URLs',
					},
				],
				default: 'getContents',
			},
			{
				displayName: 'URLs',
				name: 'urls',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['getContents'],
					},
				},
				default: '',
				description: 'Comma-separated list of URLs to get contents for',
			},
			// Answer Operation
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['answer'],
					},
				},
				options: [
					{
						name: 'Get Answer',
						value: 'answer',
						description: 'Get an answer to a question',
						action: 'Get an answer to a question',
					},
				],
				default: 'answer',
			},
			{
				displayName: 'Question',
				name: 'question',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['answer'],
					},
				},
				default: '',
				description: 'The question to get an answer for',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['answer'],
					},
				},
				options: [
					{
						displayName: 'Include Text',
						name: 'text',
						type: 'boolean',
						default: false,
						description: 'Whether to include the source text in the response',
					},
					{
						displayName: 'Model',
						name: 'model',
						type: 'options',
						options: [
							{
								name: 'Default',
								value: 'default',
							},
							{
								name: 'Exa Pro',
								value: 'exa-pro',
							},
						],
						default: 'default',
						description: 'The model to use for generating the answer',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials
		const credentials = await this.getCredentials('exaApi') as { apiKey: string };
		const exaClient = new Exa(credentials.apiKey);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'search') {
					const query = this.getNodeParameter('query', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const options: IDataObject = {};
					if (additionalFields.useAutoprompt) options.useAutoprompt = additionalFields.useAutoprompt as boolean;
					if (additionalFields.numResults) options.numResults = additionalFields.numResults as number;
					if (additionalFields.startPublishedDate) options.startPublishedDate = additionalFields.startPublishedDate as string;
					if (additionalFields.endPublishedDate) options.endPublishedDate = additionalFields.endPublishedDate as string;
					if (additionalFields.includeDomains) {
						options.includeDomains = (additionalFields.includeDomains as string).split(',').map(domain => domain.trim());
					}

					if (operation === 'search') {
						const response = await (exaClient as any).search(query, options);
						returnData.push(response as IDataObject);
					} else if (operation === 'searchAndContents') {
						const response = await (exaClient as any).searchAndContents(query, { text: true, highlights: true, ...options });
						returnData.push(response as IDataObject);
					}
				} else if (resource === 'findSimilar') {
					const url = this.getNodeParameter('url', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const options: IDataObject = {};
					if (additionalFields.excludeSourceDomain) options.excludeSourceDomain = additionalFields.excludeSourceDomain as boolean;
					if (additionalFields.numResults) options.numResults = additionalFields.numResults as number;

					if (operation === 'findSimilar') {
						const response = await (exaClient as any).findSimilar(url, options);
						returnData.push(response as IDataObject);
					} else if (operation === 'findSimilarAndContents') {
						const response = await (exaClient as any).findSimilarAndContents(url, { text: true, highlights: true, ...options });
						returnData.push(response as IDataObject);
					}
				} else if (resource === 'getContents') {
					const urls = (this.getNodeParameter('urls', i) as string).split(',').map(url => url.trim());
					const response = await (exaClient as any).getContents(urls, { text: true });
					returnData.push(response as IDataObject);
				} else if (resource === 'answer') {
					const question = this.getNodeParameter('question', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const options: IDataObject = {};
					if (additionalFields.text) options.text = additionalFields.text as boolean;
					if (additionalFields.model && additionalFields.model !== 'default') {
						options.model = additionalFields.model as string;
					}

					const response = await (exaClient as any).answer(question, options);
					returnData.push(response as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
