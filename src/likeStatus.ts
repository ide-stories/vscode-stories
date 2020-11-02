import { window, StatusBarItem, StatusBarAlignment } from "vscode";

export class LikeStatus {
  static likeStatus: LikeStatus;
  static storyId?: string;
  static likes: number = 0;
  private item: StatusBarItem;
  constructor() {
    this.item = window.createStatusBarItem(StatusBarAlignment.Right);
    this.item.show();
  }

  static createLikeStatus = () => {
    if (!LikeStatus.likeStatus) {
      LikeStatus.likeStatus = new LikeStatus();
    }
  };

  static loading = () => {
    LikeStatus.likeStatus.item.text = `loading...`;
  };

  static setLikes(likes: number, storyId?: string) {
    LikeStatus.likes = likes;
    LikeStatus.likeStatus.item.text = `$(heart) ${likes} likes`;
    if (storyId) {
      LikeStatus.storyId = storyId;
      LikeStatus.likeStatus.item.command = "stories.like";
    } else {
      LikeStatus.storyId = undefined;
      LikeStatus.likeStatus.item.command = undefined;
    }
  }

  static removeItem() {
    LikeStatus.likeStatus.dispose();
  }

  dispose() {
    this.item.dispose();
  }
}
