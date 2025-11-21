'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface EnergieStepProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

// Types d'énergie basés sur ADEME Base Carbone
const TYPES_ENERGIE = [
  {
    category: 'Électricité',
    items: [
      { value: 'electricite_reseau', label: 'Électricité du réseau français', unit: 'kWh', factor: '0.0571 kgCO₂e/kWh' },
      { value: 'electricite_renouvelable', label: 'Électricité renouvelable certifiée', unit: 'kWh', factor: '0.0134 kgCO₂e/kWh' }
    ]
  },
  {
    category: 'Gaz',
    items: [
      { value: 'gaz_naturel', label: 'Gaz naturel', unit: 'kWh PCI', factor: '0.227 kgCO₂e/kWh' },
      { value: 'gaz_propane', label: 'Gaz propane', unit: 'kg', factor: '2.94 kgCO₂e/kg' },
      { value: 'gaz_butane', label: 'Gaz butane', unit: 'kg', factor: '2.93 kgCO₂e/kg' }
    ]
  },
  {
    category: 'Combustibles liquides',
    items: [
      { value: 'fioul_domestique', label: 'Fioul domestique', unit: 'L', factor: '3.25 kgCO₂e/L' },
      { value: 'fioul_lourd', label: 'Fioul lourd', unit: 'kg', factor: '3.17 kgCO₂e/kg' },
      { value: 'essence', label: 'Essence', unit: 'L', factor: '2.80 kgCO₂e/L' },
      { value: 'gazole', label: 'Gazole', unit: 'L', factor: '3.10 kgCO₂e/L' }
    ]
  },
  {
    category: 'Combustibles solides',
    items: [
      { value: 'charbon', label: 'Charbon', unit: 'kg', factor: '3.27 kgCO₂e/kg' },
      { value: 'bois_buches', label: 'Bois bûches', unit: 'kg', factor: '0.0295 kgCO₂e/kg' },
      { value: 'granules_bois', label: 'Granulés de bois', unit: 'kg', factor: '0.0304 kgCO₂e/kg' }
    ]
  }
]

export function EnergieStep({ register, errors }: EnergieStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Consommations énergétiques
        </h2>
        <p className="text-gray-600">
          Renseignez vos consommations d'énergie annuelles. Les facteurs d'émission ADEME seront automatiquement appliqués.
        </p>
      </div>

      {TYPES_ENERGIE.map((category, categoryIndex) => (
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
                    {...register(`energie.${item.value}`, { 
                      valueAsNumber: true,
                      min: { value: 0, message: 'La valeur doit être positive' }
                    })}
                    type="number"
                    step="0.01"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="0"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600 min-w-fit">
                    {item.unit}
                  </span>
                </div>
                
                {(errors as any).energie?.[item.value] && (
                  <p className="mt-1 text-xs text-red-600">
                    {(errors as any).energie[item.value]?.message || 'Erreur de validation'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Autres énergies
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Si vous utilisez d'autres sources d'énergie non listées ci-dessus, vous pouvez les ajouter ici.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'énergie
            </label>
            <input
              {...register('energie.autre_type')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="ex: Biomasse"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité
            </label>
            <input
              {...register('energie.autre_quantite', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unité
            </label>
            <select
              {...register('energie.autre_unite')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Sélectionner</option>
              <option value="kWh">kWh</option>
              <option value="MWh">MWh</option>
              <option value="kg">kg</option>
              <option value="tonne">tonne</option>
              <option value="L">Litres</option>
              <option value="m3">m³</option>
            </select>
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
              Facteurs d'émission ADEME
            </h4>
            <p className="text-sm text-blue-700">
              Les facteurs d'émission affichés proviennent de la Base Carbone ADEME v17. 
              Ils incluent les émissions directes (combustion) et indirectes (amont) selon les scopes 1, 2 et 3 du GHG Protocol.
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
              Conseil
            </h4>
            <p className="text-sm text-amber-700">
              Vous pouvez retrouver vos consommations sur vos factures d'énergie. 
              Si vous n'avez pas les données exactes, notre IA peut vous aider à les estimer selon votre secteur d'activité.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
