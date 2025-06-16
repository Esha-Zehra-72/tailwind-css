import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../Notification/firebase";

const AuthContext = createContext()
export const useAuth = ()=>{
    return useContext(AuthContext)
}
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [userLoggedIn, setuserLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, initializeUser)
        return unSubscribe
    }, [])

    const initializeUser = async (user) => {
        if (user) {
            setCurrentUser({ ...user })
            setuserLoggedIn(true)
        } else {
            setCurrentUser(false)
            setuserLoggedIn(false)
        }
        setLoading(false)
    }


    const value = {
        currentUser,
        userLoggedIn,
        loading
    }

    return(
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

