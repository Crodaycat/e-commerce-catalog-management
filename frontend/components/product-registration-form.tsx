"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GeneratedProduct {
  requestType: "image" | "product_description"
  productName: string
  productDescription: string
  image?: string
}

interface ProductRegistrationFormProps {
  generatedProduct?: GeneratedProduct | null
  onProductRegistered?: () => void
}

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/gif': return 'gif';
    case 'application/pdf': return 'pdf';
    case 'text/plain': return 'txt';
    // Add more cases as needed
    default: return 'bin'; // Default to .bin for unknown types
  }
}

export function ProductRegistrationForm({ generatedProduct, onProductRegistered }: ProductRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [price, setPrice] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (generatedProduct) {
      setProductName(generatedProduct.productName)
      setProductDescription(generatedProduct.productDescription)

      if (generatedProduct.image) {
        setImagePreview(generatedProduct.image)


        const parts = generatedProduct.image.split(',');
        const mimeType = parts[0].match(/:(.*?);/)![1];
        const base64Data = parts[1];

        debugger;

        const decodedData = atob(base64Data);

        const arrayBuffer = new ArrayBuffer(decodedData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < decodedData.length; i++) {
          uint8Array[i] = decodedData.charCodeAt(i);
        }

        const blob = new Blob([uint8Array], { type: mimeType });


        setSelectedFile(
          new File([blob], `${generatedProduct.productName}.${getExtensionFromMimeType(mimeType)}`, { type: mimeType }),
        )
      }
      setPrice("")
    }
  }, [generatedProduct])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      const request = {
        productName,
        productDescription,
        price,
      }

      formData.append("request", JSON.stringify(request))
      formData.append("productImage", selectedFile!)


      const response = await fetch("http://localhost:8000/products", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      setSuccess(true)
      alert("Producto registrado exitosamente")
      handleReset()
      onProductRegistered?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setProductName("")
    setProductDescription("")
    setPrice("")
    setSelectedFile(null)
    setImagePreview(null)
    setError(null)
    setSuccess(false)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="text-2xl">Registrar Producto</CardTitle>
        <CardDescription>Ingresa los detalles del nuevo producto</CardDescription>
      </CardHeader>

      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del Producto */}
          <div className="space-y-2">
            <label htmlFor="product-name" className="block text-sm font-semibold text-foreground">
              Nombre del Producto
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="Ingresa el nombre del producto"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required
            />
          </div>

          {/* Descripción del Producto */}
          <div className="space-y-2">
            <label htmlFor="product-description" className="block text-sm font-semibold text-foreground">
              Descripción del Producto
            </label>
            <textarea
              id="product-description"
              placeholder="Describe características, material, uso, etc."
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              required
            />
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-semibold text-foreground">
              Precio
            </label>
            <input
              id="price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required
            />
          </div>

          {/* Imagen del Producto */}
          <div className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
            <div className="space-y-2">
              <label htmlFor="product-image" className="block text-sm font-semibold text-foreground">
                Imagen del Producto
              </label>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Formatos soportados: JPG, PNG, GIF, WebP</p>
            </div>

            {imagePreview && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Vista Previa</p>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Vista previa del producto"
                    className="object-contain w-full h-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedFile?.name} ({(selectedFile?.size ? selectedFile.size / 1024 : 0).toFixed(2)} KB)
                </p>
              </div>
            )}
          </div>

          {/* Error message display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Success message display */}
          {success && (
            <div className="p-3 rounded-lg bg-green-100 border border-green-300 text-green-800 text-sm">
              Producto registrado exitosamente
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !productName || !productDescription || !price || !selectedFile}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
            >
              {isSubmitting ? "Registrando..." : "Registrar Producto"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border hover:bg-secondary bg-transparent"
              onClick={handleReset}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
