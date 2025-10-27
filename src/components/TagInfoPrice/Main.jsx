import React from 'react'
import Home from './Home'
import { TagContextProvider } from '../../context/TagContext'

const Main = () => {
  return (
    <TagContextProvider>
    <Home/>
    </TagContextProvider>
  )
}

export default Main