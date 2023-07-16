"use client"

import { StakingButton } from "../../staking"
import {
  useWallet,
  useStaking
} from "../../../providers"

export const StakeBox = () => {

  const {
    renderLabel,
    handleBalance,
    handlePercentageButtons,
    handleTopChange,
    handleTopInput
  } = useStaking()

  return (
    <div className="w-[60%] flex flex-col">
      <div className="rounded-3xl border-2 border-black w-[100%] h-[60%] bg-white flex flex-col relative">
        <div className="flex flex-row items-center justify-between ml-10 mt-16">
          <h1 className="font-acme text-[40px]">{renderLabel()}</h1>
          <div className="flex flex-row items-center mr-6">
            <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(1)}>25%</button>
            <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(2)}>50%</button>
            <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(3)}>75%</button>
            <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(4)}>MAX</button>
          </div>
        </div>
        <div className="absolute top-[45%]">
          <input className="border-none focus:outline-none font-acme rounded-xl text-[40px] pl-10" placeholder="0.00" type="number" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} id="number-input" autoFocus />
        </div>
        <div className="absolute right-0 bottom-[35%]">
          <h1 className="text-[23px] mr-6 font-acme text-[#878d97]">balance: {handleBalance()}</h1>
        </div>
      </div>
      <StakingButton />
    </div>
  )
}