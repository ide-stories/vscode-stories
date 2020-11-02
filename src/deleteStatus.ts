import { window, StatusBarItem, StatusBarAlignment } from "vscode";

export class DeleteStatus {
  static deleteStatus: DeleteStatus;
  static storyId?: string;
  private item: StatusBarItem;
  constructor() {
    this.item = window.createStatusBarItem(StatusBarAlignment.Right);
    this.item.show();
    this.item.text = "$(trash) delete story";
    this.item.command = "stories.delete";
  }

  static createDeleteStatus = (storyId: string) => {
    DeleteStatus.storyId = storyId;
    if (!DeleteStatus.deleteStatus) {
      DeleteStatus.deleteStatus = new DeleteStatus();
    }
  };

  static loading = () => {
    DeleteStatus.deleteStatus.item.text = "loading...";
  };

  static doneLoading = (_good: boolean) => {
    DeleteStatus.deleteStatus.item.text = "$(trash) delete story";
  };
}
