// Groove Records — API Configuration
// Central API base URL for all microservices through the Gateway

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8080'  // Docker gateway on port 8080
  : '';                      // Production: same domain

export const API = {
  // Auth Service
  auth: {
    login: `${API_BASE}/api/auth/login`,
    register: `${API_BASE}/api/auth/register`,
    sendRegisterOTP: `${API_BASE}/api/auth/send-register-otp`,
    verifyRegisterOTP: `${API_BASE}/api/auth/verify-register-otp`,
    sendForgotOTP: `${API_BASE}/api/auth/send-forgot-otp`,
    verifyForgotOTP: `${API_BASE}/api/auth/verify-forgot-otp`,
    resetPassword: `${API_BASE}/api/auth/reset-password`,
  },

  // User Service
  users: {
    getProfile: (customerId: number) => `${API_BASE}/api/users/customers/${customerId}`,
    updateProfile: (customerId: number) => `${API_BASE}/api/users/customers/${customerId}`,
    getCustomers: `${API_BASE}/api/users/customers`,
    getEmployees: `${API_BASE}/api/users/employees`,
    createEmployee: `${API_BASE}/api/users/employees`,
    updateEmployee: (id: number) => `${API_BASE}/api/users/employees/${id}`,
    toggleEmployeeStatus: `${API_BASE}/api/users/employees/toggle-status`,
    getWishlist: (customerId: number) => `${API_BASE}/api/users/wishlist/${customerId}`,
    addWishlist: `${API_BASE}/api/users/wishlist`,
    removeWishlist: `${API_BASE}/api/users/wishlist/remove`,
  },

  // Product Service
  products: {
    list: `${API_BASE}/api/products/`,
    detail: (id: number | string) => `${API_BASE}/api/products/${id}`,
    create: `${API_BASE}/api/products/`,
    update: (id: number | string) => `${API_BASE}/api/products/${id}`,
    remove: (id: number | string) => `${API_BASE}/api/products/${id}`,
    categories: `${API_BASE}/api/products/categories`,
    inventory: `${API_BASE}/api/products/inventory`,
    importStock: `${API_BASE}/api/products/import-stock`,
    stats: `${API_BASE}/api/products/stats`,
    // Discounts
    discounts: `${API_BASE}/api/products/discounts/all`,
    createDiscount: `${API_BASE}/api/products/discounts`,
    checkDiscount: `${API_BASE}/api/products/discounts/check`,
    updateDiscount: (id: number) => `${API_BASE}/api/products/discounts/${id}`,
    deleteDiscount: (id: number) => `${API_BASE}/api/products/discounts/${id}`,
  },

  // Order Service
  orders: {
    create: `${API_BASE}/api/orders/`,
    list: `${API_BASE}/api/orders/`,
    detail: (id: number | string) => `${API_BASE}/api/orders/${id}`,
    updateStatus: `${API_BASE}/api/orders/update-status`,
    cancel: `${API_BASE}/api/orders/cancel`,
    checkStatus: (orderId: number | string) => `${API_BASE}/api/orders/check-status?order_id=${orderId}`,
    dashboard: `${API_BASE}/api/orders/admin/dashboard`,
    revenue: `${API_BASE}/api/orders/admin/revenue`,
  },

  // Payment Service
  payments: {
    createLink: `${API_BASE}/api/payments/create-link`,
    webhook: `${API_BASE}/api/payments/webhook`,
    checkStatus: (orderId: number | string) => `${API_BASE}/api/payments/check-status/${orderId}`,
  },

  // Content Service
  content: {
    posts: `${API_BASE}/api/content/posts`,
    postDetail: (id: number | string) => `${API_BASE}/api/content/posts/${id}`,
    createPost: `${API_BASE}/api/content/posts`,
    updatePost: (id: number | string) => `${API_BASE}/api/content/posts/${id}`,
    deletePost: (id: number | string) => `${API_BASE}/api/content/posts/${id}`,
  },

  // Static assets (images) — these need to be served differently now
  // For now, use placeholder/external URLs or move images to a static server
  images: `${API_BASE}/images`,
};

export default API;
