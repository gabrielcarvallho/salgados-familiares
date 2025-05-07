"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, Minus, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

export const ProductSelector = ({
  products,
  value = [],
  onChange,
}: {
  products: any[]
  value: any[]
  onChange: (value: any[]) => void
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showProductList, setShowProductList] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductList(false)
      }
    }

    // Add event listener when dropdown is shown
    if (showProductList) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showProductList])

  // Filter products based on search term
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Check if a product is already selected
  const isProductSelected = (productId: string | number) => {
    return value.some((item) => item.product_id === productId)
  }

  // Add a product to the selection
  const addProduct = (product: any) => {
    if (!isProductSelected(product.id)) {
      onChange([...value, { product_id: product.id, quantity: 1 }])
    }
    setShowProductList(false)
  }

  // Remove a product from the selection
  const removeProduct = (productId: string | number) => {
    onChange(value.filter((item) => item.product_id !== productId))
  }

  // Update the quantity of a selected product
  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity < 1) return

    onChange(
      value.map((item) => {
        if (item.product_id === productId) {
          return { ...item, quantity }
        }
        return item
      }),
    )
  }

  return (
    <div className="space-y-3">
      {/* Product Search */}
      <div className="relative">
        <div className="flex">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value) {
                  setShowProductList(true)
                }
              }}
              onFocus={() => setShowProductList(true)}
            />
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="outline"
              className="ml-2 bg-[#FF8F3F] text-white hover:bg-[#E67D2E]"
              onClick={() => setShowProductList(!showProductList)}
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

        {/* Product Dropdown with Animation */}
        <AnimatePresence>
          {showProductList && (
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
                  <AnimatePresence>
                    {filteredProducts.length > 0 ? (
                      <motion.div className="space-y-1">
                        {filteredProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                              isProductSelected(product.id) ? "bg-muted/50" : ""
                            }`}
                            onClick={() => addProduct(product)}
                          >
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                R$ {typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                              </div>
                            </div>
                            {isProductSelected(product.id) ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <Badge variant="outline" className="bg-[#FF8F3F]/10 text-[#FF8F3F] border-[#FF8F3F]/20">
                                  Selecionado
                                </Badge>
                              </motion.div>
                            ) : (
                              <motion.div
                                whileHover={{ rotate: 90 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-2 text-center text-muted-foreground"
                      >
                        Nenhum produto encontrado
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Products with Animation */}
      <AnimatePresence mode="wait">
        {value.length > 0 ? (
          <motion.div
            key="selected-products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card>
              <CardContent className="p-4">
                <motion.div className="space-y-3">
                  <AnimatePresence>
                    {value.map((item) => {
                      const product = products.find((p) => p.id === item.product_id)
                      if (!product) return null

                      return (
                        <motion.div
                          key={item.product_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0, marginTop: 0, marginBottom: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          layout
                          className="flex items-center justify-between"
                        >
                          <div className="flex-grow">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              R$ {typeof product.price === "number" ? product.price.toFixed(2) : product.price} cada
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </motion.div>
                            <motion.div
                              key={item.quantity}
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-10 text-center"
                            >
                              {item.quantity}
                            </motion.div>
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </motion.div>
                            <motion.div
                              whileTap={{ scale: 0.9 }}
                              whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                            >
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => removeProduct(item.product_id)}
                              >
                                <motion.div
                                  whileHover={{ rotate: 90 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </motion.div>
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>
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
            className="text-center p-4 border border-dashed rounded-md text-muted-foreground"
          >
            Nenhum produto selecionado
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
