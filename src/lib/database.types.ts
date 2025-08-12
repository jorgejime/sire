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
      profiles: {
        Row: {
          id: string
          email: string
          role: 'student' | 'coordinator' | 'admin' | 'counselor'
          full_name: string
          department: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'student' | 'coordinator' | 'admin' | 'counselor'
          full_name: string
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'student' | 'coordinator' | 'admin' | 'counselor'
          full_name?: string
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          user_id: string | null
          student_code: string
          career: string
          semester: number | null
          gpa: number | null
          credits_completed: number | null
          credits_enrolled: number | null
          enrollment_date: string
          expected_graduation: string | null
          status: 'active' | 'inactive' | 'graduated' | 'dropped'
          emergency_contact: Json | null
          academic_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          student_code: string
          career: string
          semester?: number | null
          gpa?: number | null
          credits_completed?: number | null
          credits_enrolled?: number | null
          enrollment_date: string
          expected_graduation?: string | null
          status?: 'active' | 'inactive' | 'graduated' | 'dropped'
          emergency_contact?: Json | null
          academic_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          student_code?: string
          career?: string
          semester?: number | null
          gpa?: number | null
          credits_completed?: number | null
          credits_enrolled?: number | null
          enrollment_date?: string
          expected_graduation?: string | null
          status?: 'active' | 'inactive' | 'graduated' | 'dropped'
          emergency_contact?: Json | null
          academic_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      alerts: {
        Row: {
          id: string
          student_id: string
          created_by: string | null
          alert_type: 'academic' | 'attendance' | 'behavioral' | 'financial' | 'technical'
          severity: 'low' | 'medium' | 'high' | 'critical'
          title: string
          message: string
          is_resolved: boolean
          resolved_by: string | null
          resolved_at: string | null
          due_date: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          created_by?: string | null
          alert_type: 'academic' | 'attendance' | 'behavioral' | 'financial' | 'technical'
          severity: 'low' | 'medium' | 'high' | 'critical'
          title: string
          message: string
          is_resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          due_date?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          created_by?: string | null
          alert_type?: 'academic' | 'attendance' | 'behavioral' | 'financial' | 'technical'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          title?: string
          message?: string
          is_resolved?: boolean
          resolved_by?: string | null
          resolved_at?: string | null
          due_date?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      predictions: {
        Row: {
          id: string
          student_id: string
          risk_score: number | null
          risk_factors: Json | null
          recommendations: Json | null
          confidence_level: number | null
          model_version: string | null
          prediction_date: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          risk_score?: number | null
          risk_factors?: Json | null
          recommendations?: Json | null
          confidence_level?: number | null
          model_version?: string | null
          prediction_date?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          risk_score?: number | null
          risk_factors?: Json | null
          recommendations?: Json | null
          confidence_level?: number | null
          model_version?: string | null
          prediction_date?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "predictions_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_student_risk_score: {
        Args: {
          student_uuid: string
        }
        Returns: number
      }
      update_student_predictions: {
        Args: {}
        Returns: void
      }
    }
    Enums: {
      user_role: 'student' | 'coordinator' | 'admin' | 'counselor'
      student_status: 'active' | 'inactive' | 'graduated' | 'dropped'
      alert_type: 'academic' | 'attendance' | 'behavioral' | 'financial' | 'technical'
      severity_level: 'low' | 'medium' | 'high' | 'critical'
      intervention_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Helper types for application use
export type Profile = Tables<'profiles'>
export type Student = Tables<'students'>
export type Alert = Tables<'alerts'>
export type Prediction = Tables<'predictions'>
export type Intervention = Tables<'interventions'>
export type ChatConversation = Tables<'chat_conversations'>

export type UserRole = Database['public']['Enums']['user_role']
export type StudentStatus = Database['public']['Enums']['student_status']
export type AlertType = Database['public']['Enums']['alert_type']
export type SeverityLevel = Database['public']['Enums']['severity_level']
export type InterventionStatus = Database['public']['Enums']['intervention_status']
