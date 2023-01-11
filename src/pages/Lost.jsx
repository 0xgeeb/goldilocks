import React from "react"
import lostImage from ".././images/lost.png"

export default function Lost() {
  return( 
    <div className="h-[100%] w-[100%] flex flex-row">
      <div className="w-[70%] mt-48 pl-72">
        <h1 className="font-acme text-[80px] mx-auto">are you lost ser</h1>
      </div>
      <div className="w-[30%]">
        <img className="absolute bottom-0 right-0 h-[600px] w-[1000px]" src={lostImage} />
      </div>
    </div>
  )
}