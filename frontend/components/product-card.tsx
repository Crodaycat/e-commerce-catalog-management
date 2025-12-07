"use client"

import { useState } from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  price: number
  image: string
  description?: string
}

const truncateDescription = (text: string, maxLength = 80): string => {
  if (!text) return ""
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
}

export default function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-secondary overflow-hidden">
        <img
          src={`${product.image.startsWith("http") ? product.image : `http://localhost:8000/images/${product.image}`}`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full transition-all shadow-md"
          aria-label="Agregar a favoritos"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
          />
        </button>

        {/* Overlay with Add to Cart */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Agregar al Carrito
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col h-32">
        <h3 className="font-semibold text-foreground line-clamp-2 text-balance">{product.name}</h3>

        {product.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-grow">
            {truncateDescription(product.description)}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
