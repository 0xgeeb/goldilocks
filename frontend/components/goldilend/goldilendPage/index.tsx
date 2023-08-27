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
  
  const handlePopups = () => {
    if(accountPopupToggle) {
      setAccountPopupToggle(false)
    }
  }

  return (
    <div 
      className="w-screen h-screen" 
      id="page-div"
      onClick={() => handlePopups()}
    >
      { accountPopupToggle && <AccountPopup setPopupToggle={setAccountPopupToggle} /> }
      <NavBar setPopupToggle={setAccountPopupToggle} />
      <GoldilendMainBox />
      <RotatingImages />
    </div>
  )
}