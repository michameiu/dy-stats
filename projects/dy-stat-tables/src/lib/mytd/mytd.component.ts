import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mytd',
  templateUrl: './mytd.component.html',
  styleUrls: ['./mytd.component.scss']
})
export class MytdComponent implements OnInit {


  @Input()
  columnConfig: any

  @Input()
  rowData: any = {}

  @Input()
  isHeaderCell: boolean = false

  constructor() { }

  ngOnInit(): void {
  }
  get columnConfigDataType() {
    return typeof this.columnConfig
  }
  get columnName(): any {
    if (this.columnConfigDataType == "string")
      return this.columnConfig
    if (this.columnConfigDataType == "object")
      return this.columnConfig.name
    return ""
  }


  get dataSourceName(): any {
    if (this.columnConfigDataType == "object" && this.columnConfig.hasOwnProperty("source"))
      return this.columnConfig.source
    return this.columnName.replace(/ /g, "_").toLocaleLowerCase()
  }

  get cellValue(): any {
    if (this.isHeaderCell)
      return `${this.columnName[0].toLocaleUpperCase()}${this.columnName.substr(1, this.columnName.length - 1)}`
    const parts = this.dataSourceName.split(".")
    let value = `Incorrect Data Source ${this.dataSourceName} `;
    let tempValue = this.rowData;
    //Check if data hardcoded
    if (this.columnConfigDataType == "object") {
      if (this.columnConfig.hasOwnProperty("data")) {
        return this.columnConfig.data
      }
    }
    for (let index in parts) {
      const key = parts[index]
      // if (!tempValue) {
      //   value = "null"
      // }
      if (tempValue && tempValue.hasOwnProperty(key)) {
        tempValue = tempValue[key]
        value = tempValue
      }
    }
    return value
  }
  get arrayDisplayName() {
    if (this.columnConfigDataType == "object" && this.columnConfig.hasOwnProperty("display_name")) {
      return this.columnConfig.display_name
    }
    return this.columnName
  }
  get isActions(): boolean {
    if (this.isHeaderCell) return false
    if (this.columnConfigDataType == "object") {
      return this.columnConfig.hasOwnProperty("type")
    }
    return false
  }

  get _displayValue() {
    if (this.isHeaderCell)
      return `${this.columnName[0].toLocaleUpperCase()}${this.columnName.substr(1, this.columnName.length - 1)}`

    if (this.columnConfigDataType == "object" && this.CellValueType == "array") {
      //Check if there is type in config and pass as it is
      if (this.columnConfig.hasOwnProperty("type")) {
        return this.cellValue
      }

      return this.cellValue.map((element: any) => {
        if (element.hasOwnProperty(this.arrayDisplayName)) {
          return element[this.arrayDisplayName]
        } else {
          return element
        }
        return `No field "${this.arrayDisplayName}"`
      })
    }
    return this.cellValue
  }

  get displayValue(): any {
    if (this.isHeaderCell)
      return `${this.columnName[0].toLocaleUpperCase()}${this.columnName.substr(1, this.columnName.length - 1)}`

    const value = this._displayValue
    if (this.columnConfigDataType == "object" && this.columnConfig.hasOwnProperty("options")) {
      const options: any = {}
      for (let keys in this.columnConfig.options) {
        let value = this.columnConfig.options[keys]
        const kys = keys.split(",")
        for (let k in kys) {
          options[kys[k]] = value
        }
      }
      if (value in options) {
        return options[value]
      }
      return options["default"]
    }
    return value
  }

  get CellValueType() {
    const val = this.cellValue
    const valType = typeof val
    if (valType == "object") {
      const isArray = Array.isArray(val);
      if (isArray)
        return "array"
    }
    return valType
  }

}
