import React from 'react';
import { motion } from 'framer-motion';

export const DashboardStatCard = ({
  title,
  value,
  trend,
  trendText,
  icon: Icon,
  color = 'indigo',
  index = 0,
}) => {
  const colorMap = {
    indigo: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 border-brand-100 dark:border-brand-900',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-100 dark:border-purple-900',
    rose: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border-red-100 dark:border-red-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft card-elevated"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              colorMap[color] || colorMap.indigo
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
      </div>

      {(trend || trendText) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={`font-semibold ${
                trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
              }`}
            >
              {trend}
            </span>
          )}
          {trendText && (
            <span className="text-slate-400 dark:text-slate-500 truncate">
              {trendText}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
