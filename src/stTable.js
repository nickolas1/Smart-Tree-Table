ng.module('smart-table')
  .controller('stTableController', ['$scope', '$parse', '$filter', '$attrs', 'stConfig', function StTableController ($scope, $parse, $filter, $attrs, stConfig) {
    var _this = this;
    var propertyName = $attrs.stTable;
    var displayGetter = $parse(propertyName);
    var displaySetter = displayGetter.assign;
    var safeGetter;
    var orderBy = $filter('orderBy');
    var filter = $filter('filter');
    var safeCopy = copyRefs(displayGetter($scope));
    var tableState = {
      sort: {},
      search: {},
      pagination: {
        start: 0,
        totalItemCount: 0
      }
    };
    var filtered;
    var pipeAfterSafeCopy = true;
    var ctrl = this;
    var lastSelected;
    var isTreeTable = 'stTreeTable' in $attrs;
    var nodeExpanded = {};
    //TODO allow passing an object with different levels open or closed?
    var initiallyOpen = 'stTreeInitOpen' in $attrs ? Boolean(JSON.parse($attrs.stTreeInitOpen.toLowerCase())) : stConfig.tree.nodesInitiallyOpen;
    var selectedRowGetter;
    var selectedRowWatch;
    if ($attrs.stSelectedRow) selectedRowGetter = $parse($attrs.stSelectedRow);
    
    
    function copyRefs (src) {
      var copy = src ? [].concat(src) : [];
      if (isTreeTable) {
        treeifyData(copy);
      }
      return copy;
    }

    function updateSafeCopy () {
      safeCopy = copyRefs(safeGetter($scope));
      if (pipeAfterSafeCopy === true) {
        ctrl.pipe();
      }
    }

    function deepDelete (object, path) {
      if (path.indexOf('.') != -1) {
        var partials = path.split('.');
        var key = partials.pop();
        var parentPath = partials.join('.');
        var parentObject = $parse(parentPath)(object);
        delete parentObject[key];
        if (Object.keys(parentObject).length === 0) {
          deepDelete(object, parentPath);
        }
      } else {
        delete object[path];
      }
    }
    
    function treeifyData(data) {
      data.forEach(function(d, i) {
        if (!d.$$treeId) d.$$treeId = d.treeLevel.toString() + i + Math.floor(Math.random()*10000);
      });
      var ancestorSet = {};
      data.forEach(function(d, i) {
        if (d.treeLevel > 0) {
          d.$$treeDescendents = [];
          if (!d.hasOwnProperty('$$treeIsExpanded')) d.$$treeIsExpanded = initiallyOpen;
        }
        d.$$treeAncestors = findTreeAncestors(d, i);
        d.$$treeShown = d.treeLevel > 0;
      });
      
      Object.keys(ancestorSet).forEach(function(k) {
        if (!nodeExpanded.hasOwnProperty(k)) nodeExpanded[k] = initiallyOpen;
      });
      
      data.forEach(function(d, i) {
        if (d.treeLevel > 0) checkDescendentVisibility(data, i);
      });
      
      function findTreeAncestors(datum, idx) {
        var ancestors = [];
        for (var i = idx; i >= 0; i--) {
          if (data[i].treeLevel > datum.treeLevel) {
            ancestors.push(data[i].$$treeId);
            ancestorSet[data[i].$$treeId] = true;
            data[i].$$treeDescendents.push(idx);
            return ancestors.concat(data[i].$$treeAncestors);
          }
        }
        return ancestors;
      }
    }
    
    function checkDescendentVisibility(data, idx) {
      data[idx].$$treeDescendents.forEach(function(descIdx) {
        var shown = true;
        data[descIdx].$$treeAncestors.forEach(function(ancId) {
          shown = shown && nodeExpanded[ancId];
        });
        data[descIdx].$$treeShown = shown;
        if (data[descIdx].$$treeDescendents) {
          checkDescendentVisibility(data, descIdx);
        }
      });
    }
    
    function setSelectedRowWatch() {
      selectedRowWatch = $scope.$watch(function () {
        return selectedRowGetter($scope);
      }, function(newValue, oldValue) {
        if (newValue && newValue !== oldValue) _this.select(newValue, 'single')
      });
    };

    if ($attrs.stSafeSrc) {
      safeGetter = $parse($attrs.stSafeSrc);
      $scope.$watch(function () {
        var safeSrc = safeGetter($scope);
        return safeSrc && safeSrc.length ? safeSrc[0] : undefined;
      }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
          updateSafeCopy();
        }
      });
      $scope.$watch(function () {
        var safeSrc = safeGetter($scope);
        return safeSrc ? safeSrc.length : 0;
      }, function (newValue, oldValue) {
        if (newValue !== safeCopy.length) {
          updateSafeCopy();
        }
      });
      $scope.$watch(function () {
        return safeGetter($scope);
      }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
          tableState.pagination.start = 0;
          updateSafeCopy();
        }
      });
    }

    /**
     * sort the rows
     * @param {Function | String} predicate - function or string which will be used as predicate for the sorting
     * @param [reverse] - if you want to reverse the order
     */
    this.sortBy = function sortBy (predicate, reverse) {
      tableState.sort.predicate = predicate;
      tableState.sort.reverse = reverse === true;

      if (ng.isFunction(predicate)) {
        tableState.sort.functionName = predicate.name;
      } else {
        delete tableState.sort.functionName;
      }

      tableState.pagination.start = 0;
      return this.pipe();
    };

    /**
     * search matching rows
     * @param {String} input - the input string
     * @param {String} [predicate] - the property name against you want to check the match, otherwise it will search on all properties
     */
    this.search = function search (input, predicate) {
      var predicateObject = tableState.search.predicateObject || {};
      var prop = predicate ? predicate : '$';

      input = ng.isString(input) ? input.trim() : input;
      $parse(prop).assign(predicateObject, input);
      // to avoid to filter out null value
      if (!input) {
        deepDelete(predicateObject, prop);
      }
      tableState.search.predicateObject = predicateObject;
      tableState.pagination.start = 0;
      return this.pipe();
    };

    /**
     * this will chain the operations of sorting and filtering based on the current table state (sort options, filtering, ect)
     */
    this.pipe = function pipe () {
      var pagination = tableState.pagination;
      var output;
      filtered = tableState.search.predicateObject ? filter(safeCopy, tableState.search.predicateObject) : safeCopy;
      if (tableState.sort.predicate) {
        filtered = orderBy(filtered, tableState.sort.predicate, tableState.sort.reverse);
      }
      pagination.totalItemCount = filtered.length;
      if (pagination.number !== undefined) {
        pagination.numberOfPages = filtered.length > 0 ? Math.ceil(filtered.length / pagination.number) : 1;
        pagination.start = pagination.start >= filtered.length ? (pagination.numberOfPages - 1) * pagination.number : pagination.start;
        output = filtered.slice(pagination.start, pagination.start + parseInt(pagination.number));
      }
      displaySetter($scope, output || filtered);
    };

    /**
     * select a dataRow (it will add the attribute isSelected to the row object)
     * @param {Object} row - the row to select
     * @param {String} [mode] - "single" or "multiple" (multiple by default)
     */
    this.select = function select (row, mode) {
      var rows = copyRefs(displayGetter($scope));
      var index = rows.indexOf(row);
      if (index !== -1) {
        if (mode === 'single') {
          row.isSelected = row.isSelected !== true;
          if (lastSelected) {
            lastSelected.isSelected = false;
          }
          if ($attrs.stSelectedRow) {
            selectedRowWatch()
            selectedRowGetter.assign($scope, row);
            setSelectedRowWatch();
          }
          lastSelected = row.isSelected === true ? row : undefined;
        } else {
          rows[index].isSelected = !rows[index].isSelected;
        }
      } else { // if a bad row selection is passed in, deselect the current row
        if ($attrs.stSelectedRow) {
          lastSelected.isSelected = false;
          lastSelected = undefined;
        }
      }
    };

    /**
     * take a slice of the current sorted/filtered collection (pagination)
     *
     * @param {Number} start - start index of the slice
     * @param {Number} number - the number of item in the slice
     */
    this.slice = function splice (start, number) {
      tableState.pagination.start = start;
      tableState.pagination.number = number;
      return this.pipe();
    };

    /**
     * return the current state of the table
     * @returns {{sort: {}, search: {}, pagination: {start: number}}}
     */
    this.tableState = function getTableState () {
      return tableState;
    };

    this.getFilteredCollection = function getFilteredCollection () {
      return filtered || safeCopy;
    };

    /**
     * Use a different filter function than the angular FilterFilter
     * @param filterName the name under which the custom filter is registered
     */
    this.setFilterFunction = function setFilterFunction (filterName) {
      filter = $filter(filterName);
    };

    /**
     * Use a different function than the angular orderBy
     * @param sortFunctionName the name under which the custom order function is registered
     */
    this.setSortFunction = function setSortFunction (sortFunctionName) {
      orderBy = $filter(sortFunctionName);
    };

    /**
     * Usually when the safe copy is updated the pipe function is called.
     * Calling this method will prevent it, which is something required when using a custom pipe function
     */
    this.preventPipeOnWatch = function preventPipe () {
      pipeAfterSafeCopy = false;
    };
    
    /**
     * Open or close a tree level.
     * @param treeId the unique id of the tree table row being toggled
     * @param treeIdx the index of the row in the table
     */
    this.toggleRow = function toggleRow (treeId, treeIdx) {
      nodeExpanded[treeId] = !nodeExpanded[treeId];
      safeCopy[treeIdx].$$treeIsExpanded = nodeExpanded[treeId];
      $scope.$apply(function() {
        checkDescendentVisibility(safeCopy, treeIdx);
      });
    };
    
    /**
     * Check if a tree level is open or closed
     * @param treeId the unique id of the tree table row being checked
     */
    this.checkExpanded = function checkExpanded (treeId) {
      return nodeExpanded[treeId];
    };

    if ($attrs.stSelectedRow) {
      setSelectedRowWatch();
    }
    
  }])
  .directive('stTable', function () {
    return {
      restrict: 'A',
      controller: 'stTableController',
      link: function (scope, element, attr, ctrl) {

        if (attr.stSetFilter) {
          ctrl.setFilterFunction(attr.stSetFilter);
        }

        if (attr.stSetSort) {
          ctrl.setSortFunction(attr.stSetSort);
        }
      }
    };
  });
