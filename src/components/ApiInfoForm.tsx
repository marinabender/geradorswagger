import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiDefinition, AuthConfig } from '@/types/swagger';
import { FileJson2, Globe, Info, Lock, Tag } from 'lucide-react';

interface ApiInfoFormProps {
  api: ApiDefinition;
  onChange: (api: ApiDefinition) => void;
}

export function ApiInfoForm({ api, onChange }: ApiInfoFormProps) {
  const updateField = (field: keyof ApiDefinition, value: string) => {
    onChange({ ...api, [field]: value });
  };

  const updateAuth = (auth: AuthConfig) => {
    onChange({ ...api, auth });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Informações da API</h2>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2 text-muted-foreground">
            <FileJson2 className="h-4 w-4" />
            Nome da API
          </Label>
          <Input
            id="title"
            placeholder="Minha API REST"
            value={api.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="bg-input border-border focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            Descrição
          </Label>
          <Textarea
            id="description"
            placeholder="Descrição detalhada da sua API..."
            value={api.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="bg-input border-border focus:border-primary focus:ring-primary min-h-[100px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="version" className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              Versão
            </Label>
            <Input
              id="version"
              placeholder="1.0.0"
              value={api.version}
              onChange={(e) => updateField('version', e.target.value)}
              className="bg-input border-border focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              URL Base
            </Label>
            <Input
              id="baseUrl"
              placeholder="https://api.exemplo.com/v1"
              value={api.baseUrl}
              onChange={(e) => updateField('baseUrl', e.target.value)}
              className="bg-input border-border focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        {/* Authentication Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Lock className="h-4 w-4 text-warning" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Autenticação</h3>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Tipo de Autenticação</Label>
            <Select
              value={api.auth?.type || 'none'}
              onValueChange={(v) => updateAuth({ ...api.auth, type: v as AuthConfig['type'] })}
            >
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

          {api.auth?.type === 'basic' && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Username</Label>
                <Input
                  placeholder="usuario"
                  value={api.auth.username || ''}
                  onChange={(e) => updateAuth({ ...api.auth, username: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={api.auth.password || ''}
                  onChange={(e) => updateAuth({ ...api.auth, password: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}

          {api.auth?.type === 'bearer' && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-muted-foreground">Token</Label>
              <Input
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={api.auth.token || ''}
                onChange={(e) => updateAuth({ ...api.auth, token: e.target.value })}
                className="bg-input border-border font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
