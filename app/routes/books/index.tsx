import React, { Component } from 'react';
import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
import { Form, json, useActionData, redirect } from "remix";

import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';
import LibPagenate from '~/lib/LibPagenate';
import { gql } from "@apollo/client";
import client from '../../../apollo-client'
import Config from '../../../config'
import LibCookie from '~/lib/LibCookie';
import LibFlash from '~/lib/LibFlash';

interface IProps {
  history:string[],
}
interface IState {
  data: any[],
  data_all: any[],
  offset: number,
  perPage: number,
  pageCount: number,
  message: string,
}

export default class Demo extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      data_all: [],
      offset: 0,
      perPage: 10,
      pageCount: 0,
      message: '',
    };
  }
  async componentDidMount() {
    try{
      const keyUid = Config.COOKIE_KEY_USER_ID;
      const uid = LibCookie.get_cookie(keyUid);
      console.log("uid=", uid);
      if(uid === null){
        console.log("uid nothing");
        location.href = '/login';
      }
      const items = await this.initTask();
      LibPagenate.set_per_page(5);
      const n = LibPagenate.getMaxPage(items.length);
  console.log(items.length, n);
      const d = LibPagenate.getPageStart(0);
      const msg: any = LibFlash.getMessageObject();
      console.log(msg);        
      this.setState({
        pageCount: n, data: items.slice(d.start, d.end), data_all: items,
        message: msg.success,
      });
    } catch (e) {
      console.error(e);
    }
//console.log(d);
  }
  async initTask(){
    const data = await client.query({
      query: gql`
      query {
        books {
          id
          title
          created_at
        }
      }      
      `,
      fetchPolicy: "network-only"
    });
    console.log(data.data.books);
    const items = data.data.books;
    return items;
  }
  handlePageClick = (data: any) => {
    console.log('onPageChange', data);
    let selected = data.selected;
    let offset = Math.ceil(selected * this.state.perPage);
    const d = LibPagenate.getPageStart(selected);
//console.log(d);
    this.setState({
      offset: offset, data: this.state.data_all.slice(d.start, d.end) 
    });
  };
  render() {
console.log(this.state);
    const currentPage = Math.round(this.state.offset / this.state.perPage);
    return (
      <div className="commentBox">
        { this.state.message ? 
        <div className="alert alert-success" role="alert">{this.state.message}</div> 
        : <div /> 
        }        
        <h3>Demo</h3>
        <hr />
        <Link to="/books/create" className="btn btn-primary">Create</Link>
        <hr />
        <ul>
        {this.state.data.map(item => (
          <li key={item.id} className="remix__page__resource">
            <h3>{item.title}</h3>
            <Link to={item.id} className="btn btn-sm btn-outline-primary mx-2">Show</Link>
            <Link to={`edit/${item.id}`} 
            className="btn btn-sm btn-outline-primary">edit
            </Link><br />
            ID: {item.id}
            <hr className="my-2" />
          </li>
        ))}
        </ul>

        <hr />
        <nav aria-label="Page navigation comments" className="mt-4">
          <ReactPaginate
            previousLabel="previous"
            nextLabel="next"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="page-link"
            pageCount={this.state.pageCount}
            pageRangeDisplayed={4}
            marginPagesDisplayed={2}
            onPageChange={this.handlePageClick}
            containerClassName="pagination justify-content-center"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            activeClassName="active"
            hrefBuilder={(page, pageCount) =>
              page >= 1 && page <= pageCount ? `/page/${page}` : '#'
            }
            hrefAllControls
            forcePage={currentPage}
            onClick={(clickEvent) => {
              console.log('onClick', clickEvent);
            }}
          />
        </nav>
        <hr className="my-4" />
      </div>
    );
  }  
}