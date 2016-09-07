ng.module('smart-table', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/smart-table/pagination.html',
        '<nav ng-if="numPages && pages.length >= 2"><ul class="pagination">' +
        '<li ng-repeat="page in pages" ng-class="{active: page==currentPage}"><a href="javascript: void(0);" ng-click="selectPage(page)">{{page}}</a></li>' +
        '</ul></nav>');
        
    $templateCache.put('sttable/template/st-tree-toggle.html',
        '<span ng-class="spacerClass"></span><i ng-if="toggleExists" ng-class="toggleIsExpanded ? \'fa fa-caret-down\' : \'fa fa-caret-right\'"></i>\n' +
        '');
}]);
