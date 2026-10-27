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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          delivery_address: string
          delivery_fee: number
          id: string
          notes: string
          payment_status: string
          phone: string
          product_name: string
          quantity: number
          request_id: string
          status: string
          supplier_id: string
          total: number
          unit: string
          unit_price: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          delivery_address: string
          delivery_fee: number
          id?: string
          notes?: string
          payment_status?: string
          phone: string
          product_name: string
          quantity: number
          request_id: string
          status?: string
          supplier_id: string
          total: number
          unit: string
          unit_price: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          delivery_address?: string
          delivery_fee?: number
          id?: string
          notes?: string
          payment_status?: string
          phone?: string
          product_name?: string
          quantity?: number
          request_id?: string
          status?: string
          supplier_id?: string
          total?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          name: string
          price: number
          stock: number
          supplier_id: string
          unit: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          name: string
          price: number
          stock?: number
          supplier_id: string
          unit: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          name?: string
          price?: number
          stock?: number
          supplier_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id: string
          location?: string
          name?: string
          phone?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          buyer_id: string
          created_at: string
          delivery_address: string
          id: string
          notes: string
          phone: string
          product_id: string
          product_name: string
          quantity: number
          status: string
          supplier_id: string
          unit: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          delivery_address: string
          id?: string
          notes?: string
          phone: string
          product_id: string
          product_name: string
          quantity: number
          status?: string
          supplier_id: string
          unit: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          delivery_address?: string
          id?: string
          notes?: string
          phone?: string
          product_id?: string
          product_name?: string
          quantity?: number
          status?: string
          supplier_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_responses: {
        Row: {
          created_at: string
          delivery_fee: number
          expires_at: string
          id: string
          notes: string
          request_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          expires_at: string
          id?: string
          notes?: string
          request_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          expires_at?: string
          id?: string
          notes?: string
          request_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_businesses: {
        Row: {
          business_name: string
          created_at: string
          id: string
          location: string
          reviewed_at: string | null
          reviewed_by: string | null
          verification_notes: string
          verification_status: string
        }
        Insert: {
          business_name: string
          created_at?: string
          id: string
          location: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          verification_notes?: string
          verification_status?: string
        }
        Update: {
          business_name?: string
          created_at?: string
          id?: string
          location?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          verification_notes?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_businesses_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role?: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decide_quote: {
        Args: { _accept: boolean; _request_id: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      register_supplier: {
        Args: { _location: string; _name: string }
        Returns: undefined
      }
      request_quote: {
        Args: {
          _address: string
          _notes?: string
          _phone: string
          _product_id: string
          _quantity: number
        }
        Returns: string
      }
      respond_quote: {
        Args: {
          _delivery_fee: number
          _expires_at: string
          _notes?: string
          _price: number
          _request_id: string
        }
        Returns: string
      }
      review_supplier: {
        Args: { _id: string; _notes?: string; _status: string }
        Returns: undefined
      }
      supplier_approved: { Args: { _id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
