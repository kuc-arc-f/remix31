import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';
import LibPagenate from '../lib/LibPagenate';

interface IProps {
  history:string[],
}
interface IState {
  data: any[],
  offset: number,
  perPage: number,
  pageCount: number,
}
interface IPropsComment {
  data: any[],
} 

const TestData = [
  {title: 'title-1', comment: 'commnet-1', username: 'user_1'},
  {title: 'title-2', comment: 'commnet-2', username: 'user_2'},
  {title: 'title-3', comment: 'commnet-3', username: 'user_3'},
  {title: 'title-4', comment: 'commnet-4', username: 'user_4'},
  {title: 'title-5', comment: 'commnet-5', username: 'user_5'},
  {title: 'title-6', comment: 'commnet-6', username: 'user_6'},
  {title: 'title-7', comment: 'commnet-7', username: 'user_7'},
  {title: 'title-8', comment: 'commnet-8', username: 'user_8'},
  {title: 'title-9', comment: 'commnet-9', username: 'user_9'},
  {title: 'title-10', comment: 'commnet-10', username: 'user_10'},
  {title: 'title-11', comment: 'commnet-11', username: 'user_11'},
  {title: 'title-12', comment: 'commnet-12', username: 'user_12'},
];

export class CommentList extends Component<IPropsComment> {
  static propTypes = {
    data: PropTypes.array.isRequired,
  };

  render() {
    let commentNodes = this.props.data.map(function (comment, index) {
      return (
        <li key={index} className="list-group-item">
          <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1">{comment.comment}</h5>
          </div>
          <small>From {comment.username}.</small>
        </li>
      );
    });

    return (
      <div id="project-comments" className="commentList">
        <ul className="list-group">{commentNodes}</ul>
      </div>
    );
  }
}

export default class Demo extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      offset: 0,
      perPage: 10,
      pageCount: 0,
    };
  }
  componentDidMount() {
    LibPagenate.set_per_page(5);
    const n = LibPagenate.getMaxPage(TestData.length);
console.log(TestData.length, n);
    const d = LibPagenate.getPageStart(0);
//console.log(d);
//console.log(TestData.slice(d.start, d.end));
    this.setState({
      pageCount: n, data: TestData.slice(d.start, d.end),
    });
  }
  handlePageClick = (data: any) => {
    console.log('onPageChange', data);
    let selected = data.selected;
    let offset = Math.ceil(selected * this.state.perPage);
    const d = LibPagenate.getPageStart(selected);
//console.log(d);
    this.setState({
      offset: offset, data: TestData.slice(d.start, d.end) 
    });
  };
  render() {
    const currentPage = Math.round(this.state.offset / this.state.perPage);
    return (
      <div className="commentBox">
        <h3>Demo</h3>
        <hr />
        <CommentList data={this.state.data} />
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