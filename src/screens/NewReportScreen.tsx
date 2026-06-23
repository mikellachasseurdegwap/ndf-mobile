import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { PrimaryButton } from '../components/PrimaryButton'
import { SectionTitle } from '../components/SectionTitle'
import { createReport } from '../services/api'
import { colors, radius, shadow, spacing } from '../theme/theme'
import { MobileExpensePayload } from '../types'

const categories = ['Voiture', 'Moto', 'Train', 'Repas', 'Hôtel', 'Autre']
const categoryToApi: Record<string, MobileExpensePayload['expenses'][number]['categorie']> = {
  Voiture: 'voiture',
  Moto: 'moto',
  Train: 'train',
  Repas: 'repas',
  Hôtel: 'hotel',
  Autre: 'autre',
}

type NewReportScreenProps = {
  token: string
  onSubmitted: () => void
}

export function NewReportScreen({ token, onSubmitted }: NewReportScreenProps) {
  const [commission, setCommission] = useState('')
  const [objetAction, setObjetAction] = useState('')
  const [dateAction, setDateAction] = useState('')
  const [villeDepart, setVilleDepart] = useState('')
  const [villeArrivee, setVilleArrivee] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [kilometers, setKilometers] = useState('')
  const [manualAmount, setManualAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dateDepense, setDateDepense] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const km = Number(kilometers.replace(',', '.')) || 0
  const amount = Number(manualAmount.replace(',', '.')) || 0
  const isKilometric = selectedCategory === 'Voiture' || selectedCategory === 'Moto'
  const estimatedAmount = isKilometric ? km * (selectedCategory === 'Voiture' ? 0.36 : 0.14) : amount

  function handleCategoryPress(category: string) {
    setSelectedCategory(category)
    setKilometers('')
    setManualAmount('')
  }

  async function handleSubmit() {
    setError('')
    if (!commission || !objetAction || !dateAction || !villeDepart || !villeArrivee || !description || !dateDepense) {
      setError('Tous les champs sont obligatoires')
      return
    }
    if (estimatedAmount <= 0) {
      setError('Le montant doit être supérieur à 0')
      return
    }

    setLoading(true)
    try {
      await createReport(token, {
        commission,
        objet_action: objetAction,
        date_action: dateAction,
        ville_depart: villeDepart,
        ville_arrivee: villeArrivee,
        expenses: [{
          categorie: categoryToApi[selectedCategory],
          description,
          montant: estimatedAmount,
          date_depense: dateDepense,
          ...(isKilometric ? { km } : {}),
        }],
      })
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Nouvelle note</Text>
      <Text style={styles.copy}>Même logique que le site : barèmes auto, plafonds repas/hôtel côté backend.</Text>

      <View style={styles.card}>
        <SectionTitle>Informations</SectionTitle>
        <TextInput placeholder="Commission" value={commission} onChangeText={setCommission} placeholderTextColor={colors.mutedText} style={styles.input} />
        <TextInput placeholder="Objet / Action" value={objetAction} onChangeText={setObjetAction} placeholderTextColor={colors.mutedText} style={styles.input} />
        <TextInput placeholder="Date action (YYYY-MM-DD)" value={dateAction} onChangeText={setDateAction} placeholderTextColor={colors.mutedText} style={styles.input} />
        <View style={styles.row}>
          <TextInput placeholder="Départ" value={villeDepart} onChangeText={setVilleDepart} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
          <TextInput placeholder="Arrivée" value={villeArrivee} onChangeText={setVilleArrivee} placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
        </View>
      </View>

      <View style={styles.card}>
        <SectionTitle>Dépense</SectionTitle>
        <View style={styles.chips}>
          {categories.map((category) => {
            const isSelected = selectedCategory === category
            return (
              <TouchableOpacity key={category} activeOpacity={0.85} style={[styles.chip, isSelected && styles.chipActive]} onPress={() => handleCategoryPress(category)}>
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{category}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <View style={styles.row}>
          {isKilometric && (
            <TextInput placeholder="Kilomètres" keyboardType="numeric" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} value={kilometers} onChangeText={setKilometers} />
          )}
          <TextInput placeholder="Montant" keyboardType="numeric" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} value={isKilometric ? estimatedAmount.toFixed(2) : manualAmount} onChangeText={setManualAmount} editable={!isKilometric} />
        </View>
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} placeholderTextColor={colors.mutedText} style={styles.input} />
        <TextInput placeholder="Date dépense (YYYY-MM-DD)" value={dateDepense} onChangeText={setDateDepense} placeholderTextColor={colors.mutedText} style={styles.input} />
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Montant estimé</Text>
        <Text style={styles.totalValue}>{estimatedAmount.toFixed(2)} €</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton onPress={handleSubmit} disabled={loading}>{loading ? 'Envoi...' : 'Soumettre la note'}</PrimaryButton>
    </ScrollView>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.deepGreen,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  totalLabel: {
    color: colors.mutedText,
    fontSize: 14,
  },
  totalValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  error: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
})
