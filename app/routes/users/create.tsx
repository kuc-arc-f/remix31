import { useEffect, useState, useRef } from "react";
import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
import { Form, json, useActionData, redirect } from "remix";
import { gql } from "@apollo/client";
import client from '../../../apollo-client'
import Config from '../../../config'

export let meta: MetaFunction = () => {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!"
  };
};
export let loader: LoaderFunction = async () => {
  const data = await client.query({
    query: gql`
    query {
      userCount
    }    
    `,
    fetchPolicy: "network-only"
  });
console.log(data.data.userCount); 
  return json({count: data.data.userCount });
}
export default function Page() {
  let data: any = useLoaderData<any>();
  const count = data.count;
  //state
  const [token, setToken] = useState("");
console.log(count);
  useEffect(() => {
    if(count > 0){
      alert("Error, user max  1");
      location.href = "/login";
    }
    (async() => {
      const data = await client.query({
        query: gql`
        query {
          getToken
        }      
        `,
        fetchPolicy: "network-only"
      });
  console.log(data.data.getToken);  
      setToken(data.data.getToken);      
    })()
  },[])

  let onClick = async function(){
    try{
      console.log("#onClick");
      console.log(token);
      const name = document.querySelector<HTMLInputElement>('#name');
      const mail = document.querySelector<HTMLInputElement>('#mail');
      const password = document.querySelector<HTMLInputElement>('#password');
      // addUser(
      const result = await client.mutate({
        mutation:gql`
        mutation {
          addUser(token: "${token}",
          name: "${name.value}", email: "${mail.value}", password: "${password.value}"){
            id
          }          
        }                            
      `
      });
  console.log(result);
      if(typeof result.data.addUser.id === 'undefined'){
        throw new Error('Error , onClick');
      }
      alert("OK, Save");
      location.href = "/login";
    } catch (e) {
      console.error(e);
      alert("error, save");
    }    
  }
  
  return (
    <div className="remix__page">
      <main>
        <h2>User - Create</h2>
        <hr />
        <div className="col-sm-6">
          <label>
            <div>Mail:</div>
            <input type="text" className="form-control" name="mail" id="mail" />
          </label>
        </div>
        <div className="col-sm-6">
          <label>
            <div>name:</div>
            <input type="text" className="form-control" name="name" id="name" />
          </label>
        </div>
        <div className="col-sm-6">
          <label>
            <div>password:</div>
            <input type="password" className="form-control" name="password" id="password" />
          </label>        
        </div>
        <hr />
        <button onClick={() => onClick()} className="btn btn-primary">Save
        </button>
        {/*
        */}
      </main>
    </div>
  );
}
