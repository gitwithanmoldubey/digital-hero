export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_status: 'active' | 'inactive' | 'lapsed';
  stripe_customer_id: string | null;
  charity_id: string | null;
  charity_percentage: number;
  created_at: string;
};

export type Score = {
  id: string;
  user_id: string;
  score: number;
  date: string;
  created_at: string;
};

export type Charity = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  website_url: string;
  is_featured: boolean;
};

export type Draw = {
  id: string;
  month: number;
  year: number;
  winning_numbers: number[];
  is_published: boolean;
  jackpot_rollover: number;
  created_at: string;
};

export type Winner = {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: 3 | 4 | 5;
  prize_amount: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  proof_url: string | null;
  payout_status: 'pending' | 'paid';
  created_at: string;
};
