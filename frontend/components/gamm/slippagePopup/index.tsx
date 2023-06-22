import { SlippagePopupProps } from "../../../utils/interfaces"

export const SlippagePopup = ({slippage, setSlippage, slippageToggle, setSlippageToggle, slippageDisplayString, setSlippageDisplayString}: SlippagePopupProps ) => {

  return (
    <>
      { slippageToggle && 
        <div className="fixed z-10 bg-[#ffffb4] rounded-xl border-2 border-black w-[25%] left-[40%] top-[40%] px-4 opacity-100">
          <span className="absolute right-3 rounded-full border-2 border-black text-[1.2rem] px-3 top-3 hover:bg-black hover:text-white cursor-pointer" onClick={() => setSlippageToggle(false)}>x</span>
          <div className="flex flex-col font-acme">
            <h3 className="mt-5 mx-auto text-[2rem]">set slippage</h3>
            <div className="mx-auto w-[50%] relative">
              <input className="border-none focus:outline-none bg-slate-100 pl-[15%] font-acme rounded-xl my-5 py-1 text-[1.5rem]" type="number" value={slippageDisplayString} 
                onChange={(e) => {
                  setSlippageDisplayString(e.target.value)
                  if(!e.target.value) {
                    setSlippage(0)
                  }
                  else {
                    setSlippage(parseFloat(e.target.value))
                  }
                }} 
                id="number-input" 
              />
              <p className="absolute right-[5%] top-[35%] text-[1.2rem]">%</p>
            </div>
          </div>
        </div>
      }
    </>
  )
}