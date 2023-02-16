import { LayoutProps } from "../../interfaces"
import Nav from "./Nav"

const Layout = ({ children }: LayoutProps) => (
  <div className="m-0 p-0 overflow-hidden box-border flex flex-col h-[100vh]" id="page-div">
    <Nav />
    {children}
  </div>
)

export default Layout