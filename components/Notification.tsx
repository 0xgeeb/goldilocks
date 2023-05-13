import { useState } from "react"
import Link from "next/link"
import { NotificationProps } from "../utils/interfaces"
import { useNotification } from "../providers/NotificationProvider"

const Notification = ({ hash, title, direction, amount, price, page }: NotificationProps) => {
  
  const { closeNotification } = useNotification()

  const [clickedClose, setClickedClose] = useState<boolean>(false)

  const close = () => {
    setClickedClose(true)
    closeNotification(hash)
  }

  return (
    <div className="flex flex-col py-8 items-center font-acme">
      <span className="absolute right-2 rounded-full border-2 border-black px-2 top-2 hover:bg-black hover:text-white cursor-pointer" onClick={close}>x</span>
      <h1 className="text-[2rem] mb-4">{ title }</h1>
      <h1 className="text-[1.5rem] mb-4">{
        page === 'amm' ? 
          `you ${direction} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} $LOCKS for $${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}` :
        page === 'stake' ? 
          `you ${direction} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} $LOCKS` :
        page === 'claim' ?
          `you claimed ${amount.toLocaleString('en-US', { maximumFractionDigits: 4 })} $PRG` :
          ''
      }</h1>
      <Link href={`https://testnet.snowtrace.io/tx/${hash}`} target="_blank"><h1 className="hover:underline">link to tx</h1></Link>
    </div>
  )

}

export default Notification