import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AuthConfig, EndpointDefinition } from '@/types/swagger';
import { Loader2, Play, X } from 'lucide-react';
import { useState } from 'react';

interface ApiTesterProps {
  endpoint: EndpointDefinition;
  baseUrl: string;
  onClose: () => void;
}

export function ApiTester({ endpoint, baseUrl, onClose }: ApiTesterProps) {
  const [auth, setAuth] = useState<AuthConfig>({ type: 'none' });
  const [requestBody, setRequestBody] = useState(endpoint.requestBody.example);
  const [response, setResponse] = useState<string>('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const executeRequest = async () => {
    setLoading(true);
    setResponse('');
    setStatusCode(null);

    try {
      const url = baseUrl.replace(/\/$/, '') + endpoint.path;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add custom headers
      endpoint.headers.forEach((h) => {
        if (h.name && h.value) {
          headers[h.name] = h.value;
        }
      });

      // Add auth headers
      if (auth.type === 'basic' && auth.username && auth.password) {
        const credentials = btoa(`${auth.username}:${auth.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      } else if (auth.type === 'bearer' && auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers,
        mode: 'cors',
      };

      if (endpoint.method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      setStatusCode(res.status);

      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const json = await res.json();
        setResponse(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponse(text);
      }
    } catch (error) {
      setResponse(`Erro: ${error instanceof Error ? error.message : 'Falha na requisição'}`);
      setStatusCode(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!statusCode) return '';
    if (statusCode >= 200 && statusCode < 300) return 'text-accent';
    if (statusCode >= 400) return 'text-destructive';
    return 'text-warning';
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Testar API</h2>
            <span className="font-mono text-sm text-muted-foreground">
              {endpoint.method} {endpoint.path}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Autenticação</Label>
            <Select value={auth.type} onValueChange={(v) => setAuth({ ...auth, type: v as AuthConfig['type'] })}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {auth.type === 'basic' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Username</Label>
                <Input
                  placeholder="username"
                  value={auth.username || ''}
                  onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Password</Label>
                <Input
                  type="password"
                  placeholder="password"
                  value={auth.password || ''}
                  onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}

          {auth.type === 'bearer' && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Token</Label>
              <Input
                placeholder="seu-token-aqui"
                value={auth.token || ''}
                onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          )}

          {endpoint.method !== 'GET' && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Request Body (JSON)</Label>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="bg-input border-border font-mono text-sm min-h-[120px]"
              />
            </div>
          )}

          <Button
            onClick={executeRequest}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Executar Requisição
              </>
            )}
          </Button>

          {(response || statusCode !== null) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Resposta</Label>
                {statusCode !== null && (
                  <span className={`font-mono text-sm font-semibold ${getStatusColor()}`}>
                    Status: {statusCode}
                  </span>
                )}
              </div>
              <pre className="bg-secondary/50 border border-border rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-[300px] overflow-y-auto">
                {response || 'Sem resposta'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
