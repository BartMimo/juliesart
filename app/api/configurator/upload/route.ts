import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 30

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Geen bestand ontvangen' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Ongeldig bestandstype. Gebruik JPG, PNG, SVG of WebP.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'Bestand is te groot. Maximum is 10 MB.' },
      { status: 400 }
    )
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = `tekeningen/${fileName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const supabase = createAdminClient()

  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload naar Supabase Storage mislukt:', uploadError)
    return NextResponse.json({ error: 'Upload mislukt. Probeer opnieuw.' }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath)

  return NextResponse.json({ url: publicUrlData.publicUrl })
}
