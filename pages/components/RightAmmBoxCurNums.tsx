import React from "react"
import { RightAmmBoxCurNumProps } from "../../interfaces"

export default function RightAmmBoxCurNums( { supply }: RightAmmBoxCurNumProps) {
  return (
    <div className="flex flex-col items-end justify-between w-[30%]">
      <p className="font-acme text-[20px]">{ supply > 0 ? supply.toLocaleString('en-US') : "-" }</p>
      <p className="font-acme text-[20px] text-white">1,044</p>
      <p className="font-acme text-[20px] text-white">1,044</p>
    </div>
  )
}