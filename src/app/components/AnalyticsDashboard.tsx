import type React from "react"
import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface AnalyticsData {
  averageScore: number
  averageReadabilityScore: number
  commonFeedback: Record<string, number>
}

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`)
      const data = await response.json()
      setAnalyticsData(data)
    }

    fetchAnalytics()
  }, [timeRange])

  if (!analyticsData) {
    return <div>Loading...</div>
  }

  const chartData = {
    labels: ["Average Score", "Average Readability Score"],
    datasets: [
      {
        label: "Scores",
        data: [analyticsData.averageScore, analyticsData.averageReadabilityScore],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
      },
    ],
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      <div className="mb-4">
        <label htmlFor="timeRange" className="mr-2">
          Time Range:
        </label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as "day" | "week" | "month")}
          className="border rounded p-1"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Scores</h3>
        <Line data={chartData} />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Common Feedback</h3>
        <ul className="list-disc pl-5">
          {Object.entries(analyticsData.commonFeedback)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([feedback, count]) => (
              <li key={feedback} className="mb-1">
                {feedback}: {count} times
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

export default AnalyticsDashboard

