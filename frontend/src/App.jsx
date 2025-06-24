import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Practice from "./Practice";
import Contect from "./Contect";
import About from "./About";
import Navbar from "./Navbar";
import Success from "./Stripe/Success";
import CheckoutButton from "./Stripe/CheckoutButton";
// import Map from "./Map/Map"; // optional
// import toast, { Toaster } from 'react-hot-toast';
// import { useEffect } from "react";
// import { generateToken, messaging } from './Notification/firebase'
// import { onMessage } from "firebase/messaging";

const router = createBrowserRouter([
  // {
  //   path: '/',
  //   element: (
  //     <>
  //       <Navbar />
  //       <Practice />
  //     </>
  //   ),
  // },
  {
    path: '/about',
    element: (
      <>
        <Navbar />
        <About />
      </>
    ),
  },
  {
    path: '/contect',
    element: (
      <>
        <Navbar />
        <Contect />
      </>
    ),
  },
  {
    path: '/success',
    element: (
      <>
        <Navbar />
        <Success />
      </>
    ),
  },
  {
    path: '/',
    element: (
      <>
        <Navbar />
        <CheckoutButton />
      </>
    ),
  },
]);

function App() {
  // Optional: setup Firebase notification if needed
  // useEffect(() => {
  //   generateToken()
  //   onMessage(messaging, (payload) => {
  //     console.log("Payload = ", payload)
  //     toast(payload.notification.body)
  //   })
  // }, [])

  return (
    <>
      <RouterProvider router={router} />
      {/* <Toaster position="top-right" /> */}
    </>
  );
}

export default App;
