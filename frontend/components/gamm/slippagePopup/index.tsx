import { useGamm } from "../../../providers"

export const SlippagePopup = () => {

  const { slippage, changeSlippage, changeSlippageToggle } = useGamm()

  return (
    <div className="fixed z-10 bg-[#ffffb4] rounded-xl border-2 border-black w-[30%] 2xl:w-[25%] left-[35%] top-[40%] px-4 opacity-100">
      <span 
        className="absolute right-3 rounded-full border-2 border-black text-[1.2rem] px-3 top-3 hover:bg-black hover:text-white cursor-pointer" 
        onClick={() => changeSlippageToggle(false)}
      >
        x
      </span>
      <div className="flex flex-col font-acme">
        <h3 
          className="mt-5 mx-auto text-[2rem]" 
          onClick={() => console.log(slippage)}
        >
          set slippage
        </h3>
        <div className="ml-[30%] w-[50%] relative">
          <input 
            className="w-[80%] border-none focus:outline-none bg-slate-100 pl-[10%] 2xl:pl-[15%] font-acme rounded-xl my-5 py-1 text-[1.5rem]" 
            type="number"
            id="number-input" 
            value={slippage.displayString}
            onChange={(e) => {
              if(!e.target.value) {
                changeSlippage(0, e.target.value)
              }
              else {
                changeSlippage(parseFloat(e.target.value), e.target.value)
              }
            }} 
          />
          <p className="absolute right-[24%] top-[35%] text-[1.2rem]">%</p>
        </div>
      </div>
    </div>
  )
}