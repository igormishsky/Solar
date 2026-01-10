export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CustomerType = 'private' | 'business' | 'institutional';
export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type InstallationStage =
  | 'request_opened'
  | 'payment_processed'
  | 'department_response'
  | 'sync_compliance_request'
  | 'sync_request'
  | 'sync_complete'
  | 'commercial_activation'
  | 'standing_order_form';
export type ProfessionalType =
  | 'installing_company'
  | 'installing_contractor'
  | 'planner'
  | 'inspecting_electrician'
  | 'constructor';
export type UserRole = 'administrator' | 'manager' | 'office_staff' | 'field_technician' | 'viewer';
export type FormStatus = 'draft' | 'review' | 'signature_pending' | 'submitted' | 'approved' | 'rejected';
export type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'password_change';
export type AuditEntityType = 'customer' | 'project' | 'task' | 'professional' | 'form' | 'document' | 'user' | 'report';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          id_number: string | null;
          email: string | null;
          phone_primary: string;
          phone_secondary: string | null;
          customer_type: CustomerType;
          billing_method: string | null;
          residential_city: string | null;
          residential_street: string | null;
          residential_number: string | null;
          residential_apartment: string | null;
          residential_postal_code: string | null;
          property_city: string | null;
          property_street: string | null;
          property_number: string | null;
          property_apartment: string | null;
          property_postal_code: string | null;
          property_block: string | null;
          property_parcel: string | null;
          property_sub_parcel: string | null;
          property_lot: string | null;
          iec_contract_number: string | null;
          iec_order_number: string | null;
          iec_meter_number: string | null;
          iec_network_division: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          id_number?: string | null;
          email?: string | null;
          phone_primary: string;
          phone_secondary?: string | null;
          customer_type?: CustomerType;
          billing_method?: string | null;
          residential_city?: string | null;
          residential_street?: string | null;
          residential_number?: string | null;
          residential_apartment?: string | null;
          residential_postal_code?: string | null;
          property_city?: string | null;
          property_street?: string | null;
          property_number?: string | null;
          property_apartment?: string | null;
          property_postal_code?: string | null;
          property_block?: string | null;
          property_parcel?: string | null;
          property_sub_parcel?: string | null;
          property_lot?: string | null;
          iec_contract_number?: string | null;
          iec_order_number?: string | null;
          iec_meter_number?: string | null;
          iec_network_division?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          id_number?: string | null;
          email?: string | null;
          phone_primary?: string;
          phone_secondary?: string | null;
          customer_type?: CustomerType;
          billing_method?: string | null;
          residential_city?: string | null;
          residential_street?: string | null;
          residential_number?: string | null;
          residential_apartment?: string | null;
          residential_postal_code?: string | null;
          property_city?: string | null;
          property_street?: string | null;
          property_number?: string | null;
          property_apartment?: string | null;
          property_postal_code?: string | null;
          property_block?: string | null;
          property_parcel?: string | null;
          property_sub_parcel?: string | null;
          property_lot?: string | null;
          iec_contract_number?: string | null;
          iec_order_number?: string | null;
          iec_meter_number?: string | null;
          iec_network_division?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          description: string | null;
          status: ProjectStatus;
          current_stage: InstallationStage;
          system_size_kw: number | null;
          panel_count: number | null;
          inverter_model: string | null;
          estimated_annual_production: number | null;
          start_date: string | null;
          estimated_completion_date: string | null;
          actual_completion_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          name: string;
          description?: string | null;
          status?: ProjectStatus;
          current_stage?: InstallationStage;
          system_size_kw?: number | null;
          panel_count?: number | null;
          inverter_model?: string | null;
          estimated_annual_production?: number | null;
          start_date?: string | null;
          estimated_completion_date?: string | null;
          actual_completion_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          name?: string;
          description?: string | null;
          status?: ProjectStatus;
          current_stage?: InstallationStage;
          system_size_kw?: number | null;
          panel_count?: number | null;
          inverter_model?: string | null;
          estimated_annual_production?: number | null;
          start_date?: string | null;
          estimated_completion_date?: string | null;
          actual_completion_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      professionals: {
        Row: {
          id: string;
          professional_type: ProfessionalType;
          name: string;
          company_name: string | null;
          company_id: string | null;
          id_number: string | null;
          email: string | null;
          phone: string | null;
          license_type: string | null;
          license_number: string | null;
          license_expiry: string | null;
          license_document_url: string | null;
          is_electrician: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professional_type: ProfessionalType;
          name: string;
          company_name?: string | null;
          company_id?: string | null;
          id_number?: string | null;
          email?: string | null;
          phone?: string | null;
          license_type?: string | null;
          license_number?: string | null;
          license_expiry?: string | null;
          license_document_url?: string | null;
          is_electrician?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          professional_type?: ProfessionalType;
          name?: string;
          company_name?: string | null;
          company_id?: string | null;
          id_number?: string | null;
          email?: string | null;
          phone?: string | null;
          license_type?: string | null;
          license_number?: string | null;
          license_expiry?: string | null;
          license_document_url?: string | null;
          is_electrician?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string | null;
          customer_id: string | null;
          assigned_to: string | null;
          title: string;
          description: string | null;
          priority: TaskPriority;
          status: TaskStatus;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          customer_id?: string | null;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          customer_id?: string | null;
          assigned_to?: string | null;
          title?: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      forms: {
        Row: {
          id: string;
          project_id: string;
          form_type: string;
          form_name: string;
          form_name_he: string;
          status: FormStatus;
          required_signature: string | null;
          signed_by: string | null;
          signed_at: string | null;
          document_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          form_type: string;
          form_name: string;
          form_name_he: string;
          status?: FormStatus;
          required_signature?: string | null;
          signed_by?: string | null;
          signed_at?: string | null;
          document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          form_type?: string;
          form_name?: string;
          form_name_he?: string;
          status?: FormStatus;
          required_signature?: string | null;
          signed_by?: string | null;
          signed_at?: string | null;
          document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          project_id: string | null;
          customer_id: string | null;
          name: string;
          file_url: string;
          file_type: string | null;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          customer_id?: string | null;
          name: string;
          file_url: string;
          file_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          customer_id?: string | null;
          name?: string;
          file_url?: string;
          file_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      installation_stages: {
        Row: {
          id: string;
          project_id: string;
          stage: InstallationStage;
          completed: boolean;
          completed_at: string | null;
          completed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          stage: InstallationStage;
          completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          stage?: InstallationStage;
          completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      project_professionals: {
        Row: {
          id: string;
          project_id: string;
          professional_id: string;
          role: string | null;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          professional_id: string;
          role?: string | null;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          professional_id?: string;
          role?: string | null;
          assigned_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: AuditAction;
          entity_type: AuditEntityType;
          entity_id: string | null;
          old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: AuditAction;
          entity_type: AuditEntityType;
          entity_id?: string | null;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: AuditAction;
          entity_type?: AuditEntityType;
          entity_id?: string | null;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      customer_type: CustomerType;
      project_status: ProjectStatus;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      installation_stage: InstallationStage;
      professional_type: ProfessionalType;
      user_role: UserRole;
      form_status: FormStatus;
      audit_action: AuditAction;
      audit_entity_type: AuditEntityType;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
