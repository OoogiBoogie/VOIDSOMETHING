"use client"

import { useState } from "react"
import { Plus, Package, DollarSign, TrendingUp, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { Business, SKU, SKUCategory, LicenseType } from "@/lib/land/types"
import { ChromePanel, ChromeButton, ChromeStat } from "../ui/chrome-panel"
import { formatEther, parseEther } from "viem"

interface BusinessManagementPanelProps {
  business: Business
  skus: SKU[]
  onCreateSKU?: (sku: Partial<SKU>) => void
  onUpdateSKU?: (skuId: string, updates: Partial<SKU>) => void
  onToggleSKUStatus?: (skuId: string, isActive: boolean) => void
  onClose?: () => void
}

export function BusinessManagementPanel({ 
  business, 
  skus, 
  onCreateSKU,
  onUpdateSKU,
  onToggleSKUStatus,
  onClose 
}: BusinessManagementPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'create'>('overview')
  const [formData, setFormData] = useState<Partial<SKU>>({
    category: SKUCategory.VIRTUAL_ITEM,
    currency: 'VOID',
    isActive: true,
    isLimitedEdition: false
  })

  const activeSKUs = skus.filter(s => s.isActive)
  const totalRevenue = skus.reduce((sum, sku) => sum + sku.totalRevenue, 0n)
  const totalSales = skus.reduce((sum, sku) => sum + sku.totalSales, 0)

  const handleCreateSKU = () => {
    if (!formData.name || !formData.price || !formData.maxSupply) {
      alert('Please fill in all required fields')
      return
    }
    
    onCreateSKU?.({
      ...formData,
      businessId: business.businessId,
      creatorAddress: business.ownerAddress,
      currentSupply: 0,
      availableStock: formData.maxSupply || 0,
      totalSales: 0,
      totalRevenue: 0n,
      createdAt: new Date()
    })
    
    // Reset form
    setFormData({
      category: SKUCategory.VIRTUAL_ITEM,
      currency: 'VOID',
      isActive: true,
      isLimitedEdition: false
    })
    setActiveTab('products')
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <ChromePanel variant="liquid" glow={true}>
        {/* Header */}
        <div className="mb-6 pb-4 border-b-2 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white font-orbitron mb-1">
                {business.brandName}
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                LICENSE: {business.licenseType} • SECTOR: {business.sector}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-mono mb-1">BUSINESS ID</p>
              <p className="text-sm text-[#00f0ff] font-mono">{business.businessId.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === 'overview' 
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === 'products' 
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            PRODUCTS ({skus.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === 'create' 
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            CREATE SKU
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <ChromeStat 
                label="TOTAL REVENUE" 
                value={`${Number(totalRevenue) / 1e18} ${business.revenueDistribution ? 'ETH' : 'VOID'}`} 
              />
              <ChromeStat label="TOTAL SALES" value={totalSales.toString()} />
              <ChromeStat label="ACTIVE PRODUCTS" value={activeSKUs.length.toString()} />
              <ChromeStat label="TOTAL PRODUCTS" value={skus.length.toString()} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                <p className="text-xs text-gray-400 font-mono mb-2">MONTHLY REVENUE</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {Number(business.monthlyRevenue) / 1e18} ETH
                </p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                <p className="text-xs text-gray-400 font-mono mb-2">CUSTOMER COUNT</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {business.customerCount || 0}
                </p>
              </div>
            </div>

            {business.features && (
              <div className="p-4 bg-blue-500/10 rounded border border-blue-500/30">
                <p className="text-sm text-blue-400 font-mono font-bold mb-3">BUSINESS FEATURES</p>
                <div className="grid grid-cols-2 gap-2">
                  {business.features.hasRetail && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <p className="text-xs text-gray-300 font-mono">RETAIL ENABLED</p>
                    </div>
                  )}
                  {business.features.hasJukebox && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <p className="text-xs text-gray-300 font-mono">JUKEBOX ACTIVE</p>
                    </div>
                  )}
                  {business.features.hasCasino && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <p className="text-xs text-gray-300 font-mono">CASINO ACTIVE</p>
                    </div>
                  )}
                  {business.features.hasTipping && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <p className="text-xs text-gray-300 font-mono">TIPPING ENABLED</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {skus.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-mono mb-6">No products listed yet</p>
                <ChromeButton variant="primary" onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  CREATE FIRST SKU
                </ChromeButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skus.map((sku) => (
                  <div 
                    key={sku.skuId}
                    className={`p-4 rounded-lg border-2 ${
                      sku.isActive 
                        ? 'bg-gray-900/50 border-cyan-500/30' 
                        : 'bg-gray-900/30 border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white font-mono mb-1">
                          {sku.name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2">{sku.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-mono rounded">
                            {sku.category}
                          </span>
                          {sku.isLimitedEdition && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-mono rounded">
                              LIMITED
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleSKUStatus?.(sku.skuId, !sku.isActive)}
                        className="p-2 hover:bg-gray-800 rounded transition-colors"
                      >
                        {sku.isActive ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-500 font-mono">PRICE</p>
                        <p className="text-sm text-white font-mono font-bold">
                          {Number(sku.price) / 1e18} {sku.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-mono">STOCK</p>
                        <p className="text-sm text-white font-mono font-bold">
                          {sku.availableStock}/{sku.maxSupply}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-mono">SALES</p>
                        <p className="text-sm text-white font-mono font-bold">
                          {sku.totalSales}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <ChromeButton variant="ghost" className="flex-1 !py-1">
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </ChromeButton>
                      <ChromeButton variant="ghost" className="!py-1">
                        <Trash2 className="w-3 h-3" />
                      </ChromeButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create SKU Tab */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g., VIP Access Pass"
                />
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as SKUCategory })}
                  className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                >
                  <option value={SKUCategory.VIRTUAL_ITEM}>Virtual Item</option>
                  <option value={SKUCategory.DIGITAL_CONTENT}>Digital Content</option>
                  <option value={SKUCategory.SERVICE}>Service</option>
                  <option value={SKUCategory.COLLECTIBLE}>Collectible</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                rows={3}
                placeholder="Describe your product..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price ? Number(formData.price) / 1e18 : ''}
                  onChange={(e) => setFormData({ ...formData, price: parseEther(e.target.value || '0') })}
                  className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'VOID' | 'ETH' })}
                  className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                >
                  <option value="VOID">VOID</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                  Max Supply *
                </label>
                <input
                  type="number"
                  value={formData.maxSupply || ''}
                  onChange={(e) => setFormData({ ...formData, maxSupply: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-cyan-400 mb-2 uppercase tracking-wider font-mono">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isLimitedEdition || false}
                  onChange={(e) => setFormData({ ...formData, isLimitedEdition: e.target.checked })}
                  className="w-4 h-4 bg-black border-2 border-cyan-500/30 rounded"
                />
                <span className="text-sm text-gray-300 font-mono">Limited Edition</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <ChromeButton variant="primary" onClick={handleCreateSKU} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                CREATE SKU
              </ChromeButton>
              <ChromeButton variant="ghost" onClick={() => setActiveTab('products')}>
                CANCEL
              </ChromeButton>
            </div>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <ChromeButton variant="ghost" onClick={onClose} className="w-full">
              CLOSE PANEL
            </ChromeButton>
          </div>
        )}
      </ChromePanel>
    </div>
  )
}
