ng.module('smart-table')
  .directive('stTreeRow', ['stConfig', function (stConfig) {
    return {
      restrict: 'A',
      require: '^stTable',
      priority: 1001, // needs to compile before ng-repeat at priority 1000
      compile: function (tElement, tAttrs) {
        // add tree attributes
        var repeat = tAttrs.ngRepeat;
        var rptVar = repeat.split(' in ')[0];
        tElement.attr('ng-repeat', repeat + ' track by ' + rptVar + '.$$treeId');
        tElement.attr('st-tree-row-internal', '');
        tElement.attr('st-tree-id', rptVar + '.$$treeId');
        tElement.attr('st-tree-level', rptVar + '.treeLevel');
        tElement.attr('st-tree-index', '$index');
        tElement.attr('ng-if', rptVar + '.$$treeShown');
        tElement.attr('ng-class', '"st-tree-row-"+' + rptVar + '.treeLevel');
            
        var caretEl = angular.element(tElement.find('td')[0]).find('st-tree-caret');
        caretEl.attr('toggle-exists', rptVar + '.treeLevel > 0');
        caretEl.attr('toggle-is-expanded', rptVar + '.$$treeIsExpanded');
        caretEl.attr('toggle-level', rptVar + '.treeLevel');
      }
    };
  }]);

ng.module('smart-table')
  .directive('stTreeRowInternal', ['stConfig', function (stConfig) {
    return {
      require: '^^stTable',
      scope: {
        stTreeId: '<',
        stTreeLevel: '<',
        stTreeIndex: '<'
      },
      link: function(scope, element, attrs, tableCtrl) {
        if (scope.stTreeLevel > 0) {
          element.bind('click', function() {
            tableCtrl.toggleRow(scope.stTreeId, scope.stTreeIndex);
          });
        }
      }
    };
  }]);
  
ng.module('smart-table')
  .directive('stTreeCaret', ['stConfig', function (stConfig) {
    return {
      scope: {
        toggleExists: '<',
        toggleIsExpanded: '<',
        toggleLevel: '<'
      },
      templateUrl: 'sttable/template/st-tree-toggle.html',
      link: function(scope) {
        scope.spacerClass = 'st-tree-spacer st-tree-spacer-level-' + scope.toggleLevel;
      }
    };
  }]);
