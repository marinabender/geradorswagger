import { Button } from '@/components/ui/button';
import { Check, Copy, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface JsonPreviewProps {
  json: string;
}

export function JsonPreview({ json }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      toast.success('JSON copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar JSON');
    }
  };

  const downloadJson = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi-spec.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Arquivo JSON baixado!');
  };

  const highlightJson = (jsonString: string): string => {
    return jsonString
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="json-number">$1</span>')
      .replace(/([{}\[\]])/g, '<span class="json-bracket">$1</span>');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <h3 className="font-semibold text-foreground">OpenAPI Specification</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="border-border hover:bg-secondary"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1 text-accent" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadJson}
            className="border-border hover:bg-secondary"
          >
            <Download className="h-4 w-4 mr-1" />
            Baixar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <pre
          className="json-preview whitespace-pre-wrap break-all"
          dangerouslySetInnerHTML={{ __html: highlightJson(json) }}
        />
      </div>
    </div>
  );
}
