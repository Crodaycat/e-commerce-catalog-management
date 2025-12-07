export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">◆</span>
          </div>
          <span className="text-2xl font-bold text-foreground">Store</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <a href="/" className="text-muted-foreground hover:text-foreground transition">
            Inicio
          </a>
          <a href="/catalog-management" className="text-muted-foreground hover:text-foreground transition">
            Gestión de Catálogo
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header
