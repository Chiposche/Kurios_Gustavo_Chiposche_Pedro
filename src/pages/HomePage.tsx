import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Shield, Palette, TrendingUp, Wallet, Search, ShoppingCart, ArrowRight } from 'lucide-react'
import { nftsApi } from '../api/endpoints/nfts'
import type { NFTFilters } from '../api/types/nft.types'

// Categorias usadas como atalhos de filtro (levam ao marketplace com URL)
const HOME_CATEGORIES = ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Colecionáveis']

const HOME_SORT_OPTIONS: { value: NFTFilters['sort']; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'name', label: 'Nome A-Z' },
]

// Seção de catálogo da Home
function CatalogSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['nfts', { perPage: 8, sort: 'recent' }],
    queryFn: () => nftsApi.list({ perPage: 8, sort: 'recent' }),
  })
  const nfts = data?.data ?? []

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const search = query.trim()
    navigate({ to: '/marketplace', search: search ? { search } : {} })
  }

  return (
    <section className="px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho + ordenação */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="font-mono text-2xl font-bold text-white">Destaques do catálogo</h2>
            <p className="text-[#A78B6E] text-sm">
              Busque, filtre e abra qualquer NFT direto daqui.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#A78B6E]">
            Ordenar:
            <select
              aria-label="Ordenar catálogo"
              onChange={(e) =>
                navigate({
                  to: '/marketplace',
                  search:
                    e.target.value !== 'recent'
                      ? { sort: e.target.value as NFTFilters['sort'] }
                      : {},
                })
              }
              className="bg-[#2A1F1A] border border-[#3A2A20] rounded px-3 py-1.5 text-[#C4956A] text-sm focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
            >
              {HOME_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Busca */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4 max-w-md">
          <input
            type="text"
            placeholder="Buscar NFTs..."
            aria-label="Buscar NFTs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-[#2A1F1A] border border-[#3A2A20] rounded-full px-4 py-2.5 text-white text-sm placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
          />
          <button
            type="submit"
            className="shrink-0 bg-[#D4944C] text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#E0A55D] transition-colors"
          >
            Buscar
          </button>
        </form>

        {/* Atalhos de categoria (filtro) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {HOME_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => navigate({ to: '/marketplace', search: { category } })}
              className="border border-[#3A2A20] text-[#C4956A] text-sm px-3 py-1.5 rounded-full hover:border-[#D4944C] hover:text-[#D4944C] transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grade de destaques */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer rounded-xl h-64" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-[#C4956A] mb-3">Erro ao carregar os destaques.</p>
            <button onClick={() => refetch()} className="text-[#D4944C] underline">
              Tentar novamente
            </button>
          </div>
        ) : nfts.length === 0 ? (
          <p className="text-center text-[#C4956A] py-10">Nenhum NFT encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {nfts.map((nft, index) => (
              <Link
                key={nft.id}
                to="/nft/$nftId"
                params={{ nftId: nft.id }}
                className="group animate-card-in bg-[#2A1F1A] rounded-xl overflow-hidden hover:ring-1 hover:ring-[#D4944C] hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/40 transition-all"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/400x400/2A1F1A/D4944C?text=${encodeURIComponent(nft.name.slice(0, 10))}`
                    }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium truncate">{nft.name}</h3>
                  <span className="text-[#D4944C] font-mono text-sm group-hover:text-[#E0A55D] transition-colors">
                    {nft.price} ETH
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-[#D4944C] text-sm font-bold border border-[#D4944C] px-4 py-2 rounded hover:bg-[#D4944C] hover:text-black transition-colors"
          >
            Ver catálogo completo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Página Inicial - landing page educativa sobre NFTs e a plataforma Kurio
export function HomePage() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="px-4 md:px-8 py-8 md:py-16">
        <div className="max-w-6xl mx-auto flex flex-row items-center gap-4 md:gap-8">
          <div className="flex-1 min-w-0">
            <p className="text-[#C4956A] text-xs sm:text-sm mb-2">Bem-vindo à Kurio</p>
            <h1 className="font-mono text-xl sm:text-3xl md:text-5xl font-bold text-white leading-tight mb-3 md:mb-4">
              SEJA DONO DA CULTURA DIGITAL
            </h1>
            <p className="text-[#A78B6E] text-xs sm:text-sm md:text-base mb-4 md:mb-6 max-w-md">
              Descubra NFTs selecionados de criadores do mundo todo.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 border border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded font-mono text-xs sm:text-sm hover:bg-white hover:text-black transition-colors"
            >
              EXPLORAR <ArrowRight size={14} />
            </Link>
          </div>
          <div className="shrink-0">
            <img
              src="/assets/nfts/emerald-ape.svg"
              alt="NFT em destaque - Emerald Ape"
              className="w-28 sm:w-48 md:w-80 rounded-2xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/2A1F1A/D4944C?text=NFT'
              }}
            />
          </div>
        </div>
      </section>

      {/* Catálogo de destaques com busca, filtros e ordenação */}
      <CatalogSection />

      {/* O que são NFTs */}
      <section className="px-4 md:px-8 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mono text-2xl md:text-3xl font-bold text-white mb-3">O que são NFTs?</h2>
            <p className="text-[#A78B6E] max-w-2xl mx-auto">
              NFTs (Non-Fungible Tokens) são certificados digitais únicos registrados na blockchain.
              Eles provam que você é o dono de um item digital — seja uma arte, música, vídeo ou colecionável.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2A1F1A] rounded-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#3A2A20] flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-[#D4944C]" />
              </div>
              <h3 className="text-white font-bold mb-2">Propriedade Digital</h3>
              <p className="text-[#A78B6E] text-sm">
                Cada NFT é registrado na blockchain, garantindo que a propriedade é verificável,
                transparente e impossível de falsificar.
              </p>
            </div>

            <div className="bg-[#2A1F1A] rounded-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#3A2A20] flex items-center justify-center mx-auto mb-4">
                <Palette size={28} className="text-[#D4944C]" />
              </div>
              <h3 className="text-white font-bold mb-2">Arte Única</h3>
              <p className="text-[#A78B6E] text-sm">
                Diferente de cópias digitais comuns, cada NFT é único ou de edição limitada.
                Você coleciona obras exclusivas de artistas do mundo todo.
              </p>
            </div>

            <div className="bg-[#2A1F1A] rounded-xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#3A2A20] flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={28} className="text-[#D4944C]" />
              </div>
              <h3 className="text-white font-bold mb-2">Valor Real</h3>
              <p className="text-[#A78B6E] text-sm">
                NFTs podem se valorizar com o tempo. Ao colecionar, você apoia artistas
                diretamente e participa de uma economia criativa descentralizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona a Kurio */}
      <section className="px-4 md:px-8 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mono text-2xl md:text-3xl font-bold text-white mb-3">Como funciona</h2>
            <p className="text-[#A78B6E]">Comece a colecionar NFTs em 3 passos simples.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#D4944C] flex items-center justify-center mx-auto mb-4">
                <Wallet size={28} className="text-[#D4944C]" />
              </div>
              <div className="text-[#D4944C] font-mono text-sm mb-2">Passo 1</div>
              <h3 className="text-white font-bold mb-2">Crie sua carteira</h3>
              <p className="text-[#A78B6E] text-sm">
                Conecte uma carteira digital como MetaMask ou WalletConnect para começar a explorar o marketplace.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#D4944C] flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-[#D4944C]" />
              </div>
              <div className="text-[#D4944C] font-mono text-sm mb-2">Passo 2</div>
              <h3 className="text-white font-bold mb-2">Explore a coleção</h3>
              <p className="text-[#A78B6E] text-sm">
                Navegue por categorias, filtre por preço e rede, e descubra NFTs de artistas emergentes e consagrados.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#D4944C] flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={28} className="text-[#D4944C]" />
              </div>
              <div className="text-[#D4944C] font-mono text-sm mb-2">Passo 3</div>
              <h3 className="text-white font-bold mb-2">Colecione NFTs</h3>
              <p className="text-[#A78B6E] text-sm">
                Adicione ao carrinho, finalize a compra e os NFTs são transferidos diretamente para sua carteira.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 bg-[#D4944C] text-black px-8 py-3 rounded font-bold hover:bg-[#E0A55D] transition-colors"
            >
              Explorar Marketplace <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Banners promocionais */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#2A1F1A] rounded-xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img
                src="/assets/nfts/emerald-ape.svg"
                alt="Lançamentos gênesis"
                className="w-full h-48 md:h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/2A1F1A/D4944C?text=NFT'
                }}
              />
            </div>
            <div className="p-6 flex flex-col justify-center md:w-1/2">
              <h3 className="text-white font-bold mb-2">
                Lançamentos gênesis de edição limitada
              </h3>
              <p className="text-[#A78B6E] text-sm mb-4">
                Colecione edições escassas diretamente dos criadores antes da revelação pública.
              </p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1 text-[#D4944C] text-sm font-bold border border-[#D4944C] px-4 py-2 rounded w-fit hover:bg-[#D4944C] hover:text-black transition-colors"
              >
                Explorar <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-[#2A1F1A] rounded-xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img
                src="/assets/nfts/sage-nomad.svg"
                alt="Arte digital selecionada"
                className="w-full h-48 md:h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/2A1F1A/D4944C?text=NFT'
                }}
              />
            </div>
            <div className="p-6 flex flex-col justify-center md:w-1/2">
              <h3 className="text-white font-bold mb-2">
                Arte digital selecionada e muito mais
              </h3>
              <p className="text-[#A78B6E] text-sm mb-4">
                Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.
              </p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1 text-[#D4944C] text-sm font-bold border border-[#D4944C] px-4 py-2 rounded w-fit hover:bg-[#D4944C] hover:text-black transition-colors"
              >
                Explorar <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Diário da Cunhagem (blog) */}
      <section className="px-4 md:px-8 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-mono text-2xl font-bold text-white">Diário da Cunhagem</h2>
            <p className="text-[#A78B6E] text-sm mt-2">
              Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article className="bg-[#2A1F1A] rounded-xl overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img
                  src="/assets/nfts/emerald-ape.svg"
                  alt="Como funciona a propriedade de NFTs"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x170/2A1F1A/D4944C?text=Blog'
                  }}
                />
              </div>
              <div className="p-4">
                <p className="text-[#A78B6E] text-xs mb-2">12 de setembro | Leitura de 6 min</p>
                <h3 className="text-white text-sm font-bold mb-1">
                  Como funciona a propriedade de NFTs
                </h3>
                <p className="text-[#A78B6E] text-xs mb-3">
                  Aprenda a colecionar, negociar e verificar ativos digitais.
                </p>
                <span className="text-[#D4944C] text-xs">Ler mais →</span>
              </div>
            </article>

            <article className="bg-[#2A1F1A] rounded-xl overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img
                  src="/assets/nfts/sage-nomad.svg"
                  alt="10 artistas digitais para acompanhar"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x170/2A1F1A/D4944C?text=Blog'
                  }}
                />
              </div>
              <div className="p-4">
                <p className="text-[#A78B6E] text-xs mb-2">15 de outubro | Leitura de 2 min</p>
                <h3 className="text-white text-sm font-bold mb-1">
                  10 artistas digitais para acompanhar
                </h3>
                <p className="text-[#A78B6E] text-xs mb-3">
                  Conheça criadores que moldam a cultura digital.
                </p>
                <span className="text-[#D4944C] text-xs">Ler mais →</span>
              </div>
            </article>

            <article className="bg-[#2A1F1A] rounded-xl overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img
                  src="/assets/nfts/neon-vessel.svg"
                  alt="Raridade, atributos e procedência"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x170/2A1F1A/D4944C?text=Blog'
                  }}
                />
              </div>
              <div className="p-4">
                <p className="text-[#A78B6E] text-xs mb-2">16 de outubro | Leitura de 3 min</p>
                <h3 className="text-white text-sm font-bold mb-1">
                  Raridade, atributos e procedência
                </h3>
                <p className="text-[#A78B6E] text-xs mb-3">
                  Entenda raridade, procedência, direitos autorais e utilidade.
                </p>
                <span className="text-[#D4944C] text-xs">Ler mais →</span>
              </div>
            </article>

            <article className="bg-[#2A1F1A] rounded-xl overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img
                  src="/assets/nfts/ivory-baron.svg"
                  alt="Como proteger sua carteira"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x170/2A1F1A/D4944C?text=Blog'
                  }}
                />
              </div>
              <div className="p-4">
                <p className="text-[#A78B6E] text-xs mb-2">15 de setembro | Leitura de 2 min</p>
                <h3 className="text-white text-sm font-bold mb-1">
                  Como proteger sua carteira
                </h3>
                <p className="text-[#A78B6E] text-xs mb-3">
                  Proteja sua carteira, seus ativos e sua identidade.
                </p>
                <span className="text-[#D4944C] text-xs">Ler mais →</span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
