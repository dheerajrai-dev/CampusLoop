export interface Campus {
  id: string;
  name: string;
  email_domain?: string | null;
  city?: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  campus_id: string;
  department?: string | null;
  course?: string | null;
  year_or_semester?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  is_verified: boolean;
  phone?: string | null;
  show_phone?: boolean;
  whatsapp?: string | null;
  show_whatsapp?: boolean;
  contact_note?: string | null;
  created_at: string;
  campus?: Campus;
}

export interface UserPublic {
  id: string;
  full_name: string;
  campus_id: string;
  department?: string | null;
  course?: string | null;
  year_or_semester?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  is_verified: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  contact_note?: string | null;
  created_at: string;
}

export interface ExploreItem {
  id: string;
  item_type: "request" | "listing" | "service";
  title: string;
  description: string;
  category: string;
  price_or_budget?: number | null;
  badge_label: string;
  badge_variant: "free" | "borrow" | "exchange" | "paid";
  status: string;
  created_at: string;
  creator?: UserPublic | null;
  extra: Record<string, any>;
}

export interface Offer {
  id: string;
  request_id: string;
  provider_id: string;
  message: string;
  proposed_price?: number | null;
  availability_note?: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  provider?: UserPublic | null;
  request_title?: string;
  request_category?: string;
  request_status?: string;
  requester_name?: string;
}

export interface RequestItem {
  id: string;
  requester_id: string;
  campus_id: string;
  title: string;
  description: string;
  category: string;
  request_type: "item" | "academic_help" | "task" | "campus_help" | "other";
  budget?: number | null;
  preferred_arrangement: "free" | "paid" | "exchange" | "any";
  deadline?: string | null;
  status: "open" | "assigned" | "in_progress" | "completed" | "cancelled" | "archived";
  assigned_provider_id?: string | null;
  accepted_offer_id?: string | null;
  created_at: string;
  updated_at: string;
  requester?: UserPublic | null;
  assigned_provider?: UserPublic | null;
  offers_count: number;
  offers: Offer[];
  match_score?: number | null;
  match_reasons?: string[];
}

export type Request = RequestItem;

export interface ListingImage {
  id: string;
  image_url: string;
  sort_order: number;
}

export interface ListingItem {
  id: string;
  owner_id: string;
  campus_id: string;
  title: string;
  description: string;
  category: string;
  listing_mode: "sell" | "lend" | "giveaway" | "exchange";
  price?: number | null;
  condition?: "new" | "like_new" | "good" | "fair" | null;
  pickup_area: string;
  availability_status: "available" | "reserved" | "unavailable" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  owner?: UserPublic | null;
  images: ListingImage[];
}

export interface ServiceItem {
  id: string;
  provider_id: string;
  campus_id: string;
  title: string;
  description: string;
  category: string;
  tags?: string | null;
  pricing_type: "free" | "fixed" | "hourly" | "negotiable";
  price?: number | null;
  availability_note?: string | null;
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
  provider?: UserPublic | null;
}

export interface Review {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  reviewer?: UserPublic | null;
}

export interface Transaction {
  id: string;
  request_id?: string | null;
  listing_id?: string | null;
  service_id?: string | null;
  offer_id?: string | null;
  requester_or_buyer_id: string;
  provider_or_owner_id: string;
  status: "accepted" | "in_progress" | "completed" | "cancelled";
  completion_confirmed_by_requester: boolean;
  completion_confirmed_by_provider: boolean;
  cancellation_reason?: string | null;
  cancelled_by_id?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  requester_or_buyer?: UserPublic | null;
  provider_or_owner?: UserPublic | null;
  reviews: Review[];
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  related_type: "request" | "listing" | "service" | "transaction";
  related_id: string;
  content: string;
  created_at: string;
  sender?: UserPublic | null;
  recipient?: UserPublic | null;
}

export interface UnifiedActivity {
  posted_requests: RequestItem[];
  offers_sent: Offer[];
  active_tasks: Transaction[];
  completed_tasks: Transaction[];
  cancelled_tasks: Transaction[];
  stats: {
    open_requests_count?: number;
    active_tasks_count?: number;
    pending_offers_count?: number;
    completed_tasks_count?: number;
    total_posted?: number;
    total_offers_sent?: number;
    active_tasks?: number;
    completed_tasks?: number;
    cancelled_tasks?: number;
    reputation_score?: number;
  };
}
