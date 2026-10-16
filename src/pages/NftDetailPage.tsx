import { useState } from 'react'
import { useParams, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nftsApi } from '../api/endpoints/nfts'
import { cartApi } from '../api/endpoints/cart'
import { favoritesApi } from '../api/endpoints/favorites'
import { useAuth } from '../hooks/useAuth'
import { Heart, Minus, Plus, ChevronLeft, ShoppingCart, Mail, Share2, Link2 } from 'lucide-react'
import { Skeleton } from '../components/ui/skeleton'

// Página de detalhes do NFT
export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const [selectedEdition, setSelectedEdition] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['nft', nftId],
    queryFn: () => nftsApi.getById(nftId),
  })

  const nft = data?.data

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.list,
    enabled: isAuthenticated,
  })

  const isNftFavorite = favoritesData?.data?.includes(nftId) ?? false

  const addToCartMutation = useMutation({
    mutationFn: (data: { nftId: string; editionId: string; quantity: number }) =>
      cartApi.addItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      alert('NFT adicionado ao carrinho!')
    },
    onError: () => {
      alert('Erro ao adicionar ao carrinho. Faça login primeiro.')
    },
  })

  // Favoritar com atualização otimista
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ nftId, isFavorite }: { nftId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return favoritesApi.remove(nftId)
      }
      return favoritesApi.add(nftId)
    },
    onMutate: async ({ nftId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const previousFavorites = queryClient.getQueryData<{ data: string[] }>(['favorites'])
      queryClient.setQueryData<{ data: string[] }>(['favorites'], (old) => {
        if (!old) return { data: isFavorite ? [] : [nftId] }
        const newData = isFavorite
          ? old.data.filter((id) => id !== nftId)
          : [...old.data, nftId]
        return { data: newData }
      })

      return { previousFavorites }
    },
    // Rollback se der erro
    onError: (_err, _vars, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites)
      }
      alert('Erro ao atualizar favorito.')
    },
    // Revalida com o servidor depois
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    if (!selectedEdition) {
      alert('Selecione uma edição')
      return
    }
    addToCartMutation.mutate({ nftId, editionId: selectedEdition, quantity })
  }

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }
    toggleFavoriteMutation.mutate({ nftId, isFavorite: isNftFavorite })
  }

  if (nft && !selectedEdition && nft.editions.length > 0) {
    const available = nft.editions.find((e) => e.available > 0)
    if (available) setSelectedEdition(available.id)
  }

  const currentEdition = nft?.editions.find((e) => e.id === selectedEdition)
  const maxQty = currentEdition ? (currentEdition.type === 'open' ? 99 : currentEdition.available) : 1

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-1/2 aspect-square rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !nft) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-mono text-white mb-4">NFT não encontrado</h1>
        <p className="text-[#A78B6E] mb-6">O NFT que você procura não existe ou foi removido.</p>
        <Link to="/" className="text-[#D4944C] hover:underline">Voltar ao catálogo</Link>
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-0">
      {/* Breadcrumb - só no desktop */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-[#A78B6E]">
          <Link to="/" className="hover:text-[#C4956A]">Início</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-[#C4956A]">Mercado</Link>
          <span>/</span>
          <span className="text-white">{nft.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Imagem do NFT */}
          <div className="w-full md:w-1/2">
            {/* Header mobile: voltar + favoritar */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <button
                onClick={() => navigate({ to: '/marketplace' })}
                className="text-[#C4956A] flex items-center gap-1"
                aria-label="Voltar ao catálogo"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleToggleFavorite}
                className="p-2"
                aria-label={isNftFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart
                  size={22}
                  className={isNftFavorite ? 'fill-[#D4944C] text-[#D4944C]' : 'text-[#A78B6E]'}
                />
              </button>
            </div>

            {/* Desktop: thumbnails + imagem principal */}
            <div className="hidden md:flex gap-3">
              <div className="flex flex-col gap-2 shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={nft.image}
                    alt={`${nft.name} miniatura ${i + 1}`}
                    className={`w-16 h-16 rounded-lg object-cover cursor-pointer border-2 transition-opacity ${
                      i === 0 ? 'border-[#D4944C]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/64x64/2A1F1A/D4944C?text=NFT`
                    }}
                  />
                ))}
              </div>
              <div className="flex-1">
                <img
                  src={nft.image}
                  alt={nft.name}
                  width={600}
                  height={600}
                  className="w-full rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/600x600/2A1F1A/D4944C?text=${encodeURIComponent(nft.name)}`
                  }}
                />
              </div>
            </div>

            {/* Mobile: só a imagem grande */}
            <div className="md:hidden">
              <img
                src={nft.image}
                alt={nft.name}
                width={600}
                height={600}
                className="w-full rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x600/2A1F1A/D4944C?text=${encodeURIComponent(nft.name)}`
                }}
              />
            </div>
          </div>

          {/* Informações do NFT */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{nft.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[#D4944C] font-mono text-xl">{nft.price} ETH</span>
              <span className="text-[#A78B6E] text-sm">
                ★ {nft.rating} ({nft.reviewCount} avaliações)
              </span>
            </div>

            {/* Descrição */}
            <div className="mb-6">
              <h2 className="text-[#C4956A] text-sm font-bold mb-2">Sobre este NFT:</h2>
              <p className="text-[#A78B6E] text-sm leading-relaxed">{nft.description}</p>
            </div>

            {/* Edições */}
            <div className="mb-6">
              <h2 className="text-[#C4956A] text-sm font-bold mb-3">Edição:</h2>
              <div className="flex flex-wrap gap-2">
                {nft.editions.map((edition) => (
                  <button
                    key={edition.id}
                    onClick={() => {
                      if (edition.available > 0) {
                        setSelectedEdition(edition.id)
                        setQuantity(1)
                      }
                    }}
                    disabled={edition.available === 0}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      selectedEdition === edition.id
                        ? 'bg-[#D4944C] text-black border-[#D4944C] font-bold'
                        : edition.available === 0
                          ? 'border-[#3A2A20] text-[#A78B6E] cursor-not-allowed opacity-50'
                          : 'border-[#3A2A20] text-[#C4956A] hover:border-[#D4944C]'
                    }`}
                  >
                    {edition.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade - escondido no mobile (tem bottom bar) */}
            <div className="hidden md:flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3 bg-[#2A1F1A] rounded-lg px-3 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#D4944C] hover:text-white transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={18} />
                </button>
                <span className="text-white font-mono w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  className="text-[#D4944C] hover:text-white transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Botões de ação - escondido no mobile (tem bottom bar) */}
            <div className="hidden md:flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex-1 bg-[#D4944C] text-black py-3 rounded font-bold hover:bg-[#E0A55D] transition-colors disabled:opacity-50"
              >
                {addToCartMutation.isPending ? 'Adicionando...' : 'COMPRAR'}
              </button>
              <button
                onClick={handleToggleFavorite}
                className="hidden md:flex items-center gap-2 border border-[#3A2A20] text-[#C4956A] px-4 py-3 rounded hover:border-[#D4944C] transition-colors"
                aria-label={isNftFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart
                  size={18}
                  className={isNftFavorite ? 'fill-[#D4944C] text-[#D4944C]' : ''}
                />
                Favoritar
              </button>
            </div>

            {/* Detalhes extras */}
            <div className="space-y-2 text-sm">
              <p className="text-[#A78B6E]">
                <span className="text-[#C4956A]">ID do token:</span> {nft.tokenId}
              </p>
              <p className="text-[#A78B6E]">
                <span className="text-[#C4956A]">Coleção:</span> {nft.collection}
              </p>
              <p className="text-[#A78B6E]">
                <span className="text-[#C4956A]">Atributos:</span> {nft.attributes.join(', ')}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[#C4956A] font-bold">Compartilhar este NFT:</span>
                <a href="#" className="text-[#A78B6E] hover:text-[#D4944C]" aria-label="Compartilhar link" onClick={(e) => e.preventDefault()}>
                  <Link2 size={16} />
                </a>
                <a href="#" className="text-[#A78B6E] hover:text-[#D4944C]" aria-label="Enviar por email" onClick={(e) => e.preventDefault()}>
                  <Mail size={16} />
                </a>
                <a href="#" className="text-[#A78B6E] hover:text-[#D4944C]" aria-label="Compartilhar" onClick={(e) => e.preventDefault()}>
                  <Share2 size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de detalhes */}
        <div className="mt-12">
          <div className="flex gap-6 border-b border-[#3A2A20] mb-6">
            <button className="text-white pb-3 border-b-2 border-[#D4944C] text-sm">
              Detalhes do NFT
            </button>
            <button className="text-[#A78B6E] pb-3 border-b-2 border-transparent text-sm">
              Avaliações ({nft.reviewCount})
            </button>
          </div>
          <div className="text-[#A78B6E] text-sm leading-relaxed space-y-4">
            <p>{nft.description}</p>
            <p><strong className="text-[#C4956A]">Rede:</strong> Cunhado na {nft.network.charAt(0).toUpperCase() + nft.network.slice(1)} com procedência imutável e metadados armazenados no IPFS.</p>
            <p><strong className="text-[#C4956A]">Contrato:</strong> Direitos autorais do criador: {nft.creatorRoyalty} nas vendas secundárias.</p>
            <p><strong className="text-[#C4956A]">Direitos autorais:</strong> {nft.contractAddress} · Contrato inteligente ERC-721 verificado.</p>
          </div>
        </div>

        {/* Mais desta coleção */}
        <div className="mt-12">
          <h2 className="text-[#D4944C] font-bold mb-6 border-b border-[#3A2A20] pb-3">
            Mais desta coleção
          </h2>
          <MoreFromCollection currentNftId={nftId} />
        </div>
      </div>

      {/* Bottom bar mobile */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 bg-[#2A1F1A] border-t border-[#3A2A20] px-4 py-3 z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#A78B6E] text-sm">Qtd.</span>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#D4944C] bg-[#1A1412] rounded-full p-1.5" aria-label="Diminuir quantidade">
              <Minus size={14} />
            </button>
            <span className="text-white font-mono w-6 text-center">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))} className="text-[#D4944C] bg-[#1A1412] rounded-full p-1.5" aria-label="Aumentar quantidade">
              <Plus size={14} />
            </button>
          </div>
          <span className="text-[#D4944C] font-mono font-bold text-lg">{nft.price} ETH</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="flex-1 bg-[#D4944C] text-black py-3 rounded-lg font-bold text-sm"
          >
            Comprar NFT
          </button>
          <button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="bg-[#3A2A20] text-[#D4944C] p-3 rounded-lg"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente que mostra outros NFTs da mesma coleção
function MoreFromCollection({ currentNftId }: { currentNftId: string }) {
  const { data } = useQuery({
    queryKey: ['nfts', { perPage: 5 }],
    queryFn: () => nftsApi.list({ perPage: 5 }),
  })

  const nfts = data?.data?.filter((n) => n.id !== currentNftId).slice(0, 5) ?? []

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {nfts.map((nft) => (
        <Link
          key={nft.id}
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="group"
        >
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full aspect-square rounded-xl object-cover group-hover:ring-1 group-hover:ring-[#D4944C] transition-all"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/200x200/2A1F1A/D4944C?text=NFT`
            }}
          />
          <h3 className="text-white text-xs mt-2 truncate">{nft.name}</h3>
          <span className="text-[#D4944C] font-mono text-xs">{nft.price} ETH</span>
        </Link>
      ))}
    </div>
  )
}
