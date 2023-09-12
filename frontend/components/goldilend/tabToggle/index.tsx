"use client"

import {
  LoanTab,
  RepayTab,
  BoostTab,
  LiquidateTab
} from "../../goldilend"
import { useGoldilend } from "../../../providers"

export const TabToggle = () => {

  const { activeToggle } = useGoldilend()

  return (
    <div className="w-[100%] h-[85%]">
      {
        activeToggle === 'loan' ? 
          <LoanTab /> :
        activeToggle === 'repay' ? 
          <RepayTab /> :
        activeToggle === 'boost' ? 
          <BoostTab /> :
        activeToggle === 'liquidate' ??
          <LiquidateTab /> 
      }
    </div>
  )
}