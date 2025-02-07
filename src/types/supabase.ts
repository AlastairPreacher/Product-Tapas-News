export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          url: string
          summary: string
          published_at: string
          source: string
          category: string
          regions: string[]
          relevance: string | null
          created_at: string
          last_fetched: string
        }
        Insert: {
          id: string
          title: string
          url: string
          summary: string
          published_at: string
          source: string
          category: string
          regions: string[]
          relevance?: string | null
          created_at?: string
          last_fetched?: string
        }
        Update: {
          id?: string
          title?: string
          url?: string
          summary?: string
          published_at?: string
          source?: string
          category?: string
          regions?: string[]
          relevance?: string | null
          created_at?: string
          last_fetched?: string
        }
      }
      user_articles: {
        Row: {
          id: string
          user_id: string
          article_id: string
          is_read: boolean
          is_saved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_id: string
          is_read?: boolean
          is_saved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_id?: string
          is_read?: boolean
          is_saved?: boolean
          created_at?: string
        }
      }
    }
  }
}