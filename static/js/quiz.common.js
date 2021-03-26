var QUIZ_SELECTIONS_NUM = 4;
var QUIZ_TYPE_READING = 'quiz_jap_read';
var QUIZ_TYPE_WRITING = 'quiz_jap_write';

// REGEXP for char type
var REGEXP_HIRAGANA = /[\u{3041}-\u{3094}]/mu;
var REGEXP_KATAKANA = /[\u{30A1}-\u{30F4}\u{30FC}]/mu;
var REGEXP_KANJI = /[\u{3005}\u{3007}\u{303b}\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}\u{20000}-\u{2FFFF}][\u{E0100}-\u{E01EF}\u{FE00}-\u{FE02}]?/mu;

$(document).ready(function(){
    // quiz icon
    $(document).on('click', '#quiz-start-button', function() {
        resetQuiz();
        clearSearchConditions();

        // judge which quiz to start
        var selected_quiz = $('#quiz-form input[name="quizRadios"]:checked');
        var title = selected_quiz.attr('data-quiz-name');
        if(title) {
            // set extra-url for detail window
            $('#content').attr('data-extra-url', selected_quiz.attr('data-extra-url'));
            // set text into info-bar
            $('#info-bar').html('<span id="quiz-info-title">'+ title +'</span><span id="quiz-info-score"></span>');
            
            // check default tags for the selected quiz
            var quiz_tag_ids = selected_quiz.attr('data-quiz-tag-ids');
            if(quiz_tag_ids){
                $.each(quiz_tag_ids.split(/, /), function(index, tag_id){
                    $('#tag-toggle' + tag_id).prop('checked', true).change();
                });
            }
        }
        // no select is normal mode (not quiz mode)
                
        search();
    })
    // initialize quiz modal (because onload does not work, do this at inview event)
    .on('inview', '.quiz-modal-body', function(e, isInView) {
        if (! isInView) {
            return;
        }

        // initialize quiz modal
        initQuizModal();

        var current = getDetailModalCurrent();
        // move scroll to target row
        $("html, body").animate({scrollTop: current.offset().top});
    })
    // select the one of selections
    .on('click', '#detail-modal .quiz-ok, #detail-modal .quiz-ng', function() {
        if($(this).hasClass('quiz-answered')){
            // already answered
            return;
        }

        $('.quiz-selected').removeClass('quiz-selected');
        $(this).addClass('quiz-selected');
    })
    // answer button
    .on('click', '.quiz-select-button', function() {
        $('.quiz-select-button').hide();

        var ok_ng = $('.quiz-selected').hasClass('quiz-ok');
        var current = getDetailModalCurrent();
        // set 'ok/ng' flag to the selected word/example in search page
        var badge;
        if(ok_ng){
            current.removeClass('quiz-ng');
            current.addClass('quiz-ok');
            badge = $('#quiz_badges .badge-ok');
        } else {
            current.removeClass('quiz-ok');
            current.addClass('quiz-ng');
            badge = $('#quiz_badges .badge-ng');
        }
        // add ok/ng badge
        $('.quiz-selected').find('.field-selection').append(badge.clone());
        current.children('div').last().append(badge.clone());
        
        // set 'answered' flag to 
        // selections in modal & the selected word/example in search page
        $('.quiz-ok, .quiz-ng').addClass('quiz-answered');

        // set ok/ng count
        var ok_text = $('#quiz_badges .badge-ok').text();
        var ng_text = $('#quiz_badges .badge-ng').text();
        var quiz_info = getQuizInfo();
        $('#quiz-info-score').text('('+
            ok_text+':'+ (quiz_info['word_ok']+quiz_info['example_ok'])+
            ' / '+
            ng_text+':'+ (quiz_info['word_ng']+quiz_info['example_ng'])+
        ')');

        // set link to next/prev item, to the next/prev buttons
        var next = current.nextAll('.row').filter(':visible');
        if(next.length > 0) {
            $('.next-card-button').attr({'href': next.first().attr('href')});
        }
        var prev = current.prevAll('.row').filter(':visible');
        if(prev.length > 0) {
            $('.prev-card-button').attr({'href': prev.first().attr('href')});
        }
    })
    // next/prev buttons
    .on('click', '.next-card-button, .prev-card-button', function() {
        loadDetailModal($(this).attr('href'));
    });
});

function resetQuiz(){
    $('#content').attr('data-extra-url', "");

    $('#info-bar').empty();
    $('.quiz-answered').removeClass('quiz-answered');
    $('.quiz-ng').removeClass('quiz-ng');
    $('.quiz-ok').removeClass('quiz-ok');

    $('.badge-ok, .badge-ng').remove();
}

// get selected word/example in search page, by the data from modal  
function getDetailModalCurrent(){
    var url = $("#detail-modal").attr("data-url");
    var curRowSelector = '.row-word[href="'+url+'"], .row-example[href="'+url+'"]';
    return $(curRowSelector);
}

function getQuizInfo(){
    var ret = {
        'word_ok' : $('.row-word.quiz-ok').length,
        'word_ng' : $('.row-word.quiz-ng').length,
        'example_ok' : $('.row-example.quiz-ok').length,
        'example_ng' : $('.row-example.quiz-ng').length,
    };
    return ret;
}

// get quiz type
function getQuizType(){
    var extra_url = $('#content').attr('data-extra-url');
    if (extra_url.startsWith('quiz')) {
        return extra_url;
    }
    return undefined;
}

function initQuizModal() {
    // target words select for example-detail window
    $('#quiz_target_words label').each(function(index, label){
        var question_target = $(label).attr('data-question').trim();
        question_target = question_target.replace(/[\(（][^\)）]*[\)）]/g, '')
        question_target = question_target.replace(/[～~]/g, '')
        var question_target_id = "quiz_target_word"+index;
        var question_answer = $(label).attr('data-answer').trim();
        question_answer = question_answer.replace(/[\(（][^\)）]*[\)）]/g, '')
        question_answer = question_answer.replace(/[～~]/g, '')
        var question_answer_id = "quiz_answer_word"+index;
        var field_target = $('#quiz_question .field-target').html();
        var field_answer = $('#quiz_question .field-answer').html();
        
        // WORD CHECK for target words
        if($('#quiz_target_words label[data-question="'+question_target+'"][data-answer="'+question_answer+'"]').length > 1){
            // there are 2 or more same words (this will remain the last one only)
            $(label).remove();
            return;
        }
        if(question_target == question_answer){
            // question & answer is the same word
            $(label).remove();
            return;
        }
        if( ((field_target.match(new RegExp(question_target, "g")) || []).length < 1) ||
            ((field_answer.match(new RegExp(question_answer, "g")) || []).length < 1)){
            // question-word is not found in the question-example or
            // answer-word is not found in the answer-example
            // -> then, try to trim hiragana and check again
            var temp = trimHiragana(question_target, question_answer);
            question_target = temp['word1'];
            question_answer = temp['word2'];
            if( ((field_target.match(new RegExp(question_target, "g")) || []).length == 1) &&
                ((field_answer.match(new RegExp(question_answer, "g")) || []).length == 1)){
                    // if trimmed japanese&hiragana found in example string,
                    // use the trimmed word
            } else {
                $(label).remove();
                return;
            }
        }

        // Do target words have checked tag (in tag-window)?
        var checkedTags = getCheckedTagsList();
        // if no tags checked, all words are ok
        if(checkedTags.length > 0){
            var hasCheckedTag = false;
            $(label).children('.tag-badge').each(function(index, tag){
                if(checkedTags.indexOf($(tag).attr('data-tag-id')) >= 0) {
                    hasCheckedTag = true;
                    return;
                }
            });
            if(! hasCheckedTag){
                // if the target word's tags are not checked, delete the word 
                $(label).remove();
                return;
            }
        }

        // add marker to the specific target word
        $('#quiz_question .field-target').html(
            field_target.replace(question_target, "<span id='"+question_target_id+"'>" + question_target + "</span>")
        );
        $('#quiz_question .field-answer').html(
            field_answer.replace(question_answer, "<span id='"+question_answer_id+"'>" + question_answer + "</span>")
        );

        $(label).on('click', function(){
            // change quiz target field to the specific word in example
            $('#quiz_question .field-target').removeClass('field-target');
            $('#'+question_target_id).addClass('field-target');
            // change quiz answer field to the specific word in example
            $('#quiz_question .field-answer').removeClass('field-answer');
            $('#'+question_answer_id).addClass('field-answer');
            
            // initial creation of selections
            createSelections();
        });
    });
    if($('#quiz_target_words label:visible').length == 0){
        // initial creation of selections
        // if no target word in example-detail (or simply case of word-detail),
        // use all example/word text
        createSelections();
        $('#quiz_target_words').hide();
    } else if($('#quiz_target_words label:visible').length == 1){
        // only 1 target word
        $('#quiz_target_words label:visible').trigger('click');
        $('#quiz_target_words').hide();
    }
}

// create the correct/wrong selections
function createSelections() {
    // create the correct/wrong answer selections
    var selections = getAnswerTexts(
        $('#quiz_question .field-answer').text(),
        $('#quiz_question .field-target').text());
    // first answer is the correct one
    var correct_answer = selections[0];

    // shuffle the answers
    selections = arrayShuffle(selections);

    // create selections
    $('.quiz-selections').empty();
    $.each(selections, function(index, sel){
        var element = $('#quiz_selection_temp').clone();
        // change id to be unique
        element.attr('id', 'quiz_selection_' + index);
        // set the selection text
        element.find('.field-num').text(index+1);
        element.find('.field-selection').text(sel);
        element.find('.speech-target').attr('data-text', sel);
        // set the correct/wrong answer
        if(sel == correct_answer){
            element.addClass('quiz-ok');
        } else {
            element.addClass('quiz-ng');
        }

        $('.quiz-selections').append(element);
    });

    createHint();
    $('.quiz-question-string').show();
    $('.quiz-select-button').show();
    $('#accordionHint').show();
    $('#quiz_target_words').hide();
}

// create hint
function createHint() {
    // string that containing answer (if the case of example, real answer is a word)
    var answer_parent = $('#quiz_question .field-answer').parent();
    var answer_real = $('#quiz_question .field-answer');
    // create hint field from answer field
    $('#quiz_hint').html(answer_parent.html());
    $('#quiz_hint').attr('data-text', answer_parent.text());
    $('#quiz_hint .field-answer').html(answer_real.text().replace(/./g, '<span>X</span>'));
}

function getAnswerTexts(correct_answer, question) {
    // normalize answer & question
    correct_answer = normalizeStr(correct_answer);
    question = normalizeStr(question);

    var type = getQuizType();
    var ret = [correct_answer];
    // get wrong answers (try [4 selections * 10] times)
    for(var trycount=0; trycount < QUIZ_SELECTIONS_NUM*10; trycount++){
        var wrong_answer;
        // get a wrong answer text according to the quiz type
        if(type == QUIZ_TYPE_READING) {
            wrong_answer = getWrongAnswer_Reading(correct_answer, question);
        } else if(type == QUIZ_TYPE_WRITING) {
            wrong_answer = getWrongAnswer_Writing(correct_answer, question);
        }

        // check the wrong answer text is unique or not
        if (wrong_answer && ret.indexOf(wrong_answer) < 0){
            // get success
            ret.push(wrong_answer);
        }

        if(ret.length >= QUIZ_SELECTIONS_NUM){
            break;
        }
    }
    // if can't get enough selections, get random selection
    for (var trycount=0; (ret.length < QUIZ_SELECTIONS_NUM) && (trycount < QUIZ_SELECTIONS_NUM*10); trycount++){
        var wrong_answer;        
        if(type == QUIZ_TYPE_READING) {
            wrong_answer = correct_answer.replace(REGEXP_HIRAGANA, function(match){
                return getRandomChar(match, REGEXP_HIRAGANA);
            });
        }
        if (wrong_answer && ret.indexOf(wrong_answer) < 0){
            // get success
            ret.push(wrong_answer);
        }
    }

    return ret;
}

// common functions
function normalizeStr(str) {
    // delete spaces
    var str = str.replace(/[ ]/g, '');
    return str;
}

function arrayShuffle(arr){
    ret = arr.concat();
    // shuffle by Fisher–Yates Algorithm
    for(var i = ret.length - 1; i > 0; i--){
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = ret[i];
        ret[i] = ret[r];
        ret[r] = tmp;
    }

    return ret;
}
function arrayFixLen(arr, len) {
    if (arr.length == 0){
        return arr;
    }

    while(arr.length < len){
        arr = arr.concat(arr);
    }

    return arr.slice(0, len);
}

// get wrong answer functions core (common part)
// if the "correct_answer" string has the part that matches one of "replacePatternArray",
// return the new string that was replaced the part with "replaceFunc"
function getWrongAnswerCore(correct_answer, replacePatternArray, replaceFunc){
    // create replace target by "replacePatternArray"
    // if "replacePatternArray" = ['A', 'B', 'CD'],
    // the regular expression will be /A|B|CD/g (that means 'A' or 'B' or 'CD')
    var regexpstr = arrayShuffle(replacePatternArray).join('|');
    var regexp = new RegExp(regexpstr, 'g');    
    // check whether the "correct_answer" text has target part in it
    var rep_targets = correct_answer.match(regexp);
    if(!rep_targets){
        // not found
        return null;
    }
    
    // change the target part by the rule of "replaceFunc" param
    var rep_str = arrayShuffle(rep_targets)[0];
    var rep_func = function(match){
        return replaceFunc(match, replacePatternArray);
    };
    
    // return the changed word 
    return correct_answer.replace(rep_str, rep_func);
}

// get hiragana-trimmed kanji(or katakana) & related hiragana
// sample: word1='おはようございます', word2='お早う御座います'
//         => result will be {'word1': 'はようござ', 'word2': '早う御座'} 
function trimHiragana(word1, word2){
    // delete hiragana from head 
    var start = 0;
    for(; start<word1.length; start++){
        if(word1.charAt(start) != word2.charAt(start)){
            break;
        }
    }
    
    // delete hiragana from tail
    var end = 0;
    for(; end<word1.length; end++){
        if(word1.charAt(word1.length-1-end) != word2.charAt(word2.length-1-end)){
            break;
        }
    }
    return {
        'start': start,
        'end': end,
        'word1': word1.substring(start, word1.length-end),
        'word2': word2.substring(start, word2.length-end)
    };
}

// change answer text rules
function getAddedCharCode(match, add){
    return String.fromCharCode(match.charCodeAt(0) + add);
}

function getRandomChar(match, regexp){
    var random_size = 100;
    regexp = new RegExp(regexp, 'mug');
    var newchar;
    var max_count=100;
    do {
        newchar = getAddedCharCode(match, Math.floor(Math.random() * random_size - (random_size/2)));
        max_count--;
        if(max_count<0){
            return match;
        }
    } while(newchar == match || ! regexp.test(newchar));
    return newchar;
}

function getRandomChoice(match, patterns){
    // exclude the matched value
    var noMatchList = [];
    for(var i=0; i<patterns.length; i++){
        if(patterns[i] != match){
            noMatchList.push(patterns[i]);
        }
    }

    return noMatchList[Math.floor(Math.random() * noMatchList.length)];
}
