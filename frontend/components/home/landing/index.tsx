import { 
  HomeNav, 
  HomeTitle, 
  HomeImages 
} from "../"

export const Landing = () => {
  return (
    <div className="w-screen h-screen relative" id="page-div">
      <HomeNav />
      <HomeTitle />
      {/* <HomeImages /> */}
      <img 
        className="h-[65%] w-[50%] absolute right-0 bottom-0" 
        src="/dancing.png" 
        alt="dancing"
        key="dancing"
      />
    </div>
  )
}