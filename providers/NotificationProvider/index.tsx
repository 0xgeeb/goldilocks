import React, { createContext, PropsWithChildren, useContext, useState } from "react"
import { NotificationProps, NotificationProviderState } from "../../utils/interfaces"


export const INITIAL_STATE: NotificationProviderState = {
  notifications: new Array<NotificationProps>,
  openNotification: () => {},
  closeNotification: () => {}
}

export const NotificationContext = createContext<NotificationProviderState>(INITIAL_STATE)

export const NotificationProvider = (props: PropsWithChildren<{}>) => {

  const [notifications, setNotifications] = useState<Array<NotificationProps>>(INITIAL_STATE.notifications)
  const { children } = props

  const closeNotification = (notificationHash: string) => {
    setNotifications((notifications) => {
      return notifications.filter(({ hash }) => hash !== notificationHash)
    })
  }

  const openNotification = (notification: NotificationProps) => {
    setNotifications((notifications) => [...notifications, notification])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        closeNotification,
        openNotification
      }}
    >
      { children }
    </NotificationContext.Provider>
  )

}

export const useNotification = () => useContext(NotificationContext)