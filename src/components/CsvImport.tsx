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
        
        if (lines.length < 1) {
          toast.error('CSV está vazio');
          return;
        }

        const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
        const headerKeywords = ['name', 'campo', 'field', 'type', 'tipo', 'description', 'descrição', 'descricao'];
        
        const firstLineValues = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
        const hasHeader = firstLineValues.some((val) => headerKeywords.includes(val));
        
        let nameIndex = 0;
        let typeIndex = 1;
        let descIndex = 2;
        let dataLines = lines;
        
        if (hasHeader) {
          // CSV tem header - encontrar índices
          nameIndex = firstLineValues.findIndex((h) => h === 'name' || h === 'campo' || h === 'field');
          typeIndex = firstLineValues.findIndex((h) => h === 'type' || h === 'tipo');
          const foundDescIndex = firstLineValues.findIndex((h) => 
            h === 'description' || h === 'descrição' || h === 'descricao' || 
            h === 'desc' || h === 'detalhe' || h === 'detalhes' || h === 'observacao' || h === 'obs'
          );
          descIndex = foundDescIndex !== -1 ? foundDescIndex : (firstLineValues.length >= 3 ? 2 : -1);
          
          if (nameIndex === -1) {
            nameIndex = 0; // Assume primeira coluna como nome
          }
          if (typeIndex === -1) {
            typeIndex = 1; // Assume segunda coluna como tipo
          }
          
          dataLines = lines.slice(1);
        }
        // Se não tem header, assume: coluna 0 = name, coluna 1 = type, coluna 2 = description
        
        const fields: FieldDefinition[] = dataLines.map((line) => {
          const values = parseCsvLine(line);
          const rawType = values[typeIndex]?.toLowerCase()?.trim() || 'string';
          const type = validTypes.includes(rawType) ? rawType : 'string';

          return {
            id: uuidv4(),
            name: values[nameIndex]?.trim() || '',
            type: type as FieldDefinition['type'],
            description: descIndex !== -1 ? values[descIndex]?.trim() || '' : '',
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
