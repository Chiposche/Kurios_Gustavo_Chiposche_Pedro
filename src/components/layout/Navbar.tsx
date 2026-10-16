import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Search, ShoppingCart, LogIn, Menu, X, User, Home, Store, Heart } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/queries/useCart'

// Navbar principal do site - desktop e mobile
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated } = useAuth()
  const { data: cart } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/'
  const isMarketplace = location.pathname === '/marketplace'
  const isCreators = location.pathname === '/criadores'
  const isLearn = location.pathname === '/aprenda'

  const cartCount = cart?.data?.itemCount ?? 0

  return (
    <>
      {/* Navbar Desktop */}
      <nav className="hidden md:flex items-center justify-between px-8 py-4 border-b border-[#3A2A20]" aria-label="Navegação principal">
        {/* Logo */}
        <Link to="/" className="text-white font-mono text-xl font-bold tracking-wider">
          KURIO
        </Link>

        {/* Links de navegação */}
        <div className="flex items-center gap-8">
          <Link to="/" className={`hover:text-[#D4944C] transition-colors text-sm ${isHome ? 'text-[#D4944C] font-bold' : 'text-white'}`}>
            Início
          </Link>
          <Link to="/marketplace" className={`hover:text-[#D4944C] transition-colors text-sm ${isMarketplace ? 'text-[#D4944C] font-bold' : 'text-white'}`}>
            Mercado
          </Link>
          <Link to="/criadores" className={`hover:text-[#D4944C] transition-colors text-sm ${isCreators ? 'text-[#D4944C] font-bold' : 'text-white'}`}>
            Criadores
          </Link>
          <Link to="/aprenda" className={`hover:text-[#D4944C] transition-colors text-sm ${isLearn ? 'text-[#D4944C] font-bold' : 'text-white'}`}>
            Aprenda
          </Link>
        </div>

        {/* Ícones da direita */}
        <div className="flex items-center gap-4">
          {/* Botão de busca */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-white hover:text-[#D4944C] transition-colors"
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>

          {/* Favoritos */}
          <Link
            to="/favorites"
            className={`transition-colors ${location.pathname === '/favorites' ? 'text-[#D4944C]' : 'text-white hover:text-[#D4944C]'}`}
            aria-label="Favoritos"
          >
            <Heart size={20} />
          </Link>

          {/* Carrinho com badge */}
          <Link to="/cart" className="relative text-white hover:text-[#D4944C] transition-colors" aria-label="Carrinho">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4944C] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Botão de login ou nome do usuário */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 border border-[#D4944C] text-[#D4944C] px-4 py-1.5 rounded text-sm hover:bg-[#D4944C] hover:text-black transition-colors"
            >
              <User size={16} />
              {user?.displayName?.split(' ')[0]}
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 border border-[#D4944C] text-[#D4944C] px-4 py-1.5 rounded text-sm hover:bg-[#D4944C] hover:text-black transition-colors"
            >
              <LogIn size={16} />
              Entrar
            </Link>
          )}
        </div>
      </nav>

      {/* Barra de busca expandida */}
      {searchOpen && (
        <div className="hidden md:block px-8 py-3 bg-[#2A1F1A] border-b border-[#3A2A20]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // Navega pra busca na URL do marketplace (sem recarregar a página)
              navigate({ to: '/marketplace', search: searchQuery ? { search: searchQuery } : {} })
              setSearchOpen(false)
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Buscar NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#1A1412] border border-[#3A2A20] rounded px-4 py-2 text-white placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#D4944C] text-black px-4 py-2 rounded hover:bg-[#E0A55D] transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* Navbar Mobile - Topo */}
      <nav className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#3A2A20]" aria-label="Navegação mobile">
        <Link to="/" className="text-white font-mono text-lg font-bold">
          KURIO
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative text-white" aria-label="Carrinho">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4944C] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile expandido */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#2A1F1A] border-b border-[#3A2A20] px-4 py-4 space-y-3">
          <Link to="/" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
            Início
          </Link>
          <Link to="/marketplace" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
            Mercado
          </Link>
          <Link to="/criadores" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
            Criadores
          </Link>
          <Link to="/aprenda" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
            Aprenda
          </Link>
          <Link to="/cart" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
            Carrinho
          </Link>
          <Link to="/favorites" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
            Favoritos
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Meu Perfil
              </Link>
              <Link to="/wallets" className="block text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                Carteiras
              </Link>
            </>
          ) : (
            <Link to="/login" className="block text-[#D4944C] py-2" onClick={() => setMobileMenuOpen(false)}>
              Entrar
            </Link>
          )}
        </div>
      )}

      {/* Bottom Tab Bar Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1412] border-t border-[#3A2A20] flex items-center justify-around py-3 z-50">
        <Link to="/" className={`p-2 ${isHome ? 'text-[#D4944C]' : 'text-[#A78B6E]'}`} aria-label="Início">
          <Home size={22} />
        </Link>
        <Link
          to="/favorites"
          className={`p-2 ${location.pathname === '/favorites' ? 'text-[#D4944C]' : 'text-[#A78B6E]'}`}
          aria-label="Favoritos"
        >
          <Heart size={22} />
        </Link>
        <Link to="/cart" className="relative -mt-6" aria-label="Carrinho">
          <div className="bg-[#D4944C] rounded-full p-4 border-4 border-[#1A1412]">
            <ShoppingCart size={22} className="text-black" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </div>
        </Link>
        <Link to="/marketplace" className={`p-2 ${isMarketplace ? 'text-[#D4944C]' : 'text-[#A78B6E]'}`} aria-label="Mercado">
          <Store size={22} />
        </Link>
        <Link to={isAuthenticated ? '/profile' : '/login'} className="p-2 text-[#A78B6E]" aria-label="Perfil">
          <User size={22} />
        </Link>
      </div>
    </>
  )
}
