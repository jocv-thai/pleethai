var SERVER_ERROR_MESSAGE = "An unexpected error occurred while communicating the server."
var NO_RESULT_MESSAGE = "No results found.";
var WAIT_TIME = 500;

var wordPage = 0;
var examplePage = 0;
var holdFlag = false;
var inputTimer;
var clickTimer;

var tagsModalOpen = '';

$(document).ready(function(){
    loadWordList();
    loadExampleList();
    loadTagList();

    // Search
    $('#content').on('input', '#keyword', function(e) { 
        initTimer();
    })
    .on('keydown', function(e) { 
        if (e.which == 13) {
            //if not pc, hide keyboard
            if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
                $("#keyword").blur();
            }
            //Cancel reloading
            return false;
        }
    })
    // Show tags modal
    .on('click', '#tagbutton', function() {
        $("#tag-modal").modal("show");
    })
    // Clear keyword and tags
    .on('click', '#clearbutton', function() {
        allToggleOff();
        $('#keyword').val('');
        search();
    })
    // Change backgroundcolor of selected item
    .on('mouseenter', '.row-word, .modallink-word', function() {
        $(this).addClass('hover-word');
    })
    .on('mouseenter', '.row-example, .modallink-example', function() {
        $(this).addClass('hover-example');
    })
    .on('mouseleave', '.row-word, .modallink-word', function() {
        $(this).removeClass('hover-word');
    })
    .on('mouseleave', '.row-example, .modallink-example', function() {
        $(this).removeClass('hover-example');
    })
    // Show detail modal *dont show when hold
    .on('mousedown', '.row-word, .row-example, .modallink-word, .modallink-example', function() {
        holdFlag = false;
        clickTimer =setTimeout(function(){
            holdFlag = true;
        }, 350);
    })
    .on('mouseup', '.row-word, .row-example, .modallink-word, .modallink-example', function(e) {
        if (clickTimer) {
            clearTimeout(clickTimer);
        }
        if ($(e.target).is('.tag-badge')) {
            return;
        }
        // If selected text, return
        if(window.getSelection) {
            selectedStr = window.getSelection().toString();
            if(selectedStr !== '' && selectedStr !== '\n') {
              return;
            }
        }
        if (!holdFlag) {
            if ($(this).is('.row-word, .row-example')) {
                $( "#detail-modal .modal-content" ).load($(this).attr("href"), function() {
                    // set speakbale indicator
                    setSpeakableOrNot();

                    $("#detail-modal").modal("show");
                });
            } else if($(this).is('.modallink-word, .modallink-example')) {
                $("#detail-modal .modal-content").load($(this).attr("href"), function() {
                    // set speakbale indicator
                    setSpeakableOrNot();
                });
            }

            // modal word/example access
            sendGAPageView($(this).attr("href"));
        }
    })
    // Load items
    .on('inview', '#wordbottom', function(e, isInView) {
        if (isInView && $('.row-word').length >= 20) {
            loadWordList();
        }
    })
    .on('inview', '#examplebottom', function(e, isInView) {
        if (isInView && $('.row-example').length >= 20) {
            loadExampleList();
        }
    })
    
    // Tag modal window
    .on('shown.bs.modal', '#tag-modal', function() {
        // Create toggles
        $('.tag-toggle').bootstrapToggle();
        tagsModalOpen = getTags();
    })
    .on('hidden.bs.modal', '#tag-modal', function() {
        var tagsModalClose = getTags();
        if(tagsModalOpen != tagsModalClose){
            // Search when tag state changed
            search();
        }
    })
    .on('click', '#tagclearbutton', function() {
        allToggleOff();
    })

    // Click tag in search result
    .on('click', '.tag-badge', function() {

        // clear all tag toggles
        allToggleOff();
        // clear keyword
        $('#keyword').val('');

        // check selected tag
        var value =  $(this).attr('value');
        $('#tag-toggle' + value).prop('checked', true).change();
        
        search();

        // close modal
        $('#detail-modal').modal('hide');
    })

    // Language form submit
    .on('submit', 'form[name="trans"]', function() {
        // when submit happened by button
        var th_jp = $(document.activeElement).attr('value');
        if(!th_jp){
            // when submit happened by a-tag
            th_jp = $(this).find('input[name="language"]').attr('value');
        }
        sendGAEvent("UI", "language_change", th_jp, 1);
    });

    // Page top button
    var appear = false;
    var pagetop = $('#page_top');
    $(window).scroll(function () {
      if ($(this).scrollTop() > 100) {  //100pxスクロールしたら
        if (appear == false) {
          appear = true;
          pagetop.stop().animate({
            'bottom': '20px' //下から20pxの位置に
          }, 300); //0.3秒かけて現れる
        }
      } else {
        if (appear) {
          appear = false;
          pagetop.stop().animate({
            'bottom': '-50px' //下から-50pxの位置に
          }, 300); //0.3秒かけて隠れる
        }
      }
    });
    pagetop.click(function () {
      $('body, html').animate({ scrollTop: 0 }, 500); //0.5秒かけてトップへ戻る
      return false;
    });
});

function initTimer() {
    //reset timer
    if (inputTimer) {
        clearTimeout(inputTimer);
    }
    inputTimer = setTimeout(search, WAIT_TIME);
}

function search() {
    wordPage = 0;
    examplePage = 0;
    var wordHeader = $('#wordheader');
    var exampleHeader = $('#exampleheader');
    $('#wordcontainer').empty();
    $('#examplecontainer').empty();
    $('#wordcontainer').append(wordHeader);
    $('#examplecontainer').append(exampleHeader);
    $('#wordcontainer').append('<hr class="header-row-word">');
    $('#examplecontainer').append('<hr class="header-row-example">');
    loadWordList();
    loadExampleList();
    onTagsChanged();
}

function loadWordList() {
    $('#wordloading').show();
    
    var query = CreateQuery();
    if(query) {
        // Send to Google Analytics only with keyword or tags
        // Init load & Clearing search condition will be not sent
        sendGAPageView('/wordsearch' + query);
        // send tag event
        SendTagsEvent('wordsearch');
    }
    wordPage++;
    $.ajax({
        'url': 'searchword',
        'type': 'GET',
        'data': {
            'keyword': $('#keyword').val(),
            'tags': getTags(),
            'page': wordPage,
        },
        'dataType': 'text'
    })
    .done(function(response) {
        if (!response && $('.row-word').length == 0) {
            $('#wordcontainer').append('<div class="alert alert-warning">'
            + NO_RESULT_MESSAGE + '</div>');
        } else if (response) {
            // load page success
            $('#wordcontainer .alert').remove();
            $('#wordcontainer').append(response);

            if (wordPage > 1) {
                // append load 
                sendGAEvent("page_load", "wordPage", query, wordPage);
            }
        }
        
    })
    .fail(function() {
        wordPage--;
        $('#wordcontainer').append('<div class="alert alert-danger">'
        + SERVER_ERROR_MESSAGE + '</div>');
    })
    .always(function() {
        $('#wordloading').hide();
    });
}

function loadExampleList() {
    $('#exampleloading').show();

    var query = CreateQuery();
    if(query) {
        // Send to Google Analytics only with keyword or tags
        // Init load & Clearing search condition will be not sent
        sendGAPageView('/examplesearch' + query);
        // send tag event
        SendTagsEvent('examplesearch');
    }
    examplePage++;
    $.ajax({
        'url': 'searchexample',
        'type': 'GET',
        'data': {
            'keyword': $('#keyword').val(),
            'tags': getTags(),
            'page': examplePage,
        },
        'dataType': 'text'
    })
    .done(function(response) {
        if (!response && $('.row-example').length == 0) {
            $('#examplecontainer').append('<div class="alert alert-warning">'
            + NO_RESULT_MESSAGE + '</div>');
        } else if (response) {
            // load page success
            $('#examplecontainer .alert').remove();
            $('#examplecontainer').append(response);

            if (examplePage > 1) {
                // append load 
                sendGAEvent("page_load", "examplePage", query, examplePage);
            }
        }
    })
    .fail(function() {
        examplePage--;
        $('#examplecontainer').append('<div class="alert alert-danger">'
        + SERVER_ERROR_MESSAGE + '</div>');
    })
    .always(function() {
        $('#exampleloading').hide();
    });
}

function loadTagList() {
    $('#tagloading').show();
    $.ajax({
        'url': 'tags',
        'type': 'GET',
        'dataType': 'text'
    })
    .done(function(response) {
        if (!response) {
            $('#tag-modal-content').append('<div class="alert alert-warning">'
            + NO_RESULT_MESSAGE + '</div>');
        } else {
            $('#tag-modal-content .alert').remove();
            $('#tag-modal-content').append(response);
        }
    })
    .fail(function() {
        $('#tag-modal-content').append('<div class="alert alert-danger">'
        + SERVER_ERROR_MESSAGE + '</div>');
    })
    .always(function() {
        $('#tagloading').hide();
    });
}

// Clear tags
function allToggleOff() {
    $('.tag-toggle').prop('checked', false).change();
}

// Get selected tags
function getTags() {
    return $('.tag-toggle:checked').map(function(){
        return $(this).val();
    }).get().join('+');
}

// Operation when selected tags are changed
function onTagsChanged() {
    // update number of selected tags
    var len = $('.tag-toggle:checked').length;
    if(len > 0){
        $('#tagbadge').text(len);
    } else {
        $('#tagbadge').empty();
    }
}

// Creaete query for Google Analytics
function CreateQuery() {
    var query = "";
    if ($('#keyword').val()) {
        query = "?keyword=" + $('#keyword').val();
        if (getTags()) {
            query += "&tags=" + getTags();
        }
    } else if (getTags()) {
        query += "?tags=" + getTags();
    }
    return query;
}

// Send tags event for Google Analytics
function SendTagsEvent(searchtype) {
    var tags = getTags();
    if(tags){
        tags.split('+').forEach(function(value) {
            // If multiple tags selected (such as tag1+tag2+tag3),
            // send each tag as an event
            sendGAEvent(searchtype, "tag", value, 1);
        })
    }
}