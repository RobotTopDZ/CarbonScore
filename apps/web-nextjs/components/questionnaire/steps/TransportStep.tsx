'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface TransportStepProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

const TYPES_VEHICULES = [
  { value: 'essence', label: 'Essence', factor: '0.193 kgCO₂e/km' },
  { value: 'diesel', label: 'Diesel', factor: '0.166 kgCO₂e/km' },
  { value: 'electrique', label: 'Électrique', factor: '0.0129 kgCO₂e/km' },
  { value: 'hybride', label: 'Hybride', factor: '0.109 kgCO₂e/km' }
]

const MODES_TRANSPORT = [
  { value: 'voiture_particuliere', label: 'Voiture particulière', factor: '0.193 kgCO₂e/km' },
  { value: 'train_regional', label: 'Train régional', factor: '0.0307 kgCO₂e/km' },
  { value: 'train_grande_ligne', label: 'Train grande ligne', factor: '0.00285 kgCO₂e/km' },
  { value: 'avion_domestique', label: 'Avion domestique', factor: '0.230 kgCO₂e/km' },
  { value: 'avion_international', label: 'Avion international', factor: '0.156 kgCO₂e/km' },
  { value: 'bus', label: 'Bus', factor: '0.166 kgCO₂e/km' },
  { value: 'metro_tramway', label: 'Métro/Tramway', factor: '0.00285 kgCO₂e/km' }
]

export function TransportStep({ register, errors }: TransportStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Transport et mobilité
        </h2>
        <p className="text-gray-600">
          Renseignez les données de transport de votre entreprise et de vos employés.
        </p>
      </div>

      {/* Véhicules d'entreprise */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Véhicules d'entreprise
        </h3>
        
        {TYPES_VEHICULES.map((type, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{type.label}</h4>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {type.factor}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de véhicules
                </label>
                <input
                  {...register(`transport.vehicules.${type.value}.nombre`, { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Le nombre doit être positif' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilométrage annuel total (km)
                </label>
                <input
                  {...register(`transport.vehicules.${type.value}.kilometrage`, { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Le kilométrage doit être positif' }
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Déplacements professionnels */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Déplacements professionnels
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES_TRANSPORT.map((mode, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
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
                  {...register(`transport.deplacements.${mode.value}`, { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'La distance doit être positive' }
                  })}
                  type="number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
                <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                  km/an
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trajets domicile-travail */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Trajets domicile-travail des employés
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance moyenne domicile-travail (km)
            </label>
            <input
              {...register('transport.trajets_employes.distance_moyenne', { 
                valueAsNumber: true,
                min: { value: 0, message: 'La distance doit être positive' }
              })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="ex: 15"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de jours de présence/an
            </label>
            <input
              {...register('transport.trajets_employes.jours_presence', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Le nombre de jours doit être positif' },
                max: { value: 365, message: 'Maximum 365 jours par an' }
              })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="ex: 220"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode de transport principal
          </label>
          <select
            {...register('transport.trajets_employes.mode_principal')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Sélectionner le mode principal</option>
            <option value="voiture_particuliere">Voiture particulière (0.193 kgCO₂e/km)</option>
            <option value="transport_commun">Transports en commun (0.0307 kgCO₂e/km)</option>
            <option value="velo_marche">Vélo/Marche (0 kgCO₂e/km)</option>
            <option value="mixte">Mixte (estimation automatique)</option>
          </select>
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
              Calcul des émissions transport
            </h4>
            <p className="text-sm text-blue-700">
              Les facteurs d'émission incluent la combustion (Scope 1) et la production des carburants (Scope 3). 
              Pour les véhicules électriques, seules les émissions liées à la production d'électricité sont comptabilisées.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
