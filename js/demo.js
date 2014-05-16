/* global FilePreviews, filepicker */
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
      $multimediaCheckbox = $('#multimediaCheckbox'),
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
      alert('Error: Please upload a file, provide a file ' +
            'url or click on one of the examples.');
    }
  }

  function previewsReady(err, result) {
    if (err) {
      $jsonConsole.text('Something went wrong...');
      $previewImage.attr('src', 'http://i.imgur.com/caZYo6v.jpg');
      $previewLink.attr('href', '#');
    } else {
      console.log(result);
      $previewImage.attr('src', result.previewURL);
      $previewLink.attr('href', result.previewURL);
      $jsonConsole.html(JSON.stringify(result.metadata, null, ' '));

      // Check if file is a PSD to do some extra stuff
      try {
        var psd = result.metadata.extra_data.psd;
        if (psd) displayLayers(psd);
      } catch (err) {}

      // Check if file is a video to do animation on hover
      try {
        var video = result.metadata.extra_data.multimedia;
        if (video) createVideoAnim(result.metadata.thumbnails);
      } catch (err) {}
    }
  }

  function cleanResultsArea() {
    $previewImage.attr('src', 'img/spinner.gif');
    $previewImage.off('mouseenter');
    $previewImage.off('mouseleave');
    $previewLink.attr('href', '#');
    $jsonConsole.html('Processing, please wait...');

    $('.preloaded-img').remove();

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

  function createVideoAnim(frames) {
    var playing = false;

    if (frames.length > 0) {
      var totalFrames = frames.length,
          currentFrame = -1;

      // Preload images hack
      frames.forEach(function(frame) {
        $('body').append('<img src="'+ frame.url +'" style="display:none" class="preloaded-img">');
      });

      var startAnimation = function() {
        if (playing) {
          setTimeout(function() {
            currentFrame++;

            if (currentFrame > totalFrames - 1) {
              currentFrame = 0;
            }

            // Set the image
            $previewImage.attr('src', frames[currentFrame].url);

            // Loop to next frame
            startAnimation(frames);
          }, 1000);
        }
      };

      var stopAnimation = function() {
        playing = false;
      };

      $previewImage.mouseenter(function(event) {
        playing = true;
        startAnimation(event);
      });

      $previewImage.mouseleave(stopAnimation);
    }
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

    var checkboxes = [
      $ocrCheckbox, $psdCheckbox, $exifCheckbox, $multimediaCheckbox
    ];

    checkboxes.forEach(function(opt){
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
