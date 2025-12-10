import { ApiDefinition, EndpointDefinition, FieldDefinition, OpenAPISpec } from '@/types/swagger';

function fieldTypeToSchema(field: FieldDefinition): Record<string, any> {
  const baseSchema: Record<string, any> = {
    type: field.type,
    description: field.description,
  };

  if (field.example) {
    try {
      if (field.type === 'number' || field.type === 'integer') {
        baseSchema.example = Number(field.example);
      } else if (field.type === 'boolean') {
        baseSchema.example = field.example.toLowerCase() === 'true';
      } else if (field.type === 'array' || field.type === 'object') {
        baseSchema.example = JSON.parse(field.example);
      } else {
        baseSchema.example = field.example;
      }
    } catch {
      baseSchema.example = field.example;
    }
  }

  return baseSchema;
}

function generateSchemaFromFields(fields: FieldDefinition[]): Record<string, any> {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  fields.forEach((field) => {
    properties[field.name] = fieldTypeToSchema(field);
    if (field.required) {
      required.push(field.name);
    }
  });

  return {
    type: 'object',
    properties,
    ...(required.length > 0 && { required }),
  };
}

function parseExample(example: string): any {
  try {
    return JSON.parse(example);
  } catch {
    return example;
  }
}

function generatePathItem(endpoint: EndpointDefinition): Record<string, any> {
  const responses: Record<string, any> = {};
  
  endpoint.responses.forEach((response) => {
    responses[response.statusCode] = {
      description: response.description,
      content: {
        'application/json': {
          schema: {
            type: 'object',
          },
          example: parseExample(response.example),
        },
      },
    };
  });

  const operation: Record<string, any> = {
    summary: endpoint.summary,
    description: endpoint.description,
    tags: endpoint.tags,
    responses,
  };

  // Add headers as parameters
  if (endpoint.headers && endpoint.headers.length > 0) {
    operation.parameters = endpoint.headers
      .filter((h) => h.name) // Only include headers with names
      .map((header) => ({
        name: header.name,
        in: 'header',
        required: true,
        description: header.description || '',
        schema: {
          type: 'string',
          example: header.value || '',
        },
      }));
  }

  if (endpoint.method !== 'GET' && endpoint.requestBody.fields.length > 0) {
    operation.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: generateSchemaFromFields(endpoint.requestBody.fields),
          example: parseExample(endpoint.requestBody.example),
        },
      },
    };
  }

  return {
    [endpoint.method.toLowerCase()]: operation,
  };
}

export function generateOpenAPISpec(api: ApiDefinition): OpenAPISpec {
  const paths: Record<string, any> = {};

  api.endpoints.forEach((endpoint) => {
    if (!paths[endpoint.path]) {
      paths[endpoint.path] = {};
    }
    Object.assign(paths[endpoint.path], generatePathItem(endpoint));
  });

  const spec: OpenAPISpec = {
    openapi: '3.0.3',
    info: {
      title: api.title,
      description: api.description,
      version: api.version,
    },
    servers: [{ url: api.baseUrl }],
    paths,
    components: {
      schemas: {},
    },
  };

  // Add security schemes if auth is configured
  if (api.auth && api.auth.type === 'basic') {
    spec.components.securitySchemes = {
      basicAuth: {
        type: 'http',
        scheme: 'basic',
        description: `Username: ${api.auth.username || ''}, Password: ${api.auth.password || ''}`,
      },
    };
    spec.security = [{ basicAuth: [] }];
  } else if (api.auth && api.auth.type === 'bearer') {
    spec.components.securitySchemes = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    };
    spec.security = [{ bearerAuth: [] }];
  }

  return spec;
}

export function formatJSON(obj: any): string {
  return JSON.stringify(obj, null, 2);
}
