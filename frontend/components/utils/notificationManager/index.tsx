"use client"

import { useEffect, useState } from "react"
import { useNotification } from "../../../providers/NotificationProvider"
import Notification from "../../utils/notification"

const AUTOHIDE_TIMER = 1000 * 15

export const NotificationManager = () => {
  
  const { notifications, closeNotification } = useNotification()
  const [areOpen, setAreOpen] = useState<boolean[]>([])

  useEffect(() => {
    const listTrue = new Array(notifications.length).fill(true)
    setAreOpen(listTrue)

    const timerForExpiration = setTimeout(function () {
      for (let i = 0; i < notifications.length; i++) {
        closeNotification(notifications[i].hash)
      }
    }, AUTOHIDE_TIMER)

    return () => {
      clearTimeout(timerForExpiration)
    }
  }, [notifications])

  return (
    <div className={`fixed z-999 bg-[#ffffb4] top-[40%] left-[12.5%] lg:left-[35%] w-[75%] lg:w-[30%] rounded-xl ${notifications.length ? "border-2 border-black" : ""}`}>
      {
        notifications.map((n, index) => {
          const { title, hash, direction, amount, price, page } = n
          return <Notification hash={hash} title={title} direction={direction} amount={amount} price={price} page={page} key={hash} />
        })
      }
    </div>
  )

}