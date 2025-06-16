import React, { useEffect, useState } from 'react'

const useGeolocation = () => {

    const [position, setPosition] = useState({
        latitude: 0,
        longitude: 0
    })

    useEffect(() => {
        const geo = navigator.geolocation;
        function onSuccess(position) {
            setPosition({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            })
        }

        function onError(error) {
            console.log("Error Retriving geoloaction : ", error)
        }

        const watcher = geo.watchPosition(onSuccess, onError)
        return () => geo.clearWatch(watcher)
    }, [])
    return position
}

export default useGeolocation;