'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface AchatsStepProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

const CATEGORIES_ACHATS = [
  {
    category: 'Matières premières',
    items: [
      { value: 'acier', label: 'Acier', factor: '2.29 kgCO₂e/kg', unit: 'kg' },
      { value: 'aluminium', label: 'Aluminium', factor: '8.24 kgCO₂e/kg', unit: 'kg' },
      { value: 'plastiques', label: 'Plastiques', factor: '2.53 kgCO₂e/kg', unit: 'kg' },
      { value: 'bois', label: 'Bois', factor: '0.72 kgCO₂e/kg', unit: 'kg' },
      { value: 'papier', label: 'Papier', factor: '1.32 kgCO₂e/kg', unit: 'kg' }
    ]
  },
  {
    category: 'Équipements',
    items: [
      { value: 'ordinateurs', label: 'Ordinateurs', factor: '300 kgCO₂e/unité', unit: 'unités' },
      { value: 'serveurs', label: 'Serveurs', factor: '1200 kgCO₂e/unité', unit: 'unités' },
      { value: 'vehicules', label: 'Véhicules', factor: '6000 kgCO₂e/unité', unit: 'unités' },
      { value: 'mobilier', label: 'Mobilier de bureau', factor: '150 kgCO₂e/unité', unit: 'unités' }
    ]
  },
  {
    category: 'Services',
    items: [
      { value: 'nettoyage', label: 'Services de nettoyage', factor: '0.45 kgCO₂e/€', unit: '€' },
      { value: 'maintenance', label: 'Maintenance', factor: '0.32 kgCO₂e/€', unit: '€' },
      { value: 'conseil', label: 'Conseil/Formation', factor: '0.28 kgCO₂e/€', unit: '€' },
      { value: 'marketing', label: 'Marketing/Communication', factor: '0.52 kgCO₂e/€', unit: '€' }
    ]
  }
]

export function AchatsStep({ register, errors }: AchatsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Achats et approvisionnements
        </h2>
        <p className="text-gray-600">
          Renseignez vos principaux achats et approvisionnements. Ces données représentent souvent la majorité des émissions Scope 3.
        </p>
      </div>

      {CATEGORIES_ACHATS.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {category.category}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    {item.label}
                  </label>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {item.factor}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    {...register(`achats.${item.value}`, { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'La valeur doit être positive' }
                    })}
                    type="number"
                    step="0.01"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600 min-w-fit">
                    {item.unit}/an
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estimation globale par montant
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Si vous ne connaissez pas le détail, vous pouvez estimer vos émissions à partir des montants d'achats.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Achats de biens (€/an)
            </label>
            <input
              {...register('achats.montant_biens', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Le montant doit être positif' }
              })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Facteur moyen: 0.45 kgCO₂e/€
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Achats de services (€/an)
            </label>
            <input
              {...register('achats.montant_services', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Le montant doit être positif' }
              })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Facteur moyen: 0.32 kgCO₂e/€
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immobilisations (€/an)
            </label>
            <input
              {...register('achats.montant_immobilisations', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Le montant doit être positif' }
              })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Facteur moyen: 0.58 kgCO₂e/€
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Scope 3 - Achats
            </h4>
            <p className="text-sm text-blue-700">
              Les achats représentent souvent 60-80% des émissions totales d'une entreprise. 
              Les facteurs d'émission incluent l'extraction, la production, le transport et la fin de vie des produits.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-amber-600 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-900 mb-1">
              Conseil d'optimisation
            </h4>
            <p className="text-sm text-amber-700">
              Privilégiez les données physiques (quantités) aux données monétaires pour une meilleure précision. 
              Notre IA peut vous aider à identifier les postes d'achats les plus émetteurs et les alternatives plus durables.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
