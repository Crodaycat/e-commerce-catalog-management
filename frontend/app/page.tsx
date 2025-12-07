"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import Header from "@/components/header"

const PRODUCTS_PER_PAGE = 8
const API_BASE_URL = "http://localhost:8000"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
}

interface ApiResponse {
  total: number
  result: Product[]
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          search: searchQuery,
          page: currentPage.toString(),
          size: PRODUCTS_PER_PAGE.toString(),
        })

        const response = await fetch(`${API_BASE_URL}/products?${params}`)

        if (!response.ok) {
          throw new Error("Error al cargar los productos")
        }

        const data: ApiResponse = await response.json()
        setProducts(data.result)
        setTotal(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery, currentPage])

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Encuentra tu Producto Perfecto</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Descubre nuestra colección seleccionada de productos de calidad
          </p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Busca por nombre de producto o categoría..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-12 py-6 text-base bg-card border-border"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Mostrando {products.length} de {total} productos
          </p>
        </div>

        {/* Products Gallery */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-lg text-red-500 mb-4">Error: {error}</p>
            <p className="text-sm text-muted-foreground">
              Verifica que el servidor esté ejecutándose en {API_BASE_URL}
            </p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-8">
                <Button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => goToPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-9"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No se encontraron productos</p>
            <p className="text-sm text-muted-foreground">Intenta con otra búsqueda</p>
          </div>
        )}
      </main>
    </div>
  )
}
