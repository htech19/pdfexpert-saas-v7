import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ProcessingStats {
  total: number;
  processed: number;
  discarded: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<ProcessingStats>({
    total: 0,
    processed: 0,
    discarded: 0,
    status: 'idle',
    progress: 0,
    message: 'Aguardando arquivo...'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, loading, setLocation]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setStats(prev => ({ ...prev, message: `Arquivo selecionado: ${file.name}` }));
    } else {
      setStats(prev => ({ ...prev, message: 'Por favor, selecione um arquivo PDF válido' }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setStats(prev => ({
      ...prev,
      status: 'processing',
      message: 'Iniciando processamento...',
      progress: 0
    }));

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/trpc/processing.upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload falhou');

      const data = await response.json();
      
      setStats(prev => ({
        ...prev,
        status: 'completed',
        message: 'Processamento concluído com sucesso!',
        progress: 100,
        total: data.total,
        processed: data.processed,
        discarded: data.discarded
      }));

      setSelectedFile(null);
    } catch (error) {
      setStats(prev => ({
        ...prev,
        status: 'error',
        message: 'Erro ao processar arquivo. Tente novamente.'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center dark">
        <Loader2 className="w-8 h-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-neon">PDF Expert</div>
            <div className="text-sm text-muted-foreground">Dashboard</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Olá,</span> <span className="font-semibold text-neon">{user?.name || 'Usuário'}</span>
            </div>
            <Button 
              variant="outline"
              onClick={logout}
              className="text-sm"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <Card className="bg-card border-border/50 p-8 mb-8">
            <h2 className="mb-6">Upload de Catálogo PDF</h2>

            {/* File Input */}
            <div className="mb-6">
              <label className="block mb-4">
                <div className="border-2 border-dashed border-neon/30 rounded-lg p-8 text-center cursor-pointer hover:border-neon/60 transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-neon" />
                  <p className="text-lg font-semibold mb-2">
                    {selectedFile ? selectedFile.name : 'Selecione um arquivo PDF'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique ou arraste um arquivo PDF aqui
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </div>
              </label>
            </div>

            {/* Status Message */}
            <div className="mb-6 p-4 rounded-lg bg-card/50 border border-border/50">
              <p className="text-sm text-muted-foreground">{stats.message}</p>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
              className="btn-neon w-full py-6 text-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Iniciar Processamento
                </>
              )}
            </Button>
          </Card>

          {/* Statistics Section */}
          {stats.status !== 'idle' && (
            <Card className="bg-card border-border/50 p-8 mb-8">
              <h3 className="mb-6 text-lg font-semibold">Progresso do Processamento</h3>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Progresso Geral</span>
                  <span className="text-sm font-semibold text-neon">{Math.round(stats.progress)}%</span>
                </div>
                <Progress value={stats.progress} className="h-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">Total Lido</p>
                  <p className="text-3xl font-bold text-neon">{stats.total}</p>
                </div>
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">Processados</p>
                  <p className="text-3xl font-bold text-green-400">{stats.processed}</p>
                </div>
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">Descartados</p>
                  <p className="text-3xl font-bold text-red-400">{stats.discarded}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
                {stats.status === 'completed' && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-green-400">Processamento concluído com sucesso!</span>
                  </>
                )}
                {stats.status === 'processing' && (
                  <>
                    <Loader2 className="w-5 h-5 text-neon animate-spin" />
                    <span className="text-neon">Processando...</span>
                  </>
                )}
                {stats.status === 'error' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">Erro no processamento</span>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* GitHub Link Section */}
          {stats.status === 'completed' && (
            <Card className="bg-card border-neon/30 p-8">
              <h3 className="mb-4 text-lg font-semibold">Próximos Passos</h3>
              <p className="text-muted-foreground mb-6">
                Seu catálogo foi processado e publicado no GitHub com sucesso!
              </p>
              <Button className="btn-neon">
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir Repositório no GitHub
              </Button>
            </Card>
          )}

          {/* History Section */}
          <Card className="bg-card border-border/50 p-8 mt-8">
            <h3 className="mb-6 text-lg font-semibold">Histórico de Processamentos</h3>
            <p className="text-muted-foreground text-center py-8">
              Nenhum processamento anterior. Envie seu primeiro PDF para começar!
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
