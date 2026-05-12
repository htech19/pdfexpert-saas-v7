import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Edit2, Check, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface ProductMetadata {
  id: number;
  nome: string;
  categoria: string;
  marca: string;
  descricao: string;
  imagem: string;
  imagePreview?: string;
}

interface MetadataEditorModalProps {
  isOpen: boolean;
  products: ProductMetadata[];
  onClose: () => void;
  onConfirm: (products: ProductMetadata[]) => void;
  onDiscard: (productId: number) => void;
}

export function MetadataEditorModal({
  isOpen,
  products,
  onClose,
  onConfirm,
  onDiscard
}: MetadataEditorModalProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedProducts, setEditedProducts] = useState<ProductMetadata[]>(products);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const handleEdit = (product: ProductMetadata) => {
    setEditingId(product.id);
  };

  const validateProduct = (product: ProductMetadata): Record<string, string> => {
    const productErrors: Record<string, string> = {};
    if (!product.nome?.trim()) productErrors.nome = "Nome é obrigatório";
    if (!product.categoria?.trim()) productErrors.categoria = "Categoria é obrigatória";
    if (!product.marca?.trim()) productErrors.marca = "Marca é obrigatória";
    if (!product.descricao?.trim()) productErrors.descricao = "Descrição é obrigatória";
    return productErrors;
  };

  const handleSaveEdit = (product: ProductMetadata) => {
    const productErrors = validateProduct(product);
    if (Object.keys(productErrors).length > 0) {
      setErrors(prev => ({ ...prev, [product.id]: productErrors }));
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setEditedProducts(prev =>
      prev.map(p => p.id === product.id ? product : p)
    );
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[product.id];
      return newErrors;
    });
    setEditingId(null);
  };

  const handleFieldChange = (productId: number, field: keyof ProductMetadata, value: string) => {
    setEditedProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, [field]: value }
          : p
      )
    );
  };

  const handleConfirm = async () => {
    // Validar todos os produtos
    const allErrors: Record<number, Record<string, string>> = {};
    let hasErrors = false;
    
    for (const product of editedProducts) {
      const productErrors = validateProduct(product);
      if (Object.keys(productErrors).length > 0) {
        allErrors[product.id] = productErrors;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(allErrors);
      toast.error("Corrija os erros antes de confirmar");
      return;
    }

    setIsSaving(true);
    try {
      // Aqui você pode chamar uma mutation tRPC para persistir os metadados
      // await trpc.processing.confirmMetadata.useMutation({ ... })
      onConfirm(editedProducts);
      toast.success("Metadados confirmados com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao confirmar metadados");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardProduct = (productId: number) => {
    setEditedProducts(prev => prev.filter(p => p.id !== productId));
    onDiscard(productId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revisar e Editar Metadados</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {editedProducts.length} produto(s) para revisar
            </p>
          </div>

          <div className="grid gap-4">
            {editedProducts.map((product) => (
              <Card key={product.id} className="bg-card border-border/50 p-4">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Image Preview */}
                  <div className="md:col-span-1">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border/50">
                      {product.imagePreview ? (
                        <img
                          src={product.imagePreview}
                          alt={product.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Fields */}
                  <div className="md:col-span-3 space-y-3">
                    {editingId === product.id ? (
                      <>
                        {/* Edit Mode */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Nome do Produto</Label>
                          <Input
                            value={product.nome}
                            onChange={(e) => handleFieldChange(product.id, "nome", e.target.value)}
                            className={`mt-1 ${errors[product.id]?.nome ? 'border-red-500' : ''}`}
                            placeholder="Ex: Fone Bluetooth Kaidi"
                          />
                          {errors[product.id]?.nome && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors[product.id].nome}
                            </p>
                          )}
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Categoria</Label>
                          <Input
                            value={product.categoria}
                            onChange={(e) => handleFieldChange(product.id, "categoria", e.target.value)}
                            className={`mt-1 ${errors[product.id]?.categoria ? 'border-red-500' : ''}`}
                            placeholder="Ex: Áudio"
                          />
                          {errors[product.id]?.categoria && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors[product.id].categoria}
                            </p>
                          )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Marca</Label>
                          <Input
                            value={product.marca}
                            onChange={(e) => handleFieldChange(product.id, "marca", e.target.value)}
                            className={`mt-1 ${errors[product.id]?.marca ? 'border-red-500' : ''}`}
                            placeholder="Ex: Kaidi"
                          />
                          {errors[product.id]?.marca && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors[product.id].marca}
                            </p>
                          )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Descrição</Label>
                        <Textarea
                          value={product.descricao}
                          onChange={(e) => handleFieldChange(product.id, "descricao", e.target.value)}
                          className={`mt-1 min-h-[80px] ${errors[product.id]?.descricao ? 'border-red-500' : ''}`}
                          placeholder="Descrição técnica para SEO..."
                        />
                        {errors[product.id]?.descricao && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[product.id].descricao}
                          </p>
                        )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="btn-neon flex-1"
                            onClick={() => handleSaveEdit(product)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* View Mode */}
                        <div>
                          <p className="text-xs text-muted-foreground">Nome</p>
                          <p className="font-semibold text-neon">{product.nome}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Categoria</p>
                            <p className="text-sm">{product.categoria}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Marca</p>
                            <p className="text-sm">{product.marca}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Descrição</p>
                          <p className="text-sm line-clamp-2">{product.descricao}</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="btn-neon flex-1"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDiscardProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {editedProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto para revisar
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="btn-neon"
            onClick={handleConfirm}
            disabled={editedProducts.length === 0 || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              `Confirmar e Enviar (${editedProducts.length})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
