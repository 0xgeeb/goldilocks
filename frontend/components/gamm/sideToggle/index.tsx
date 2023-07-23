import { SideToggleProps } from "../../../utils/interfaces"

export const SideToggle = ({ showChart, toggleChart}: SideToggleProps) => {
  return (
    <button
      className="absolute right-[2%] bottom-[2%] w-[6%] h-[6%] bg-slate-300 bg-grid-slate-100 border-2 border-black rounded-2xl pointer-cursor hover:scale-[110%]"
      id="chart-button"
      onClick={toggleChart}
    >
      <div className="h-[100%] flex items-center justify-center rounded-xl">
        <p className="font-acme text-[1.2rem] user-select-none">
          {!showChart ? "show chart" : "hide chart"}
        </p>
      </div>
    </button>
  )
}