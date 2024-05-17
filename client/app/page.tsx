import StartingInterface from "@/components/StartingInterface";
import { v4 as uuidv4 } from 'uuid';



// async function IdGenerator(){
//   "use server"
// }



export default async function Home() {
  const uuid = uuidv4();




  return (
    <main className=" min-h-screen   px-10 ">
        <StartingInterface uniqueId={uuid as string}/>
    </main>
  );
}
