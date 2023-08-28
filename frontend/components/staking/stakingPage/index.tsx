"use client"

import { useState } from "react"
import { StakingMainBox, RealizePopup } from "../../staking"
import { 
  NavBar, 
  AccountPopup,
  RotatingImages
} from "../../utils"
import { useStaking } from "../../../providers"

export const StakingPage = () => {

  const [accountPopupToggle, setAccountPopupToggle] = useState<boolean>(false)
  const [burgerPopupToggle, setBurgerPopupToggle] = useState<boolean>(false)
  const { realizePopupToggle, setRealizePopupToggle } = useStaking()

  const handlePopups = () => {
    if(accountPopupToggle) {
      setAccountPopupToggle(false)
    }
    if(realizePopupToggle) {
      setRealizePopupToggle(false)
    }
  }

  return (
    <div 
      className="w-screen h-screen" 
      id="page-div"
      onClick={() => handlePopups()}
    >
      { accountPopupToggle && <AccountPopup setPopupToggle={setAccountPopupToggle} /> }
      { realizePopupToggle && <RealizePopup setPopupToggle={setRealizePopupToggle} /> }
      <NavBar
        burgerPopupToggle={burgerPopupToggle}
        setBurgerPopupToggle={setBurgerPopupToggle} 
        setAccountPopupToggle={setAccountPopupToggle}
      />
      <StakingMainBox />
      <RotatingImages />
    </div>
  )
}