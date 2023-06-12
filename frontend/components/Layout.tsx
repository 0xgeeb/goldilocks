import { LayoutProps } from "../utils/interfaces"
import Nav from "./Nav"

const Layout = ({ children }: LayoutProps) => (
  <div className="m-0 p-0 overflow-hidden box-border w-[100vw] h-[100vh]" id="page-div">
    <Nav />
    {children}
  </div>
)

export default Layout