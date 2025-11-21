'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'

interface EntrepriseData {
  nom: string
  secteur: string
  effectif: number
  chiffreAffaires?: number
  adresse?: string
}

interface EntrepriseStepProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

// Secteurs basés sur les catégories ADEME Base Carbone
const SECTEURS_ADEME = [
  { value: 'agriculture', label: 'Agriculture, sylviculture et pêche' },
  { value: 'industrie_alimentaire', label: 'Industries alimentaires' },
  { value: 'industrie_textile', label: 'Fabrication de textiles' },
  { value: 'industrie_chimique', label: 'Industrie chimique' },
  { value: 'industrie_pharmaceutique', label: 'Industrie pharmaceutique' },
  { value: 'metallurgie', label: 'Métallurgie' },
  { value: 'industrie_automobile', label: 'Industrie automobile' },
  { value: 'construction', label: 'Construction' },
  { value: 'commerce_gros', label: 'Commerce de gros' },
  { value: 'commerce_detail', label: 'Commerce de détail' },
  { value: 'transport_logistique', label: 'Transports et entreposage' },
  { value: 'hotellerie_restauration', label: 'Hébergement et restauration' },
  { value: 'information_communication', label: 'Information et communication' },
  { value: 'activites_financieres', label: 'Activités financières et d\'assurance' },
  { value: 'activites_immobilieres', label: 'Activités immobilières' },
  { value: 'activites_juridiques', label: 'Activités juridiques et comptables' },
  { value: 'activites_conseil', label: 'Conseil et ingénierie' },
  { value: 'recherche_developpement', label: 'Recherche-développement scientifique' },
  { value: 'education', label: 'Enseignement' },
  { value: 'sante_social', label: 'Santé humaine et action sociale' },
  { value: 'arts_spectacles', label: 'Arts, spectacles et activités récréatives' },
  { value: 'autres_services', label: 'Autres activités de services' }
]

const TAILLES_ENTREPRISE = [
  { value: '1-10', label: '1-10 employés (Micro-entreprise)' },
  { value: '11-49', label: '11-49 employés (Petite entreprise)' },
  { value: '50-249', label: '50-249 employés (Moyenne entreprise)' },
  { value: '250-499', label: '250-499 employés (Grande entreprise)' },
  { value: '500+', label: '500+ employés (Très grande entreprise)' }
]

export function EntrepriseStep({ register, errors }: EntrepriseStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informations sur votre entreprise
        </h2>
        <p className="text-gray-600">
          Ces informations nous permettront de personnaliser le calcul selon votre secteur d'activité et les facteurs d'émission ADEME correspondants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="entreprise.nom" className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'entreprise *
          </label>
          <input
            {...register('entreprise.nom', { 
              required: 'Le nom de l\'entreprise est requis' 
            })}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="Nom de votre entreprise"
          />
          {errors.entreprise?.nom && (
            <p className="mt-1 text-sm text-red-600">{(errors.entreprise.nom as any)?.message || 'Erreur de validation'}</p>
          )}
        </div>

        <div>
          <label htmlFor="entreprise.secteur" className="block text-sm font-medium text-gray-700 mb-2">
            Secteur d'activité *
          </label>
          <select
            {...register('entreprise.secteur', { 
              required: 'Le secteur d\'activité est requis' 
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="">Sélectionnez votre secteur</option>
            {SECTEURS_ADEME.map((secteur) => (
              <option key={secteur.value} value={secteur.value}>
                {secteur.label}
              </option>
            ))}
          </select>
          {errors.entreprise?.secteur && (
            <p className="mt-1 text-sm text-red-600">{(errors.entreprise.secteur as any)?.message || 'Erreur de validation'}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Le secteur détermine les facteurs d'émission ADEME applicables
          </p>
        </div>

        <div>
          <label htmlFor="entreprise.effectif" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre d'employés *
          </label>
          <select
            {...register('entreprise.effectif', { 
              required: 'Le nombre d\'employés est requis',
              valueAsNumber: true
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="">Sélectionnez la taille</option>
            {TAILLES_ENTREPRISE.map((taille) => (
              <option key={taille.value} value={taille.value}>
                {taille.label}
              </option>
            ))}
          </select>
          {errors.entreprise?.effectif && (
            <p className="mt-1 text-sm text-red-600">{(errors.entreprise.effectif as any)?.message || 'Erreur de validation'}</p>
          )}
        </div>

        <div>
          <label htmlFor="entreprise.chiffreAffaires" className="block text-sm font-medium text-gray-700 mb-2">
            Chiffre d'affaires annuel (€)
          </label>
          <input
            {...register('entreprise.chiffreAffaires', { 
              valueAsNumber: true,
              min: { value: 0, message: 'Le chiffre d\'affaires doit être positif' }
            })}
            type="number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="ex: 1000000"
          />
          {errors.entreprise?.chiffreAffaires && (
            <p className="mt-1 text-sm text-red-600">{(errors.entreprise.chiffreAffaires as any)?.message || 'Erreur de validation'}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Optionnel - permet de calculer l'intensité carbone par euro de CA
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="entreprise.adresse" className="block text-sm font-medium text-gray-700 mb-2">
          Adresse principale
        </label>
        <textarea
          {...register('entreprise.adresse')}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder="Adresse complète de votre siège social"
        />
        <p className="mt-1 text-xs text-gray-500">
          Optionnel - utilisé pour les facteurs d'émission géographiques (mix électrique régional)
        </p>
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
              Conformité ADEME
            </h4>
            <p className="text-sm text-blue-700">
              Nos calculs utilisent exclusivement les facteurs d'émission officiels de la Base Carbone ADEME v17, 
              garantissant la conformité avec les standards français et européens de reporting carbone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
