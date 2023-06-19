import { 
  HomeNav, 
  HomeTitle, 
  HomeImages 
} from "../components/home"

export default function Page() {
  
  return (
    <div className="w-screen h-screen relative" id="page-div">
      <HomeNav />
      <HomeTitle />
      <HomeImages />
    </div>
  )
}