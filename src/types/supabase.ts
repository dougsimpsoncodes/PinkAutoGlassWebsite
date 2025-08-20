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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      leads: {
        Row: {
          acquisition_channel: string | null
          address: string | null
          city: string | null
          client_id: string | null
          created_at: string | null
          email: string | null
          email_consent: boolean | null
          estimated_cost: number | null
          fbclid: string | null
          first_name: string | null
          first_touch: Json | null
          gclid: string | null
          id: string
          ip_address: string | null
          last_name: string | null
          last_touch: Json | null
          mobile_service: boolean
          notes: string | null
          phone: string | null
          phone_e164: string | null
          preferred_date: string | null
          privacy_acknowledgment: boolean
          reference_number: string | null
          referral_code: string | null
          service_type: Database["public"]["Enums"]["service_type_enum"]
          session_id: string | null
          sms_consent: boolean | null
          source: string | null
          state: string | null
          status: string
          submitted_at: string | null
          terms_accepted: boolean
          time_preference: Database["public"]["Enums"]["time_preference"]
          user_agent: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_year: string | null
          vin: string | null
          zip: string | null
        }
        Insert: {
          acquisition_channel?: string | null
          address?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          email_consent?: boolean | null
          estimated_cost?: number | null
          fbclid?: string | null
          first_name?: string | null
          first_touch?: Json | null
          gclid?: string | null
          id?: string
          ip_address?: string | null
          last_name?: string | null
          last_touch?: Json | null
          mobile_service?: boolean
          notes?: string | null
          phone?: string | null
          phone_e164?: string | null
          preferred_date?: string | null
          privacy_acknowledgment?: boolean
          reference_number?: string | null
          referral_code?: string | null
          service_type: Database["public"]["Enums"]["service_type_enum"]
          session_id?: string | null
          sms_consent?: boolean | null
          source?: string | null
          state?: string | null
          status?: string
          submitted_at?: string | null
          terms_accepted?: boolean
          time_preference?: Database["public"]["Enums"]["time_preference"]
          user_agent?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
          vin?: string | null
          zip?: string | null
        }
        Update: {
          acquisition_channel?: string | null
          address?: string | null
          city?: string | null
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          email_consent?: boolean | null
          estimated_cost?: number | null
          fbclid?: string | null
          first_name?: string | null
          first_touch?: Json | null
          gclid?: string | null
          id?: string
          ip_address?: string | null
          last_name?: string | null
          last_touch?: Json | null
          mobile_service?: boolean
          notes?: string | null
          phone?: string | null
          phone_e164?: string | null
          preferred_date?: string | null
          privacy_acknowledgment?: boolean
          reference_number?: string | null
          referral_code?: string | null
          service_type?: Database["public"]["Enums"]["service_type_enum"]
          session_id?: string | null
          sms_consent?: boolean | null
          source?: string | null
          state?: string | null
          status?: string
          submitted_at?: string | null
          terms_accepted?: boolean
          time_preference?: Database["public"]["Enums"]["time_preference"]
          user_agent?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_year?: string | null
          vin?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          alt?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          alt?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
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
      lead_status: "new" | "contacted" | "scheduled" | "completed" | "cancelled"
      service_type: "repair" | "replacement"
      service_type_enum: "repair" | "replacement"
      time_preference: "morning" | "afternoon" | "flexible"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      lead_status: ["new", "contacted", "scheduled", "completed", "cancelled"],
      service_type: ["repair", "replacement"],
      service_type_enum: ["repair", "replacement"],
      time_preference: ["morning", "afternoon", "flexible"],
    },
  },
} as const
