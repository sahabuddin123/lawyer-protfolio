import { z } from 'zod';

export const consultationSchema = z.object({
  name: z.string().min(2, { message: 'Full legal name must be at least 2 characters' }),
  phone: z
    .string()
    .min(10, { message: 'Please provide a valid direct telephone number' })
    .regex(/^[0-9+\s\-()]+$/, { message: 'Phone number format is invalid' }),
  email: z.string().email({ message: 'A valid email address is required' }),
  subject: z.string().min(5, { message: 'Please specify the subject or case title' }),
  practice_area_id: z.number().optional(),
  preferred_date: z.string().optional(),
  message: z.string().min(15, { message: 'Please provide a brief statement of dispute facts' }),
  _honeypot: z.string().max(0, { message: 'Spam detected' }).optional(),
});

export type ConsultationFormValues = z.infer<typeof consultationSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().min(10, { message: 'Phone number is required' }),
  email: z.string().email({ message: 'Valid email required' }).optional().or(z.literal('')),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
  _honeypot: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
