import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockTrendData = [
  { month: 'Jan', compliant: 65, pending: 25, nonCompliant: 10 },
  { month: 'Feb', compliant: 70, pending: 22, nonCompliant: 8 },
  { month: 'Mar', compliant: 75, pending: 18, nonCompliant: 7 },
  { month: 'Apr', compliant: 80, pending: 15, nonCompliant: 5 },
  { month: 'May', compliant: 75, pending: 20, nonCompliant: 5 },
];

export default function ComplianceTrendChart() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <h3 className="text-lg text-gray-800 mb-4">Monthly Compliance Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockTrendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="compliant"
            stroke="#10b981"
            strokeWidth={2}
            name="Compliant (%)"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Pending (%)"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="nonCompliant"
            stroke="#ef4444"
            strokeWidth={2}
            name="Non-Compliant (%)"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          📊 Trend shows compliance rates over the last 5 months. Current month compliance has slightly decreased.
        </p>
      </div>
    </div>
  );
}
