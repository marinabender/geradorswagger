export interface FieldDefinition {
  id: string;
  name: string;
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  example?: string;
}

export interface HeaderDefinition {
  id: string;
  name: string;
  value: string;
  description: string;
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer';
  username?: string;
  password?: string;
  token?: string;
}

export interface EndpointDefinition {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  headers: HeaderDefinition[];
  requestBody: {
    fields: FieldDefinition[];
    example: string;
  };
  response: {
    statusCode: number;
    description: string;
    example: string;
  };
}

export interface ApiDefinition {
  id: string;
  title: string;
  description: string;
  version: string;
  baseUrl: string;
  endpoints: EndpointDefinition[];
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: Array<{ url: string }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}
