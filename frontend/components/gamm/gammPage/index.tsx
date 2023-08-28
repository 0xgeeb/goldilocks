"use client"

import { useState } from "react"
import { NavBar, AccountPopup } from "../../utils"
import { 
  GammMainBox, 
  GammSideBox,
  RedeemPopup, 
  SlippagePopup
} from "../../gamm"
import { useGamm } from "../../../providers"

export const GammPage = () => {

  const [accountPopupToggle, setAccountPopupToggle] = useState<boolean>(false)
  const [burgerPopupToggle, setBurgerPopupToggle] = useState<boolean>(false)
  const { 
    redeemPopupToggle, 
    setRedeemPopupToggle,
    slippage,
    changeSlippageToggle
  } = useGamm()

  const handlePopups = () => {
    if(accountPopupToggle) {
      setAccountPopupToggle(false)
    }
    if(slippage.toggle) {
      changeSlippageToggle(false)
    }
    if(redeemPopupToggle) {
      setRedeemPopupToggle(false)
    }
    if(burgerPopupToggle) {
      setBurgerPopupToggle(false)
    }
  }

  return (
    <div 
      className="w-screen h-screen" 
      id="page-div"
      onClick={() => handlePopups()}
    >
      { accountPopupToggle && <AccountPopup setPopupToggle={setAccountPopupToggle} /> }
      { redeemPopupToggle && <RedeemPopup setPopupToggle={setRedeemPopupToggle} /> }
      { slippage.toggle && <SlippagePopup /> }
      <NavBar
        burgerPopupToggle={burgerPopupToggle}
        setBurgerPopupToggle={setBurgerPopupToggle} 
        setAccountPopupToggle={setAccountPopupToggle}
      />
      <div className="h-[85%] lg:h-[80%]">
        <GammMainBox />
        <GammSideBox />
      </div>
    </div>
  )
}