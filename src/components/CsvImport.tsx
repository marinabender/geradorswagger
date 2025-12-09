import { Button } from '@/components/ui/button';
import { FieldDefinition } from '@/types/swagger';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface CsvImportProps {
  onImport: (fields: FieldDefinition[]) => void;
}

export function CsvImport({ onImport }: CsvImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());
        
        if (lines.length < 2) {
          toast.error('CSV deve ter pelo menos uma linha de dados');
          return;
        }

        const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
        const nameIndex = headers.findIndex((h) => h === 'name' || h === 'campo' || h === 'field');
        const typeIndex = headers.findIndex((h) => h === 'type' || h === 'tipo');
        const descIndex = headers.findIndex((h) => h === 'description' || h === 'descrição' || h === 'descricao');

        if (nameIndex === -1) {
          toast.error('CSV deve ter uma coluna "name" ou "campo"');
          return;
        }

        const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
        
        const fields: FieldDefinition[] = lines.slice(1).map((line) => {
          const values = parseCsvLine(line);
          const rawType = typeIndex !== -1 ? values[typeIndex]?.toLowerCase() : 'string';
          const type = validTypes.includes(rawType) ? rawType : 'string';

          return {
            id: uuidv4(),
            name: values[nameIndex] || '',
            type: type as FieldDefinition['type'],
            description: descIndex !== -1 ? values[descIndex] || '' : '',
            required: false,
            example: '',
          };
        }).filter((f) => f.name);

        if (fields.length === 0) {
          toast.error('Nenhum campo válido encontrado no CSV');
          return;
        }

        onImport(fields);
        toast.success(`${fields.length} campos importados com sucesso!`);
      } catch (error) {
        toast.error('Erro ao processar arquivo CSV');
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="border-accent/30 text-accent hover:bg-accent/10"
      >
        <FileSpreadsheet className="h-4 w-4 mr-1" />
        Importar CSV
      </Button>
    </div>
  );
}
