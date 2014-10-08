var app = angular.module('myApp', ['ngRoute']);

/* 路由 */
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/', {
    templateUrl: 'views/scaffold.html'
  }).
  when('/page-scaffold', {
    templateUrl: 'views/scaffold.html'
  }).
  when('/page-component', {
    templateUrl: 'views/component.html'
  }).
  when('/page-module', {
    templateUrl: 'views/module.html'
  }).
  when('/page-build-and-test', {
    templateUrl: 'views/buildAndTest.html'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);


// 传播屏幕滚动事件
app.directive('scrollPropagate', function($document, sideNavTargets){
  return {
    scope: true,
    compile: function() {
      return {
        pre: function preLink(scope) {
          scope.sideNavTargets = sideNavTargets
          console.log(scope);
        },
        post: function postLink(scope) {
          $document.on('scroll', function(event){
            scope.$broadcast('scroll');
          });
          scope.$on('jumpTarget', function(){
            scope.$broadcast('scroll');
          });
        }
      }
    }
  };
});

// 控制头部tab的切换及滚动时头部挂起
app.controller("HeaderController", function($scope, util) {

  $scope.tabs = [{
    title: "基础",
    link: "#/page-scaffold"
  }, {
    title: "组件",
    link: "#/page-component"
  }, {
    title: "模块",
    link: "#/page-module"
  }, {
    title: "构建与测试",
    link: "#/page-build-and-test"
  }];

  $scope.currTab = $scope.tabs[0];

  $scope.select = function(tab) {
    $scope.currTab = tab;
  }
  // $scope.$on('scroll', fix);

  // function fix(){
  //   $scope.$apply(function(){
  //     if(util.getScrollTop() > 0) {
  //       $scope.clsFixed = true;
  //     } else {
  //       $scope.clsFixed = false;
  //     }
  //   });
  // }
});

// 处理代码高亮
app.directive('codeHighlight', ['$document', function($document){
  return {
    scope: {},
    link: function(scope, element, attrs) {
      var clientHight = $document[0].documentElement.clientHeight;

      highlight();

      scope.$on('scroll', highlight);

      function highlight(event) {
        var posT = element[0].getBoundingClientRect().top;
        if (posT >= -200 && posT < clientHight + 200) {
          SyntaxHighlighter.highlight({}, element[0]);
          scope.$destroy();
        }
      }
    }
  };
}]);

// 滚动时监听当前滚动位置
app.directive('sideNavSpy', function($document, $rootScope, sideNavTargets, util) {
  return {
    scope:true,
    link: function(scope, element, attrs) {
      var doc = $document[0].documentElement;
      var target = element.attr('id');
      var clientHight = doc.clientHeight; //获取视窗高度
      var scrollTop = util.getScrollTop();
      var documentHeight = doc.scrollHeight;

      sideNavTargets['targets'][target] = {
        ele: element,
        id: target,
        offsetTop: util.getOffsetTop(element[0]),
        active:false
      };

      scope.$on('scroll', active);

      element.on('$destroy', function() {
        sideNavTargets['targets'][target]['active'] = false;
      });
      
      function active() {
        var clientHight = doc.clientHeight;
        var posT = element[0].getBoundingClientRect().top;
        
        $rootScope.$apply(function(){
          if (posT > 0 && posT < clientHight) {
            scope.sideNavTargets['targets'][target]['active'] = true;
          } else {
            scope.sideNavTargets['targets'][target]['active'] = false;
          }
          scope.sideNavTargets.setFirstActive();


          // if (posT > 0 && posT < clientHight) {
          //   scope.sideNavTargets['active'] = target;
          //   console.log(sideNavTargets);
          // }

        });
      }
    }
  };
});

// 滚动时将侧边栏刮起
app.directive('affixSpy', function($document, util){
  return {
    scope: true,
    link: function(scope, element, attrs) {
      affix();
      scope.$on('scroll', affix);

      function affix() {
        var scrollTop = util.getScrollTop();
        if (scrollTop > 0) {
          element.addClass('affix');
        } else {
          element.removeClass('affix');
        }
      }
    }
  };
});

// 根据当前滚动的位置激活对应的侧边栏菜单项
app.directive('navItem', function($rootScope, $location){
  return {
    scope:true,
    link: function(scope, element, attrs) {
      scope.$watch('sideNavTargets.active', checkActive);
      var parentLI = element[0].parentElement.parentElement;
      var parentIsLI = parentLI.tagName.toLowerCase() == 'li';
      var a = angular.element(element.children()[0]);
      var selfTarget = a.attr('data-target');

      function checkActive(value) {
        if (value != selfTarget) {
          element.removeClass('active');
        } else {
          element.addClass('active');
          if (parentIsLI) {angular.element(parentLI).addClass('active');}
        }
      }

      a.on('click', function($event){
        var pos = scope.sideNavTargets['targets'][selfTarget].offsetTop - 81;
        window.scrollTo(0, pos);
        scope.$apply(function(){
          scope.sideNavTargets.active = selfTarget;
        });
        // $location.hash(selfTarget);
        scope.$emit('jumpTarget');
      });
    }
  };
});

app.directive('backToTop', function(){
  return {
    scope:true,
    link: function(scope, element, attrs) {
      element.on('click', function($event){
        window.scrollTo(0, 0);
      });
    }
  };
});

app.factory('sideNavTargets', function(){
  return {
    targets: {},
    active:"",
    activeCounts: 0,
    setFirstActive: function() {
      var targets = this.targets
      for (target in targets) {
        if (targets[target]['active']) {
          this.active = targets[target]['id']
          break;
        }
      }
    }
  };
});

// util services
app.factory('util', function(){
  return {
    getOffsetTop: function(element) {
      var posT = element.offsetTop;
      var parent = element.offsetParent;

      while(parent !== null) {
        posT += parent.offsetTop;
        parent = parent.offsetParent;
      }

      return posT;
    },
    getScrollTop: function(){
      return document.documentElement.scrollTop || document.body.scrollTop;
    }
  };
});

