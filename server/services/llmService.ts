import { invokeLLM } from "../_core/llm";

/**
 * Serviço de LLM para Taxonomia Inteligente
 * Usa Gemini 1.5 Flash para identificação de produtos
 */
export class LLMService {
  /**
   * Identifica o produto a partir da imagem e contexto
   */
  async identifyProduct(
    imageBase64: string,
    textContext: string
  ): Promise<{
    nome: string;
    categoria: string;
    marca: string;
    descricao: string;
  } | null> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um especialista em catalogação de produtos. Sua missão é extrair a taxonomia exata do produto para um catálogo SaaS.

REGRAS CRÍTICAS:
1. NUNCA use nomes genéricos como 'Item_01' ou 'Produto_Pendente'.
2. Se o nome não estiver claro no texto, identifique-o visualmente (ex: 'Fone_Bluetooth_Kaidi_KD771').
3. Remova preços, termos de estoque ou promoções do nome.
4. Formate o nome para ser usado em URLs (substitua espaços por sublinhados se necessário, mas mantenha legível).
5. Sempre retorne nomes REAIS de produtos, nunca placeholders.

Retorne APENAS um objeto JSON com: {"nome": "...", "categoria": "...", "marca": "...", "descricao": "..."}`
          },
          {
            role: "user",
            content: `Analise este produto. Contexto do PDF: ${textContext}\n\nImagem: data:image/webp;base64,${imageBase64}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "product_taxonomy",
            strict: true,
            schema: {
              type: "object",
              properties: {
                nome: { type: "string", description: "Nome completo do produto" },
                categoria: { type: "string", description: "Categoria principal" },
                marca: { type: "string", description: "Marca identificada" },
                descricao: { type: "string", description: "Descrição técnica para SEO" }
              },
              required: ["nome", "categoria", "marca", "descricao"],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0]?.message.content;
      if (!content || typeof content !== 'string') return null;

      const parsed = JSON.parse(content);
      
      // Validar que não são nomes genéricos
      if (this.isGenericName(parsed.nome)) {
        console.warn("Nome genérico detectado, usando fallback");
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Erro na identificação de produto:", error);
      return null;
    }
  }

  /**
   * Detecta se um nome é genérico/placeholder
   */
  private isGenericName(name: string): boolean {
    const genericPatterns = [
      /^item_\d+$/i,
      /^produto_\d+$/i,
      /^produto_pendente$/i,
      /^unknown$/i,
      /^sem_nome$/i,
      /^\d+$/
    ];

    return genericPatterns.some(pattern => pattern.test(name));
  }
}

export const llmService = new LLMService();
