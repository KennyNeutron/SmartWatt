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
      devices: {
        Row: {
          id: string
          owner_user_id: string
          manufacturer_id: string
          hostname_id: string
          label: string | null
          location: string | null
          timezone: string | null
          is_online: boolean
          last_seen_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          manufacturer_id: string
          hostname_id: string
          label?: string | null
          location?: string | null
          timezone?: string | null
          is_online?: boolean
          last_seen_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          manufacturer_id?: string
          hostname_id?: string
          label?: string | null
          location?: string | null
          timezone?: string | null
          is_online?: boolean
          last_seen_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      device_readings: {
        Row: {
          id: string
          device_id: string
          recorded_at: string
          grid_kwh: number
          solar_kwh: number
          current_source: string
          voltage_v: number
          current_a: number
          power_w: number
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          recorded_at?: string
          grid_kwh: number
          solar_kwh: number
          current_source: string
          voltage_v: number
          current_a: number
          power_w: number
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          recorded_at?: string
          grid_kwh?: number
          solar_kwh?: number
          current_source?: string
          voltage_v?: number
          current_a?: number
          power_w?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_readings_device_id_fkey"
            columns: ["device_id"]
            referencedRelation: "devices"
            referencedColumns: ["id"]
          }
        ]
      }
      source_switch_events: {
        Row: {
          id: string
          device_id: string
          occurred_at: string
          from_source: string
          to_source: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          occurred_at?: string
          from_source: string
          to_source: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          occurred_at?: string
          from_source?: string
          to_source?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_switch_events_device_id_fkey"
            columns: ["device_id"]
            referencedRelation: "devices"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_usage: {
        Row: {
          id: string
          device_id: string
          day: string
          total_kwh: number
          grid_kwh: number
          solar_kwh: number
          limit_kwh: number | null
          over_limit: boolean
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          day: string
          total_kwh: number
          grid_kwh: number
          solar_kwh: number
          limit_kwh?: number | null
          over_limit?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          day?: string
          total_kwh?: number
          grid_kwh?: number
          solar_kwh?: number
          limit_kwh?: number | null
          over_limit?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_usage_device_id_fkey"
            columns: ["device_id"]
            referencedRelation: "devices"
            referencedColumns: ["id"]
          }
        ]
      }
      device_config: {
        Row: {
          id: string
          device_id: string
          daily_limit_kwh: number
          limit_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          device_id: string
          daily_limit_kwh: number
          limit_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          daily_limit_kwh?: number
          limit_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_config_device_id_fkey"
            columns: ["device_id"]
            referencedRelation: "devices"
            referencedColumns: ["id"]
          }
        ]
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          device_id: string | null
          type: string
          message: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          device_id?: string | null
          type: string
          message: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          device_id?: string | null
          type?: string
          message?: string
          created_at?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_device_id_fkey"
            columns: ["device_id"]
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
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
