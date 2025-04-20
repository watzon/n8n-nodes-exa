---
description: 
globs: 
alwaysApply: true
---
# n8n Development Best Practices and Coding Standards

## Summary

This expanded guide provides a step-by-step framework for creating high‑quality custom nodes in the n8n automation platform. You’ll learn how to choose between the programmatic and declarative node styles, scaffold your project with the official n8n‑nodes‑starter template, organize your directory and metadata files, implement your node’s core logic with detailed TypeScript examples (including the `execute` method and use of the `httpRequest` helper), manage credentials securely, and write accompanying JSON descriptions for resources and operations. The guide also covers testing strategies—unit, integration, and end‑to‑end—using Jest and the n8n node linter, performance optimizations like batching and caching, security best practices for input validation and credential storage, and local development workflows with hot‑reload via Docker. Finally, you’ll see how to compile, link, and publish your node to npm, ensuring compliance with n8n’s evolving coding standards and community conventions.

---

# 1. Planning and Setup

### 1.1 Prerequisites  
- **Node.js & npm/pnpm**: Minimum Node 18.17.0 and a package manager (npm or pnpm).  
- **TypeScript**: For static typing and improved developer experience.  
- **Git**: To clone templates and version‑control your code.  
- **Docker & Docker Compose** (optional but recommended): For running and testing n8n locally with hot‑reload.

### 1.2 Choosing Your Node Style  
- **Programmatic‑style nodes** give full control in TypeScript and are suited for complex integrations. Follow the official tutorial to set up a project, define your class, metadata, and `execute()` logic.  
- **Declarative‑style nodes** let you specify resources and operations in JSON descriptors, reducing boilerplate for CRUD‑style endpoints. Ideal for straightforward REST API wrappers.

---

# 2. Project Structure & Scaffolding

### 2.1 Using the n8n‑nodes‑starter Template  
1. **Generate a repo** from the [n8n‑nodes‑starter GitHub template].  
2. **Clone & install** dependencies:  
   ```bash
   git clone https://github.com/<your-org>/n8n-nodes-yournode.git
   cd n8n-nodes-yournode
   pnpm install
   ```

### 2.2 Directory Layout  
```
n8n-nodes-yournode/
├── nodes/
│   └── YourNode/
│       ├── YourNode.node.ts        # Main TypeScript node definition
│       ├── YourNode.node.json      # Optional JSON descriptor for declarative fields
│       ├── credentials/            # Credential definitions (if needed)
│       │   └── YourApi.credentials.ts
│       ├── icons/                  # Optional SVG/PNG icons
│       └── test/                   # Jest unit tests
├── .eslintrc.js                    # ESLint with n8n‑nodes‑base plugin
├── tsconfig.json                   # TypeScript config
├── package.json                    # Project metadata & scripts
└── README.md                       # Documentation & publish instructions
```

### 2.3 Configuration Files  
- **`package.json`**: Ensure you declare `n8n` peer dependency and link build scripts:
  ```jsonc
  {
    "name": "n8n-nodes-yournode",
    "version": "0.1.0",
    "main": "dist/index.js",
    "scripts": {
      "build": "tsc",
      "lint": "eslint --ext .ts nodes",
      "test": "jest"
    },
    "peerDependencies": {
      "n8n-workflow": "^1.0.0"
    },
    "devDependencies": {
      "typescript": "^5.0.0",
      "@types/node": "^18.0.0",
      "eslint-plugin-n8n-nodes-base": "^1.16.3"
    }
  }
  ```
- **`tsconfig.json`**: A minimal example:
  ```json
  {
    "compilerOptions": {
      "module": "CommonJS",
      "target": "ES2019",
      "rootDir": "nodes",
      "outDir": "dist",
      "strict": true,
      "esModuleInterop": true,
      "resolveJsonModule": true
    },
    "include": ["nodes/**/*.ts"]
  }
  ```

---

# 3. Defining Your Node

### 3.1 Base File (`YourNode.node.ts`)
```ts
import { IExecuteFunctions } from 'n8n-core';
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class YourNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Your Node',
    name: 'yourNode',
    icon: 'file:icon.svg',
    group: ['transform'],
    version: 1,
    description: 'Describe what your node does',
    defaults: { name: 'Your Node', color: '#772244' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      { name: 'yourApi', required: true }
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          { name: 'Item', value: 'item' },
          // ...
        ],
        default: 'item',
      },
      // Additional parameters...
    ],
  };

  async execute(this: IExecuteFunctions): Promise<any[]> {
    const items = this.getInputData();
    const returnData: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i].json;
      const credentials = await this.getCredentials('yourApi');
      
      // Example HTTP call
      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        'yourApi',
        { method: 'GET', url: `${credentials.baseUrl}/endpoint` },
      );

      returnData.push({ json: response });
    }
    return this.prepareOutputData(returnData);
  }
}
```

### 3.2 JSON Descriptors (Declarative Style)
```json
{
  "displayName": "Your Node",
  "name": "yourNode",
  "description": "Declarative description",
  "version": 1,
  "properties": [
    {
      "displayName": "Mode",
      "name": "mode",
      "type": "options",
      "options": [
        { "name": "A", "value": "A" },
        { "name": "B", "value": "B" }
      ],
      "default": "A"
    }
  ]
}
```

### 3.3 Credential Definitions
```ts
import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class YourApi implements ICredentialType {
  name = 'yourApi';
  displayName = 'Your API';
  properties: INodeProperties[] = [
    { name: 'apiKey', displayName: 'API Key', type: 'string', default: '' },
    { name: 'baseUrl', displayName: 'Base URL', type: 'string', default: 'https://api.example.com' },
  ];
}
```

---

# 4. Testing & Linting

### 4.1 Unit & Integration Tests
- Use **Jest** to write tests under `nodes/YourNode/test/YourNode.test.ts`, mocking HTTP calls.  
- Verify `execute()` returns expected data for various input scenarios.

### 4.2 n8n Node Linter
- The **n8n node linter** enforces naming, ordering, defaults, and schema rules.  
- Run `pnpm lint` (or `npm run lint`) before publishing.

---

# 5. Performance & Best Practices

### 5.1 Data Handling
- **Clone input data**: Always clone via `JSON.parse(JSON.stringify(...))` if modifying to avoid side effects.  
- **Batch Processing**: Use the **Split In Batches** node in workflows for large datasets.

### 5.2 API Optimization
- Use pagination and filtering on API calls.  
- Implement **caching** in your node or external store to reduce redundant calls.

### 5.3 Common Anti‑patterns
- **Don’t** modify input data in place.  
- **Avoid** hardcoding URLs/keys—use credentials or environment variables.  
- **Keep** Code nodes focused; refactor complex logic into reusable helper modules.

---

# 6. Security Considerations

- **Credential Management**: Use n8n’s credentials system; never embed secrets in code.  
- **Input Validation**: Sanitize and validate parameters to prevent injection attacks.  
- **Least Privilege**: Request only necessary scopes/permissions from external APIs.

---

# 7. Local Development & Publishing

### 7.1 Docker Hot‑Reload
- Map your `dist` folder into `/home/node/.n8n/custom/node_modules/your-node` in your `docker-compose.yaml`.  
- Rebuild and restart n8n to pick up changes:
  ```bash
  npm run build
  docker-compose restart n8n
  ```

### 7.2 Linking & Using Your Node
- In `settings.js`, add your package under `nodes`.  
- Restart n8n; your custom node appears in the UI under the specified group.

### 7.3 Publishing to npm
1. Update `package.json` with repository, author, and license.  
2. Run `npm publish --access public`.  
3. (Optional) Submit to the n8n community integrations repo for broader distribution.

---

# 8. Further Resources

- **n8n Documentation: Creating Nodes Overview**  
- **HTTP Helpers Reference**  
- **Declarative‑style Node Tutorial**  
- **n8n‑nodes‑starter Template**

