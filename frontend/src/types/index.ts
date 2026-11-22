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
  status: "open" | "assigned" | "completed" | "cancelled" | "archived";
  created_at: string;
  updated_at: string;
  requester?: UserPublic | null;
  offers_count: number;
  offers: Offer[];
}

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
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  requester_or_buyer?: UserPublic | null;
  provider_or_owner?: UserPublic | null;
  reviews: Review[];
}
