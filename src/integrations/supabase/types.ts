export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string
          end_datetime: string
          id: string
          pr_profile_id: string
          start_datetime: string
          status: string
        }
        Insert: {
          created_at?: string
          end_datetime: string
          id?: string
          pr_profile_id: string
          start_datetime: string
          status?: string
        }
        Update: {
          created_at?: string
          end_datetime?: string
          id?: string
          pr_profile_id?: string
          start_datetime?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_pr_profile_id_fkey"
            columns: ["pr_profile_id"]
            isOneToOne: false
            referencedRelation: "pr_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          dress_code: string | null
          end_datetime: string
          id: string
          job_detail: string | null
          location: string | null
          note: string | null
          pr_profile_id: string
          price_estimate: number
          shop_id: string
          start_datetime: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dress_code?: string | null
          end_datetime: string
          id?: string
          job_detail?: string | null
          location?: string | null
          note?: string | null
          pr_profile_id: string
          price_estimate?: number
          shop_id: string
          start_datetime: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dress_code?: string | null
          end_datetime?: string
          id?: string
          job_detail?: string | null
          location?: string | null
          note?: string | null
          pr_profile_id?: string
          price_estimate?: number
          shop_id?: string
          start_datetime?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_pr_profile_id_fkey"
            columns: ["pr_profile_id"]
            isOneToOne: false
            referencedRelation: "pr_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      pr_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          display_name: string
          experience_years: number
          gender: string | null
          hourly_rate: number
          id: string
          job_types: string[]
          languages: string[]
          profile_status: string
          rating_average: number
          rating_count: number
          service_areas: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name: string
          experience_years?: number
          gender?: string | null
          hourly_rate?: number
          id?: string
          job_types?: string[]
          languages?: string[]
          profile_status?: string
          rating_average?: number
          rating_count?: number
          service_areas?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string
          experience_years?: number
          gender?: string | null
          hourly_rate?: number
          id?: string
          job_types?: string[]
          languages?: string[]
          profile_status?: string
          rating_average?: number
          rating_count?: number
          service_areas?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          category: string
          created_at: string
          detail: string | null
          id: string
          reporter_user_id: string
          status: string
          target_id: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          detail?: string | null
          id?: string
          reporter_user_id: string
          status?: string
          target_id?: string | null
          target_type: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          detail?: string | null
          id?: string
          reporter_user_id?: string
          status?: string
          target_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          pr_profile_id: string | null
          rating: number
          reviewer_user_id: string
          shop_id: string | null
          target_type: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          pr_profile_id?: string | null
          rating: number
          reviewer_user_id: string
          shop_id?: string | null
          target_type: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          pr_profile_id?: string | null
          rating?: number
          reviewer_user_id?: string
          shop_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_pr_profile_id_fkey"
            columns: ["pr_profile_id"]
            isOneToOne: false
            referencedRelation: "pr_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          close_time: string | null
          contact_name: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          district: string | null
          email: string | null
          id: string
          license_no: string | null
          open_time: string | null
          phone: string | null
          province: string | null
          shop_name: string
          shop_type: string
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          address?: string | null
          close_time?: string | null
          contact_name?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          email?: string | null
          id?: string
          license_no?: string | null
          open_time?: string | null
          phone?: string | null
          province?: string | null
          shop_name: string
          shop_type?: string
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          address?: string | null
          close_time?: string | null
          contact_name?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          email?: string | null
          id?: string
          license_no?: string | null
          open_time?: string | null
          phone?: string | null
          province?: string | null
          shop_name?: string
          shop_type?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_pr_profile: { Args: { _pr_id: string }; Returns: boolean }
      owns_shop: { Args: { _shop_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "shop" | "pr" | "agency" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["shop", "pr", "agency", "admin"],
    },
  },
} as const
