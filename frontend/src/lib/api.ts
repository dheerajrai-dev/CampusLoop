import {
  Campus,
  User,
  ExploreItem,
  RequestItem,
  Offer,
  ListingItem,
  ServiceItem,
  Transaction,
  Review,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("campusloop_token");
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Ignore JSON parse errors on non-200 responses
    }
    throw new ApiError(response.status, errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth & Campuses
  getCampuses: () => request<Campus[]>("/auth/campuses"),
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: any) =>
    request<{ access_token: string; token_type: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () => request<User>("/auth/me"),
  updateMe: (data: Partial<User>) =>
    request<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getUserProfile: (userId: string) =>
    request<{ user: User; stats: { total_reviews: number; average_rating: number; completed_exchanges: number } }>(
      `/users/${userId}`
    ),
  getUserReviews: (userId: string) => request<Review[]>(`/users/${userId}/reviews`),
  blockUser: (userId: string) =>
    request<{ message: string }>(`/users/${userId}/block`, { method: "POST" }),

  // Explore
  getExplore: (params: { type?: string; category?: string; q?: string; campus_id?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.category) query.set("category", params.category);
    if (params.q) query.set("q", params.q);
    if (params.campus_id) query.set("campus_id", params.campus_id);
    return request<ExploreItem[]>(`/explore?${query.toString()}`);
  },

  // Requests
  getRequests: (params: { category?: string; q?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.q) query.set("q", params.q);
    if (params.status) query.set("status", params.status);
    return request<RequestItem[]>(`/requests?${query.toString()}`);
  },
  getRequest: (id: string) => request<RequestItem>(`/requests/${id}`),
  createRequest: (data: Partial<RequestItem>) =>
    request<RequestItem>("/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRequest: (id: string, data: Partial<RequestItem>) =>
    request<RequestItem>(`/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  submitOffer: (requestId: string, data: { message: string; proposed_price?: number; availability_note?: string }) =>
    request<Offer>(`/requests/${requestId}/offers`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  acceptOffer: (offerId: string) =>
    request<Offer>(`/requests/offers/${offerId}/accept`, {
      method: "PATCH",
    }),
  rejectOffer: (offerId: string) =>
    request<Offer>(`/requests/offers/${offerId}/reject`, {
      method: "PATCH",
    }),
  withdrawOffer: (offerId: string) =>
    request<Offer>(`/requests/offers/${offerId}/withdraw`, {
      method: "PATCH",
    }),

  // Listings (Marketplace)
  getListings: (params: { category?: string; listing_mode?: string; q?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.listing_mode) query.set("listing_mode", params.listing_mode);
    if (params.q) query.set("q", params.q);
    if (params.status) query.set("status", params.status);
    return request<ListingItem[]>(`/listings?${query.toString()}`);
  },
  getListing: (id: string) => request<ListingItem>(`/listings/${id}`),
  createListing: (data: Partial<ListingItem> & { image_urls?: string[] }) =>
    request<ListingItem>("/listings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  archiveListing: (id: string) =>
    request<{ message: string }>(`/listings/${id}`, {
      method: "DELETE",
    }),

  // Services
  getServices: (params: { category?: string; pricing_type?: string; q?: string; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.pricing_type) query.set("pricing_type", params.pricing_type);
    if (params.q) query.set("q", params.q);
    if (params.status) query.set("status", params.status);
    return request<ServiceItem[]>(`/services?${query.toString()}`);
  },
  getService: (id: string) => request<ServiceItem>(`/services/${id}`),
  createService: (data: Partial<ServiceItem>) =>
    request<ServiceItem>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  archiveService: (id: string) =>
    request<{ message: string }>(`/services/${id}`, {
      method: "DELETE",
    }),

  // Transactions & Reviews
  getMyTransactions: () => request<Transaction[]>("/transactions/me"),
  getTransaction: (id: string) => request<Transaction>(`/transactions/${id}`),
  updateTransactionStatus: (id: string, status: string) =>
    request<Transaction>(`/transactions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  confirmCompletion: (id: string) =>
    request<Transaction>(`/transactions/${id}/confirm-completion`, {
      method: "POST",
    }),
  createReview: (transactionId: string, data: { rating: number; comment?: string }) =>
    request<Review>(`/transactions/${transactionId}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Moderation
  reportItem: (data: { target_type: string; target_id: string; reason: string; details?: string }) =>
    request("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
