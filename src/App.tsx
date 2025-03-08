import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [increase, setIncrease] = useState<number>(0)
    const [decrease, setDecrease] = useState<number>(0)
    const [count,setCount]=useState<number>(0)


    // setCount((prev)=>prev+1);


    return (
        <>
            <div>{count}</div>
            <button onClick={()=>setCount((prev)=>prev-1)}>-</button>
            <button onClick={()=>setCount((prev)=>prev+1)}>+</button>
        </>
    )
}

export default App
