import { React, useState } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import "./index.css"
import Nav from "./components/Nav.jsx"
import Home from "./pages/Home.jsx"
import Amm from "./pages/Amm.jsx"
import Staking from "./pages/Staking.jsx"
import Borrowing from "./pages/Borrowing.jsx"

export default function App() {

  const [currentAccount, setCurrentAccount] = useState(null)
  const [avaxChain, setAvaxChain] = useState(null)

  return (
    <Router>
      <div className="m-0 p-0 overflow-x-hidden" id="page-div">
        <Nav  currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} avaxChain={avaxChain} setAvaxChain={setAvaxChain} />
        <Routes>
          <Route exact path="/" element={<Home currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} avaxChain={avaxChain} setAvaxChain={setAvaxChain} />} />
          <Route exact path="/amm" element={<Amm currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} avaxChain={avaxChain} setAvaxChain={setAvaxChain} />} />
          <Route exact path="/staking" element={<Staking currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} avaxChain={avaxChain} setAvaxChain={setAvaxChain} />} />
          <Route exact path="/borrowing" element={<Borrowing currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} avaxChain={avaxChain} setAvaxChain={setAvaxChain} />} />
        </Routes>
      </div>
    </Router>
  )
}