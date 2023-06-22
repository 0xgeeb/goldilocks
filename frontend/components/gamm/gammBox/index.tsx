"use client"

import { useState } from "react"
import { 
  TitleBar,
  TradeBox,
  StatsBox
} from "../../gamm"
import {
  useActiveToggle
} from "../../../hooks/gamm"

export const GammBox = () => {

  const [slippageToggle, setSlippageToggle] = useState<boolean>(false)
  const [activeToggle, setActiveToggle] = useActiveToggle('buy')

  return (
    <div className="w-[57%] flex flex-col py-6 px-24 rounded-xl bg-slate-300 ml-10 mt-8 h-[95%] border-2 border-black">
      <TitleBar 
        activeToggle={activeToggle as string} 
        setActiveToggle={setActiveToggle as React.Dispatch<React.SetStateAction<string>>}
        slippageToggle={slippageToggle}
        setSlippageToggle={setSlippageToggle}
      />
      <TradeBox 
        activeToggle={activeToggle as string} 
        setActiveToggle={setActiveToggle as React.Dispatch<React.SetStateAction<string>>}
        slippageToggle={slippageToggle}
        setSlippageToggle={setSlippageToggle}
      />
      <StatsBox />
    </div>
  )
}