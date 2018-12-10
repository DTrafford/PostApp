import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { Reply } from '../reply.model';
import { PostService } from '../post.service';
import { PageEvent } from '@angular/material';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  private postSub: Subscription;
  replyClicked = false;
  index: number;
  isLoading = false;
  replyArray: Reply[] = [];

  // Paginator values
  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  userAuthenticated = false;
  displayName: string;
  userId: string;
  private authListenerSubs: Subscription;
  private dNameListenerSubs: Subscription;
  private userIdListenerSubs: Subscription;

  constructor(public postService: PostService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);

    this.postSub = this.postService.getPostUpdateListener()
    .subscribe((postData: {posts: Post[], postCount: number}) => {
      this.isLoading = false;
      this.totalPosts = postData.postCount;
      this.posts = postData.posts;
    });

    this.userAuthenticated = this.authService.getIsAuthenticated();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userAuthenticated = isAuthenticated;
    });

    this.userId = this.authService.getUserId();
    this.userIdListenerSubs = this.authService.getUserIdListener().subscribe(userId => {
      this.userId = userId;
    });

    this.displayName = this.authService.getDisplayName();
    this.dNameListenerSubs = this.authService.getDNameListener().subscribe(displayName => {
      this.displayName = displayName;
    });
  }

  onReply(index: number) {
    this.index = index;
    this.replyClicked = true;
  }

  cancelReply() {
    this.replyClicked = false;
  }

  onReplySubmit(id: string, replyForm: NgForm) {
    const reply = {
      user: this.displayName,
      replyMessage: replyForm.value.replyMessage
    };
    this.postService.addReply(id, reply, this.posts[this.index]);
    replyForm.resetForm();
    this.replyClicked = null;
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
    this.dNameListenerSubs.unsubscribe();
    this.userIdListenerSubs.unsubscribe();
  }
}

  // imageDisplayCheck(image: File | string ) {
  //   if (this.fileTypeChecker(image)) {
  //     this.fileTypeChecker(image);
  //   } else {
  //     return null;
  //   }
  // }
  // fileTypeChecker(file: File | string) {
  //   if (typeof(file) === 'object') {
  //     return file.name.slice((Math.max(0, file.name.lastIndexOf('.')) || Infinity) + 1);
  //   } else {
  //     if (file.slice((Math.max(0, file.lastIndexOf('.')) || Infinity) + 1)) {
  //       return file.slice((Math.max(0, file.lastIndexOf('.')) || Infinity) + 1);
  //     } else {
  //       return null;
  //     }
  //   }
  // }
