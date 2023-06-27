"use client"

import { useState } from "react"
import { 
  TitleBar,
  TradeBox,
  StatsBox
} from "../../gamm"

export const GammBox = () => {

  const [slippageToggle, setSlippageToggle] = useState<boolean>(false)

  return (
    <div className="w-[57%] flex flex-col py-6 px-24 rounded-xl bg-slate-300 ml-10 mt-8 h-[95%] border-2 border-black">
      <TitleBar 
        slippageToggle={slippageToggle}
        setSlippageToggle={setSlippageToggle}
      />
      <TradeBox 
        slippageToggle={slippageToggle}
        setSlippageToggle={setSlippageToggle}
      />
      <StatsBox />
    </div>
  )
}