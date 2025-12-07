"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProductRegistrationForm } from "@/components/product-registration-form"
import { CatalogManagementForm } from "@/components/catalog-management-form"

interface GeneratedProduct {
  requestType: "image" | "product_description"
  productName: string
  productDescription: string
  image?: string
}

export default function CatalogManagementPage() {
  const [activeTab, setActiveTab] = useState<"registration" | "management">("registration")
  const [generatedProduct, setGeneratedProduct] = useState<GeneratedProduct | null>(null)

  const handleProductGenerated = (product: GeneratedProduct) => {
    setGeneratedProduct(product)
    setActiveTab("registration")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("registration")}
              className={`px-4 py-3 font-semibold text-sm transition-all ${
                activeTab === "registration"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrar Producto
            </button>
            <button
              onClick={() => setActiveTab("management")}
              className={`px-4 py-3 font-semibold text-sm transition-all ${
                activeTab === "management"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Gestión de Catálogo
            </button>
          </div>

          {activeTab === "registration" && (
            <ProductRegistrationForm
              generatedProduct={generatedProduct}
              onProductRegistered={() => setGeneratedProduct(null)}
            />
          )}
          {activeTab === "management" && <CatalogManagementForm onProductGenerated={handleProductGenerated} />}
        </div>
      </main>
    </div>
  )
}
