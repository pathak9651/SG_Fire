/**
 * ============================================================
 * FILE: src/lib/utils.ts
 * PURPOSE: Shared utility functions used across the frontend.
 *
 * FUNCTIONS:
 *  - cn()              : Merges Tailwind class names (conditional classes)
 *  - formatPrice()     : Format number as Indian Rupee string
 *  - formatDate()      : Format date strings for display
 *  - truncate()        : Truncate long text with ellipsis
 *  - getInitials()     : Get initials from a name string
 *  - getStatusColor()  : Get Tailwind color classes for order/appointment status
 * ============================================================
 */

/**
 * cn() — Class Name merger
 * ------------------------
 * Combines multiple class name strings, filtering out falsy values.
 * Used for conditional Tailwind classes.
 *
 * @example
 *   cn('base-class', condition && 'conditional-class', 'another')
 *   cn('p-4', isActive ? 'bg-red-600' : 'bg-gray-200')
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * formatPrice() — Indian Rupee formatter
 * ----------------------------------------
 * Formats a number as Indian Rupee with ₹ symbol and comma notation.
 *
 * @param price - Amount in rupees
 * @returns Formatted string like "₹1,23,456"
 *
 * @example
 *   formatPrice(150000) → "₹1,50,000"
 *   formatPrice(999)    → "₹999"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * formatDate() — Human-readable date formatter
 * -----------------------------------------------
 * Converts ISO date string to a readable format.
 *
 * @param dateString - ISO date string (e.g., "2024-01-15T10:30:00.000Z")
 * @param options    - Optional Intl.DateTimeFormat options
 * @returns Formatted date string like "15 Jan 2024"
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
): string {
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

/**
 * truncate() — Text truncation
 * --------------------------------
 * Truncates text that exceeds a maximum character count.
 *
 * @param text    - The string to truncate
 * @param maxLen  - Maximum length before truncation (default: 100)
 * @returns Truncated string with "..." appended, or original if short
 */
export function truncate(text: string, maxLen: number = 100): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).trimEnd() + '...';
}

/**
 * getInitials() — Name initials extractor
 * -----------------------------------------
 * Extracts up to 2 initials from a full name for avatar fallbacks.
 *
 * @example
 *   getInitials("Rahul Kumar") → "RK"
 *   getInitials("Priya")      → "P"
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * getOrderStatusConfig() — Order status display config
 * -------------------------------------------------------
 * Returns label and Tailwind color classes for a given order status.
 * Used in order history and admin dashboard tables.
 *
 * @param status - Order status string from the backend
 * @returns { label: string, className: string }
 */
export function getOrderStatusConfig(status: string): {
  label: string;
  className: string;
} {
  const configs: Record<string, { label: string; className: string }> = {
    pending:          { label: 'Pending',           className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    processing:       { label: 'Processing',        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    shipped:          { label: 'Shipped',           className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    out_for_delivery: { label: 'Out for Delivery',  className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    delivered:        { label: 'Delivered',         className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    cancelled:        { label: 'Cancelled',         className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    refund_requested: { label: 'Refund Requested',  className: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    refunded:         { label: 'Refunded',          className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  };
  return configs[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
}

/**
 * getAppointmentStatusConfig() — Appointment status display config
 */
export function getAppointmentStatusConfig(status: string): {
  label: string;
  className: string;
} {
  const configs: Record<string, { label: string; className: string }> = {
    pending:     { label: 'Pending Approval',  className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    approved:    { label: 'Approved',          className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    rejected:    { label: 'Rejected',          className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    assigned:    { label: 'Technician Assigned', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    in_progress: { label: 'In Progress',       className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    completed:   { label: 'Completed',         className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    cancelled:   { label: 'Cancelled',         className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  };
  return configs[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
}
