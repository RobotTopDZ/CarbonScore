import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form'
import { EntrepriseStep } from './steps/EntrepriseStep'
import { EnergieStep } from './steps/EnergieStep'
import { TransportStep } from './steps/TransportStep'
import { DechetsStep } from './steps/DechetsStep'
import { AchatsStep } from './steps/AchatsStep'

interface QuestionnaireData {
  entreprise: {
    nom: string
    secteur: string
    effectif: number
    chiffreAffaires?: number
    adresse?: string
  }
  energie: {
    electricite: number
    gaz: number
    fioul?: number
    autresEnergies?: Array<{
      type: string
      quantite: number
      unite: string
    }>
  }
  transport: {
    vehiculesEntreprise: Array<{
      type: 'essence' | 'diesel' | 'electrique' | 'hybride'
      nombre: number
      kilometrage: number
    }>
    deplacementsProfessionnels: {
      voiture?: number
      train?: number
      avion?: number
    }
    trajetsEmployes: {
      domicileTravail?: number
      modeTransport?: 'voiture' | 'transport_commun' | 'velo' | 'marche' | 'mixte'
    }
  }
  dechets: {
    production: number
    recyclage: number
    traitement: 'incineration' | 'enfouissement' | 'compostage' | 'recyclage'
  }
  achats: {
    matieresPremières?: number
    equipements?: number
    services?: number
    fournisseurs?: Array<{
      nom: string
      localisation: string
      montant: number
    }>
  }
}

interface QuestionnaireFormProps {
  currentStep: number
  register: UseFormRegister<QuestionnaireData>
  errors: FieldErrors<QuestionnaireData>
  watch: UseFormWatch<QuestionnaireData>
  setValue: UseFormSetValue<QuestionnaireData>
  getValues: UseFormGetValues<QuestionnaireData>
}

export function QuestionnaireForm({
  currentStep,
  register,
  errors,
  watch,
  setValue,
  getValues,
}: QuestionnaireFormProps) {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EntrepriseStep
            register={register}
            errors={errors}
            watch={watch}
          />
        )
      case 2:
        return (
          <EnergieStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
          />
        )
      case 3:
        return (
          <TransportStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
          />
        )
      case 4:
        return (
          <DechetsStep
            register={register}
            errors={errors}
            watch={watch}
          />
        )
      case 5:
        return (
          <AchatsStep
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
          />
        )
      default:
        return null
    }
  }

  return <div>{renderStep()}</div>
}
