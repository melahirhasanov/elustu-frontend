import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './layouts/MainLayouts/MainLayout'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

function App() {
  return (
    
    <>
    <Routes>
      <Route path='/' element={<MainLayout/>}>
        <Route index element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Register/>}/>

      </Route>
    </Routes>
    </>
  )
}

export default App
