import Cart from '@/components/Cart'
import React from 'react'

type Props = {
    params:{
        userId:string
    }
}

function page({params}: Props) {
    const userId = params.userId
    
    // fetch(`https://localhost:5000/${userId}`) - if we want to fetch data from db , we can do this but lets keep it simple as required in task


  return (
    <Cart/>
  )
}

export default page