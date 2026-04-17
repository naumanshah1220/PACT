export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_initials: string
          gold_balance: number
          honor_score: number
          is_banned: boolean
          banned_until: string | null
          newbie_day: number
          player_number: number | null
          last_daily_gold_at: string | null
          honorific: 'Sir' | 'Lady' | null
          is_bot: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_initials: string
          gold_balance?: number
          honor_score?: number
          is_banned?: boolean
          banned_until?: string | null
          newbie_day?: number
          player_number?: number | null
          last_daily_gold_at?: string | null
          honorific?: 'Sir' | 'Lady' | null
          is_bot?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_initials?: string
          gold_balance?: number
          honor_score?: number
          is_banned?: boolean
          banned_until?: string | null
          newbie_day?: number
          player_number?: number | null
          last_daily_gold_at?: string | null
          honorific?: 'Sir' | 'Lady' | null
          is_bot?: boolean
          created_at?: string
        }
      }
      wagers: {
        Row: {
          id: string
          poster_id: string
          gold_amount: number
          timer_minutes: number
          status: 'open' | 'active' | 'completed' | 'cancelled'
          spectators_allowed: boolean
          practice: boolean
          created_at: string
        }
        Insert: {
          id?: string
          poster_id: string
          gold_amount: number
          timer_minutes: number
          status?: 'open' | 'active' | 'completed' | 'cancelled'
          spectators_allowed?: boolean
          practice?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          poster_id?: string
          gold_amount?: number
          timer_minutes?: number
          status?: 'open' | 'active' | 'completed' | 'cancelled'
          spectators_allowed?: boolean
          practice?: boolean
          created_at?: string
        }
      }
      duels: {
        Row: {
          id: string
          wager_id: string
          player1_id: string
          player2_id: string
          player1_decision: 'pledge' | 'betray' | null
          player2_decision: 'pledge' | 'betray' | null
          player1_messaged: boolean
          player2_messaged: boolean
          deadline: string
          status: 'active' | 'completed' | 'void'
          outcome: 'both_pledge' | 'both_betray' | 'p1_betray' | 'p2_betray' | 'p1_silent' | 'p2_silent' | 'both_silent' | null
          seal_requested_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wager_id: string
          player1_id: string
          player2_id: string
          player1_decision?: 'pledge' | 'betray' | null
          player2_decision?: 'pledge' | 'betray' | null
          player1_messaged?: boolean
          player2_messaged?: boolean
          deadline: string
          status?: 'active' | 'completed' | 'void'
          outcome?: 'both_pledge' | 'both_betray' | 'p1_betray' | 'p2_betray' | 'p1_silent' | 'p2_silent' | 'both_silent' | null
          seal_requested_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wager_id?: string
          player1_id?: string
          player2_id?: string
          player1_decision?: 'pledge' | 'betray' | null
          player2_decision?: 'pledge' | 'betray' | null
          player1_messaged?: boolean
          player2_messaged?: boolean
          deadline?: string
          status?: 'active' | 'completed' | 'void'
          outcome?: 'both_pledge' | 'both_betray' | 'p1_betray' | 'p2_betray' | 'p1_silent' | 'p2_silent' | 'both_silent' | null
          seal_requested_by?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          duel_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          duel_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          duel_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      alms_donations: {
        Row: {
          id: string
          donor_id: string
          recipient_id: string
          gold_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          recipient_id: string
          gold_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          recipient_id?: string
          gold_amount?: number
          created_at?: string
        }
      }
      alms_requests: {
        Row: {
          id: string
          requester_id: string
          gold_amount: number
          message: string | null
          status: 'open' | 'fulfilled' | 'cancelled'
          fulfilled_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          gold_amount: number
          message?: string | null
          status?: 'open' | 'fulfilled' | 'cancelled'
          fulfilled_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          gold_amount?: number
          message?: string | null
          status?: 'open' | 'fulfilled' | 'cancelled'
          fulfilled_by?: string | null
          created_at?: string
        }
      }
      hoard: {
        Row: { id: string; balance: number }
        Insert: { id?: string; balance?: number }
        Update: { id?: string; balance?: number }
      }
      hoard_announcements: {
        Row: {
          id: string
          message: string
          gold_added: number
          dismissed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          message: string
          gold_added?: number
          dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          message?: string
          gold_added?: number
          dismissed?: boolean
          created_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type UserRow = Database['public']['Tables']['users']['Row']
export type WagerRow = Database['public']['Tables']['wagers']['Row']
export type DuelRow = Database['public']['Tables']['duels']['Row']
export type MessageRow = Database['public']['Tables']['messages']['Row']
export type AlmsDonationRow = Database['public']['Tables']['alms_donations']['Row']
export type AlmsRequestRow = Database['public']['Tables']['alms_requests']['Row']
export type HoardRow = Database['public']['Tables']['hoard']['Row']
export type HoardAnnouncementRow = Database['public']['Tables']['hoard_announcements']['Row']

export type WagerWithUser = WagerRow & { users: UserRow }
export type DuelWithUsers = DuelRow & {
  wagers: WagerRow
  player1: UserRow
  player2: UserRow
}
export type MessageWithUser = MessageRow & { users: UserRow }
export type AlmsRequestWithUser = AlmsRequestRow & {
  requester: UserRow
  fulfiller: UserRow | null
}

export type SpectatableDuel = {
  duelId: string
  wagerId: string
  goldAmount: number
  spectators_allowed: boolean
  practice: boolean
  poster: { username: string; display_initials: string }
  p1: { username: string; display_initials: string }
  p2: { username: string; display_initials: string }
}
