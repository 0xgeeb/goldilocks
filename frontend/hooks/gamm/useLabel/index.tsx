import Image from "next/image"

export function useLabel(
  buyToggle: boolean, 
  sellToggle: boolean,
  redeemToggle: boolean,
  action: string
): string | JSX.Element | undefined {
  if(action === "topToken") {
    if(buyToggle) {
      return <><Image className="" width="35" height="35" src="/honey_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$honey</span></>
    }
    if(sellToggle) {
      return <><Image className="" width="35" height="35" src="/locks_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$locks</span></>
    }
    if(redeemToggle) {
      return <><Image className="" width="35" height="35" src="/locks_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$locks</span></>
    }
  }
  if(action === "bottomToken") {
    if(buyToggle) {
      return <><Image className="" width="35" height="35" src="/locks_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$locks</span></>
    }
    if(sellToggle) {
      return <><Image className="" width="35" height="35" src="/honey_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$honey</span></>
    }
    if(redeemToggle) {
      return <><Image className="" width="35" height="35" src="/honey_logo.png" alt="lost"/><span className="font-acme text-[25px] ml-4">$honey</span></>
    }
  }

  return undefined
}