
import { Qahiri } from 'next/font/google';
import Link from 'next/link';
import React from 'react'
import { FaCartShopping } from "react-icons/fa6";


const fontq = Qahiri({subsets:['latin'],weight:["400"]})

type Props = {}

function Navbar({ }: Props) {

    const userId = "66353a124f1ce681098a113c" //If we want we can create authentication system but as this is simple ecommerce app , we will use id of already created user

    return (
        <nav className='  z-[9999] sticky  top-0 h-20 bg-white shadow-2xl shadow-gray-400 w-full px-4 sm:px-10 flex justify-between  items-center '>
           <Link href="/">
               <article className='flex justify-center  items-end'>
                    {/* <img src="/logo.png" alt="" className='  size-10' /> */}
                    <h1 className={`${fontq.className} text-3xl font-semibold`}>Riddle Master</h1>
               </article>
           </Link>

            
        </nav>
    )
}

export default Navbar