import { View, Text } from "react-native";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from "react";
import { isTokenValid } from "../fn";
import EmployerHome from "./employerHome";
import JobseekerHome from "./jobseekerHome";

export default Home = () => {
  const token = useSelector((state) => state.token);
  const role = useSelector((state) => state.role);

  useEffect(()=>{
    if(isTokenValid(token))
    alert('token valid')
  },[])

    return(
      <>
      {role === 'em' ? <EmployerHome token={token} role={role}/> : <JobseekerHome token={token} role={role}/>}
      </>
    )
}