import { createBrowserRouter } from "react-router-dom";
import Practice from "./Practice";
import Contect from "./Contect";
import About from "./About";
import Navbar from "./Navbar";
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useRef } from "react";
import { generateToken, messaging } from './Notification/firebase'
import { onMessage } from "firebase/messaging";
import Map from "./Map/Map";
function App() {
  // useEffect(() => {
  //   generateToken()
  //   onMessage(messaging, (payload) => {
  //     console.log("Payload = ", payload)
  //     toast(payload.notification.body)
  //   })
  // }, [])
  // const router = createBrowserRouter([
  //   {
  //     path: '/',
  //     element: <>      <Navbar /><Practice /></>
  //   },
  //   {
  //     path: '/about',
  //     element: <>      <Navbar /><About />
  //     </>
  //   },
  //   {
  //     path: '/contect',
  //     element: <>      <Navbar /><Contect />
  //     </>
  //   }
  // ])

  return (
    <>
      {/* <Toaster position="top-right"/> */}
      <Map />
    </>
  )
}

export default App
