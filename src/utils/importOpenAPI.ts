import { ApiDefinition, EndpointDefinition, ResponseDefinition } from '@/types/swagger';
import { v4 as uuidv4 } from 'uuid';

export function parseOpenAPISpec(json: string): ApiDefinition | null {
  try {
    const spec = JSON.parse(json);
    
    if (!spec.openapi && !spec.swagger) {
      throw new Error('Invalid OpenAPI specification');
    }

    // Parse auth configuration
    let auth: ApiDefinition['auth'] = { type: 'none' };
    if (spec.components?.securitySchemes) {
      if (spec.components.securitySchemes.basicAuth) {
        auth = { type: 'basic', username: '', password: '' };
      } else if (spec.components.securitySchemes.bearerAuth) {
        auth = { type: 'bearer', token: '' };
      }
    }

    // Parse endpoints
    const endpoints: EndpointDefinition[] = [];
    
    if (spec.paths) {
      for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
            const op = operation as any;
            
            // Parse headers from parameters
            const headers = (op.parameters || [])
              .filter((p: any) => p.in === 'header')
              .map((p: any) => ({
                key: p.name,
                value: '',
                description: p.description || '',
                required: p.required || false,
              }));

            // Parse request body
            let requestBodyFields: any[] = [];
            let requestBodyExample = '{\n  \n}';
            
            if (op.requestBody?.content?.['application/json']) {
              const content = op.requestBody.content['application/json'];
              if (content.example) {
                requestBodyExample = JSON.stringify(content.example, null, 2);
              }
              if (content.schema?.properties) {
                requestBodyFields = Object.entries(content.schema.properties).map(([name, prop]: [string, any]) => ({
                  name,
                  type: prop.type || 'string',
                  required: (content.schema.required || []).includes(name),
                  description: prop.description || '',
                }));
              }
            }

            // Parse responses
            const responses: ResponseDefinition[] = [];
            if (op.responses) {
              for (const [statusCode, response] of Object.entries(op.responses)) {
                const res = response as any;
                let example = '{}';
                if (res.content?.['application/json']?.example) {
                  example = JSON.stringify(res.content['application/json'].example, null, 2);
                }
                responses.push({
                  statusCode: parseInt(statusCode),
                  description: res.description || '',
                  example,
                });
              }
            }

            // If no responses parsed, add default
            if (responses.length === 0) {
              responses.push({
                statusCode: 200,
                description: 'Sucesso',
                example: '{\n  "success": true\n}',
              });
            }

            endpoints.push({
              id: uuidv4(),
              method: method.toUpperCase() as EndpointDefinition['method'],
              path,
              summary: op.summary || '',
              description: op.description || '',
              tags: op.tags || ['Default'],
              headers,
              requestBody: {
                fields: requestBodyFields,
                example: requestBodyExample,
              },
              responses,
            });
          }
        }
      }
    }

    return {
      id: uuidv4(),
      title: spec.info?.title || 'Imported API',
      description: spec.info?.description || '',
      version: spec.info?.version || '1.0.0',
      baseUrl: spec.servers?.[0]?.url || 'https://api.example.com',
      auth,
      endpoints,
    };
  } catch (error) {
    console.error('Error parsing OpenAPI spec:', error);
    return null;
  }
}
