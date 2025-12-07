"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type RequestType = "image" | "product_description"

interface GeneratedProduct {
  requestType: RequestType
  productName: string
  productDescription: string
  image?: string
}

interface CatalogManagementFormProps {
  onProductGenerated?: (product: GeneratedProduct & { imageExtension?: string }) => void
}

export function CatalogManagementForm({ onProductGenerated }: CatalogManagementFormProps) {
  const [requestType, setRequestType] = useState<RequestType>("product_description")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [generatedProduct, setGeneratedProduct] = useState<(GeneratedProduct & { imageExtension?: string }) | null>(
    null,
  )

  const getMimeTypeAndExtension = (dataUri: string): { mimeType: string; extension: string } => {
    const match = dataUri.match(/^data:([^;]+);base64,/)
    const mimeType = match ? match[1] : "image/png"
    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/svg+xml": "svg",
    }
    const extension = extensionMap[mimeType] || "png"
    return { mimeType, extension }
  }

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
    setIsSubmitting(true)
    setGeneratedProduct(null)

    try {
      const formData = new FormData()

      // Build the request object based on requestType
      const requestObject: GeneratedProduct = {
        requestType: requestType,
        productName: "",
        productDescription: "",
      }

      if (requestType === "product_description") {
        formData.append("image", selectedFile!)
      } else {
        // For image: include productName and productDescription (optional)
        if (productName) {
          requestObject.productName = productName
        }
        if (productDescription) {
          requestObject.productDescription = productDescription
        }
      }

      // Add the request object as JSON string
      formData.append("request", JSON.stringify(requestObject))

      const response = await fetch("http://localhost:8000/products/generation", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as GeneratedProduct
      console.log("Response received:", data)

      let enhancedData = { ...data }
      if (data.image) {
        const { extension } = getMimeTypeAndExtension(data.image)
        enhancedData = { ...data, imageExtension: extension }
      }

      setGeneratedProduct(enhancedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      console.log("Error during submission:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setRequestType("product_description")
    setSelectedFile(null)
    setImagePreview(null)
    setProductName("")
    setProductDescription("")
    setError(null)
    setGeneratedProduct(null)
  }

  const handleUseGeneratedProduct = () => {
    if (generatedProduct && onProductGenerated) {
      onProductGenerated(generatedProduct)
      handleReset()
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="text-2xl">Gestión de Catálogo</CardTitle>
          <CardDescription>Selecciona el tipo de solicitud que deseas enviar</CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select de tipo de solicitud */}
            <div className="space-y-3">
              <label htmlFor="request-type" className="block text-sm font-semibold text-foreground">
                Tipo de Solicitud
              </label>
              <select
                id="request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as RequestType)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="product_description">Descripción de Producto</option>
                <option value="image">Imagen</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                {requestType === "image"
                  ? "Solicita imágenes para tus productos"
                  : "Solicita descripciones detalladas de productos"}
              </p>
            </div>

            {requestType === "image" && (
              <div className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
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
              </div>
            )}

            {requestType === "product_description" && (
              <div className="space-y-4 p-4 bg-secondary rounded-lg border border-border">
                <div className="space-y-2">
                  <label htmlFor="image-upload" className="block text-sm font-semibold text-foreground">
                    Cargar Imagen
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Formatos soportados: JPG, PNG, GIF, WebP</p>
                </div>

                {imagePreview && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Vista Previa</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa de la imagen"
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile?.name} ({(selectedFile?.size ? selectedFile.size / 1024 : 0).toFixed(2)} KB)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error message display */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  (requestType === "product_description" && !selectedFile) ||
                  (requestType === "image" && !productName && !productDescription)
                }
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
              >
                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
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

          {generatedProduct && (
            <div className="mt-8 p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-4">
              <h3 className="font-semibold text-foreground">Producto Generado</h3>

              {generatedProduct.requestType === "image" && generatedProduct.image && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Imagen Generada</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center">
                    <img
                      src={generatedProduct.image || "/placeholder.svg"}
                      alt="Imagen generada"
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}

              {generatedProduct.requestType === "product_description" && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Nombre del Producto</p>
                    <p className="text-foreground font-semibold">{generatedProduct.productName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                    <p className="text-foreground text-sm">{generatedProduct.productDescription}</p>
                  </div>
                </>
              )}

              <Button
                onClick={handleUseGeneratedProduct}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
              >
                Usar en Registro de Producto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
