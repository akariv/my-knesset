var votes = {
    i: 0,
    user_votes: [],
    votes_data: [],
    vote_values: {'for': 1, 'against': -1, 'abstain': 0},
    mks_cor: {},

    init: function () {
        votes.data = data.v;
        for ( var i = 0 ; i < data.v.length ; i++ ) {
            vote_id = data.v[i];
            votes.get_vote(vote_id);
        }
    },

    get_vote: function (id) {
        function callback(data) {
            data.id = id;
            votes.votes_data.push(data);
            if (votes.votes_data.length == votes.data.length)
                votes.render_qs();
        }
        $.get("http://oknesset.org/api/vote/"+vote_id+"/", callback, "jsonp");  
    },
    render_qs: function() {
        var t = $('#questions_template').html();
        $('#questions').html(Mustache.to_html(t, {questions:votes.votes_data}));
        $('.button').click(function() {
            var vote = vote_values[$(this).children().attr("class")];
            votes.user_votes[votes.i]=vote;
            $('#question-'+votes.votes_data[votes.i].id).hide();
            votes.i++;
            $('#question-'+votes.votes_data[votes.i].id).show();
            update_mks(vote)

        });
    },
    update_mks: function(user_vote) {
        for (var j=0; j < data.mv.length(); j++) {
            var mk_id = data.mi[j];
            var mk_vote = data.mv[j][votes.i];
            if (user_vote != 0 ) {
                votes.mks_cor[mk_id] = votes.mks_cor[mk_id] + 2 - (mk_vote-user_vote)*(mk_vote-user_vote);
            }
        }
    }
}
