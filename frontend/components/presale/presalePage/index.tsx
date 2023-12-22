"use client"

import { useState } from "react"
import { PresaleMainBox } from "../"
import {
  NavBar,
  AccountPopup,
  RotatingImages
} from "../../utils"
import { usePresale } from "../../../providers"

export const PresalePage = () => {

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
      <PresaleMainBox />
    </div>
  )
}