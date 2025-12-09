import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiDefinition } from '@/types/swagger';
import { Plus, Trash2 } from 'lucide-react';

interface ApiSelectorProps {
  apis: ApiDefinition[];
  currentApiId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function ApiSelector({ apis, currentApiId, onSelect, onAdd, onDelete }: ApiSelectorProps) {
  const currentApi = apis.find((a) => a.id === currentApiId);

  return (
    <div className="flex items-center gap-2">
      <Select value={currentApiId} onValueChange={onSelect}>
        <SelectTrigger className="w-[200px] bg-input border-border">
          <SelectValue placeholder="Selecionar API">
            {currentApi?.title || 'Nova API'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {apis.map((api) => (
            <SelectItem key={api.id} value={api.id}>
              {api.title || 'Nova API'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onAdd}
        className="border-primary/30 text-primary hover:bg-primary/10"
        title="Adicionar nova API"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {apis.length > 1 && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDelete(currentApiId)}
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
          title="Remover API atual"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
