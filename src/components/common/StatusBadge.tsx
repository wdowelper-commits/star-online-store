import React from 'react';
import { OrderStatus, UserStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | UserStatus | 'in_stock' | 'low_stock' | 'out_of_stock';
  className?: string;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', customLabel }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let label = customLabel || status.toUpperCase();

  switch (status) {
    case 'placed':
      badgeStyle = 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
      label = customLabel || 'Placed';
      break;
    case 'confirmed':
      badgeStyle = 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300';
      label = customLabel || 'Confirmed';
      break;
    case 'shipped':
      badgeStyle = 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300';
      label = customLabel || 'Shipped';
      break;
    case 'delivered':
      badgeStyle = 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300';
      label = customLabel || 'Delivered';
      break;
    case 'cancelled':
      badgeStyle = 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
      label = customLabel || 'Cancelled';
      break;
    case 'pending':
      badgeStyle = 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      label = customLabel || 'Pending Review';
      break;
    case 'active':
      badgeStyle = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      label = customLabel || 'Active';
      break;
    case 'suspended':
      badgeStyle = 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
      label = customLabel || 'Suspended';
      break;
    case 'in_stock':
      badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
      label = customLabel || 'In Stock';
      break;
    case 'low_stock':
      badgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      label = customLabel || 'Low Stock';
      break;
    case 'out_of_stock':
      badgeStyle = 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      label = customLabel || 'Out of Stock';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${badgeStyle} ${className}`}
    >
      {label}
    </span>
  );
};
