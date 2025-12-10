import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ApiDefinition } from '@/types/swagger';
import { parseOpenAPISpec } from '@/utils/importOpenAPI';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface JsonImportProps {
  onImport: (api: ApiDefinition) => void;
}

export function JsonImport({ onImport }: JsonImportProps) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (!jsonText.trim()) {
      toast.error('Por favor, insira um JSON válido');
      return;
    }

    const api = parseOpenAPISpec(jsonText);
    if (api) {
      onImport(api);
      setOpen(false);
      setJsonText('');
      toast.success('API importada com sucesso!');
    } else {
      toast.error('JSON inválido. Verifique se é uma especificação OpenAPI válida.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
    };
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo');
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
          <Upload className="h-4 w-4 mr-2" />
          Importar JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importar OpenAPI JSON</DialogTitle>
          <DialogDescription>
            Cole o JSON da especificação OpenAPI ou faça upload de um arquivo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload arquivo JSON
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou cole aqui</span>
            </div>
          </div>

          <Textarea
            placeholder='{"openapi": "3.0.0", "info": {...}, "paths": {...}}'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} className="bg-primary hover:bg-primary/90">
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
