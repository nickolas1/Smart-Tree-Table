# Smart Tree Table

Smart Tree Table is a fork of [Smart Table](https://github.com/lorenzofox3/Smart-Table) that adds tree functionality. At the moment it has font-awesome as an additional dependency beyond angular.

## Usage

Smart Tree Table adds internal data to the safe copy that Smart Table uses to display your table. In order to use a tree your data objects need to have a `treeLevel` field, with a value of 0 being a tree leaf and unlimited higher levels possible. After a higher level item is declared, successive lower level items will be its children. For example if your data looks like this:

```
[{name: Americas, treeLevel: 2}, 
{name: Canada, treeLevel: 1}, 
{name: Quebec, treeLevel: 0}, 
{name: Alberta, treeLevel: 0}, 
{name: Mexico, treeLevel: 1}, 
{name: Jalisco, treeLevel: 0}] 
```

the tree table will have this structure: 

```
Americas +
|-Canada +
  |-Quebec
  |-Alberta
|-Mexico +
  |-Jalisco
```
where you can click on the rows with plusses to collapse and expand them.

The tree functionality is enabled in markup by adding the attribute `st-tree-table` to the table, adding the attribute `st-tree-row` to the table's `<tr>` elements, and optionally adding a `<st-tree-caret>` element in the first `<td>` of the `<tr>`s. 

Classes are added to rows to enable styling corresponding to their tree level: `st-tree-row-0`, `st-tree-row-1` etc. The carets also include a `<span>` with class `st-tree-spacer` and a level class `st-tree-spacer-0`, `st-tree-spacer-1` etc. to control spacing if desired. 

The tree defaults to fully expanded when initialized; this can be overruled by adding the attribute `st-tree-init-open=false` to the `<table>` element.

All of this can be seen in action [at this plunk](http://plnkr.co/edit/o4VmD0Vb3ZoZfOSQwlVG?p=preview).

## License

Smart Table module is under MIT license:

> Copyright (C) 2016 Laurent Renard.
>
> Permission is hereby granted, free of charge, to any person
> obtaining a copy of this software and associated documentation files
> (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge,
> publish, distribute, sublicense, and/or sell copies of the Software,
> and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
> BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
> ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
