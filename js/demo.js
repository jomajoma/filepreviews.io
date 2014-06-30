/* global FilePreviews, filepicker, angular */
'use strict';

var previews = new FilePreviews({
  debug: true,
  apiKey: 'aPsycB6XsoAlJpzZpstunjzdGput6u'
});

filepicker.setKey('AqHhfHUMAQIOff76iEW6Oz');

// ===== ng-stuff =====
var app = angular.module('FPDemo', []);

app.filter('prettyJson', function() {
  return function(obj) {
    return angular.toJson(obj, true);
  };
});

app.controller('DemoController', ['$scope', 'filterFilter', function($scope, filterFilter) {
  $scope.demoVisible = false;
  $scope.resultVisible = false;
  $scope.result = null;
  $scope.processing = false;
  $scope.errors = null;
  $scope.format = 'png';

  $scope.getPreviews = function() {
    if (!$scope.urlField) return;

    window.location.hash = 'demoWrapper';

    $scope.processing = true;
    $scope.result = null;
    $scope.resultVisible = true;

    previews.generate($scope.urlField, getOptions(), handleResults);
  };

  function handleResults(err, result) {
    if (err) {
      $scope.$apply(function() {
        $scope.errors = err;
        $scope.processing = false;
      });
    } else {
      $scope.$apply(function() {
        var _result = result;

        // If psd do play some tricks
        if (result.metadata.extra_data.psd) {
          var images = flattenPsdObject(result.metadata.extra_data.psd);
          _result.metadata.thumbnails = images.map(function(item) {
            return {url:item};
          });
        }

        $scope.result = _result;
        $scope.processing = false;
      });
    }
  }

  function flattenPsdObject(psd, list) {
    if (!list) var list = []; list.push(psd.url);
    if (!psd.layers) return list;

    if (psd.layers) {
      psd.layers.forEach(function(layer) {
        list = list.concat(flattenPsdObject(layer, []));
      });
      return list;
    }

  }

  $scope.chooseFile = function() {
    filepicker.pick(function(inkBlob) {
      $scope.$apply(function() {
        $scope.urlField = inkBlob.url;
        $scope.demoVisible = true;
        $scope.getPreviews();
      });
    });
  };

  $scope.toggleDemo = function() {
    $scope.demoVisible = !$scope.demoVisible;
  };

  $scope.setUrl = function(url) {
    $scope.urlField = url;
    $scope.getPreviews();
  };

  // ===== Options =====
  $scope.selection = [];

  $scope.options = [
    {name: 'OCR', value: 'ocr', selected: true},
    {name: 'PSD layers and metadata', value: 'psd', selected: true},
    {name: 'EXIF metadata', value: 'exif', selected: true},
    {name: 'Multimedia', value: 'multimedia', selected: true}
  ];

  $scope.selectedOptions = function selectedOptions() {
    return filterFilter($scope.options, { selected: true });
  };

  $scope.$watch('options|filter:{selected:true}', function (nv) {
    $scope.selection = nv.map(function (opt) {
      return opt.value;
    });
  }, true);

  // Makes the options hash
  function getOptions() {
    var options = {
      'metadata': $scope.selection,
      'format': $scope.format,
      'uploader': {
        'headers': {
          'Cache-Control': 'max-age=315360000, no-transform, private',
          'x-amz-acl': 'public-read'
        }
      }
    };

    if ($scope.width || $scope.height) {
      options.size = {};

      if ($scope.width) {
        options.size.width = $scope.width;
      }

      if ($scope.height) {
        options.size.height = $scope.height;
      }
    }

    return options;
  }
}]);
