export type ContactStatus = 'new' | 'read' | 'replied' | 'archived' | 'spam';

export type ConsultationStatus =
  | 'new'
  | 'contacted'
  | 'in_progress'
  | 'scheduled'
  | 'completed'
  | 'closed'
  | 'spam';

export interface OfficeHourItem {
  day: string;
  open?: string;
  close?: string;
  is_closed?: boolean;
}

export interface PracticeAreaOption {
  id: number;
  slug: string;
  title: Record<string, string> | string;
}

export interface PublicContactConfig {
  office_name: string | null;
  chamber_name: string | null;
  address: Record<string, string> | string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  office_hours: OfficeHourItem[] | Record<string, any> | string | null;
  map_url: string | null;
  map_embed_url: string | null;
  social_links: Record<string, string>;
  practice_areas: PracticeAreaOption[];
  legal_notice: {
    en: string;
    bn: string;
  };
}

export interface ContactMessage {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  practice_area?: {
    id: number;
    title: Record<string, string> | string;
  } | null;
  status: ContactStatus;
  created_at: string;
}

export interface ContactMessageDetail extends ContactMessage {
  message: string;
  practice_area_id: number | null;
  practice_area?: {
    id: number;
    title: Record<string, string> | string;
    slug?: string;
  } | null;
  consent_given: boolean;
  consented_at: string | null;
  admin_notes: string | null;
  updated_at: string;
}

export interface ConsultationRequest {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  practice_area?: {
    id: number;
    title: Record<string, string> | string;
  } | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: ConsultationStatus;
  created_at: string;
}

export interface ConsultationRequestDetail extends ConsultationRequest {
  message: string;
  practice_area_id: number | null;
  practice_area?: {
    id: number;
    title: Record<string, string> | string;
    slug?: string;
  } | null;
  consent_given: boolean;
  consented_at: string | null;
  admin_notes: string | null;
  updated_at: string;
}

export interface ContactFormPayload {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  practice_area_id?: number | null;
  message: string;
  consent: boolean;
  _honeypot?: string;
}

export interface ConsultationFormPayload {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  practice_area_id?: number | null;
  preferred_date?: string;
  preferred_time?: string;
  message: string;
  consent: boolean;
  _honeypot?: string;
}
