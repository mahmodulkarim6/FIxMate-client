export type Role = "customer" | "technician" | "admin";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export type ServiceMode = "Home Visit" | "Shop Drop-off";

export type Category =
  | "Smartphone"
  | "Laptop & PC"
  | "AC"
  | "Refrigerator"
  | "TV"
  | "Washing Machine"
  | "Electrical";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  plan?: "free" | "pro";
  planSince?: string | null;
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
  createdAt?: string | Date;
}

export interface Service {
  _id: string;
  title: string;
  category: Category;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  technicianImage?: string | null;
  technicianArea?: string | null;
  technicianBio?: string | null;
  technicianPlan?: "free" | "pro";
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: string;
  ratingAverage?: number;
  ratingCount?: number;
}

export interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: Category;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  statusHistory?: { status: BookingStatus; changedAt: string }[];
  rating?: number | null;
  review?: string | null;
  reviewedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface Payment {
  _id: string;
  type?: "booking" | "subscription";
  plan?: "pro" | null;
  bookingId?: string | null;
  technicianId?: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: string;
}

export interface AdminUser extends AppUser {
  bookings?: number;
}

export interface ServiceReview {
  _id: string;
  rating: number;
  review: string;
  reviewedAt: string;
  customerName: string;
}

export interface ServiceListResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerStats {
  totalRequests: number;
  activeJobs: number;
  completedJobs: number;
  totalSpent: number;
  statusBreakdown: { status: string; count: number }[];
  spendByMonth: { month: string; amount: number }[];
  recentBookings: Booking[];
}

export interface TechnicianStats {
  plan: "free" | "pro";
  serviceLimit: number | null;
  totalServices: number;
  approvedServices: number;
  pendingServices: number;
  pendingRequests: number;
  activeJobs: number;
  completedJobs: number;
  totalEarnings: number;
  statusBreakdown: { status: string; count: number }[];
  earningsByMonth: { month: string; amount: number }[];
  recentBookings: Booking[];
}

export interface AdminStats {
  totalUsers: number;
  totalTechnicians: number;
  totalProTechnicians?: number;
  totalCustomers: number;
  pendingServices: number;
  totalServices: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  revenueByMonth: { month: string; amount: number }[];
  bookingsByStatus: { status: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  recentBookings: Booking[];
}
