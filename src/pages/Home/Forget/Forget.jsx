import { Box, Button, Container, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Forget = () => {
    const [email,setEmail]=useState("")
    const [message,setMessage]=useState("")
    const navigate=useNavigate()
const handleSubmit=async(e)=>{
e.preventDefault()
try{
    const response=await fetch("/api/auth/forget-password")
}
}
  return (
    <div>Forget</div>
  )
}

export default Forget