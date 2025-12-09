import { FileJson2 } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent glow-primary">
            <FileJson2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Swagger Generator</h1>
            <p className="text-sm text-muted-foreground">Gerador de OpenAPI/Swagger JSON</p>
          </div>
        </div>
      </div>
    </header>
  );
}
