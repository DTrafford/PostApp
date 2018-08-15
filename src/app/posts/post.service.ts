import { Post } from './post.model';
import { Reply } from './reply.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts';

@Injectable()
export class PostService {

    constructor(private http: HttpClient, private router: Router) {}
    posts: Post[] = [];
    private postsUpdated = new Subject<{posts: Post[], postCount: number}>();
    replyArray: Reply[] = [];

    getPosts(postsPerPage: number, currentPage: number) {
      const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http
            .get<{ message: string, posts: any, totalPosts: number }>(
              BACKEND_URL + queryParams)
            .pipe(map((postData) => {
                return { posts: postData.posts.map(post => {
                    return {
                        id: post._id,
                        title: post.title,
                        content: post.content,
                        creatorId: post.creatorId,
                        creatorName: post.creatorName,
                        replies: post.replies,
                        imagePath: post.imagePath
                    };
                }), totalPosts: postData.totalPosts};
            }))
            .subscribe((returnedPostsData) => {
              this.posts = returnedPostsData.posts;
              this.postsUpdated.next({posts: [...this.posts], postCount: returnedPostsData.totalPosts});
            });
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string) {
      return this.http.get<Post>(BACKEND_URL + '/' + id);
    }

    addPost(post: Post, image: File | string) {
      let postData: Post | FormData;
      if (image) {
      postData = new FormData();
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('replies', JSON.stringify(post.replies)); // Because replies is an array
      postData.append('image', image, post.title);
      } else {
        postData = {
          id: post.id,
          title: post.title,
          content: post.content,
          creatorId: post.creatorId,
          creatorName: null,
          replies: post.replies,
          imagePath: null
        };
      }
      this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
        .subscribe((responseData) => {
          this.router.navigate(['/']);
        });
    }

    updatePost(id: string, post: Post, image: string) {
      // Nessecary for dynamic file updates and must have image: File | string as a paramater
      // let postData: Post | FormData;
      // if (typeof image === 'object') {
      //   postData = new FormData();
      //   postData.append('id', id);
      //   postData.append('title', post.title);
      //   postData.append('content', post.content);
      //   postData.append('replies', JSON.stringify(post.replies));
      //   postData.append('image', image);
      // } else {

      let postData: Post;
          postData = {
            id: post.id,
            title: post.title,
            content: post.content,
            creatorId: post.creatorId,
            creatorName: null,
            replies: post.replies,
            imagePath: image
          };
        // }
        this.http.put(BACKEND_URL + '/' + id, postData)
        .subscribe((response) => {
          this.router.navigate(['/']);
        });
    }

    addReply(id: string, reply: Reply, post: Post) {
      if (post.replies) {
        post.replies.push(reply);
      } else {
        post.replies = [
          {
            user: reply.user,
            replyMessage: reply.replyMessage
          }];
      }
      this.http.put(BACKEND_URL + '/' + id + '/addReply', post)
      .subscribe((responseData) => {
        console.log(responseData);
      });
    }

    deletePost(postId: string) {
        return this.http.delete(BACKEND_URL + '/' + postId);
    }
}
