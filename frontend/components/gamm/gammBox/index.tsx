"use client"
import { useState, useEffect } from "react"
import { 
  RedeemPopup,
  TitleBar,
  TradeBox,
  StatsBox
} from "../../gamm"

export const GammBox = () => {
  return (
    <div className="w-[57%] flex flex-col py-6 px-24 rounded-xl bg-slate-300 ml-10 mt-8 h-[95%] border-2 border-black">
      <RedeemPopup />
      <TitleBar />
      <TradeBox />
      <StatsBox />
    </div>
  )
}