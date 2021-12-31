import { useEffect, useState, useRef } from "react";
import type { MetaFunction, LoaderFunction } from "remix";
import { Form, json, useActionData, redirect } from "remix";
import { gql } from "@apollo/client";
import client from '../../../apollo-client'
import Config from '../../../config'
import LibFlash from '~/lib/LibFlash';
import LibCookie from '~/lib/LibCookie'
import LoadingBox from '~/components/LoadingBox';

export let meta: MetaFunction = () => {
  return {
    title: "Task Create",
    description: "Welcome to remix!"
  };
};

export default function Page() {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [buttonDisplay, setButtonDisplay] = useState(false);
//console.log(cfg.OK_CODE);
  const keyUid = Config.COOKIE_KEY_USER_ID;
  useEffect(() => {
    (async() => {
      const uid = LibCookie.get_cookie(keyUid);
      console.log("uid=", uid);
//      let user_id: string | null = "";
      if(uid === null){
        console.log("uid nothing");
        location.href = '/login';
      }
      setUserId(uid);
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
      setButtonDisplay(true); 
    })()    
  },[])

  let onClick = async function(){
    console.log("#onClick");
    console.log(userId);
    const title = document.querySelector<HTMLInputElement>('#title');
    const result = await client.mutate({
      mutation:gql`
      mutation {
        addBook(token: "${token}" ,
        user_id: "${userId}", title: "${title.value}"){
          id
        }
      }      
    `
    });
console.log(result);
    if(result.data.addBook.id === 'undefined'){
      throw new Error('Error , addTask');
    }
    LibFlash.setMessage("OK, Save");
    alert("OK, Save");
    location.href = "/books";
  }
  
  return (
    <div className="remix__page">
      {buttonDisplay ? (<div />): (
        <LoadingBox></LoadingBox>
      )}      
      <main>
        <h2>books - Create</h2>
        <hr />
        <label>
          <div>Title:</div>
          <input type="text" className="form-control" name="title" id="title" />
        </label>
        <hr />
        {buttonDisplay ? (
          <div className="form-group my-2">
            <button onClick={() => onClick()} className="btn btn-primary">Save
            </button>            
          </div>                
          ): (
            <div></div>
          )
        }        
        {/*
        */}
      </main>
    </div>
  );
}
