import React, { useEffect, useState } from "react"
import girlNoBears from "../images/girl_no_bears.png"
import twitter from "../images/twitter.png"

export default function Home() {

  return (
    <div className="100vh ">
      <div className="mt-[150px] ml-[330px] py-4">
        <h1 className="text-[65px] font-acme">distributing porridge to beras</h1>
        <h3 className="mt-1 text-[25px] font-acme">novel AMM, yield-splitting vaults, and native token & nft lending markets built on Berachain</h3>
        <div className="mt-5 flex flex-row items-center">
          <a href="https://medium.com/@goldilocksmoney/goldidocs-1fe25dcb5cd2" target="_blank" >
            <button className="w-36 py-2 text-[18px] bg-slate-200 hover:bg-slate-500 rounded-xl font-acme" id="home-button">more info</button>
          </a>
          <a href="https://twitter.com/goldilocksmoney" target="_blank"><img className="h-6 w-6 ml-6 rounded-3xl hover:opacity-25" src={twitter} id="card-div-shadow" /></a>
        </div>
      </div>
      <img className="absolute left-2/3 bottom-0 h-[500px] w-[500px]" src={girlNoBears} />
    </div>
  )
}