import { getSupabaseClient } from '../lib/supabase.js'

export async function fetchDiaries() {
  const { data, error } = await getSupabaseClient()
    .from('diaries')
    .select('id, content, emotion, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`일기를 불러오지 못했습니다: ${error.message}`)
  }

  return data
}

export async function createDiary({ content, emotion }) {
  const { error } = await getSupabaseClient()
    .from('diaries')
    .insert({ content, emotion })

  if (error) {
    throw new Error(`일기를 저장하지 못했습니다: ${error.message}`)
  }
}

export async function deleteDiary(id) {
  const { error } = await getSupabaseClient()
    .from('diaries')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`일기를 삭제하지 못했습니다: ${error.message}`)
  }
}
