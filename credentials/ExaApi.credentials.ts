import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ExaApi implements ICredentialType {
	name = 'exaApi';
	displayName = 'Exa API';
	documentationUrl = 'https://docs.exa.ai/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API key for Exa',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.exa.ai',
			url: '/contents',
			method: 'POST',
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
			body: {
				urls: ['https://example.com'],
				text: true,
			},
		},
	};
}
