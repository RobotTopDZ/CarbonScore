'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface DechetsStepProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

const TYPES_DECHETS = [
  { value: 'dechets_non_dangereux', label: 'Déchets non dangereux', factor: '0.0234 kgCO₂e/kg', unit: 'kg' },
  { value: 'dechets_dangereux', label: 'Déchets dangereux', factor: '0.0456 kgCO₂e/kg', unit: 'kg' },
  { value: 'papier_carton', label: 'Papier/Carton', factor: '0.0123 kgCO₂e/kg', unit: 'kg' },
  { value: 'plastiques', label: 'Plastiques', factor: '0.0345 kgCO₂e/kg', unit: 'kg' },
  { value: 'verre', label: 'Verre', factor: '0.0089 kgCO₂e/kg', unit: 'kg' },
  { value: 'metaux', label: 'Métaux', factor: '0.0156 kgCO₂e/kg', unit: 'kg' }
]

const MODES_TRAITEMENT = [
  { value: 'recyclage', label: 'Recyclage', factor: '0.0123 kgCO₂e/kg' },
  { value: 'incineration', label: 'Incinération', factor: '0.0456 kgCO₂e/kg' },
  { value: 'enfouissement', label: 'Enfouissement', factor: '0.0789 kgCO₂e/kg' },
  { value: 'compostage', label: 'Compostage', factor: '0.0234 kgCO₂e/kg' }
]

export function DechetsStep({ register, errors }: DechetsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des déchets
        </h2>
        <p className="text-gray-600">
          Renseignez la production et le traitement des déchets de votre entreprise.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Production de déchets par type
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TYPES_DECHETS.map((type, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  {type.label}
                </label>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {type.factor}
                </span>
              </div>
              
              <div className="flex gap-2">
                <input
                  {...register(`dechets.production.${type.value}`, { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'La quantité doit être positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
                <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                  {type.unit}/an
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Modes de traitement
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Répartition des déchets selon leur mode de traitement (en pourcentage du total)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES_TRAITEMENT.map((mode, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  {mode.label}
                </label>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {mode.factor}
                </span>
              </div>
              
              <div className="flex gap-2">
                <input
                  {...register(`dechets.traitement.${mode.value}`, { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Le pourcentage doit être positif' },
                    max: { value: 100, message: 'Maximum 100%' }
                  })}
                  type="number"
                  step="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
                <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            La somme des pourcentages doit être égale à 100%. 
            Si vous ne connaissez pas la répartition exacte, laissez vide et nous utiliserons les moyennes sectorielles.
          </p>
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
              Émissions liées aux déchets
            </h4>
            <p className="text-sm text-blue-700">
              Les facteurs d'émission incluent le transport, le traitement et les émissions évitées par le recyclage. 
              Ces émissions sont comptabilisées en Scope 3 selon le GHG Protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
