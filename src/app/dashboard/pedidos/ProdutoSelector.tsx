"use client";
import React, { useState } from "react";
import { MultiSelect, SelectedItem } from "./multiselect";

// Lista de produtos de exemplo
const produtos = [
  { label: "Coxinha", value: "coxinha", price: 3.5 },
  { label: "Pastel", value: "pastel", price: 4.0 },
  { label: "Empada", value: "empada", price: 4.5 },
  { label: "Kibe", value: "kibe", price: 3.0 },
  { label: "Bolinha de Queijo", value: "bolinha", price: 3.5 },
];

export function ProdutoSelector() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Calcula o valor total do pedido
  const valorTotal = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="space-y-2">
      <MultiSelect
        options={produtos}
        onValueChange={setSelectedItems}
        defaultValue={[]}
        placeholder="Selecione os salgadinhos"
      />

      {selectedItems.length > 0 && (
        <div className="text-sm text-right font-medium">
          Total: R$ {valorTotal.toFixed(2)}
        </div>
      )}
    </div>
  );
}
