var HIRAGANA_WRONG_ANSWER_CREATION_TABLE = [
    // add voiced sound mark (゛)
    {
        "patterns": "かきくけこさしすせそたちつてとはひふへほ".split(""),
        "func": function (match) { return getAddedCharCode(match, 0x01); }
    },
    // remove voiced sound mark (゛)
    {
        "patterns": "がぎぐげござじずぜぞだぢづでどばびぶべぼ".split(""),
        "func": function (match) { return getAddedCharCode(match, -0x01); }
    },
    // add a semi-voiced sound mark(p-sound mark) (゜)
    {
        "patterns": "はひふへほ".split(""),
        "func": function (match) { return getAddedCharCode(match, 0x02); }
    },
    // remove a semi-voiced sound mark(p-sound mark) (゜)
    {
        "patterns": "ぱぴぷぺぽ".split(""),
        "func": function (match) { return getAddedCharCode(match, -0x02); }
    },
    // make bigger
    {
        "patterns": "ぁぃぅぇぉっゃゅょ".split(""),
        "func": function (match) { return getAddedCharCode(match, 0x01); }
    },
    // This pattern must be disabled.
    // Because the selection with smaller letters is sometimes unnatural (such as あした -> ぁした)
    // // make smaller
    // {
    //     "patterns": "あいうえおつやゆよ".split(""),
    //     "func": function (match) { return getAddedCharCode(match, -0x01); }
    // },
    // similar type あ
    {   "patterns": "あおめ".split(""), "func": getRandomChoice},
    // similar type い
    {   "patterns": "いりこに".split(""), "func": getRandomChoice},
    // similar type う
    {   "patterns": "うつろる".split(""), "func": getRandomChoice},
    // similar type え
    {   "patterns": "えん".split(""), "func": getRandomChoice},
    // similar type き
    {   "patterns": "きさち".split(""), "func": getRandomChoice},
    // similar type け
    {   "patterns": "けはほにた".split(""), "func": getRandomChoice},
    // similar type ぬ
    {   "patterns": "ぬのめ".split(""), "func": getRandomChoice},
    // similar type ね
    {   "patterns": "ねれわ".split(""), "func": getRandomChoice},
    // similar type ま
    {   "patterns": "まはほ".split(""), "func": getRandomChoice},
    // similar type じ
    {   "patterns": "じぢ".split(""), "func": getRandomChoice},
    // similar type ず
    {   "patterns": "ずづ".split(""), "func": getRandomChoice},
    // similar type ゃ
    {   "patterns": "ゃゅょ".split(""), "func": getRandomChoice},
    // 2 characters shuffle
    {   "patterns": [".."], "func": function (match) { return match.charAt(1) + match.charAt(0); }}
];


// get a wrong answer
// * correct_answer:hiragana
// * question:kanji(japanese)
function getWrongAnswer_Reading(correct_answer, question) {
    // trim hiragana from kanji(=answer) 
    var change_target_org = trimHiragana(correct_answer, question)['word1'];
    // try to make a wrong answer by the rule of "CREATION TABLE"
    var rep_objs = arrayShuffle(HIRAGANA_WRONG_ANSWER_CREATION_TABLE);
    for (var i = 0; i < rep_objs.length; i++) {
        var change_target = getWrongAnswerCore(change_target_org, rep_objs[i]["patterns"], rep_objs[i]["func"]);
        if(! change_target){
            // get failed, try next rule
            continue;
        }

        // get succeed
        var wrong_answer = correct_answer.replace(change_target_org, change_target);
        // max 50% chance to do it again
        var doAgainRatio = 0.5;
        if(change_target.length <= 5){doAgainRatio = 0.3;}
        if(change_target.length <= 3){doAgainRatio = 0.1;}
        if(Math.random() < doAgainRatio){
            wrong_answer = getWrongAnswer_Reading(wrong_answer, question)
        }
        return wrong_answer;
    }

    // get failed completely
    return undefined;
}
