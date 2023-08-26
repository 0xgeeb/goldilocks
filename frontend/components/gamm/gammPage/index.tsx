"use client"

import { useState } from "react"
import { NavBar, AccountPopup } from "../../utils"
import { 
  GammMainBox, 
  GammSideBox,
  RedeemPopup 
} from "../../gamm"
import { useGamm } from "../../../providers"

export const GammPage = () => {

  const [accountPopupToggle, setAccountPopupToggle] = useState<boolean>(false)
  const [slippagePopupToggle, setSlippagePopupToggle] = useState<boolean>(false)
  const { redeemPopupToggle, setRedeemPopupToggle } = useGamm()

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
      { redeemPopupToggle && <RedeemPopup setPopupToggle={setRedeemPopupToggle} /> }
      <NavBar setPopupToggle={setAccountPopupToggle} />
      <div className="h-[85%] lg:h-[80%]">
        <GammMainBox />
        <GammSideBox />
      </div>
    </div>
  )
}