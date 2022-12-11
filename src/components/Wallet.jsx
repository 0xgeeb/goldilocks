import React, { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function Wallet() {
  return (
    <div className="w-[100%] flex flex-row mt-24 justify-center">
      <div className="w-[25%] flex flex-col p-4 rounded-xl bg-yellow-100 mr-4" id="card-div-shadow">
        <h2 className="mx-auto text-xl">wallet</h2>
        <div className="px-16">
          <div className="mt-24 flex flex-row justify-between">
            <p className="">$LOCKS balance: </p>
          </div>
          <div className="mt-8 flex flex-row justify-between">
            <p className="">$PRG balance: </p>
          </div>
        </div>
      </div>
    </div>
  )

}