import { useGamm } from "../../../providers"

export const PercentageButtons = () => {

  const { handlePercentageButtons } = useGamm()

  return (
    <div className="flex flex-row items-center mr-6 2xl:mr-10">
      <button 
        className="ml-1 2xl:ml-2 w-9 2xl:w-10 text-[13px] 2xl:text-[16px] font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
        onClick={() => handlePercentageButtons(1)}
        >
          25%
        </button>
      <button 
        className="ml-1 2xl:ml-2 w-9 2xl:w-10 text-[13px] 2xl:text-[16px] font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
        onClick={() => handlePercentageButtons(2)}
        >
          50%
        </button>
      <button 
        className="ml-1 2xl:ml-2 w-9 2xl:w-10 text-[13px] 2xl:text-[16px] font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
        onClick={() => handlePercentageButtons(3)}
        >
          75%
        </button>
      <button 
        className="ml-1 2xl:ml-2 w-9 2xl:w-10 text-[13px] 2xl:text-[16px] font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
        onClick={() => handlePercentageButtons(4)}
        >
          MAX
        </button>
    </div>
  )
}