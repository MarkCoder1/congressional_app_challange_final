"use client";

import { motion } from "framer-motion";
import { TrendingUp, Clock, Target, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressHistoryProps {
  history?: {
    date: string;
    accuracy: number;
    timeSpent: number;
    tasksCompleted: number;
  }[];
}

// Mock data for demonstration
const mockHistory = [
  { date: "Mon", accuracy: 65, timeSpent: 45, tasksCompleted: 2 },
  { date: "Tue", accuracy: 72, timeSpent: 60, tasksCompleted: 3 },
  { date: "Wed", accuracy: 78, timeSpent: 50, tasksCompleted: 2 },
  { date: "Thu", accuracy: 85, timeSpent: 55, tasksCompleted: 4 },
  { date: "Fri", accuracy: 82, timeSpent: 40, tasksCompleted: 3 },
  { date: "Sat", accuracy: 88, timeSpent: 70, tasksCompleted: 5 },
  { date: "Sun", accuracy: 90, timeSpent: 65, tasksCompleted: 4 },
];

export function ProgressHistory({ history }: ProgressHistoryProps) {
  const data = history || mockHistory;
  const avgAccuracy = Math.round(data.reduce((sum, d) => sum + d.accuracy, 0) / data.length);
  const totalTime = data.reduce((sum, d) => sum + d.timeSpent, 0);
  const totalTasks = data.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const improvement = data.length >= 2 
    ? data[data.length - 1].accuracy - data[0].accuracy 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-accent" />
        Progress History
      </h3>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Target size={16} />}
          label="Avg Accuracy"
          value={`${avgAccuracy}%`}
          color="text-accent"
        />
        <StatCard
          icon={<Clock size={16} />}
          label="Study Time"
          value={`${totalTime}m`}
          color="text-green-600"
        />
        <StatCard
          icon={<Award size={16} />}
          label="Tasks Done"
          value={totalTasks.toString()}
          color="text-purple-600"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Improvement"
          value={`+${improvement}%`}
          color="text-blue-600"
        />
      </div>

      {/* Accuracy Chart */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Accuracy Trend
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: "#6b7280" }}
              stroke="#e5e7eb"
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              stroke="#e5e7eb"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#fff", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Recent Activity
        </p>
        <div className="space-y-2">
          {data.slice(-3).reverse().map((entry, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-xs"
            >
              <span className="font-medium text-foreground">{entry.date}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{entry.timeSpent}m</span>
                <span className="text-accent font-semibold">{entry.accuracy}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
      <div className={`${color} mb-1`}>{icon}</div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}