export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'client' | 'sabi' | 'admin'
          phone: string
          location: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'client' | 'sabi' | 'admin'
          phone?: string
          location?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'client' | 'sabi' | 'admin'
          phone?: string
          location?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sabi_profiles: {
        Row: {
          id: string
          user_id: string
          skills: string[]
          rating: number
          verified: boolean
          hourly_rate: number
          bio: string
          completed_jobs: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skills?: string[]
          rating?: number
          verified?: boolean
          hourly_rate?: number
          bio?: string
          completed_jobs?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skills?: string[]
          rating?: number
          verified?: boolean
          hourly_rate?: number
          bio?: string
          completed_jobs?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sabi_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      jobs: {
        Row: {
          id: string
          client_id: string
          sabi_id: string | null
          title: string
          description: string
          status: 'pending' | 'accepted' | 'completed' | 'cancelled'
          price: number
          scheduled_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          sabi_id?: string | null
          title: string
          description?: string
          status?: 'pending' | 'accepted' | 'completed' | 'cancelled'
          price?: number
          scheduled_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          sabi_id?: string | null
          title?: string
          description?: string
          status?: 'pending' | 'accepted' | 'completed' | 'cancelled'
          price?: number
          scheduled_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'jobs_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_sabi_id_fkey'
            columns: ['sabi_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      payments: {
        Row: {
          id: string
          job_id: string
          user_id: string
          amount: number // in Kobo
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method: 'paystack' | 'test'
          reference: string | null
          transaction_id: string | null
          metadata: Json | null
          failure_reason: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method?: 'paystack' | 'test'
          reference?: string | null
          transaction_id?: string | null
          metadata?: Json | null
          failure_reason?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method?: 'paystack' | 'test'
          reference?: string | null
          transaction_id?: string | null
          metadata?: Json | null
          failure_reason?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_job_id_fkey'
            columns: ['job_id']
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          job_id: string
          reviewer_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          reviewer_id: string
          rating: number
          comment?: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          reviewer_id?: string
          rating?: number
          comment?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_job_id_fkey'
            columns: ['job_id']
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_reviewer_id_fkey'
            columns: ['reviewer_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
