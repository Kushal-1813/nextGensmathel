"use client"

import { useEffect, useState } from "react"
import { useMap } from "@vis.gl/react-google-maps"

export const Circle = (props: google.maps.CircleOptions) => {
  const [circle, setCircle] = useState<google.maps.Circle | null>(null)
  const map = useMap()

  useEffect(() => {
    if (map) {
      setCircle(new google.maps.Circle())
    }
  }, [map])

  useEffect(() => {
    if (circle) {
      circle.setOptions(props)
    }
  }, [circle, props])

  useEffect(() => {
    if (circle && map) {
      circle.setMap(map)
    }
    return () => {
      if (circle) {
        circle.setMap(null)
      }
    }
  }, [circle, map])

  return null
}
