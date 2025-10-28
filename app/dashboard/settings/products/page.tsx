'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductAttributesSettings } from '@/components/product-attributes-settings'
import { ProductColumnsSettings } from '@/components/product-columns-settings'

export default function ProductsSettingsPage() {
  const [activeTab, setActiveTab] = useState('columns')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Produtos</h1>
        <p className="text-gray-500 mt-2">
          Customize colunas, atributos e propriedades dos seus produtos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="columns">Colunas da Tabela</TabsTrigger>
          <TabsTrigger value="attributes">Atributos & Variações</TabsTrigger>
        </TabsList>

        <TabsContent value="columns" className="space-y-6">
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <ProductColumnsSettings />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">Sobre Colunas</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1">
              <li>• Personalize quais colunas aparecem na tabela de produtos</li>
              <li>• Use o ícone de olho para mostrar/ocultar colunas</li>
              <li>• Defina o tipo de campo para formatação correta (moeda, número, data, etc.)</li>
              <li>• Configure se a coluna é editável ou apenas visualização</li>
              <li>• As primeiras 7 colunas aparecem por padrão na tabela</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-6">
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <ProductAttributesSettings />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">Sobre Atributos</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1">
              <li>• Configure atributos personalizados para seus produtos</li>
              <li>• Marque como &quot;Variação&quot; para atributos como Tamanho, Cor, etc.</li>
              <li>• Marque como &quot;Obrigatório&quot; para exigir preenchimento</li>
              <li>• Defina opções predefinidas para seleção rápida (ex: P, M, G para tamanho)</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
