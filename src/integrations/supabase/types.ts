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
      achievement_templates: {
        Row: {
          achievement_type: string
          badge_icon: string | null
          created_at: string | null
          criteria: Json
          description: string
          id: string
          is_active: boolean | null
          points_reward: number | null
          title: string
        }
        Insert: {
          achievement_type: string
          badge_icon?: string | null
          created_at?: string | null
          criteria: Json
          description: string
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          title: string
        }
        Update: {
          achievement_type?: string
          badge_icon?: string | null
          created_at?: string | null
          criteria?: Json
          description?: string
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          title?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          achievement_type: string
          badge_url: string | null
          description: string | null
          earned_at: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          badge_url?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          badge_url?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          session_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          session_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          session_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          properties: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          properties?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          properties?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_leaderboards: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          rank: number | null
          score: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          rank?: number | null
          score?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          rank?: number | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_leaderboards_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "eco_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participations: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          current_progress: number | null
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          current_progress?: number | null
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "eco_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          created_at: string | null
          id: string
          participation_id: string
          photo_urls: Json | null
          submission_location_address: string | null
          submission_location_lat: number | null
          submission_location_lng: number | null
          submission_text: string | null
          updated_at: string | null
          user_id: string
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          id?: string
          participation_id: string
          photo_urls?: Json | null
          submission_location_address?: string | null
          submission_location_lat?: number | null
          submission_location_lng?: number | null
          submission_text?: string | null
          updated_at?: string | null
          user_id: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          id?: string
          participation_id?: string
          photo_urls?: Json | null
          submission_location_address?: string | null
          submission_location_lat?: number | null
          submission_location_lng?: number | null
          submission_text?: string | null
          updated_at?: string | null
          user_id?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "eco_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_participation_id_fkey"
            columns: ["participation_id"]
            isOneToOne: false
            referencedRelation: "challenge_participations"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "eco_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          enrollment_id: string
          id: string
          module_id: string
          score: number | null
          time_spent_minutes: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          module_id: string
          score?: number | null
          time_spent_minutes?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          module_id?: string
          score?: number | null
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_actions: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          points_earned: number | null
          status: string | null
          title: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          points_earned?: number | null
          status?: string | null
          title: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          points_earned?: number | null
          status?: string | null
          title?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      eco_challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          location_radius_km: number | null
          points_reward: number | null
          requires_location_verification: boolean | null
          start_date: string | null
          target_value: number | null
          title: string
          verification_photos_required: boolean | null
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_radius_km?: number | null
          points_reward?: number | null
          requires_location_verification?: boolean | null
          start_date?: string | null
          target_value?: number | null
          title: string
          verification_photos_required?: boolean | null
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_radius_km?: number | null
          points_reward?: number | null
          requires_location_verification?: boolean | null
          start_date?: string | null
          target_value?: number | null
          title?: string
          verification_photos_required?: boolean | null
        }
        Relationships: []
      }
      eco_courses: {
        Row: {
          category: string
          content: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          points_reward: number | null
          title: string
        }
        Insert: {
          category: string
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          points_reward?: number | null
          title: string
        }
        Update: {
          category?: string
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          points_reward?: number | null
          title?: string
        }
        Relationships: []
      }
      eco_pets: {
        Row: {
          created_at: string | null
          energy: number | null
          experience_points: number | null
          growth: number | null
          health: number | null
          id: string
          last_fed_at: string | null
          level: number | null
          name: string
          species: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          energy?: number | null
          experience_points?: number | null
          growth?: number | null
          health?: number | null
          id?: string
          last_fed_at?: string | null
          level?: number | null
          name?: string
          species?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          energy?: number | null
          experience_points?: number | null
          growth?: number | null
          health?: number | null
          id?: string
          last_fed_at?: string | null
          level?: number | null
          name?: string
          species?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      eco_tips: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          difficulty_level: string | null
          estimated_impact: string | null
          id: string
          is_active: boolean | null
          points_value: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          estimated_impact?: string | null
          id?: string
          is_active?: boolean | null
          points_value?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          estimated_impact?: string | null
          id?: string
          is_active?: boolean | null
          points_value?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          bucket_name: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_public: boolean | null
          mime_type: string | null
          purpose: string
          related_entity_id: string | null
          user_id: string
        }
        Insert: {
          bucket_name: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          purpose: string
          related_entity_id?: string | null
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          purpose?: string
          related_entity_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          calculated_at: string | null
          category: string
          id: string
          period: string
          rank: number | null
          score: number
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          category: string
          id?: string
          period?: string
          rank?: number | null
          score?: number
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          category?: string
          id?: string
          period?: string
          rank?: number | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          eco_score: number | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          school_name: string | null
          state: string | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          eco_score?: number | null
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          school_name?: string | null
          state?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          eco_score?: number | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          school_name?: string | null
          state?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          actions_taken: number | null
          device_info: Json | null
          duration_minutes: number | null
          id: string
          pages_visited: Json | null
          session_end: string | null
          session_start: string | null
          user_id: string
        }
        Insert: {
          actions_taken?: number | null
          device_info?: Json | null
          duration_minutes?: number | null
          id?: string
          pages_visited?: Json | null
          session_end?: string | null
          session_start?: string | null
          user_id: string
        }
        Update: {
          actions_taken?: number | null
          device_info?: Json | null
          duration_minutes?: number | null
          id?: string
          pages_visited?: Json | null
          session_end?: string | null
          session_start?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_leaderboard_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_and_award_achievements: {
        Args: { _user_id: string }
        Returns: undefined
      }
      create_notification: {
        Args: {
          _action_url?: string
          _message: string
          _metadata?: Json
          _title: string
          _type?: string
          _user_id: string
        }
        Returns: string
      }
      create_welcome_notification: {
        Args: { _user_id: string }
        Returns: undefined
      }
      end_user_session: {
        Args: { _session_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      schedule_leaderboard_update: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      start_user_session: {
        Args: { _device_info?: Json; _user_id: string }
        Returns: string
      }
      update_eco_pet_stats: {
        Args: { _points: number; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "student"
        | "teacher"
        | "ngo"
        | "institution"
        | "admin"
        | "other"
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
      app_role: ["student", "teacher", "ngo", "institution", "admin", "other"],
    },
  },
} as const
