import React from "react";
import { ProdutoSelector } from "./ProdutoSelector";

export default function ProdutoSelectorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Novo Pedido</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <ProdutoSelector />

        <div className="mt-8 flex justify-end">
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
