import Image from "next/image"

export function useLabel(
  activeToggle: string,
  action: string
): string | JSX.Element | undefined {
  if(action === "topToken") {
    if(activeToggle === 'buy') {
      return <><Image className="" width="35" height="35" src="/honey_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$honey</span></>
    }
    if(activeToggle === 'sell') {
      return <><Image className="" width="35" height="35" src="/locks_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$locks</span></>
    }
    if(activeToggle === 'redeem') {
      return <><Image className="" width="35" height="35" src="/locks_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$locks</span></>
    }
  }
  if(action === "bottomToken") {
    if(activeToggle === 'buy') {
      return <><Image className="" width="35" height="35" src="/locks_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$locks</span></>
    }
    if(activeToggle === 'sell') {
      return <><Image className="" width="35" height="35" src="/honey_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$honey</span></>
    }
    if(activeToggle === 'redeem') {
      return <><Image className="" width="35" height="35" src="/honey_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$honey</span></>
    }
  }

  return undefined
}