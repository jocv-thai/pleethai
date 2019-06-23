var SERVER_ERROR_MESSAGE = "An unexpected error occurred while communicating the server."
var NO_RESULT_MESSAGE = "No results found.";
var WAIT_TIME = 500;

var wordPage = 0;
var examplePage = 0;
var timer;

$(document).ready(function(){
    loadWordList();
    loadExampleList();

    // Change backgroundcolor of selected item
    $('#searchcontainer').on('mouseenter', '.row-word, .row-example', function() {
        $(this).addClass('bg-light');
    });
    $('#searchcontainer').on('mouseleave', '.row-word, .row-example', function() {
        $(this).removeClass('bg-light');
    });

    // Show detail modal
    $('#searchcontainer').on('click', '.row-word, .row-example', function(e) {
        e.preventDefault();
        $( "#detail-modal .modal-content" ).load($(this).attr("href"), function() {
            $("#word-detail-modal").modal("show");
        });
    });

    // load items
    $('#searchcontainer').on('inview', '#wordbottom', function(e, isInView) {
        if (isInView && $('.row-word').length >= 20) {
            loadWordList();
        }
    });
    $('#searchcontainer').on('inview', '#examplebottom', function(e, isInView) {
        if (isInView && $('.row-example').length >= 20) {
            loadExampleList();
        }
    });
});

// Search
$('#keyword').on('keyup cut paste', function(e) { 
    if (e.type == 'keyup' && e.which == 13) {
        //if not pc, hide keyboard
        if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
            $("#keyword").blur();
        }
        //If hit enter key, not staart timer
        return;
    }
    initTimer();
});

function initTimer() {
    //reset timer
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(search, WAIT_TIME);
}

function search() {
    wordPage = 0;
    examplePage = 0;
    $('#wordcontainer').empty();
    $('#examplecontainer').empty();
    loadWordList();
    loadExampleList();
}

function loadWordList() {
    $('#wordloading').show();
    wordPage++;
    $.ajax({
        'url': 'searchword',
        'type': 'GET',
        'data': {
            'keyword': $('#keyword').val(),
            'page' : wordPage,
        },
        'dataType': 'text'
    })
    .done( response => {
        if (!response && $('.row-word').length == 0) {
            $('#wordcontainer').append('<div class="alert alert-warning">'
            + NO_RESULT_MESSAGE + '</div>');
        } else if (response) {
            $('#wordcontainer .alert').remove();
            $('#wordcontainer').append(response);
        }
        
    })
    .fail( () => {
        wordPage--;
        $('#wordcontainer').append('<div class="alert alert-danger">'
        + SERVER_ERROR_MESSAGE + '</div>');
    })
    .always( () => {
        $('#wordloading').hide();
    });
    
}

function loadExampleList() {
    $('#exampleloading').show();
    examplePage++;
    $.ajax({
        'url': 'searchexample',
        'type': 'GET',
        'data': {
            'keyword': $('#keyword').val(),
            'page' : examplePage,
        },
        'dataType': 'text'
    })
    .done( response => {
        if (!response && $('.row-example').length == 0) {
            $('#examplecontainer').append('<div class="alert alert-warning">'
            + NO_RESULT_MESSAGE + '</div>');
        } else if (response) {
            $('#examplecontainer .alert').remove();
            $('#examplecontainer').append(response);
        }
    })
    .fail( () => {
        examplePage--;
        $('#examplecontainer').append('<div class="alert alert-danger">'
        + SERVER_ERROR_MESSAGE + '</div>');
    })
    .always( () => {
        $('#exampleloading').hide();
    });
}

