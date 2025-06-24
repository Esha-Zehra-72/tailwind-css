import { auth } from "./firebase"

export const doCreateUserWithEmailAndPassword = async (email, password) =>{
    return doCreateUserWithEmailAndPassword(auth, email, password)
}
export const doSignInWithEmailAndPassword = async (email, password) =>{
    return doSignInWithEmailAndPassword(auth, email, password)
}
