import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
// import { TablesService } from '../tables.service';

@Component({
  selector: 'app-mycelldisplay',
  templateUrl: './mycelldisplay.component.html',
  styleUrls: ['./mycelldisplay.component.scss']
})
export class MycelldisplayComponent implements OnInit {
  _value: any
  @Input()
  set displayValue(data) {
    this._value = data
  }
  get displayValue() {
    if (this.valueType == "number") {
      return new Intl.NumberFormat().format(this._value)
    }
    return this._value
  }
  @Input()
  columnConfig: any

  @Input()
  rowData: any

  @Input()
  isActions: boolean = false

  constructor() { }

  ngOnInit(): void {
    if (this.isActions) {
      // console.log(this.valueType)
    }

  }


  get valueType() {
    const val = this._value
    const valType = typeof val
    if (valType == "object") {
      const isArray = Array.isArray(val);
      if (isArray)
        return "array"
    }
    return valType
  }



}
