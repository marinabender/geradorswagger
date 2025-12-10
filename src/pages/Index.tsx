import { ApiInfoForm } from '@/components/ApiInfoForm';
import { ApiSelector } from '@/components/ApiSelector';
import { ApiTester } from '@/components/ApiTester';
import { EndpointForm } from '@/components/EndpointForm';
import { Header } from '@/components/Header';
import { JsonPreview } from '@/components/JsonPreview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ApiDefinition, EndpointDefinition } from '@/types/swagger';
import { formatJSON, generateOpenAPISpec } from '@/utils/generateOpenAPI';
import { Code2, Layers, Plus, Save, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const createDefaultEndpoint = (): EndpointDefinition => ({
  id: uuidv4(),
  method: 'POST',
  path: '/api/resource',
  summary: '',
  description: '',
  tags: ['Default'],
  headers: [],
  requestBody: {
    fields: [],
    example: '{\n  \n}',
  },
  response: {
    statusCode: 200,
    description: 'Sucesso',
    example: '{\n  "success": true\n}',
  },
});

const createDefaultApi = (): ApiDefinition => ({
  id: uuidv4(),
  title: '',
  description: '',
  version: '1.0.0',
  baseUrl: 'https://api.example.com',
  auth: { type: 'none' },
  endpoints: [],
});

export default function Index() {
  const [apis, setApis] = useLocalStorage<ApiDefinition[]>('swagger-apis', [createDefaultApi()]);
  const [currentApiId, setCurrentApiId] = useLocalStorage<string>('swagger-current-api', apis[0]?.id || '');
  const [activeTab, setActiveTab] = useState('info');
  const [testingEndpoint, setTestingEndpoint] = useState<EndpointDefinition | null>(null);

  const currentApi = apis.find((a) => a.id === currentApiId) || apis[0];

  const openApiSpec = useMemo(() => {
    if (!currentApi) return '{}';
    return formatJSON(generateOpenAPISpec(currentApi));
  }, [currentApi]);

  const updateCurrentApi = (updatedApi: ApiDefinition) => {
    setApis(apis.map((a) => (a.id === currentApiId ? updatedApi : a)));
  };

  const addApi = () => {
    const newApi = createDefaultApi();
    setApis([...apis, newApi]);
    setCurrentApiId(newApi.id);
    toast.success('Nova API adicionada!');
  };

  const deleteApi = (id: string) => {
    if (apis.length <= 1) {
      toast.error('Você precisa ter pelo menos uma API');
      return;
    }
    const newApis = apis.filter((a) => a.id !== id);
    setApis(newApis);
    if (currentApiId === id) {
      setCurrentApiId(newApis[0].id);
    }
    toast.success('API removida!');
  };

  const addEndpoint = () => {
    updateCurrentApi({
      ...currentApi,
      endpoints: [...currentApi.endpoints, createDefaultEndpoint()],
    });
  };

  const updateEndpoint = (index: number, endpoint: EndpointDefinition) => {
    const newEndpoints = [...currentApi.endpoints];
    newEndpoints[index] = endpoint;
    updateCurrentApi({ ...currentApi, endpoints: newEndpoints });
  };

  const removeEndpoint = (index: number) => {
    const newEndpoints = currentApi.endpoints.filter((_, i) => i !== index);
    updateCurrentApi({ ...currentApi, endpoints: newEndpoints });
  };

  const handleSave = () => {
    // Already auto-saved via localStorage, but show confirmation
    toast.success('API salva com sucesso!');
  };

  if (!currentApi) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <ApiSelector
            apis={apis}
            currentApiId={currentApiId}
            onSelect={setCurrentApiId}
            onAdd={addApi}
            onDelete={deleteApi}
          />
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-secondary/50 border border-border p-1">
                <TabsTrigger
                  value="info"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Informações
                </TabsTrigger>
                <TabsTrigger
                  value="endpoints"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Endpoints ({currentApi.endpoints.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-6">
                <div className="p-6 rounded-xl border border-border bg-card">
                  <ApiInfoForm api={currentApi} onChange={updateCurrentApi} />
                </div>
              </TabsContent>

              <TabsContent value="endpoints" className="mt-6 space-y-4">
                <Button
                  onClick={addEndpoint}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Endpoint
                </Button>

                {currentApi.endpoints.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum endpoint adicionado ainda.
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Clique no botão acima para começar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentApi.endpoints.map((endpoint, index) => (
                      <EndpointForm
                        key={endpoint.id}
                        endpoint={endpoint}
                        onChange={(e) => updateEndpoint(index, e)}
                        onRemove={() => removeEndpoint(index)}
                        onTest={() => setTestingEndpoint(endpoint)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - JSON Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm text-muted-foreground">openapi-spec.json</span>
              </div>
              <div className="h-[calc(100vh-200px)] max-h-[700px]">
                <JsonPreview json={openApiSpec} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {testingEndpoint && (
        <ApiTester
          endpoint={testingEndpoint}
          baseUrl={currentApi.baseUrl}
          onClose={() => setTestingEndpoint(null)}
        />
      )}
    </div>
  );
}
