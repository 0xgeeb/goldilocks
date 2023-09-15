"use client"

import { useEffect, useState } from "react"
import { useGoldilend } from "../../../providers"

export const LoanTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)
  // const [beraArr, setBeraArr] = useState<string[]>([])

  const {
    checkBondBalance,
    checkBandBalance,
    checkBeraBalance,
    beraArray
  } = useGoldilend()

  useEffect(() => {
    if(infoLoading) {
      // countBonds()
      // countBands()
      const fetchData = async () => {
        checkBeraBalance()
      }
      fetchData()
      setInfoLoading(false)
    }
  }, [])

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }

  // const countBonds = () => {
  //   const bonds = checkBondBalance()
  //   bonds.then(num => {
  //     for(let i = 0; i < num / 2; i++) {
  //       console.log('hello from bond: ', i)
  //       setBeraArr(curr => [...curr, 'https://ipfs.io/ipfs/QmSaVWb15oQ1HcsUjGGkjwHQ1mxJBYeivtBCgHHHiVLt7w'])
  //     }
  //   })
  // }

  // const countBands = () => {
  //   const bands = checkBandBalance()
  //   bands.then(num => {
  //     if(num % 2 == 0) {
  //       for(let i = 0; i < num / 2; i++) {
  //         console.log('hello from band: ', i)
  //         setBeraArr(curr => [...curr, 'https://ipfs.io/ipfs/QmNWggx9vvBVEHZc6xwWkdyymoKuXCYrJ3zQwwKzocDxRt'])
  //       }
  //     }
  //     else {
  //       for(let i = 0; i < num / 2; i++) {
  //         console.log('hello from band: ', i)
  //         setBeraArr(curr => [...curr, 'https://ipfs.io/ipfs/QmNWggx9vvBVEHZc6xwWkdyymoKuXCYrJ3zQwwKzocDxRt'])
  //       }
  //     }
  //   })
  // }

  const test = () => {
    const num = 5
    for(let i = 0; i < num / 2; i++) {
      
    }
  }

  return (
    <div className="w-[100%] h-[100%] flex flex-row" onClick={() => test()}>
      <div className="h-[100%] w-[70%] bg-green-400">

      </div>
      <div className="h-[100%] w-[30%] flex flex-col bg-blue-400 px-2">
        <h1 className="font-acme mx-auto underline py-8 text-[18px] 2xl:text-[24px]">your beras</h1>
        { 
          infoLoading ? loadingElement() : 
          <div className="flex flex-wrap overflow-y-auto h-[90%] border-2 border-black">
            {
              beraArray.map((src, index) => (
                <div key={index} className="w-[40%]">
                  <img src={src} alt="bera" />
                </div>
              ))
            }
          </div> 
        }
      </div>
    </div>
  )
}