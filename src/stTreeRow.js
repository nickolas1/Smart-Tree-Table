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
        tElement.attr('ng-if', rptVar + '.$$treeShown');
        tElement.attr('ng-class', '"st-tree-row-"+' + rptVar + '.treeLevel');
            
        var caretEl = angular.element(tElement.find('td')[0]).find('st-tree-caret');
        caretEl.attr('toggle-exists', rptVar + '.treeLevel > 0');
        caretEl.attr('toggle-is-expanded', rptVar + '.$$treeIsExpanded');
        caretEl.attr('toggle-level', rptVar + '.treeLevel');
        caretEl.attr('st-tree-id', rptVar + '.$$treeId');
        caretEl.attr('st-tree-level', rptVar + '.treeLevel');
        caretEl.attr('st-tree-index', '$index');
      }
    };
  }]);
  
ng.module('smart-table')
  .directive('stTreeCaret', ['stConfig', function (stConfig) {
    return {
      require: '^^stTable',
      scope: {
        toggleExists: '<',
        toggleIsExpanded: '<',
        toggleLevel: '<',
        stTreeId: '<',
        stTreeLevel: '<',
        stTreeIndex: '<'
      },
      templateUrl: 'sttable/template/st-tree-toggle.html',
      link: function(scope, element, attrs, ctrl) {
        if (scope.toggleExists) {
          element.bind('click', function($event) {
            $event.stopPropagation();
            ctrl.toggleRow(scope.stTreeId, scope.stTreeIndex);
          });
        }
        scope.spacerClass = 'st-tree-spacer st-tree-spacer-level-' + scope.toggleLevel;
      }
    };
  }]);
