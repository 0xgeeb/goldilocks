"use client"

import { useState } from "react"
import { GoldilendMainBox } from "../../goldilend"
import {
  NavBar,
  AccountPopup,
  RotatingImages
} from "../../utils"
import { useGoldilend } from "../../../providers"

export const GoldilendPage = () => {

  const [accountPopupToggle, setAccountPopupToggle] = useState<boolean>(false)
  const [burgerPopupToggle, setBurgerPopupToggle] = useState<boolean>(false)
  
  const handlePopups = () => {
    if(accountPopupToggle) {
      setAccountPopupToggle(false)
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
      <NavBar
        burgerPopupToggle={burgerPopupToggle}
        setBurgerPopupToggle={setBurgerPopupToggle} 
        setAccountPopupToggle={setAccountPopupToggle}
      />
      <GoldilendMainBox />
      <RotatingImages />
    </div>
  )
}