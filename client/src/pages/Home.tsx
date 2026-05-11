import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Zap, Brain, GitBranch, BarChart3, Lock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-neon">PDF</div>
            <div className="text-sm text-muted-foreground">Expert Enterprise</div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm hover-neon">Features</a>
            <a href="#how-it-works" className="text-sm hover-neon">Como Funciona</a>
            {isAuthenticated ? (
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="btn-neon"
              >
                Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = getLoginUrl()}
                className="btn-neon"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff41]/5 via-transparent to-transparent pointer-events-none" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 rounded-full border border-neon/30 bg-neon/5">
              <span className="text-neon text-sm font-semibold">🚀 Automação Inteligente</span>
            </div>
            <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Transforme Catálogos em <span className="text-neon">Websites</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
              Processe PDFs inteligentemente com IA, extraia imagens em WebP e publique automaticamente no GitHub. Sem código. Sem limites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = getLoginUrl()}
                className="btn-neon text-lg px-8 py-6"
              >
                Começar Agora
              </Button>
              <Button 
                variant="outline"
                className="btn-neon-outline text-lg px-8 py-6"
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 border-t border-border/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="mb-4">Recursos Poderosos</h2>
            <p className="text-muted-foreground text-lg">
              Tudo que você precisa para automatizar o processamento de catálogos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-card border-border/50 p-6 hover:border-neon/50 transition-colors">
              <div className="mb-4 inline-block p-3 bg-neon/10 rounded-lg">
                <Zap className="w-6 h-6 text-neon" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Processamento Ultra-Rápido</h3>
              <p className="text-muted-foreground">
                Extrai e processa centenas de imagens em minutos com filtros de entropia inteligentes
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-card border-border/50 p-6 hover:border-neon/50 transition-colors">
              <div className="mb-4 inline-block p-3 bg-neon/10 rounded-lg">
                <Brain className="w-6 h-6 text-neon" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">IA Gemini 1.5 Flash</h3>
              <p className="text-muted-foreground">
                Taxonomia 100% inteligente. Nomes reais de produtos, sem placeholders genéricos
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-card border-border/50 p-6 hover:border-neon/50 transition-colors">
              <div className="mb-4 inline-block p-3 bg-neon/10 rounded-lg">
                <GitBranch className="w-6 h-6 text-neon" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Deploy Automático</h3>
              <p className="text-muted-foreground">
                Commit automático no GitHub com database.json atualizado em tempo real
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-card border-border/50 p-6 hover:border-neon/50 transition-colors">
              <div className="mb-4 inline-block p-3 bg-neon/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-neon" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Progresso em Tempo Real</h3>
              <p className="text-muted-foreground">
                Acompanhe cada etapa do processamento com atualizações ao vivo no dashboard
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-card border-border/50 p-6 hover:border-neon/50 transition-colors">
              <div className="mb-4 inline-block p-3 bg-neon/10 rounded-lg">
                <Lock className="w-6 h-6 text-neon" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Segurança Total</h3>
              <p className="text-muted-foreground">
                Credenciais gerenciadas por variáveis de ambiente. Nenhuma exposição de tokens
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-card border-border/50 p-6 hover:border-neon/50 transition-colors">
              <div className="mb-4 inline-block p-3 bg-neon/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-neon" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">WebP Otimizado</h3>
              <p className="text-muted-foreground">
                Conversão automática para WebP com compressão inteligente e melhor performance
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 border-t border-border/50 bg-card/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="mb-4">Como Funciona</h2>
            <p className="text-muted-foreground text-lg">
              4 passos simples para transformar seus PDFs em websites
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon text-black font-bold text-lg">
                1
              </div>
              <h3 className="mb-2 font-semibold">Upload PDF</h3>
              <p className="text-muted-foreground text-sm">
                Envie seu catálogo em PDF através do dashboard
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon text-black font-bold text-lg">
                2
              </div>
              <h3 className="mb-2 font-semibold">Processamento IA</h3>
              <p className="text-muted-foreground text-sm">
                Extração inteligente com filtros de entropia e taxonomia
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon text-black font-bold text-lg">
                3
              </div>
              <h3 className="mb-2 font-semibold">Conversão WebP</h3>
              <p className="text-muted-foreground text-sm">
                Otimização automática para melhor performance
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon text-black font-bold text-lg">
                4
              </div>
              <h3 className="mb-2 font-semibold">Deploy GitHub</h3>
              <p className="text-muted-foreground text-sm">
                Publicação automática com database.json atualizado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 border-t border-border/50">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-6">Pronto para Revolucionar Seu Workflow?</h2>
            <p className="mb-8 text-muted-foreground text-lg">
              Junte-se a empresas que já estão automatizando seus catálogos com PDF Expert
            </p>
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              className="btn-neon text-lg px-8 py-6"
            >
              Começar Gratuitamente
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-neon">Features</a></li>
                <li><a href="#" className="hover-neon">Pricing</a></li>
                <li><a href="#" className="hover-neon">Documentação</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-neon">Sobre</a></li>
                <li><a href="#" className="hover-neon">Blog</a></li>
                <li><a href="#" className="hover-neon">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-neon">Privacidade</a></li>
                <li><a href="#" className="hover-neon">Termos</a></li>
                <li><a href="#" className="hover-neon">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Social</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-neon">Twitter</a></li>
                <li><a href="#" className="hover-neon">GitHub</a></li>
                <li><a href="#" className="hover-neon">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 PDF Expert Enterprise. Todos os direitos reservados. Desenvolvido por HC TECH Solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
