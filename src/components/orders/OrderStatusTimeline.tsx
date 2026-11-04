import React from 'react';
import { OrderStatus, OrderStatusHistory } from '../../types';
import { CheckCircle2, Circle, XCircle, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  history?: OrderStatusHistory[];
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  history = [],
}) => {
  const steps: Array<{ status: OrderStatus; label: string; desc: string }> = [
    { status: 'placed', label: 'Order Placed', desc: 'Received and registered via Cash on Delivery' },
    { status: 'confirmed', label: 'Confirmed by Seller', desc: 'Verified and queued for dispatch packaging' },
    { status: 'shipped', label: 'Shipped & In Transit', desc: 'Handed over to courier with active dispatch tracking' },
    { status: 'delivered', label: 'Delivered', desc: 'Package handed over and cash collected' },
  ];

  if (currentStatus === 'cancelled') {
    const cancelHistory = history.find((h) => h.status === 'cancelled');
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 my-4">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Order Cancelled</h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              {cancelHistory?.note || 'This order was cancelled and inventory has been restored.'}
            </p>
            {cancelHistory?.created_at && (
              <p className="text-[11px] text-red-500 mt-1">
                Cancelled on: {formatDate(cancelHistory.created_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const getStepIndex = (s: OrderStatus) => {
    switch (s) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="py-4">
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {steps.map((step, index) => {
          const isDone = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const stepHistory = history.find((h) => h.status === step.status);

          return (
            <div key={step.status} className="relative">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-[#6C47FF] text-white animate-pulse'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Step info */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4
                    className={`text-sm font-bold ${
                      isDone
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {stepHistory?.created_at && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(stepHistory.created_at)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {stepHistory?.note || step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
