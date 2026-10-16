import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  getNetworkMode,
  setNetworkMode,
  NETWORK_MODE_EVENT,
  type NetworkMode,
} from '../../lib/network'
import { mswEnabled } from '../../lib/msw'

async function resetScenario() {
  setNetworkMode('normal')
  await fetch('/api/__reset', { method: 'POST' })
  window.location.reload()
}

// Footer do site - informações de contato e créditos
export function Footer() {
  // Seletor de modo de rede pra testes
  const [networkMode, setNetworkModeState] = useState<NetworkMode>(getNetworkMode)

  // Sincroniza quando o Layout normaliza a rede
  useEffect(() => {
    const sync = () => setNetworkModeState(getNetworkMode())
    window.addEventListener(NETWORK_MODE_EVENT, sync)
    return () => window.removeEventListener(NETWORK_MODE_EVENT, sync)
  }, [])

  const handleNetworkChange = (mode: NetworkMode) => {
    setNetworkMode(mode)
    setNetworkModeState(mode)
  }

  return (
    <footer className="bg-[#1A1412] border-t border-[#3A2A20] pb-20 md:pb-0">
      {/* Seção de features */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4944C] flex items-center justify-center text-[#D4944C] font-mono text-lg mb-3">
            W
          </div>
          <h3 className="text-white font-bold mb-2">Segurança da carteira</h3>
          <p className="text-[#A78B6E] text-sm">
            Proteja sua carteira e colecione arte digital verificada com confiança.
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4944C] flex items-center justify-center text-[#D4944C] font-mono text-lg mb-3">
            C
          </div>
          <h3 className="text-white font-bold mb-2">Criadores em destaque</h3>
          <p className="text-[#A78B6E] text-sm">
            Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4944C] flex items-center justify-center text-[#D4944C] font-mono text-lg mb-3">
            D
          </div>
          <h3 className="text-white font-bold mb-2">Alertas de lançamentos</h3>
          <p className="text-[#A78B6E] text-sm">
            Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">Antecipe-se ao próximo lançamento</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              placeholder="digite seu e-mail..."
              className="min-w-0 flex-1 bg-[#2A1F1A] border border-[#3A2A20] rounded px-3 py-2 text-white text-sm placeholder-[#A78B6E] focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
            />
            <button className="shrink-0 bg-[#D4944C] text-black px-4 py-2 rounded text-sm font-medium hover:bg-[#E0A55D] transition-colors">
              Enviar
            </button>
          </div>
          <p className="text-[#A78B6E] text-xs">
            Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </div>
      </div>

      {/* Barra de info */}
      <div className="border-t border-[#3A2A20] px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
          <span className="text-white font-mono font-bold">KURIO</span>
          <span className="text-[#A78B6E]">Feito para colecionadores, criadores e cultura</span>
          <span className="text-[#A78B6E]">contato@email.com</span>
          <span className="text-[#A78B6E]">+55 11 4002 8922</span>
        </div>
      </div>

      {/* Links do footer */}
      <div className="border-t border-[#3A2A20] px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h4 className="text-white font-bold mb-3">Meu perfil</h4>
            <ul className="space-y-2 text-[#A78B6E] text-sm">
              <li><Link to="/profile" className="hover:text-[#C4956A]">Meu perfil</Link></li>
              <li><Link to="/favorites" className="hover:text-[#C4956A]">Minha coleção</Link></li>
              <li><span className="cursor-default">Atividade</span></li>
              <li><span className="cursor-default">Estúdio do criador</span></li>
              <li><span className="cursor-default">Lista de interesse</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Central de ajuda</h4>
            <ul className="space-y-2 text-[#A78B6E] text-sm">
              <li><span className="cursor-default">Central de ajuda</span></li>
              <li><span className="cursor-default">Como comprar NFTs</span></li>
              <li><span className="cursor-default">Carteira e segurança</span></li>
              <li><span className="cursor-default">Política do mercado</span></li>
              <li><span className="cursor-default">Denunciar item</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Coleções</h4>
            <ul className="space-y-2 text-[#A78B6E] text-sm">
              <li><span className="cursor-default">Arte digital</span></li>
              <li><span className="cursor-default">Fotografia</span></li>
              <li><span className="cursor-default">Música</span></li>
              <li><span className="cursor-default">Arte 3D</span></li>
              <li><span className="cursor-default">Utilidade</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Redes sociais</h4>
            <div className="flex gap-3 mb-4">
              {['f', 'ig', 'tw', 'in', 'yt'].map((icon) => (
                <span
                  key={icon}
                  className="w-8 h-8 rounded-full border border-[#3A2A20] flex items-center justify-center text-[#A78B6E] text-xs cursor-default"
                >
                  {icon}
                </span>
              ))}
            </div>
            <h4 className="text-white font-bold mb-2">Carteiras compatíveis</h4>
            <div className="flex flex-wrap gap-2">
              <span className="text-[#D4944C] text-xs bg-[#2A1F1A] px-2 py-1 rounded">METAMASK</span>
              <span className="text-[#D4944C] text-xs bg-[#2A1F1A] px-2 py-1 rounded">WALLETCONNECT</span>
              <span className="text-[#D4944C] text-xs bg-[#2A1F1A] px-2 py-1 rounded">COINBASE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright e crédito do desenvolvedor */}
      <div className="border-t border-[#3A2A20] px-4 py-4 text-center">
        <p className="text-[#A78B6E] text-sm">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
        <p className="text-[#C4956A] text-sm mt-1">
          Desenvolvido por Gustavo Chiposche Pedro
        </p>
        {mswEnabled && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <label htmlFor="network-mode" className="text-[#A78B6E]">
              Simular rede:
            </label>
            <select
              id="network-mode"
              value={networkMode}
              onChange={(e) => handleNetworkChange(e.target.value as NetworkMode)}
              className="bg-[#2A1F1A] border border-[#3A2A20] rounded px-2 py-1 text-[#C4956A] focus:outline-none focus:border-[#D4944C] focus-visible:ring-2 focus-visible:ring-[#D4944C]"
            >
              <option value="normal">Normal</option>
              <option value="slow">Lenta (3s)</option>
              <option value="error">Erro 500</option>
              <option value="offline">Sem conexão</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>
        )}
        {mswEnabled && (
          <button
            onClick={resetScenario}
            className="mt-3 text-[#A78B6E] text-xs underline hover:text-[#C4956A] transition-colors"
          >
            Resetar cenário de teste
          </button>
        )}
      </div>
    </footer>
  )
}
