import { Component, OnInit, OnDestroy } from "@angular/core";

import { Post } from "../post.model";
import { Reply } from "../reply.model";
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormArray
} from "@angular/forms";
import { PostService } from "../post.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { mimeType } from "./mime-type.validator";
import { AuthService } from "../../auth/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = "";
  enteredContent = "";
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  replyArray: Reply[];
  mode = "create";
  private postId: string;
  userId: string;
  displayName: string;
  isAuthenticated: boolean;
  private dNameListenerSubs: Subscription;
  private userIdListenerSubs: Subscription;
  private authStatusListenerSubs: Subscription;

  constructor(
    public postService: PostService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(
        null,
        { validators: [Validators.required, Validators.minLength(2)] },
        null
      ),
      image: new FormControl(null, { asyncValidators: [mimeType] }, null),
      content: new FormControl(
        null,
        { validators: [Validators.required] },
        null
      )
    });
    this.userId = this.authService.getUserId();
    this.userIdListenerSubs = this.authService
      .getUserIdListener()
      .subscribe(userId => {
        this.userId = userId;
      });

    this.isAuthenticated = this.authService.getIsAuthenticated();
    this.authStatusListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isAuthenticated = authStatus;
        this.isLoading = false;
      });

    this.displayName = this.authService.getDisplayName();
    this.dNameListenerSubs = this.authService
      .getDNameListener()
      .subscribe(displayName => {
        this.displayName = displayName;
      });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        // start fetching data
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postData => {
          // get result
          this.isLoading = false;
          this.post = {
            id: postData.id, // possibly _id
            title: postData.title,
            content: postData.content,
            creatorId: postData.creatorId,
            creatorName: postData.creatorName,
            replies: postData.replies,
            imagePath: postData.imagePath
          };
          this.replyArray = this.post.replies;
          this.form.setValue({
            title: this.post.title,
            image: this.post.imagePath,
            content: this.post.content
          });
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    // To check file type before we patch
    if (
      this.fileTypeChecker(file).match(/jpg/i) ||
      this.fileTypeChecker(file).match(/jpeg/i) ||
      this.fileTypeChecker(file).match(/png/i) ||
      this.fileTypeChecker(file).match(/gif/i)
    ) {
      this.form.patchValue({ image: file });
      this.form.get("image").updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please enter a valid file type of JPG, PNG or GIF");
      return;
    }
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }

    const post: Post = {
      id: null,
      title: this.form.value.title,
      content: this.form.value.content,
      creatorId: this.userId,
      creatorName: this.displayName,
      replies: this.replyArray,
      imagePath: this.form.value.imagePath
    };
    this.isLoading = true;
    if (this.mode === "create") {
      this.postService.addPost(post, this.form.value.image);
    } else {
      this.postService.updatePost(this.postId, post, this.form.value.image);
      this.mode = "create";
    }
    this.form.reset();
  }

  fileTypeChecker(file: File) {
    return file.name.slice(
      (Math.max(0, file.name.lastIndexOf(".")) || Infinity) + 1
    );
  }

  ngOnDestroy() {
    this.dNameListenerSubs.unsubscribe();
    this.userIdListenerSubs.unsubscribe();
    this.authStatusListenerSubs.unsubscribe();
  }
}
