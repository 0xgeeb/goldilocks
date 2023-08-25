"use client"

import { useState } from "react"

import { NavBar, AccountPopup } from "../../utils"
import { GammMainBox, GammSideBox } from "../../gamm"

export const GammPage = () => {

  const [accountPopupToggle, setAccountPopupToggle] = useState<boolean>(false)
  const [slippagePopupToggle, setSlippagePopupToggle] = useState<boolean>(false)
  const [redeemPopupToggle, setRedeemPopupToggle] = useState<boolean>(false)

  const handlePopups = () => {
    if(accountPopupToggle) {
      setAccountPopupToggle(false)
    }
    if(slippagePopupToggle) {
      setSlippagePopupToggle(false)
    }
    if(redeemPopupToggle) {
      setRedeemPopupToggle(false)
    }
  }

  return (
    <div className="w-screen h-screen" id="page-div" onClick={() => handlePopups()}>
      { accountPopupToggle && <AccountPopup setPopupToggle={setAccountPopupToggle} /> }
      <NavBar setPopupToggle={setAccountPopupToggle} />
      <div className="h-[80%]">
        <GammMainBox />
        <GammSideBox />
      </div>
    </div>
  )
}