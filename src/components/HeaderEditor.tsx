import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeaderDefinition } from '@/types/swagger';
import { Trash2 } from 'lucide-react';

interface HeaderEditorProps {
  header: HeaderDefinition;
  onChange: (header: HeaderDefinition) => void;
  onRemove: () => void;
}

export function HeaderEditor({ header, onChange, onRemove }: HeaderEditorProps) {
  const updateField = <K extends keyof HeaderDefinition>(key: K, value: HeaderDefinition[K]) => {
    onChange({ ...header, [key]: value });
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg border border-border animate-fade-in">
      <Input
        placeholder="Header Name"
        value={header.name}
        onChange={(e) => updateField('name', e.target.value)}
        className="bg-input border-border flex-1"
      />
      <Input
        placeholder="Value"
        value={header.value}
        onChange={(e) => updateField('value', e.target.value)}
        className="bg-input border-border flex-1"
      />
      <Input
        placeholder="Descrição"
        value={header.description}
        onChange={(e) => updateField('description', e.target.value)}
        className="bg-input border-border flex-1"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
