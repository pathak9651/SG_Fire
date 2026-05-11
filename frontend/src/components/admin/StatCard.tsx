import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'red' | 'blue' | 'green' | 'amber';
}

export default function StatCard({ label, value, icon: Icon, trend, color = 'red' }: StatCardProps) {
  const colorMap = {
    red: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend.isUp ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <h3 className="text-2xl font-black dark:text-white font-outfit">{value}</h3>
      </div>
    </motion.div>
  );
}
