"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Factory, StickyNote, Plus, Loader2, ListChecks, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useProduction } from "@/hooks/useProduction";
import { useProductList } from "@/hooks/useProduct";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import DatePicker from "@/components/ui/date-picker";

const toYMD = (s?: string | null) => (s ? s.slice(0, 10) : "");
const isValidYMD = (s?: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

const statusLabelPT = (s: number) => (s === 0 ? "Planejado" : s === 1 ? "Em produção" : "Concluído");
const statusHint = (s: number) =>
  s === 0 ? "Registro planejado, ainda não iniciado" : s === 1 ? "Produção em andamento" : "Produção concluída e estoque reposto";

export function DialogProduction() {
  const [open, setOpen] = useState(false);
  const { create, isLoading } = useProduction();

  // Estado controlado manualmente - SEM react-hook-form para evitar loops
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity_produced: 0, expiration_date: null }]);

  // Produtos - chamada estável
  const { products = [] } = useProductList("active", 1, 1000);

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setStatus(0);
    setNotes("");
    setItems([{ product_id: "", quantity_produced: 0, expiration_date: null }]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error("Datas de início e fim são obrigatórias");
      return;
    }

    if (items.every(it => !it.product_id)) {
      toast.error("Adicione pelo menos um produto");
      return;
    }

    try {
      const payload = {
        start_date: toYMD(startDate),
        end_date: toYMD(endDate),
        status: Number(status) as 0 | 1 | 2,
        notes: notes.trim() || "",
        production_items: items
          .filter(it => it.product_id) // só itens com produto
          .map((it) => ({
            product_id: it.product_id,
            quantity_produced: Number(it.quantity_produced) || 0,
            expiration_date: it.expiration_date ? toYMD(it.expiration_date) : null,
          })),
      };

      await create(payload);
      toast.success("Registro de produção criado!");
      setOpen(false);
      resetForm();
      
      // Force page reload para atualizar a tabela
      window.location.reload();
    } catch (e) {
      toast.error("Falha ao criar registro de produção", { description: String(e) });
    }
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const addItem = () => {
    setItems(prev => [...prev, { product_id: "", quantity_produced: 0, expiration_date: null }]);
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#FF8F3F] text-white gap-2">
          <Plus className="h-4 w-4" />
          Novo registro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-[#FF8F3F]" />
            Novo Registro de Produção
          </DialogTitle>
          <DialogDescription>
            Defina o período, o status e os itens produzidos para repor o estoque.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Período */}
          <div className="space-y-3">
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF8F3F]" />
                Início
              </Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF8F3F]" />
                Fim
              </Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2].map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={status === s ? "default" : "outline"}
                  className={status === s ? "bg-[#FF8F3F] text-white" : ""}
                  title={statusHint(s)}
                  onClick={() => setStatus(s)}
                >
                  {statusLabelPT(s)}
                </Button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-[#FF8F3F]" />
              Observações (opcional)
            </Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre a produção"
            />
          </div>

          {/* Itens */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-[#FF8F3F]" />
              <span>Itens de produção</span>
              <Button type="button" variant="outline" onClick={addItem} className="ml-auto">
                Adicionar item
              </Button>
            </div>
            <Separator />

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="rounded-md border p-3 space-y-3 bg-background">
                  {/* Produto */}
                  <div>
                    <Label>Produto</Label>
                    <Select
                      value={item.product_id}
                      onValueChange={(v) => updateItem(idx, "product_id", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantidade */}
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      value={item.quantity_produced}
                      onChange={(e) => updateItem(idx, "quantity_produced", Number.parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min={0}
                    />
                  </div>

                  {/* Validade */}
                  <div>
                    <Label>Validade (opcional)</Label>
                    <DatePicker
                      value={item.expiration_date || ""}
                      onChange={(s) => updateItem(idx, "expiration_date", s || null)}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>

                  {items.length > 1 && (
                    <div className="flex justify-end">
                      <Button type="button" variant="ghost" onClick={() => removeItem(idx)}>
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-[#FF8F3F] text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>Salvar</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
