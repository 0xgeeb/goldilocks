"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"
import { Line } from "react-chartjs-2"


export const TradeChart = () => {

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  )

  const dateLabels: String[] = ['1/1', '1/2', '1/3']
  const fdi: Number[] = [1, 2, 3]

  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: "fucking data idk",
        data: fdi,
        fill: false,
        backgroundColor: "#44dc8a",
        borderColor: "#ffff88"
      }
    ]
  }

  const options = { 
    scales: {

    }
  }

  return (
    // <div className="absolute h-[50%] w-[30%] bottom-[20%] right-[5%] rounded-xl bg-green-500 border-2 border-black">
    <div className="absolute h-[50%] w-[30%] bottom-[20%] right-[5%]">
      <Line data={data} options={options} />
    </div>
  )
}