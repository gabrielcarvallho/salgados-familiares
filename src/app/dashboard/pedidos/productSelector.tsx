import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus, Minus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
          <Button
            type="button"
            variant="outline"
            className="ml-2 bg-[#FF8F3F] text-white hover:bg-[#E67D2E]"
            onClick={() => setShowProductList(!showProductList)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Product Dropdown */}
        {showProductList && (
          <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto">
            <CardContent className="p-1">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer ${
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
                      <Badge variant="outline" className="bg-[#FF8F3F]/10 text-[#FF8F3F] border-[#FF8F3F]/20">
                        Selecionado
                      </Badge>
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-muted-foreground">Nenhum produto encontrado</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Products */}
      {value.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {value.map((item) => {
                const product = products.find((p) => p.id === item.product_id)
                if (!product) return null

                return (
                  <div key={item.product_id} className="flex items-center justify-between">
                    <div className="flex-grow">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        R$ {typeof product.price === "number" ? product.price.toFixed(2) : product.price} cada
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-10 text-center">{item.quantity}</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => removeProduct(item.product_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
          Nenhum produto selecionado
        </div>
      )}
    </div>
  )
}
