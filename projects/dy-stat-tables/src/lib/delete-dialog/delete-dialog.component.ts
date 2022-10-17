import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// import { MyTableStateService } from '../my-table-state.service';
// import { TablesService } from '../tables.service';

export interface ConfirmDeleteDialogData {
  name: string;
}


@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent implements OnDestroy {
  isLoading = false
  hasErrors = false
  error = ""
  private _deleteSubscription: any

  constructor(
    // public dialogRef: MatDialogRef<DeleteDialogComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    // private tableStateService: MyTableStateService,
    // private tableServ: TablesService
  ) {
    // console.log(this.tableStateService.listUrl)
  }

  onNoClick(): void {
    // this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this._deleteSubscription) {
      this._deleteSubscription.unsubscribe()
    }
  }

  setError(message = "", status = true) {
    this.error = message
    this.hasErrors = status
  }

  onDelete(): void {
    // this.isLoading = true
    // this.setError("", false)
    // this._deleteSubscription = this.tableServ.delete(this.data, this.tableStateService.listUrl).subscribe(res => {
    //   this.isLoading = false
    //   this.dialogRef.close();
    // }, respError => {
    //   if (respError.hasOwnProperty("error") && respError.error.hasOwnProperty("detail")) {
    //     this.setError(respError.error.detail, true)
    //   } else {
    //     this.setError("Failed, try again later", true)
    //   }
    //   this.isLoading = false
    // })
  }

}
