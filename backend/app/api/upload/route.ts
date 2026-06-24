import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { uploadToR2 } from '@/lib/r2'

// Types de fichiers acceptés
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

// Taille max : 10 Mo
const MAX_SIZE = 10 * 1024 * 1024

// Schéma de validation
const uploadSchema = z.object({
  type: z.string().refine((t) => ACCEPTED_TYPES.includes(t), {
    message: 'Type de fichier non accepté (jpg, png, webp, pdf uniquement)',
  }),
  size: z.number().max(MAX_SIZE, {
    message: 'Fichier trop volumineux (max 10 Mo)',
  }),
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData() as unknown as { get(name: string): FormDataEntryValue | null }
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier reçu' },
        { status: 400 }
      )
    }

    const validation = uploadSchema.safeParse({
      type: file.type,
      size: file.size,
    })

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const extension = file.name.split('.').pop()
    const filename = `justificatifs/${uuidv4()}.${extension}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const url = await uploadToR2(buffer, filename, file.type)

    return NextResponse.json(
      { success: true, data: { url } },
      { status: 200 }
    )
  } catch (error) {
    console.error('[UPLOAD ERROR]', error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de l'upload" },
      { status: 500 }
    )
  }
}
