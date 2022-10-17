import { Component, OnInit, Input } from '@angular/core';
// import { TablesService } from '../tables.service';
// import { MatDialog } from '@angular/material';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-action-view',
  templateUrl: './action-view.component.html',
  styleUrls: ['./action-view.component.css']
})
export class ActionViewComponent implements OnInit {

  @Input()
  columnConfig: any

  @Input()
  rowData: any

  @Input()
  value: any
  constructor() { }

  ngOnInit(): void {
  }

  get dataSourceName(): any {
    if (this.valueType == "object" && this.value.hasOwnProperty("source"))
      return this.value.source
    return this.value
  }

  get hiddenDataSourceName(): any {
    if (this.valueType == "object" && this.value.hasOwnProperty("response")) {
      return this.value.response
    }
    return this.value
  }

  get repairStatus() {
    return this.rowData.status
  }

  get displayHiddenValue() {
    if (this.value.hasOwnProperty("type")) {
      return this.value.type
    }
    if (this.valueType == "object" && this.value.hasOwnProperty("response"))
      return this.cellValue(this.hiddenDataSourceName)
    if (this.valueType == "object")
      return this.value.name
    return this.value
  }

  get displayValue() {
    if (this.valueType == "object" && this.value.hasOwnProperty("source"))
      return this.cellValue(this.dataSourceName)
    if (this.valueType == "object") {
      if (this.value.hasOwnProperty("options")) {
        if (this.value.options.hasOwnProperty(this.displayHiddenValue)) {
          return this.value.options[this.displayHiddenValue]
        }
      }
      return this.value.name
    }
    return this.value
  }



  get downloadUrl() {
    if (this.valueType == "object" && this.value.hasOwnProperty("downloadUrl"))
      return this.cellValue(this.value.downloadUrl) == null ? "" : this.cellValue(this.value.downloadUrl)
    return ""
  }

  get downloadCssClass() {
    if (!this.value.hasOwnProperty("downloadUrl") || !this.value.hasOwnProperty("cssClass"))
      return ""
    const options = this.value.cssClass.classes
    const value = this.cellValue(this.value.cssClass.source)
    if (options.hasOwnProperty(value))
      return options[value]
    return options.default
  }

  cellValue(source: string): any {
    const parts = source.split(".")
    let value = `Incorrect Data Source ${this.dataSourceName} `;
    let tempValue = this.rowData;
    //Check if data hardcoded
    if (this.value == "object") {
      if (this.value.hasOwnProperty("data")) {
        return this.value.data
      }
    }
    for (let index in parts) {
      const key = parts[index]
      if (tempValue.hasOwnProperty(key)) {
        tempValue = tempValue[key]
        value = tempValue
      }
    }
    return value
  }

  get valueType() {
    const val = this.value
    const valType = typeof val
    if (valType == "object") {
      const isArray = Array.isArray(val);
      if (isArray)
        return "array"
    }
    return valType
  }

  get responseActionName() {
    if (this.valueType == "object" && this.value.hasOwnProperty("response"))
      return this.cellValue(this.value.response)
    if (this.valueType == "object")
      return this.value.name
    return this.value
  }

  openDialog(row: any): void {
    // const dialogRef = this.dialog.open(DeleteDialogComponent, {
    //   data: this.rowData,
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log('The dialog was closed');
    //   console.log(result)
    // });
  }

  emitAction() {
    //Override delete and Edit
    if (this.responseActionName == "Edit") {
      //Redirect automatically
      // this._tableSerivce.emitAction(this.responseActionName, this.rowData)

    } else if (this.responseActionName == "Delete") {
      //Show delete prompt
      this.openDialog(this.rowData)
      console.log(this.rowData)

    } else {
      // this._tableSerivce.emitAction(this.responseActionName, this.rowData)
    }
  }


}
