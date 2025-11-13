import { createClient } from '@/utils/supabase/client';

export type Donation = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  amount: number;
  message: string | null;
  transaction_id: string;
  payment_method: string;
  mpesa_receipt: string | null;
  bank_reference: string | null;
  card_last_four: string | null;
  payment_status: string;
  currency: string;
  payment_gateway: string | null;
  created_at: string;
  updated_at: string;
}

export type DonationStats = {
  total_donations: number;
  total_amount: number;
  completed_donations: number;
  pending_donations: number;
  average_donation: number;
}

export async function getDonations(): Promise<Donation[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching donations:', error);
    return [];
  }

  return data || [];
}

export async function getDonationStats(): Promise<DonationStats> {
  const supabase = createClient();
  
  // Get total donations and amount
  const { data: totalData, error: totalError } = await supabase
    .from('donations')
    .select('amount, payment_status');

  if (totalError) {
    console.error('Error fetching donation stats:', totalError);
    return {
      total_donations: 0,
      total_amount: 0,
      completed_donations: 0,
      pending_donations: 0,
      average_donation: 0
    };
  }

  const total_donations = totalData.length;
  const total_amount = totalData.reduce((sum, donation) => sum + donation.amount, 0);
  const completed_donations = totalData.filter(d => d.payment_status === 'completed').length;
  const pending_donations = totalData.filter(d => d.payment_status === 'pending').length;
  const average_donation = total_donations > 0 ? total_amount / total_donations : 0;

  return {
    total_donations,
    total_amount,
    completed_donations,
    pending_donations,
    average_donation
  };
}

export async function deleteDonation(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting donation:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
