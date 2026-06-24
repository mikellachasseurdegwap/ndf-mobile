'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface Depense {
  categorie: string
  description: string
  montant: number
  date_depense: string
  km?: number
}

const CATEGORIES = [
  { value: 'voiture', label: 'Voiture (0,36 €/km)' },
  { value: 'moto', label: 'Moto (0,14 €/km)' },
  { value: 'train', label: 'Train' },
  { value: 'bus', label: 'Bus' },
  { value: 'avion', label: 'Avion' },
  { value: 'hotel', label: 'Hôtel (plafond 100 €)' },
  { value: 'repas', label: 'Repas (plafond 25 €)' },
  { value: 'autre', label: 'Autre' },
]

export default function NouvelleNDF() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [justificatifs, setJustificatifs] = useState<Record<number, string[]>>({})
  const [uploadLoading, setUploadLoading] = useState<Record<number, boolean>>({})

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    commission: '',
    objet_action: '',
    date_action: '',
    ville_depart: '',
    ville_arrivee: '',
  })

  const [depenses, setDepenses] = useState<Depense[]>([
    { categorie: 'voiture', description: '', montant: 0, date_depense: '', km: 0 }
  ])

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleDepenseChange(index: number, field: string, value: string | number) {
    const updated = [...depenses]
    updated[index] = { ...updated[index], [field]: value }

    const cat = updated[index].categorie
    const rate = cat === 'voiture' ? 0.36 : cat === 'moto' ? 0.14 : 0

    if (field === 'km' && rate > 0) {
      updated[index].montant = Number(value) * rate
    }
    if (field === 'categorie' && (value === 'voiture' || value === 'moto')) {
      const newRate = value === 'voiture' ? 0.36 : 0.14
      updated[index].montant = Number(updated[index].km || 0) * newRate
    }

    setDepenses(updated)
  }

  function addDepense() {
    setDepenses([...depenses, { categorie: 'repas', description: '', montant: 0, date_depense: '' }])
  }

  function removeDepense(index: number) {
    if (depenses.length === 1) return
    setDepenses(depenses.filter((_, i) => i !== index))
  }

  async function handleUpload(index: number, file: File) {
    setUploadLoading(prev => ({ ...prev, [index]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setJustificatifs(prev => ({
          ...prev,
          [index]: [...(prev[index] || []), data.data.url],
        }))
      }
    } catch {
      console.error('Erreur upload')
    } finally {
      setUploadLoading(prev => ({ ...prev, [index]: false }))
    }
  }

  function removeJustificatif(expIndex: number, fileIndex: number) {
    setJustificatifs(prev => ({
      ...prev,
      [expIndex]: (prev[expIndex] || []).filter((_, i) => i !== fileIndex),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          expenses: depenses.map((d, i) => ({
            categorie: d.categorie,
            description: d.description,
            montant: Number(d.montant),
            date_depense: d.date_depense,
            ...(d.km ? { km: Number(d.km) } : {}),
            ...(justificatifs[i]?.length ? { justificatif_urls: justificatifs[i] } : {}),
          })),
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Erreur lors de la soumission')
        return
      }

      const params = new URLSearchParams({
        ref: data.data.id,
        montant: String(data.data.montant_total),
        email: form.email,
        prenom: form.prenom,
        nom: form.nom,
      })
      router.push(`/confirmation?${params.toString()}`)
    } catch {
      setError('Erreur serveur, réessayez')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '0.5px solid #d8e4a8',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#f4f8e8',
    color: '#1a2e0a',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '500' as const,
    color: '#5a6e3a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '6px',
  }

  const sectionTitle = {
    fontSize: '12px',
    fontWeight: '500' as const,
    color: '#7a9420',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, background: '#f4f8e8', padding: '32px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#1a2e0a', margin: 0 }}>Nouvelle note de frais</h1>
            <p style={{ fontSize: '13px', color: '#5a6e3a', marginTop: '4px' }}>Remplissez le formulaire — calcul automatique selon les barèmes FFS 2026</p>
          </div>

          <form onSubmit={handleSubmit}>

            {error && (
              <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* Informations personnelles */}
            <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '24px', marginBottom: '16px' }}>
              <div style={sectionTitle}>Informations personnelles</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Prénom</label>
                  <input name="prenom" value={form.prenom} onChange={handleFormChange} required placeholder="Jean" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
                </div>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input name="nom" value={form.nom} onChange={handleFormChange} required placeholder="Dupont" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Adresse email</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} required placeholder="jean.dupont@exemple.com" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
              </div>
              <div>
                <label style={labelStyle}>Commission</label>
                <input name="commission" value={form.commission} onChange={handleFormChange} required placeholder="ex: Commission technique" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
              </div>
            </div>

            {/* Informations de l'action */}
            <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '24px', marginBottom: '16px' }}>
              <div style={sectionTitle}>Informations de l'action</div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Objet / Action</label>
                <input name="objet_action" value={form.objet_action} onChange={handleFormChange} required placeholder="ex: Réunion Lyon" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Date de l'action</label>
                <input type="date" name="date_action" value={form.date_action} onChange={handleFormChange} required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Ville de départ</label>
                  <input name="ville_depart" value={form.ville_depart} onChange={handleFormChange} required placeholder="Paris" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
                </div>
                <div>
                  <label style={labelStyle}>Ville d'arrivée</label>
                  <input name="ville_arrivee" value={form.ville_arrivee} onChange={handleFormChange} required placeholder="Lyon" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
                </div>
              </div>
            </div>

            {/* Dépenses */}
            <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #d8e4a8', padding: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={sectionTitle}>Dépenses</div>
                <button type="button" onClick={addDepense}
                  style={{ background: '#e4f0b8', color: '#4a5c14', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', border: '0.5px solid #A6C630', cursor: 'pointer' }}>
                  + Ajouter
                </button>
              </div>

              {depenses.map((dep, index) => (
                <div key={index} style={{ background: '#f4f8e8', borderRadius: '10px', padding: '16px', marginBottom: '12px', border: '0.5px solid #d8e4a8' }}>

                  {/* Header dépense */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: '#7a9420' }}>Dépense {index + 1}</span>
                    {depenses.length > 1 && (
                      <button type="button" onClick={() => removeDepense(index)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    )}
                  </div>

                  {/* Catégorie + Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={labelStyle}>Catégorie</label>
                      <select value={dep.categorie} onChange={e => handleDepenseChange(index, 'categorie', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Date de la dépense</label>
                      <input type="date" value={dep.date_depense} onChange={e => handleDepenseChange(index, 'date_depense', e.target.value)} required style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Description</label>
                    <input value={dep.description} onChange={e => handleDepenseChange(index, 'description', e.target.value)} required placeholder="ex: Trajet Paris-Lyon" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')} />
                  </div>

                  {/* Montant + KM */}
                  <div style={{ display: 'grid', gridTemplateColumns: dep.categorie === 'voiture' || dep.categorie === 'moto' ? '1fr 1fr' : '1fr', gap: '12px' }}>
                    {(dep.categorie === 'voiture' || dep.categorie === 'moto') && (
                      <div>
                        <label style={labelStyle}>Kilomètres</label>
                        <input type="number" min="0" value={dep.km || ''} onChange={e => handleDepenseChange(index, 'km', e.target.value)} style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = '#A6C630')} onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
                          placeholder="ex: 150" />
                      </div>
                    )}
                    <div>
                      <label style={labelStyle}>Montant (€)</label>
                      <input
                        type="number" min="0" step="0.01"
                        value={dep.montant || ''}
                        onChange={e => handleDepenseChange(index, 'montant', e.target.value)}
                        required
                        readOnly={dep.categorie === 'voiture' || dep.categorie === 'moto'}
                        style={{
                          ...inputStyle,
                          ...(dep.categorie === 'voiture' || dep.categorie === 'moto'
                            ? { background: '#e4f0b8', color: '#4a5c14', cursor: 'not-allowed' }
                            : {})
                        }}
                        onFocus={e => { if (dep.categorie !== 'voiture' && dep.categorie !== 'moto') e.target.style.borderColor = '#A6C630' }}
                        onBlur={e => (e.target.style.borderColor = '#d8e4a8')}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Justificatifs — multiples */}
                  <div style={{ marginTop: '12px' }}>
                    <label style={labelStyle}>Justificatifs</label>

                    {(justificatifs[index] || []).map((url, fileIndex) => (
                      <div key={url} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', border: '0.5px solid #86efac', borderRadius: '6px', padding: '6px 10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#166534', flex: 1 }}>
                          ✓ Justificatif {fileIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeJustificatif(index, fileIndex)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleUpload(index, file)
                          e.target.value = ''
                        }
                      }}
                      style={{ width: '100%', padding: '8px 12px', border: '0.5px solid #d8e4a8', borderRadius: '8px', fontSize: '13px', background: '#f4f8e8', cursor: 'pointer' }}
                      capture="environment"
                    />
                    {uploadLoading[index] && (
                      <div style={{ fontSize: '12px', color: '#7a9420', marginTop: '6px' }}>Upload en cours...</div>
                    )}
                  </div>

                </div>
              ))}
            </div>

            {/* Bouton soumettre */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: loading ? '#B3D280' : '#A6C630', color: '#1a2e0a', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Soumission en cours...' : 'Soumettre la note de frais'}
            </button>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}