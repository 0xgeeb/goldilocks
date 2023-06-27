"use client"

import { useState } from "react"
import { 
  SlippagePopup,
  GammButton
} from "../../gamm"
import { useActiveToggle } from "../../../hooks/gamm"
import { ToggleProps } from "../../../utils/interfaces"

export const TradeBox = ({ slippageToggle, setSlippageToggle }: ToggleProps) => {

  const [slippage, setSlippage] = useState<number>(0.1)
  const [slippageDisplayString, setSlippageDisplayString] = useState<string>('0.1')
  const [activeToggle, setActiveToggle] = useActiveToggle('buy')

  const test = () => {
    console.log('tradeBox: ', activeToggle)
  }

  return (
    <div className="h-[75%] relative mt-4 flex flex-col" onClick={() => test()}>
      <div className="h-[67%] px-6">
        <SlippagePopup
          slippage={slippage}
          setSlippage={setSlippage}
          slippageToggle={slippageToggle}
          setSlippageToggle={setSlippageToggle}
          slippageDisplayString={slippageDisplayString}
          setSlippageDisplayString={setSlippageDisplayString}
        />
        {/* <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
          <div className="h-[50%] flex flex-row items-center justify-between">
            <div className="rounded-[50px] m-6 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">{useLabel(activeToggle, "topToken")}</div>
            <div className="flex flex-row items-center mr-10">
              <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(1)}>25%</button>
              <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(2)}>50%</button>
              <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(3)}>75%</button>
              <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(4)}>MAX</button>
            </div>
          </div>
          <div className="h-[50%] pl-10 flex flex-row items-center justify-between">
            <input className="border-none focus:outline-none bg-transparent font-acme rounded-xl text-[40px]" placeholder="0.00" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} type="number" id="number-input" autoFocus />
            <h1 className="mr-10 mt-4 text-[23px] font-acme text-[#878d97]">balance: {handleTopBalance()}</h1>
          </div>
        </div>
        <div className="absolute top-[31%] left-[50%] h-10 w-10 bg-[#ffff00] border-2 border-black rounded-3xl flex justify-center items-center" onClick={() => flipTokens()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D111C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>
        <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
          <div className="h-[50%] flex flex-row items-center">
            <div className="rounded-[50px] m-6 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">{useLabel(buyToggle, sellToggle, redeemToggle, "bottomToken")}</div>
          </div>
          <div className="h-[50%] pl-10 flex flex-row items-center justify-between">
            <input className="border-none focus:outline-none bg-transparent font-acme rounded-xl text-[40px]" placeholder="0.00" value={handleBottomInput()} onChange={(e) => handleBottomChange(e.target.value)} type="number" id="number-input" />
            <h1 className="mr-10 mt-4 text-[23px] font-acme text-[#878d97]">balance: {handleBottomBalance()}</h1>
          </div>
        </div> */}
      </div>
      <GammButton />
    </div>
  )
}