"use client"

import { Hammer } from "lucide-react"
import { MobileOptimizedWrapper } from "@/components/mobile/MobileOptimizedComponents"

export function CraftingSystem() {
  const recipes = [
    { name: "Iron Sword", materials: "3x Iron Ore, 1x Wood", canCraft: true },
    { name: "Magic Staff", materials: "2x Gem, 3x Wood, 1x Crystal", canCraft: false },
    { name: "Leather Armor", materials: "5x Leather, 2x Thread", canCraft: true },
  ]

  return (
    <MobileOptimizedWrapper
      title="Crafting"
      preventPullToRefresh={true}
      adjustForKeyboard={false}
    >
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recipes.map((recipe, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border-2 ${
              recipe.canCraft
                ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400"
                : "bg-white/5 border-white/10"
            }`}
          >
            <h3 className="font-bold text-lg mb-2">{recipe.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{recipe.materials}</p>
            <button
              disabled={!recipe.canCraft}
              className={`w-full py-2 rounded-lg font-bold ${
                recipe.canCraft ? "bg-green-500 hover:bg-green-600" : "bg-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              {recipe.canCraft ? "Craft" : "Missing Materials"}
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-2 border-orange-400 text-center">
        <Hammer className="w-12 h-12 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Crafting Workshop</h3>
        <p className="text-gray-300">Combine materials to create powerful items and equipment</p>
      </div>
    </div>
    </MobileOptimizedWrapper>
  )
}
