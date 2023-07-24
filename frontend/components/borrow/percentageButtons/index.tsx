import { useBorrowing } from "../../../providers"

export const PercentageButtons = () => {

  const { handlePercentageButtons } = useBorrowing()

  return (
    <div className="flex flex-row items-center mr-3">
      <button 
        className="ml-1 2xl:ml-2 w-10 2xl:w-12 text-[13px] 2xl:text-[16px] font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
        onClick={() => handlePercentageButtons(1)}
      >
        25%
      </button>
      <button 
        className="ml-1 2xl:ml-2 w-10 2xl:w-12 text-[13px] 2xl:text-[16px] font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
        onClick={() => handlePercentageButtons(2)}
      >
        50%
      </button>
      <button 
        className="ml-1 2xl:ml-2 w-10 2xl:w-12 text-[13px] 2xl:text-[16px] font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
        onClick={() => handlePercentageButtons(3)}
      >
        75%
      </button>
      <button 
        className="ml-1 2xl:ml-2 w-10 2xl:w-12 text-[13px] 2xl:text-[16px] font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" 
        onClick={() => handlePercentageButtons(4)}
      >
        MAX
      </button>
    </div>
  )
}