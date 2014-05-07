$(function() {
  'use strict';

  var previews,
      $uploadFileButton1 = $('#uploadFileButton1'),
      $uploadFileButton2 = $('#uploadFileButton2'),
      $moreOptionsLink = $('#moreOptionsLink'),
      $closedDemoWrapper = $('#closedDemoWrapper'),
      $openDemoWrapper = $('#openDemoWrapper'),
      $demoCloseButton = $('#demoCloseButton'),
      $demoForm = $('#demoForm'),
      $exampleLinks = $('.example-link'),
      $fileURLField = $('#fileURLField'),
      $submitButton = $('#submitButton'),

      $ocrCheckbox = $('#ocrCheckbox'),
      $psdCheckbox = $('#psdCheckbox'),
      $exifCheckbox = $('#exifCheckbox'),
      $widthField = $('#widthField'),
      $heightField = $('#heightField'),

      $demoResultsContainer = $('#demoResultsContainer'),
      $jsonConsole = $('#jsonConsole'),
      $previewImage = $('#previewImage'),
      $previewLink = $('#previewLink'),
      $imageContainer = $('#imageContainer');

  // Instantiate FilePreviews with debug true
  // to get feedback on the developer console
  previews = new FilePreviews({debug: true});

  // Set filepicker
  filepicker.setKey('AL6QPWsKaT6neuH8YjdKbz');

  // Functions
  function formSubmit(e) {
    var url = $fileURLField.val();
    e.preventDefault();

    if (url) {
      cleanResultsArea();

      var options = getFormParams();
      previews.generate(url, options, previewsReady);
    } else {
      alert('Error: Please upload a file, provide a file url or click on one of the examples.');
    }
  }

  function previewsReady(err, result) {
    if (err) {
      $jsonConsole.text('Something went wrong...');
      $previewImage.attr('src', 'http://i.imgur.com/caZYo6v.jpg');
      $previewLink.attr('href', '#');
    } else {
      $previewImage.attr('src', result.previewURL);
      $previewLink.attr('href', result.previewURL);
      $jsonConsole.html(JSON.stringify(result.metadata, null, ' '));

      // Check if file is a PSD to do some extra stuff
      try {
        var psd = result.metadata.extra_data.psd;
        if (psd) displayLayers(psd);
      } catch (err) {}
    }
  }

  function cleanResultsArea() {
    $previewImage.attr('src', 'img/spinner.gif');
    $previewLink.attr('href', '#');
    $jsonConsole.html('Processing, please wait...');

    $demoResultsContainer.show();
    $('.preview-hr').remove();
    $('.preview-h5').remove();
    $('.preview-layer').remove();

    window.location.hash = '#';
    window.location.hash = '#anchorInteractiveDemo';
  }

  function displayLayers(psd) {
    psd.layers.forEach(function(layer) {
      if (layer.layers) displayLayers(layer); // This is a group extract sub-layers
      $('<hr class="preview-hr"><h5 class="preview-h5">' + layer.type + ': ' + layer.name + '</h5>').appendTo($imageContainer);
      $('<img src="' + layer.url + '" class="preview-layer">').appendTo($imageContainer);
    });
  }

  function pickFile(e) {
    e.preventDefault();
    filepicker.pick(pickFileComplete);
  }

  function pickFileComplete(inkBlob) {
    // make sure form is visible
    $openDemoWrapper.show();
    $closedDemoWrapper.hide();

    $fileURLField.val(inkBlob.url);
    $demoForm.submit();
  }

  function toggleDemo(e) {
    e.preventDefault();
    $openDemoWrapper.toggle();
    $closedDemoWrapper.toggle();
  }

  function getFormParams() {
    var options = {};
    options.metadata = [];

    [$ocrCheckbox, $psdCheckbox, $exifCheckbox].forEach(function(opt){
      if (opt.is(':checked')) {
        options.metadata.push(opt.val());
      }
    });

    if ($widthField.val() !== '' || $heightField.val() !== '') {
      options.size = {};

      if ($widthField.val() !== '') {
        options.size.width = $widthField.val();
      }

      if ($heightField.val() !== '') {
        options.size.height = $heightField.val();
      }
    }
    return options;
  }

  function clickExampleLink(e) {
    var $link = $(e.currentTarget),
        linkHref = $link.attr('href');

    e.preventDefault();

    $fileURLField.val(linkHref);
    $demoForm.submit();
  }

  // Event handlers
  $moreOptionsLink.click(toggleDemo);
  $demoCloseButton.click(toggleDemo);
  $demoForm.submit(formSubmit);
  $exampleLinks.click(clickExampleLink);
  $submitButton.click(formSubmit);
  $uploadFileButton1.click(pickFile);
  $uploadFileButton2.click(pickFile);
});

// $(function() {
//   'use strict';

//   var previews,
//       $fileForm = $('#fileForm'),
//       $fileURLInput = $('#fileURLInput'),
//       $exampleLinks = $('.example-link'),
//       $previewImage = $('#previewImage'),
//       $uploadFileLink = $('#uploadFileLink'),
//       $resultsSection = $('.results-section'),
//       $imagesContainer = $('#imagesContainer'),
//       $metadataConsole = $('#metadataConsole'),
//       $previewImageLink = $('#previewImageLink'),
//       $advancedCheckboxes = $('input:checkbox'),
//       $toggleCheckboxesLink = $('#toggleCheckboxesLink');

//   // Instantiate FilePreviews
//   previews = new FilePreviews({debug: true});

//   filepicker.setKey('Ah8QlzykQRGcsx1SaObz0z');

//   var onFormSubmit = function(e) {
//     var url = $fileURLInput.val();

//     e.preventDefault();

//     if (url) {
//       $resultsSection.show();
//       $previewImage.attr('src', 'img/spinner.gif');
//       $previewImageLink.attr('href', '');
//       $metadataConsole.html('Processing, please wait...');

//       // This is how we integrate with FilePreviews.io
//       // Look mom, no servers!
//       var options = {
//         metadata: ['all']
//       };
//       previews.generate(url, options, function(err, result) {
//         if (err) {
//           $metadataConsole.text('Something went wrong...');
//           $previewImage.attr('src', 'http://i.imgur.com/caZYo6v.jpg');
//         } else {
//           $previewImage.attr('src', result.previewURL + '?1');
//           $previewImageLink.attr('href', result.previewURL + '?1');
//           $metadataConsole.html(JSON.stringify(result.metadata, null, '  '));

//           // Check if file is a PSD to do some extra stuff
//           try {
//             var psd = result.metadata.extra_data.psd;
//             if (psd) displayLayers(psd);
//           } catch (err) {
//             // pass
//           }
//         }
//       });
//     }
//   };

//   var displayLayers = function(psd) {
//     psd.layers.forEach(function(layer) {
//       if (layer.layers) displayLayers(layer); // This is a group extract sub-layers
//       $('<hr class="preview-hr"><h5 class="preview-h5">' + layer.type + ': ' + layer.name + '</h5>').appendTo($imagesContainer);
//       $('<img src="' + layer.url + '" class="preview-layer">').appendTo($imagesContainer);
//     });
//   };

//   var onClickExampleLink = function(e) {
//     var $link = $(e.currentTarget),
//         linkHref = $link.attr('href');

//     e.preventDefault();

//     $('.preview-hr').remove();
//     $('.preview-h5').remove();
//     $('.preview-layer').remove();
//     $fileURLInput.val(linkHref);
//     $fileForm.submit();
//   };

//   var onUploadedFile = function(inkBlob) {
//     $fileURLInput.val(inkBlob.url);
//     $fileForm.submit();
//   };

//   var onClickUploadFileLink = function() {
//     filepicker.pick(onUploadedFile);
//   };

//   var toggleCheckboxes = function(e) {
//     var allText = 'Check all',
//         noneText = 'Uncheck all';

//     e.preventDefault();

//     if ($toggleCheckboxesLink.text() === allText) {
//       $toggleCheckboxesLink.text(noneText);
//     } else {
//       $toggleCheckboxesLink.text(allText);
//     }

//     $advancedCheckboxes.each(function() {
//       var $elem = $(this);
//       $elem.prop('checked', !$elem.prop('checked'));
//     });
//   };

//   // Event handlers
//   $fileForm.submit(onFormSubmit);
//   $exampleLinks.click(onClickExampleLink);
//   $uploadFileLink.click(onClickUploadFileLink);
//   $toggleCheckboxesLink.click(toggleCheckboxes);
// });
