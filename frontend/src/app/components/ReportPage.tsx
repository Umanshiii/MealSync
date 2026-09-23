import { ArrowLeft, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportPageProps {
  onBack: () => void;
}

export default function ReportPage({ onBack }: ReportPageProps) {
  const proteinCarbData = [
    { month: 'Jan', protein: 45, carbs: 85 },
    { month: 'Feb', protein: 52, carbs: 78 },
    { month: 'Mar', protein: 48, carbs: 82 },
    { month: 'Apr', protein: 61, carbs: 75 },
    { month: 'May', protein: 58, carbs: 80 },
  ];

  const mealQualityData = [
    { month: 'Jan', quality: 72 },
    { month: 'Feb', quality: 75 },
    { month: 'Mar', quality: 68 },
    { month: 'Apr', quality: 82 },
    { month: 'May', quality: 78 },
  ];

  const nutritionDistribution = [
    { name: 'High Nutrition', value: 45, color: '#10b981' },
    { name: 'Medium Nutrition', value: 35, color: '#f59e0b' },
    { name: 'Low Nutrition', value: 20, color: '#ef4444' },
  ];

  const lowNutritionSchools = [
    { name: 'River View Academy', score: 62, trend: -5 },
    { name: 'City Central School', score: 58, trend: -8 },
    { name: 'Lakeside Primary', score: 55, trend: -3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl text-gray-800">Nutrition & Meal Quality Reports</h1>
          <p className="text-gray-600">Comprehensive analysis of midday meal program</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg text-gray-800 mb-6">Protein vs Carbohydrate Intake</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={proteinCarbData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="protein" fill="#3b82f6" name="Protein (g)" />
                <Bar dataKey="carbs" fill="#10b981" name="Carbs (g)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg text-gray-800 mb-6">Monthly Meal Quality Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mealQualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Quality Score"
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg text-gray-800 mb-6">Nutrition Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nutritionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {nutritionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg text-gray-800">Schools Requiring Attention</h2>
            </div>

            <div className="space-y-4">
              {lowNutritionSchools.map((school, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-gray-800">{school.name}</h3>
                    <div className="flex items-center gap-2 text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm">{school.trend}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${school.score}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">{school.score}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ These schools show declining nutrition scores and require immediate intervention.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg text-gray-800 mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📊 Average nutrition score across all schools is <strong>76%</strong>
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Protein intake has increased by <strong>12%</strong> over the last quarter
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                📈 Overall meal quality improved by <strong>8%</strong> since January
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
