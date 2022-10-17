import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-mypagination',
  templateUrl: './mypagination.component.html',
  styleUrls: ['./mypagination.component.scss']
})
export class MypaginationComponent implements OnInit {

  @Input()
  resultsMeta: any
  @Input()
  selectedPage: number = 5

  @Input()
  pageSize: number = 10;

  @Input()
  totalDisplayedPAges = 9

  @Output()
  onPageSelect: EventEmitter<number> = new EventEmitter()


  @Output()
  onCursorSelected: EventEmitter<string> = new EventEmitter()

  constructor() { }
  ngOnInit(): void {
  }
  get isAtEnd() {
    return !(this.selectedPage + 3 < this.totalPages - 1 ? true : false)
  }
  get isAtStart() {
    // 5 -2
    return this.selectedPage - 3 <= 2 ? true : false
  }
  get moreAtStart() {
    return this.isAtEnd && this.hideSomePages
  }
  get moreAtEnd() {
    return this.isAtStart && this.hideSomePages
  }

  get isCursorPagination() {
    if (!this.resultsMeta) return false
    return !this.resultsMeta.hasOwnProperty("count")
  }

  get isStandardPagination() {
    if (!this.resultsMeta) return false
    return this.resultsMeta.hasOwnProperty("count")
  }

  get currentPageRange() {
    const start = (1 + ((this.selectedPage - 1) * this.pageSize))
    const end = start + (this.pageSize - 1)
    return `${start} - ${end > this.totalItems ? this.totalItems : end}`
  }
  get hideSomePages() {
    // console.log((this.totalPages - 2) >= this.totalDisplayedPAges)
    return (this.totalPages - 2) >= this.totalDisplayedPAges
  }
  get pages() {
    if (!this.isPaginatable) return []
    let pages: any[] = []
    const totalPages = this.totalPages

    const excluded = [1, this.totalPages]
    const remPages = totalPages - 2

    if (!this.resultsMeta.hasOwnProperty("count"))
      return []
    // console.log(this.selectedPage)
    // Check if there are more than 5 spaces between it and start
    // Check if there are more than 5 spances between it and end
    // Generate the list of pages
    //  
    let myPages = []
    for (let i = -3; i < 4; i++) {
      // If less than or 1 do nothing and set at start
      // if more than or greate than total at the end
      let tempPage = this.selectedPage + i
      if (tempPage < 2) continue

      if (tempPage >= this.totalPages) continue

      myPages.push(tempPage)
    }
    // console.log(`Selected page${this.selectedPage}, Start:${isAtStart}, End:${isAtEnd}`)
    // console.log(myPages)
    return myPages
  }

  get totalItems() {
    if (!this.isPaginatable) return 1
    return this.resultsMeta.count;
  }

  scrollPage(addPage: number) {
    let tempvalue = addPage + this.selectedPage;
    if (tempvalue > this.totalPages) {
      tempvalue = this.totalPages
    } else if (tempvalue < 1) {
      tempvalue = 1
    }

    this.selectPage(tempvalue)
  }

  get totalPages() {
    if (!this.isPaginatable) return 1
    return Math.ceil(this.resultsMeta.count / this.pageSize)
  }
  get isPaginationActive() {
    if (!this.isPaginatable) return false
    // return 
    return this.hasNext || this.hasPrev
  }
  get hasNext() {
    if (!this.isPaginatable) return false
    return this.resultsMeta.next != undefined
  }
  get hasPrev() {
    if (!this.isPaginatable) return false
    return this.resultsMeta.prev != undefined
  }
  get isPaginatable() {
    if (!this.resultsMeta)
      return false
    return this.resultsMeta.hasOwnProperty("next") || this.resultsMeta.hasOwnProperty("prev")
  }
  selectPage(page: number) {
    if (this.selectedPage == page) return
    // this.selectedPage = page
    // console.log(this.selectedPage)
    this.onPageSelect.emit(page)
  }

  selectCursorUrl(cursorUrl: string) {
    console.log(cursorUrl)
    if (!cursorUrl) return
    const url = new URL(cursorUrl);
    const cursor = url.searchParams.get("cursor")
    if (cursor) {
      this.onCursorSelected.emit(cursor)
    }
  }

  checkIsSelected(page: number): boolean {
    return this.selectedPage == page
  }
}
