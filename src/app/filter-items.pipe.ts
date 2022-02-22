import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterItems',
})
export class FilterItemsPipe implements PipeTransform {
  transform(items: any[], searchValue: string): any[] {
    if (!items) return [];
    if (!searchValue) return items;
    searchValue = searchValue.toLocaleLowerCase();
    return items.filter((it:any) => {
      let copyIt:string = it
      return copyIt.toLocaleLowerCase()==searchValue
    })
  }
}
