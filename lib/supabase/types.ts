export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          invite_code: string
          admin_user_id: string
          locked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          admin_user_id: string
          locked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          admin_user_id?: string
          locked?: boolean
          created_at?: string
        }
      }
      room_members: {
        Row: {
          id: string
          room_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      contestants: {
        Row: {
          id: string
          country: string
          artist: string
          song: string
          flag_emoji: string
          photo_url: string | null
          running_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          country: string
          artist: string
          song: string
          flag_emoji: string
          photo_url?: string | null
          running_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          country?: string
          artist?: string
          song?: string
          flag_emoji?: string
          photo_url?: string | null
          running_order?: number | null
          created_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          room_id: string
          rank: number
          contestant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          rank: number
          contestant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          rank?: number
          contestant_id?: string
          created_at?: string
        }
      }
      favourites: {
        Row: {
          id: string
          user_id: string
          room_id: string
          contestant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          contestant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          contestant_id?: string
          created_at?: string
        }
      }
      results: {
        Row: {
          id: string
          room_id: string
          rank: number
          contestant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          rank: number
          contestant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          rank?: number
          contestant_id?: string
          created_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          room_id: string
          total_score: number
          exact_matches: number
          in_top10: number
          computed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          total_score: number
          exact_matches: number
          in_top10: number
          computed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          total_score?: number
          exact_matches?: number
          in_top10?: number
          computed_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type RoomMember = Database['public']['Tables']['room_members']['Row']
export type Contestant = Database['public']['Tables']['contestants']['Row']
export type Prediction = Database['public']['Tables']['predictions']['Row']
export type Favourite = Database['public']['Tables']['favourites']['Row']
export type Result = Database['public']['Tables']['results']['Row']
export type Score = Database['public']['Tables']['scores']['Row']
