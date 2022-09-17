import React from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import "./index.css"
import Home from "./pages/Home.jsx"


export default function App() {
  return (
    <Router>
      <div className="flex flex-col relative min-w-screen min-h-screen m-0 p-0 overflow-x-hidden bg-[#F7F7F7]">
        <Routes>
          <Route exact path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  )
}