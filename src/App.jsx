import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Button from "./Button";
import Practice from "./Practice";
import Contect from "./Contect";
import About from "./About";
import Navbar from "./Navbar";

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <>      <Navbar /><Practice /></>
    },
    {
      path: '/about',
      element: <>      <Navbar /><About />
      </>
    },
    {
      path: '/contect',
      element: <>      <Navbar /><Contect />
      </>
    }
  ])
  return (
    <>

      <Button />
      <RouterProvider router={router} />
    </>
  )
}

export default App
