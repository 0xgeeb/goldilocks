import { 
  Landing,
  Products,
  Discord
} from "../components/home"

export default function Page() {
  
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Landing />
      <Products />
      <Discord />
    </div>
  )
}