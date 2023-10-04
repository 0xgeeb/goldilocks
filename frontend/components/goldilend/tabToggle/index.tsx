"use client"

import {
  LoanTab,
  RepayTab,
  BoostTab,
  StakeTab,
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
        activeToggle === 'stake' ?
          <StakeTab /> :
        activeToggle === 'liquidate' ?
          <LiquidateTab /> :
        ''
      }
    </div>
  )
}