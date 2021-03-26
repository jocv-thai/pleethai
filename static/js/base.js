$(document).ready(function(){
    // Hide menu when menu item is clicked (for small screen)
    $('#content').on('click', '#nav-items a', function() {
        $("#nav-items.show").collapse('hide');
    })
    // icon control
    .on('click mouseenter', '.icon_div', function() {
        if(! $(this).hasClass('openning') && ! $(this).hasClass('opened')) {
            // open icon when no classes attached (default state)
            $(this).addClass('openning').delay(200).queue(function(){
                // In tablets or touch-screen-devices (no mouse devices),
                // click & mouseenter events will be happened at the same time.
                // So, there should be 'openning' state to ignore a-tag link at the 1st touch
                $(this).removeClass('openning').addClass('opened').dequeue();
            }).delay(3000).queue(function(){
                $(this).removeClass('opened').dequeue();
            });
            return false;
        } else if(! $(this).hasClass('opened')){
            // link is invalid when openning
            return false;
        } else {
            // link is only valid when opened
        }
    })
    // Show general modal
    .on('click', '.general-modal-button', function() {
        $("#general-modal .modal-content").empty();
        $("#general-modal .modal-content").load($(this).attr("href"), function() {
            // set speakbale indicator
            setSpeakableOrNot();

            $("#general-modal").modal("show");
        });

        // no jump
        return false;
    });
});