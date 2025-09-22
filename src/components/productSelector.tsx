"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, Trash2, Edit, Save, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export type SelectedItem = {
  product_id: string | number;
  quantity: number;
  sale_price?: number;
  price?: number;
};

export const ProductSelector = ({
  products,
  value = [],
  onChange,
  onDisabled,
}: {
  products: any[];
  value: SelectedItem[];
  onChange: (value: SelectedItem[]) => void;
  onDisabled?: (value: SelectedItem[], product?: any) => boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductList, setShowProductList] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | number | null>(
    null
  );
  const [tempSalePrice, setTempSalePrice] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ VERIFICAR SE ESTÁ DESABILITADO GLOBALMENTE
  const isGloballyDisabled = onDisabled?.(value) ?? false;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProductList(false);
      }
    }

    if (showProductList) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProductList]);

  // ✅ FECHAR DROPDOWN QUANDO DESABILITADO
  useEffect(() => {
    if (isGloballyDisabled && showProductList) {
      setShowProductList(false);
    }
  }, [isGloballyDisabled, showProductList]);

  // ✅ CANCELAR EDIÇÃO QUANDO DESABILITADO
  useEffect(() => {
    if (isGloballyDisabled && editingPriceId) {
      cancelEdit();
    }
  }, [isGloballyDisabled, editingPriceId]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isProductSelected = (productId: string | number) =>
    value.some((item) => item.product_id === productId && item.quantity > 0);

  const addProduct = (product: any) => {
    // ✅ BLOQUEAR SE DESABILITADO
    if (isGloballyDisabled) return;

    // Verifica se o produto já foi adicionado
    const isDuplicate = value.some((item) => item.product_id === product.id);

    if (isDuplicate) {
      alert("Este produto já foi adicionado ao pedido");
      // ✅ FECHAR DROPDOWN MESMO SE DUPLICADO
      setShowProductList(false);
      return;
    }

    onChange([
      ...value,
      {
        product_id: product.id,
        quantity: 1,
        sale_price: Number(product.price) || 0,
        price: Number(product.price) || 0,
      },
    ]);

    // ✅ FECHAR DROPDOWN APÓS SELECIONAR PRODUTO (com setTimeout para garantir)
    setTimeout(() => {
      setShowProductList(false);
      setSearchTerm("");
    }, 0);
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    // ✅ BLOQUEAR SE DESABILITADO
    if (isGloballyDisabled) return;
    if (quantity < 0) return;

    onChange(
      value.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateSalesPrice = (productId: string | number, sale_price: number) => {
    // ✅ BLOQUEAR SE DESABILITADO
    if (isGloballyDisabled) return;
    if (sale_price < 0) return;

    onChange(
      value.map((item) =>
        item.product_id === productId ? { ...item, sale_price } : item
      )
    );
  };

  // ✅ CORRIGIR FUNÇÃO removeProduct
  const removeProduct = (productId: string | number) => {
    // ✅ BLOQUEAR SE DESABILITADO
    if (isGloballyDisabled) return;

    onChange(value.filter((item) => item.product_id !== productId));
  };

  // Editing price handlers
  const startEditPrice = (item: SelectedItem) => {
    // ✅ BLOQUEAR SE DESABILITADO
    if (isGloballyDisabled) return;

    setEditingPriceId(item.product_id);
    setTempSalePrice(Number(item.sale_price || 0).toFixed(2));
  };

  const cancelEdit = () => {
    setEditingPriceId(null);
    setTempSalePrice("");
  };

  const saveEdit = (productId: string | number) => {
    // ✅ BLOQUEAR SE DESABILITADO
    if (isGloballyDisabled) return;

    const parsed = parseFloat(tempSalePrice);
    updateSalesPrice(productId, isNaN(parsed) ? 0 : parsed);
    cancelEdit();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex">
          <div className="relative flex-grow">
            <Search
              className={`absolute left-2.5 top-2.5 h-4 w-4 ${
                isGloballyDisabled
                  ? "text-muted-foreground/50"
                  : "text-muted-foreground"
              }`}
            />
            <Input
              placeholder="Buscar produtos..."
              className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => {
                // ✅ BLOQUEAR SE DESABILITADO
                if (isGloballyDisabled) return;
                setSearchTerm(e.target.value);
                if (e.target.value) setShowProductList(true);
              }}
              onFocus={() => {
                // ✅ BLOQUEAR SE DESABILITADO
                if (isGloballyDisabled) return;
                setShowProductList(true);
              }}
              disabled={isGloballyDisabled}
            />
          </div>
          <motion.div whileTap={{ scale: isGloballyDisabled ? 1 : 0.95 }}>
            <Button
              type="button"
              variant="outline"
              className={`ml-2 ${
                isGloballyDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#FF8F3F] text-white hover:bg-[#E67D2E]"
              }`}
              onClick={() => {
                if (isGloballyDisabled) return;
                setShowProductList(!showProductList);
              }}
              disabled={isGloballyDisabled}
            >
              <motion.div
                animate={{ rotate: showProductList ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Plus className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showProductList && !isGloballyDisabled && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute z-10 w-full mt-1"
            >
              <Card className="max-h-60 overflow-auto">
                <CardContent className="p-1">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const disabledItem =
                        onDisabled?.(value, product) ?? false;
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          whileHover={{
                            backgroundColor: disabledItem
                              ? undefined
                              : "rgba(0,0,0,0.05)",
                          }}
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                            disabledItem ? "opacity-50 pointer-events-none" : ""
                          }`}
                          onClick={() => {
                            setShowProductList(false);
                            addProduct(product);
                          }}
                        >
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(Number(product.price || 0))}
                            </div>
                          </div>
                          {!isProductSelected(product.id) && (
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          )}
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-2 text-center text-muted-foreground"
                    >
                      Nenhum produto encontrado
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {value.length > 0 ? (
          <motion.div
            key="selected-products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className={isGloballyDisabled ? "opacity-60" : ""}>
              <CardContent className="p-4 space-y-4">
                {value.map((item) => {
                  const product = products.find(
                    (p) => p.id === item.product_id
                  );
                  if (!product) return null;
                  const isEditing = editingPriceId === item.product_id;
                  return (
                    <motion.div
                      key={item.product_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: 20,
                        height: 0,
                        marginTop: 0,
                        marginBottom: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      layout
                      className="flex items-center justify-between space-x-4"
                    >
                      <div className="flex-grow space-y-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <>
                              <div className="flex flex-col space-y-2">
                                <div>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={tempSalePrice}
                                    onChange={(e) =>
                                      setTempSalePrice(e.target.value)
                                    }
                                    onKeyUp={(e) =>
                                      e.key === "Enter" &&
                                      saveEdit(item.product_id)
                                    }
                                    className="w-24"
                                    min={0}
                                    disabled={isGloballyDisabled}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Button
                                    variant={"outline"}
                                    type="button"
                                    size="icon"
                                    onClick={() => saveEdit(item.product_id)}
                                    disabled={isGloballyDisabled}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant={"outline"}
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={isGloballyDisabled}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <span>
                                {formatCurrency(
                                  Number(item.sale_price) ||
                                  Number(item.price) ||
                                  0
                                )}
                              </span>
                              <Button
                                variant={"outline"}
                                type="button"
                                size="icon"
                                onClick={() => startEditPrice(item)}
                                disabled={isGloballyDisabled}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                          disabled={isGloballyDisabled}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                            updateQuantity(item.product_id, newQuantity);
                          }}
                          className="w-16 h-8 text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                          min={1}
                          disabled={isGloballyDisabled}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                          disabled={isGloballyDisabled}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`text-center p-4 border border-dashed rounded-md text-muted-foreground ${
              isGloballyDisabled ? "opacity-50" : ""
            }`}
          >
            Nenhum produto selecionado
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
