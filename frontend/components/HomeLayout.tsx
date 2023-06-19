import { LayoutProps } from "../utils/interfaces"
import { HomeNav } from "./home"

const Layout = ({ children }: LayoutProps) => (
  <div className="m-0 p-0 overflow-hidden box-border flex flex-col h-[100vh]" id="page-div">
    <HomeNav />
    {children}
  </div>
)

export default Layout