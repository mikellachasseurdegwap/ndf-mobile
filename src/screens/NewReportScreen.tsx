import { useState } from 'react'
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '../components/PrimaryButton'
import { SectionTitle } from '../components/SectionTitle'
import { createReport, uploadJustificatif } from '../services/api'
import { colors, radius, shadow, spacing } from '../theme/theme'
import { ExpenseReport, MobileExpensePayload } from '../types'

type ExpenseCategory =
  | 'voiture'
  | 'moto'
  | 'covoiturage'
  | 'train'
  | 'bus'
  | 'avion'
  | 'hotel'
  | 'repas'
  | 'peage'
  | 'parking'
  | 'taxi'
  | 'autre'

type ExpenseDraft = {
  categorie: ExpenseCategory
  description: string
  montant: string
  date_depense: string
  km: string
  nuits: string
  repas: string
  justificatif_urls: string[]
}

type DateTarget = 'date_action' | `depense-${number}`

type NewReportScreenProps = {
  token: string | null
  onSubmitted: (report: ExpenseReport, identity?: { nom: string; prenom: string; email: string }) => void
}

const steps = ['Infos', 'Dépenses', 'Justificatifs', 'Récapitulatif']

const commissions = ['EFS', 'CA', 'Commission technique', 'Commission canyon', 'Commission plongée', 'Autre']

const categories: Array<{ value: ExpenseCategory; label: string }> = [
  { value: 'voiture', label: 'Voiture' },
  { value: 'moto', label: 'Moto' },
  { value: 'covoiturage', label: 'Covoiturage' },
  { value: 'train', label: 'Train' },
  { value: 'bus', label: 'Bus' },
  { value: 'avion', label: 'Avion' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'repas', label: 'Repas' },
  { value: 'peage', label: 'Péage' },
  { value: 'parking', label: 'Parking' },
  { value: 'taxi', label: 'Taxi' },
  { value: 'autre', label: 'Autre' },
]

const emptyExpense = (): ExpenseDraft => ({
  categorie: 'voiture',
  description: '',
  montant: '',
  date_depense: toDateInputValue(new Date()),
  km: '',
  nuits: '',
  repas: '',
  justificatif_urls: [],
})

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatDateFr(value: string) {
  return new Date(value).toLocaleDateString('fr-FR')
}

function parseNumber(value: string) {
  return Number(value.replace(',', '.')) || 0
}

function getRate(category: ExpenseCategory) {
  if (category === 'voiture') return 0.36
  if (category === 'moto') return 0.14
  if (category === 'covoiturage') return 0.4
  return 0
}

function getExpenseAmount(expense: ExpenseDraft) {
  const rate = getRate(expense.categorie)
  if (rate) return parseNumber(expense.km) * rate
  if (expense.categorie === 'hotel') return parseNumber(expense.nuits || '1') * parseNumber(expense.montant)
  if (expense.categorie === 'repas') return parseNumber(expense.repas || '1') * parseNumber(expense.montant)
  return parseNumber(expense.montant)
}

function toApiCategory(category: ExpenseCategory): MobileExpensePayload['expenses'][number]['categorie'] {
  if (category === 'covoiturage' || category === 'peage' || category === 'parking' || category === 'taxi') return 'autre'
  return category
}

export function NewReportScreen({ token, onSubmitted }: NewReportScreenProps) {
  const [step, setStep] = useState(0)
  const [datePickerTarget, setDatePickerTarget] = useState<DateTarget | null>(null)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [telephone, setTelephone] = useState('')
  const [commission, setCommission] = useState(commissions[0])
  const [objetAction, setObjetAction] = useState('')
  const [dateAction, setDateAction] = useState(toDateInputValue(new Date()))
  const [villeDepart, setVilleDepart] = useState('')
  const [departementDepart, setDepartementDepart] = useState('')
  const [villeArrivee, setVilleArrivee] = useState('')
  const [departementArrivee, setDepartementArrivee] = useState('')
  const [expenses, setExpenses] = useState<ExpenseDraft[]>([emptyExpense()])
  const [loading, setLoading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  const total = expenses.reduce((sum, expense) => sum + getExpenseAmount(expense), 0)

  function updateExpense(index: number, patch: Partial<ExpenseDraft>) {
    setExpenses((current) => current.map((expense, i) => i === index ? { ...expense, ...patch } : expense))
  }

  function validateStep(currentStep = step) {
    setError('')
    if (currentStep === 0) {
      if (!token && (!nom || !prenom || !email)) return 'Nom, prénom et email sont obligatoires sans compte'
      if (!adresse || !telephone || !commission || !objetAction || !dateAction || !villeDepart || !villeArrivee || !departementDepart || !departementArrivee) {
        return 'Tous les champs des informations générales sont obligatoires'
      }
    }
    if (currentStep === 1) {
      for (const expense of expenses) {
        if (!expense.description || !expense.date_depense) return 'Description et date de chaque dépense sont obligatoires'
        if (getRate(expense.categorie) && parseNumber(expense.km) <= 0) return 'Les kilomètres sont obligatoires pour ce déplacement'
        if (!getRate(expense.categorie) && getExpenseAmount(expense) <= 0) return 'Chaque dépense doit avoir un montant supérieur à 0'
      }
    }
    return ''
  }

  function goNext() {
    const message = validateStep()
    if (message) {
      setError(message)
      return
    }
    setStep((value) => Math.min(value + 1, steps.length - 1))
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS !== 'ios') setDatePickerTarget(null)
    if (event.type === 'dismissed' || !selectedDate || !datePickerTarget) return

    const value = toDateInputValue(selectedDate)
    if (datePickerTarget === 'date_action') {
      setDateAction(value)
      return
    }

    const index = Number(datePickerTarget.replace('depense-', ''))
    updateExpense(index, { date_depense: value })
  }

  async function handleTakePhoto(index: number) {
    setError('')
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      setError('Permission caméra refusée')
      return
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 })
    if (result.canceled) return
    await uploadAsset(index, result.assets[0].uri, `justificatif-${Date.now()}.jpg`, result.assets[0].mimeType || 'image/jpeg')
  }

  async function handlePickFile(index: number) {
    setError('')
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      copyToCacheDirectory: true,
    })
    if (result.canceled) return
    const asset = result.assets[0]
    await uploadAsset(index, asset.uri, asset.name, asset.mimeType || 'application/octet-stream')
  }

  async function uploadAsset(index: number, uri: string, name: string, type: string) {
    setUploadingIndex(index)
    try {
      const url = await uploadJustificatif({ uri, name, type })
      updateExpense(index, { justificatif_urls: [...expenses[index].justificatif_urls, url] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploadingIndex(null)
    }
  }

  async function handleSubmit() {
    const firstStepError = validateStep(0)
    const secondStepError = validateStep(1)
    const message = firstStepError || secondStepError
    if (message) {
      setError(message)
      return
    }

    setLoading(true)
    setError('')
    try {
      const report = await createReport(token, {
        ...(token ? {} : { nom, prenom, email }),
        commission,
        objet_action: objetAction,
        date_action: dateAction,
        ville_depart: `${villeDepart} (${departementDepart})`,
        ville_arrivee: `${villeArrivee} (${departementArrivee})`,
        expenses: expenses.map((expense) => ({
          categorie: toApiCategory(expense.categorie),
          description: expense.description,
          montant: getExpenseAmount(expense),
          date_depense: expense.date_depense,
          ...(getRate(expense.categorie) && expense.categorie !== 'covoiturage' ? { km: parseNumber(expense.km) } : {}),
          ...(expense.justificatif_urls.length ? { justificatif_urls: expense.justificatif_urls } : {}),
        })),
      })
      onSubmitted(report, token ? undefined : { nom, prenom, email })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Nouvelle note de frais</Text>
      <Text style={styles.copy}>Formulaire en 4 étapes avec calcul automatique et justificatifs.</Text>

      <View style={styles.progress}>
        {steps.map((label, index) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.progressDot, index <= step && styles.progressDotActive]}>
              <Text style={[styles.progressNumber, index <= step && styles.progressNumberActive]}>{index + 1}</Text>
            </View>
            <Text style={[styles.progressLabel, index === step && styles.progressLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {step === 0 && (
        <View style={styles.card}>
          <SectionTitle>Informations générales</SectionTitle>
          {!token && (
            <>
              <View style={styles.row}>
                <TextInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
                <TextInput placeholder="Nom" value={nom} onChangeText={setNom} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
              </View>
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.mutedText} style={styles.input} />
            </>
          )}
          <TextInput placeholder="Adresse" value={adresse} onChangeText={setAdresse} placeholderTextColor={colors.mutedText} style={styles.input} />
          <TextInput placeholder="Téléphone" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" placeholderTextColor={colors.mutedText} style={styles.input} />
          <Text style={styles.fieldLabel}>Commission</Text>
          <View style={styles.chips}>
            {commissions.map((item) => (
              <TouchableOpacity key={item} style={[styles.chip, commission === item && styles.chipActive]} onPress={() => setCommission(item)}>
                <Text style={[styles.chipText, commission === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput placeholder="Objet de l'action" value={objetAction} onChangeText={setObjetAction} placeholderTextColor={colors.mutedText} style={styles.input} />
          <DateButton label="Date de l'action" value={dateAction} onPress={() => setDatePickerTarget('date_action')} />
          <View style={styles.row}>
            <TextInput placeholder="Ville départ" value={villeDepart} onChangeText={setVilleDepart} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
            <TextInput placeholder="Département" value={departementDepart} onChangeText={setDepartementDepart} keyboardType="numeric" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
          </View>
          <View style={styles.row}>
            <TextInput placeholder="Ville arrivée" value={villeArrivee} onChangeText={setVilleArrivee} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
            <TextInput placeholder="Département" value={departementArrivee} onChangeText={setDepartementArrivee} keyboardType="numeric" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
          </View>
        </View>
      )}

      {step === 1 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SectionTitle>Déplacements, repas et frais</SectionTitle>
            <TouchableOpacity style={styles.addButton} onPress={() => setExpenses((current) => [...current, emptyExpense()])}>
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {expenses.map((expense, index) => {
            const amount = getExpenseAmount(expense)
            const rate = getRate(expense.categorie)
            return (
              <View key={index} style={styles.expenseBox}>
                <View style={styles.cardHeader}>
                  <Text style={styles.expenseTitle}>Dépense {index + 1}</Text>
                  {expenses.length > 1 && (
                    <TouchableOpacity onPress={() => setExpenses((current) => current.filter((_, i) => i !== index))}>
                      <Text style={styles.removeText}>Supprimer</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.fieldLabel}>Catégorie</Text>
                <View style={styles.chips}>
                  {categories.map((category) => (
                    <TouchableOpacity key={category.value} style={[styles.chip, expense.categorie === category.value && styles.chipActive]} onPress={() => updateExpense(index, { categorie: category.value, montant: '', km: '' })}>
                      <Text style={[styles.chipText, expense.categorie === category.value && styles.chipTextActive]}>{category.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <DateButton label="Date de la dépense" value={expense.date_depense} onPress={() => setDatePickerTarget(`depense-${index}`)} />
                <TextInput placeholder="Description" value={expense.description} onChangeText={(value) => updateExpense(index, { description: value })} placeholderTextColor={colors.mutedText} style={styles.input} />
                {rate ? (
                  <View style={styles.row}>
                    <TextInput placeholder="Kilomètres" value={expense.km} onChangeText={(value) => updateExpense(index, { km: value })} keyboardType="numeric" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
                    <ReadOnlyAmount amount={amount} />
                  </View>
                ) : (
                  <View style={styles.row}>
                    {(expense.categorie === 'hotel' || expense.categorie === 'repas') && (
                      <TextInput placeholder={expense.categorie === 'hotel' ? 'Nb nuits' : 'Nb repas'} value={expense.categorie === 'hotel' ? expense.nuits : expense.repas} onChangeText={(value) => updateExpense(index, expense.categorie === 'hotel' ? { nuits: value } : { repas: value })} keyboardType="numeric" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
                    )}
                    <TextInput placeholder="Montant (€)" value={expense.montant} onChangeText={(value) => updateExpense(index, { montant: value })} keyboardType="numeric" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
                  </View>
                )}
                {expense.categorie === 'repas' && parseNumber(expense.montant) > 25 ? <Text style={styles.warning}>Alerte : plafond repas 25 € par repas côté backend.</Text> : null}
                {expense.categorie === 'hotel' && parseNumber(expense.montant) > 100 ? <Text style={styles.warning}>Alerte : plafond hôtel 100 € par nuit côté backend.</Text> : null}
                <Text style={styles.lineTotal}>Total dépense : {amount.toFixed(2)} €</Text>
              </View>
            )
          })}
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <SectionTitle>Upload justificatifs</SectionTitle>
          {expenses.map((expense, index) => (
            <View key={index} style={styles.expenseBox}>
              <Text style={styles.expenseTitle}>Dépense {index + 1}</Text>
              <Text style={styles.muted}>{expense.description || 'Sans description'}</Text>
              {expense.justificatif_urls.map((url, fileIndex) => (
                <View key={url} style={styles.fileRow}>
                  <Ionicons name="document-attach-outline" size={18} color={colors.success} />
                  <Text style={styles.fileText}>Justificatif {fileIndex + 1}</Text>
                  <TouchableOpacity onPress={() => updateExpense(index, { justificatif_urls: expense.justificatif_urls.filter((_, i) => i !== fileIndex) })}>
                    <Text style={styles.removeText}>Retirer</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.row}>
                <TouchableOpacity style={[styles.uploadButton, styles.half]} onPress={() => handleTakePhoto(index)} disabled={uploadingIndex === index}>
                  <Ionicons name="camera-outline" size={18} color={colors.deepGreen} />
                  <Text style={styles.uploadText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.uploadButton, styles.half]} onPress={() => handlePickFile(index)} disabled={uploadingIndex === index}>
                  <Ionicons name="folder-open-outline" size={18} color={colors.deepGreen} />
                  <Text style={styles.uploadText}>Fichier</Text>
                </TouchableOpacity>
              </View>
              {uploadingIndex === index ? <Text style={styles.muted}>Upload en cours...</Text> : null}
            </View>
          ))}
        </View>
      )}

      {step === 3 && (
        <View style={styles.card}>
          <SectionTitle>Récapitulatif</SectionTitle>
          <SummaryLine label="Demandeur" value={token ? 'Compte connecté' : `${prenom} ${nom}`} />
          <SummaryLine label="Commission" value={commission} />
          <SummaryLine label="Objet" value={objetAction} />
          <SummaryLine label="Date action" value={formatDateFr(dateAction)} />
          <SummaryLine label="Trajet" value={`${villeDepart} (${departementDepart}) → ${villeArrivee} (${departementArrivee})`} />
          <View style={styles.separator} />
          {expenses.map((expense, index) => (
            <View key={index} style={styles.summaryExpense}>
              <Text style={styles.expenseTitle}>Dépense {index + 1}</Text>
              <SummaryLine label="Catégorie" value={categories.find((item) => item.value === expense.categorie)?.label || expense.categorie} />
              <SummaryLine label="Montant" value={`${getExpenseAmount(expense).toFixed(2)} €`} />
              <SummaryLine label="Justificatifs" value={`${expense.justificatif_urls.length}`} />
            </View>
          ))}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Montant total</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>
      )}

      {datePickerTarget && (
        <DateTimePicker
          value={new Date(datePickerTarget === 'date_action' ? dateAction : expenses[Number(datePickerTarget.replace('depense-', ''))].date_depense)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          onChange={handleDateChange}
        />
      )}

      <View style={styles.actions}>
        {step > 0 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep((value) => value - 1)}>
            <Text style={styles.secondaryText}>Retour</Text>
          </TouchableOpacity>
        )}
        {step < steps.length - 1 ? (
          <PrimaryButton onPress={goNext}>Continuer</PrimaryButton>
        ) : (
          <PrimaryButton onPress={handleSubmit} disabled={loading}>{loading ? 'Soumission en cours...' : 'Confirmer et soumettre'}</PrimaryButton>
        )}
      </View>
    </ScrollView>
  )
}

function DateButton({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.dateBox} onPress={onPress}>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={styles.dateValue}>{formatDateFr(value)}</Text>
    </TouchableOpacity>
  )
}

function ReadOnlyAmount({ amount }: { amount: number }) {
  return (
    <View style={[styles.input, styles.half, styles.readOnlyAmount]}>
      <Text style={styles.readOnlyText}>{amount.toFixed(2)} €</Text>
    </View>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  copy: {
    color: colors.mutedText,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  progress: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressNumber: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '900',
  },
  progressNumberActive: {
    color: colors.deepGreen,
  },
  progressLabel: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressLabelActive: {
    color: colors.deepGreen,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  fieldLabel: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  chipTextActive: {
    color: colors.deepGreen,
  },
  dateBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dateLabel: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  dateValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkText: {
    color: colors.text,
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    color: colors.deepGreen,
    fontWeight: '900',
  },
  expenseBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  expenseTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  removeText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '900',
  },
  warning: {
    color: colors.warning,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 12,
    fontWeight: '800',
  },
  lineTotal: {
    color: colors.deepGreen,
    fontWeight: '900',
    textAlign: 'right',
  },
  readOnlyAmount: {
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  readOnlyText: {
    color: colors.deepGreen,
    fontWeight: '900',
  },
  uploadButton: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  uploadText: {
    color: colors.deepGreen,
    fontWeight: '900',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  fileText: {
    flex: 1,
    color: colors.success,
    fontWeight: '800',
  },
  muted: {
    color: colors.mutedText,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  summaryExpense: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    color: colors.mutedText,
  },
  summaryValue: {
    flex: 1,
    color: colors.text,
    fontWeight: '800',
    textAlign: 'right',
  },
  totalCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  totalLabel: {
    color: colors.deepGreen,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  totalValue: {
    color: colors.deepGreen,
    fontSize: 30,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.sm,
  },
  secondaryButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  secondaryText: {
    color: colors.deepGreen,
    fontWeight: '900',
  },
})
