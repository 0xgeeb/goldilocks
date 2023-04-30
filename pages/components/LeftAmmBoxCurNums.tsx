import React from "react"
import { LeftAmmBoxCurNumsProps } from "../../interfaces"

export default function LeftAmmBoxCurNums({ floor, market, fsl, psl }: LeftAmmBoxCurNumsProps) {
  return (
    <div className="flex flex-col items-end justify-between font-acme text-[20px]">
      <p>${ floor > 0 ? floor.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
      <p>${ market > 0 ? market.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-"}</p>
      <p>{ fsl > 0 ? fsl.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-" }</p>
      <p>{ psl > 0 ? psl.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "-" }</p>
    </div>
  )
}