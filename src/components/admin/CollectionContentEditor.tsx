'use client'

import { useState } from 'react'
import { Plus, Trash2, MoveUp, MoveDown, Type, Image as ImageIcon, Crosshair, ChevronDown, ChevronUp, Shirt } from 'lucide-react'
import Image from 'next/image'
import { CollectionBlock, Product } from '@/types'
import { cn } from '@/lib/utils'

interface CollectionContentEditorProps {
  blocks: CollectionBlock[]
  onChange: (blocks: CollectionBlock[]) => void
  availableProducts: Product[]
}

export function CollectionContentEditor({ blocks, onChange, availableProducts }: CollectionContentEditorProps) {
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null)

  const addBlock = (type: CollectionBlock['type']) => {
    let newBlock: CollectionBlock
    if (type === 'text') {
      newBlock = { type: 'text', content: '' }
    } else if (type === 'image') {
      newBlock = { type: 'image', url: '', alt: '', caption: '' }
    } else {
      newBlock = { type: 'shoppable_image', url: '', markers: [] }
    }
    onChange([...blocks, newBlock])
    setExpandedBlock(blocks.length)
  }

  const removeBlock = (index: number) => {
    const newBlocks = [...blocks]
    newBlocks.splice(index, 1)
    onChange(newBlocks)
    if (expandedBlock === index) setExpandedBlock(null)
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === blocks.length - 1) return
    
    const newBlocks = [...blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    onChange(newBlocks)
    if (expandedBlock === index) setExpandedBlock(targetIndex)
  }

  const updateBlock = (index: number, data: Partial<CollectionBlock>) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], ...data } as CollectionBlock
    onChange(newBlocks)
  }

  const addMarker = (blockIndex: number, x: number, y: number) => {
    const block = blocks[blockIndex]
    if (block.type !== 'shoppable_image') return
    
    const productId = availableProducts[0]?.id || ''
    const newMarkers = [...block.markers, { x, y, productId }]
    updateBlock(blockIndex, { markers: newMarkers })
  }

  const updateMarker = (blockIndex: number, markerIndex: number, data: any) => {
    const block = blocks[blockIndex]
    if (block.type !== 'shoppable_image') return
    
    const newMarkers = [...block.markers]
    newMarkers[markerIndex] = { ...newMarkers[markerIndex], ...data }
    updateBlock(blockIndex, { markers: newMarkers })
  }

  const removeMarker = (blockIndex: number, markerIndex: number) => {
    const block = blocks[blockIndex]
    if (block.type !== 'shoppable_image') return
    
    const newMarkers = [...block.markers]
    newMarkers.splice(markerIndex, 1)
    updateBlock(blockIndex, { markers: newMarkers })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider">Conteúdo da Página (Blog)</h3>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div key={index} className="bg-white border border-brand-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Header do Bloco */}
            <div className="px-4 py-3 bg-brand-50 flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                {block.type === 'text' && <Type className="w-4 h-4 text-brand-600" />}
                {block.type === 'image' && <ImageIcon className="w-4 h-4 text-brand-600" />}
                {block.type === 'shoppable_image' && <Crosshair className="w-4 h-4 text-brand-600" />}
                <span className="text-xs font-bold text-brand-900 uppercase">
                  {block.type === 'text' ? 'Texto' : block.type === 'image' ? 'Imagem' : 'Foto Comprável (Tags)'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveBlock(index, 'up')} className="p-1.5 hover:bg-brand-100 rounded text-brand-500"><MoveUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveBlock(index, 'down')} className="p-1.5 hover:bg-brand-100 rounded text-brand-500"><MoveDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => removeBlock(index)} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                <button type="button" onClick={() => setExpandedBlock(expandedBlock === index ? null : index)} className="p-1.5 hover:bg-brand-100 rounded text-brand-900">
                  {expandedBlock === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Conteúdo do Bloco */}
            {expandedBlock === index && (
              <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {block.type === 'text' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    rows={4}
                    placeholder="Digite o texto aqui..."
                    className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900 text-sm"
                  />
                )}

                {(block.type === 'image' || block.type === 'shoppable_image') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-brand-600 mb-1">URL da Imagem</label>
                        <input
                          type="text"
                          value={block.url}
                          onChange={(e) => updateBlock(index, { url: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-4 py-2 border border-brand-200 rounded-lg text-sm"
                        />
                      </div>
                      
                      {block.type === 'image' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-brand-600 mb-1">Legenda (Opcional)</label>
                            <input
                              type="text"
                              value={block.caption}
                              onChange={(e) => updateBlock(index, { caption: e.target.value })}
                              placeholder="Ex: Detalhe do tecido"
                              className="w-full px-4 py-2 border border-brand-200 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-brand-600 mb-1">Alt Text (Acessibilidade)</label>
                            <input
                              type="text"
                              value={block.alt}
                              onChange={(e) => updateBlock(index, { alt: e.target.value })}
                              placeholder="Ex: Foto de modelo usando vestido azul"
                              className="w-full px-4 py-2 border border-brand-200 rounded-lg text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {block.type === 'shoppable_image' && (
                      <div className="space-y-4">
                        {!block.url ? (
                          <div className="p-8 border-2 border-dashed border-brand-200 rounded-xl text-center bg-brand-50/50">
                            <ImageIcon className="w-8 h-8 mx-auto text-brand-300 mb-2" />
                            <p className="text-sm text-brand-500">Insira a URL da imagem acima para começar a marcar</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="block text-xs font-medium text-brand-600">
                              Clique na imagem para adicionar marcadores ({block.markers.length})
                            </label>
                            <div 
                              className="relative w-full aspect-[4/5] sm:aspect-video bg-brand-100 rounded-xl overflow-hidden cursor-crosshair ring-2 ring-brand-100 shadow-inner group"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const x = ((e.clientX - rect.left) / rect.width) * 100
                                const y = ((e.clientY - rect.top) / rect.height) * 100
                                addMarker(index, x, y)
                              }}
                            >
                              <img 
                                src={block.url} 
                                alt="Tag editor" 
                                className="w-full h-full object-cover pointer-events-none" 
                              />
                              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                              <div className="absolute top-2 left-2 px-2 py-1 bg-brand-900 text-white text-[10px] font-bold rounded shadow-lg uppercase tracking-wider">
                                Editor de Tags Ativado
                              </div>
                              
                              {block.markers.map((marker, mIdx) => (
                                <div 
                                  key={mIdx}
                                  className="absolute w-8 h-8 bg-white border-2 border-brand-900 rounded-full flex items-center justify-center shadow-2xl text-brand-900 z-10 transition-transform hover:scale-125"
                                  style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -50%)' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Podemos adicionar uma opção de remover clicando no marcador futuramente
                                  }}
                                >
                                   <Shirt className="w-4 h-4" />
                                </div>
                              ))}
                            </div>

                            {block.markers.length > 0 && (
                              <div className="bg-brand-50 rounded-xl p-3 border border-brand-100 space-y-2">
                                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Vincular Produtos</p>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                  {block.markers.map((marker, mIdx) => (
                                    <div key={mIdx} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-brand-100 shadow-sm animate-in fade-in slide-in-from-right-2">
                                      <div className="w-6 h-6 bg-brand-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {mIdx + 1}
                                      </div>
                                      <select 
                                        value={marker.productId}
                                        onChange={(e) => updateMarker(index, mIdx, { productId: e.target.value })}
                                        className="flex-1 bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer"
                                      >
                                        <option value="" disabled>Selecione a peça...</option>
                                        {availableProducts.map(p => (
                                          <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                      </select>
                                      <button 
                                        type="button" 
                                        onClick={() => removeMarker(index, mIdx)} 
                                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remover marcador"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botões de Adicionar */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <button type="button" onClick={() => addBlock('text')} className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-brand-200 rounded-2xl hover:border-brand-400 hover:bg-brand-50 transition-all text-brand-600 group">
          <Type className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase">Texto</span>
        </button>
        <button type="button" onClick={() => addBlock('image')} className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-brand-200 rounded-2xl hover:border-brand-400 hover:bg-brand-50 transition-all text-brand-600 group">
          <ImageIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase">Foto</span>
        </button>
        <button type="button" onClick={() => addBlock('shoppable_image')} className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-brand-200 rounded-2xl hover:border-brand-400 hover:bg-brand-50 transition-all text-brand-600 group">
          <Crosshair className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase">Tags</span>
        </button>
      </div>
    </div>
  )
}
