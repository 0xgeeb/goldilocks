import React from "react"

export default function LeftAmmBoxText() {
  return (
    <div className="flex flex-col items-start justify-between font-acme text-[24px]">
      <h3>$LOCKS floor price:</h3>
      <h3>$LOCKS market price:</h3>
      <h3>current fsl:</h3>
      <h3>current psl:</h3>
    </div>
  )
}