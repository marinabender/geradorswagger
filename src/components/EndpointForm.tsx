import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EndpointDefinition, FieldDefinition, HeaderDefinition, ResponseDefinition } from '@/types/swagger';
import { ChevronDown, ChevronUp, Code2, FileText, Play, Plus, Route, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FieldEditor } from './FieldEditor';
import { HeaderEditor } from './HeaderEditor';
import { CsvImport } from './CsvImport';
import { v4 as uuidv4 } from 'uuid';

interface EndpointFormProps {
  endpoint: EndpointDefinition;
  onChange: (endpoint: EndpointDefinition) => void;
  onRemove: () => void;
  onTest: () => void;
}

const httpMethods = [
  { value: 'GET', label: 'GET', color: 'text-accent' },
  { value: 'POST', label: 'POST', color: 'text-primary' },
  { value: 'PUT', label: 'PUT', color: 'text-warning' },
  { value: 'DELETE', label: 'DELETE', color: 'text-destructive' },
  { value: 'PATCH', label: 'PATCH', color: 'text-purple-400' },
];

export function EndpointForm({ endpoint, onChange, onRemove, onTest }: EndpointFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateField = <K extends keyof EndpointDefinition>(
    key: K,
    value: EndpointDefinition[K]
  ) => {
    onChange({ ...endpoint, [key]: value });
  };

  const addField = () => {
    const newField: FieldDefinition = {
      id: uuidv4(),
      name: '',
      type: 'string',
      description: '',
      required: false,
      example: '',
    };
    updateField('requestBody', {
      ...endpoint.requestBody,
      fields: [...endpoint.requestBody.fields, newField],
    });
  };

  const updateFieldItem = (index: number, field: FieldDefinition) => {
    const newFields = [...endpoint.requestBody.fields];
    newFields[index] = field;
    updateField('requestBody', { ...endpoint.requestBody, fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = endpoint.requestBody.fields.filter((_, i) => i !== index);
    updateField('requestBody', { ...endpoint.requestBody, fields: newFields });
  };

  const addHeader = () => {
    const newHeader: HeaderDefinition = {
      id: uuidv4(),
      name: '',
      value: '',
      description: '',
    };
    updateField('headers', [...endpoint.headers, newHeader]);
  };

  const updateHeader = (index: number, header: HeaderDefinition) => {
    const newHeaders = [...endpoint.headers];
    newHeaders[index] = header;
    updateField('headers', newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = endpoint.headers.filter((_, i) => i !== index);
    updateField('headers', newHeaders);
  };

  const handleCsvImport = (fields: FieldDefinition[]) => {
    updateField('requestBody', {
      ...endpoint.requestBody,
      fields: [...endpoint.requestBody.fields, ...fields],
    });
  };

  const methodColor = httpMethods.find((m) => m.value === endpoint.method)?.color || 'text-primary';

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card animate-fade-in">
      <div
        className="flex items-center justify-between p-4 bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-muted-foreground" />
            <span className={`font-mono font-semibold ${methodColor}`}>{endpoint.method}</span>
            <span className="font-mono text-muted-foreground">{endpoint.path || '/endpoint'}</span>
          </div>
          {endpoint.summary && (
            <span className="text-sm text-muted-foreground">— {endpoint.summary}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onTest();
            }}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            title="Testar endpoint"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Método HTTP</Label>
              <Select
                value={endpoint.method}
                onValueChange={(v) => updateField('method', v as EndpointDefinition['method'])}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {httpMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <span className={method.color}>{method.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Caminho (Path)</Label>
              <Input
                placeholder="/users/{id}"
                value={endpoint.path}
                onChange={(e) => updateField('path', e.target.value)}
                className="bg-input border-border font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Tags</Label>
              <Input
                placeholder="Users, Auth"
                value={endpoint.tags.join(', ')}
                onChange={(e) =>
                  updateField(
                    'tags',
                    e.target.value.split(',').map((t) => t.trim())
                  )
                }
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Resumo</Label>
              <Input
                placeholder="Breve descrição do endpoint"
                value={endpoint.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Descrição Detalhada</Label>
              <Input
                placeholder="Descrição completa..."
                value={endpoint.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>

          {/* Headers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-warning" />
                <Label className="text-foreground font-medium">Headers</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addHeader}
                className="border-warning/30 text-warning hover:bg-warning/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Header
              </Button>
            </div>

            <div className="space-y-3">
              {endpoint.headers.map((header, index) => (
                <HeaderEditor
                  key={header.id}
                  header={header}
                  onChange={(h) => updateHeader(index, h)}
                  onRemove={() => removeHeader(index)}
                />
              ))}
            </div>
          </div>

          {endpoint.method !== 'GET' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  <Label className="text-foreground font-medium">Request Body</Label>
                </div>
                <div className="flex items-center gap-2">
                  <CsvImport onImport={handleCsvImport} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addField}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Campo
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {endpoint.requestBody.fields.map((field, index) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    onChange={(f) => updateFieldItem(index, f)}
                    onRemove={() => removeField(index)}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Exemplo de Body (JSON)</Label>
                <Textarea
                  placeholder='{"campo": "valor"}'
                  value={endpoint.requestBody.example}
                  onChange={(e) =>
                    updateField('requestBody', {
                      ...endpoint.requestBody,
                      example: e.target.value,
                    })
                  }
                  className="bg-input border-border font-mono text-sm min-h-[120px]"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-accent" />
              <Label className="text-foreground font-medium">Responses</Label>
            </div>

            {endpoint.responses.map((response, index) => (
              <div key={index} className="space-y-3 p-4 border border-border rounded-lg bg-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-mono font-semibold ${
                    response.statusCode >= 200 && response.statusCode < 300 ? 'text-accent' :
                    response.statusCode >= 400 && response.statusCode < 500 ? 'text-warning' :
                    'text-destructive'
                  }`}>
                    {response.statusCode}
                  </span>
                  <span className="text-muted-foreground text-sm">{response.description}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Status Code</Label>
                    <Input
                      type="number"
                      value={response.statusCode}
                      onChange={(e) => {
                        const newResponses = [...endpoint.responses];
                        newResponses[index] = { ...response, statusCode: parseInt(e.target.value) || 200 };
                        updateField('responses', newResponses);
                      }}
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Descrição</Label>
                    <Input
                      value={response.description}
                      onChange={(e) => {
                        const newResponses = [...endpoint.responses];
                        newResponses[index] = { ...response, description: e.target.value };
                        updateField('responses', newResponses);
                      }}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">Exemplo (JSON)</Label>
                  <Textarea
                    placeholder='{"success": true}'
                    value={response.example}
                    onChange={(e) => {
                      const newResponses = [...endpoint.responses];
                      newResponses[index] = { ...response, example: e.target.value };
                      updateField('responses', newResponses);
                    }}
                    className="bg-input border-border font-mono text-sm min-h-[80px]"
                  />
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newResponse: ResponseDefinition = {
                  statusCode: 500,
                  description: 'Erro interno',
                  example: '{\n  "error": "Internal Server Error"\n}',
                };
                updateField('responses', [...endpoint.responses, newResponse]);
              }}
              className="border-accent/30 text-accent hover:bg-accent/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Response
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
