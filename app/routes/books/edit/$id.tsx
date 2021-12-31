import { useCatch, Link, json, useLoaderData } from "remix";
import type { LoaderFunction, MetaFunction } from "remix";
import React, {useState, useEffect, useRef} from 'react';
import { gql } from "@apollo/client";
import client from '../../../../apollo-client'
import LibFlash from '~/lib/LibFlash';
import LibCookie from '~/lib/LibCookie';
import Config from '../../../../config';
import LoadingBox from '~/components/LoadingBox';

export let loader: LoaderFunction = async ({ params }) => {
  if (params.id === "this-record-does-not-exist") {
    throw new Response("Not Found", { status: 404 });
  }
  if (params.id === "shh-its-a-secret") {
    throw json({ webmasterEmail: "hello@remix.run" }, { status: 401 });
  }
  return { param: params.id };
};

export default function BookEdit() {
  let data = useLoaderData();
  const param = data.param;
//  console.log(param);
  // state
  const [task, setTask] = useState([]);
  const [title, setTitle] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [buttonDisplay, setButtonDisplay] = useState(false);
  const keyUid = Config.COOKIE_KEY_USER_ID;
  useEffect(() => {
    (async() => {
      const uid = LibCookie.get_cookie(keyUid);
      console.log("uid=", uid);
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
//console.log(data.data.getToken);  
      setToken(data.data.getToken);
      setButtonDisplay(true);  
      initTask();
    })()    
  },[])  
  const initTask = async function(){
    try{
      const result = await client.query({
        query: gql`
        query {
          book(id: "${param}"){
            id
            title
            content
            created_at
          }            
        }            
        `,
        fetchPolicy: "network-only"
      });
      const item = result.data.book;
console.log(item);
      setTask(item);
      setTitle(item.title);
    } catch (e) {
      console.error(e);
    }
  }
  let item: any = task;
  let onClick = async function(){
console.log("#onClick");
console.log(token, userId);
    const title = document.querySelector<HTMLInputElement>('#title');
console.log("title=", title.value);
    const result = await client.mutate({
      mutation: gql`
      mutation {
        updateBook(token: "${token}",
        user_id: "${userId}",
        id: "${item.id}", title: "${title.value}"){
          id
        }
      }                   
    `
    });
    console.log(result);
    if(result.data.updateBook.id === 'undefined'){
      throw new Error('Error , updateTask');
    }
    LibFlash.setMessage("OK, Save");
    alert("OK, Save");
    location.href = "/books";
  }
  let clickDelete = async function(){
    console.log("#clickDelete");
    console.log(token, userId);
    const result = await client.mutate({
      mutation:  gql`
      mutation {
        deleteBook(token: "${token}",
        user_id: "${userId}", id: "${item.id}"){
          id
        }
      }            
    ` 
    })
console.log(result);
    if(result.data.deleteBook.id === 'undefined'){
      throw new Error('Error , deleteTask');
    }
    LibFlash.setMessage("OK, delete");
    alert("OK, delete"); 
    location.href = "/books";   
  }  
//console.log(item);
  return (
    <div className="remix__page">
      {buttonDisplay ? (<div />): (
        <LoadingBox></LoadingBox>
      )}      
      <h3>Book - Edit</h3>
      <hr />
      <label>
        <div>Title:</div>
        <input name="title" id="title" type="text" className="form-control"
         defaultValue={title} />
      </label>      
      {buttonDisplay ? (
        <div className="form-group my-2">
          <hr />
          <button onClick={() => onClick()} className="btn btn-primary">Save
          </button>
          <hr />
          <button onClick={() =>clickDelete()} className="btn btn-danger">Delete
          </button>      
        </div>                
        ): (
          <div></div>
        )
      }      
      <hr />
      <p>ID: {}</p>
    </div>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  let message: React.ReactNode;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Looks like you tried to visit a page that you do not have access to.
          Maybe ask the webmaster ({caught.data.webmasterEmail}) for access.
        </p>
      );
    case 404:
      message = (
        <p>Looks like you tried to visit a page that does not exist.</p>
      );
    default:
      message = (
        <p>
          There was a problem with your request!
          <br />
          {caught.status} {caught.statusText}
        </p>
      );
  }

  return (
    <>
      <h2>Oops!</h2>
      <p>{message}</p>
      <p>
        (Isn't it cool that the user gets to stay in context and try a different
        link in the parts of the UI that didn't blow up?)
      </p>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <>
      <h2>Error!</h2>
      <p>ErrorBoundary: {error.message}</p>
      <p>
        (Isn't it cool that the user gets to stay in context and try a different
        link in the parts of the UI that didn't blow up?)
      </p>
    </>
  );
}

export let meta: MetaFunction = ({ data }) => {
  return {
    title: data ? `Param: ${data.param}` : "Oops...",
  };
};
