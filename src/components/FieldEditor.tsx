import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FieldDefinition } from '@/types/swagger';
import { GripVertical, Trash2 } from 'lucide-react';

interface FieldEditorProps {
  field: FieldDefinition;
  onChange: (field: FieldDefinition) => void;
  onRemove: () => void;
}

const fieldTypes = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'integer', label: 'Integer' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Object' },
];

export function FieldEditor({ field, onChange, onRemove }: FieldEditorProps) {
  const updateField = (key: keyof FieldDefinition, value: any) => {
    onChange({ ...field, [key]: value });
  };

  return (
    <div className="group relative flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all">
      <div className="flex items-center h-10 text-muted-foreground/50 cursor-grab">
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Nome do Campo</Label>
          <Input
            placeholder="campo"
            value={field.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="h-9 bg-input border-border text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select value={field.type} onValueChange={(v) => updateField('type', v)}>
            <SelectTrigger className="h-9 bg-input border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Descrição</Label>
          <Input
            placeholder="Descrição do campo"
            value={field.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="h-9 bg-input border-border text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Exemplo</Label>
          <Input
            placeholder="valor exemplo"
            value={field.example || ''}
            onChange={(e) => updateField('example', e.target.value)}
            className="h-9 bg-input border-border text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-6">
        <div className="flex items-center gap-2">
          <Switch
            id={`required-${field.id}`}
            checked={field.required}
            onCheckedChange={(checked) => updateField('required', checked)}
          />
          <Label htmlFor={`required-${field.id}`} className="text-xs text-muted-foreground cursor-pointer">
            Req.
          </Label>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
