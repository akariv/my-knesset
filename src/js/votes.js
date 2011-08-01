var votes = {};
votes = {
    i: 0,
    user_votes: [],
    votes_data: [],
    vote_values: {'for': 1, 'against': -1, 'abstain': 0},
    mks_cor: {},
	default_mk_cor: 0,
    init: function () {
        votes.data = data.v;
		// initialize votes data
        for ( var i = 0 ; i < data.v.length ; i++ ) {
            vote_id = data.v[i];
			votes.votes_data.push(votes_data[vote_id]);
        }
		// initialize mk correlation value dictionary
		for (var j=0; j < data.mv.length; j++) {
            var mk_id = data.mi[j];
            votes.mks_cor[mk_id] = votes.default_mk_cor;
        }		
		votes.render_qs();
    },
    update_mks: function(user_vote) {
        for (var j=0; j < data.mv.length; j++) {
            var mk_id = data.mi[j];
            var mk_vote = data.mv[j][votes.i];
            if (user_vote != 0 ) {
                votes.mks_cor[mk_id] = votes.mks_cor[mk_id] + 2 - (mk_vote-user_vote)*(mk_vote-user_vote);
            }
        }
    },	
    render_qs: function() {
        var t = $('#questions_template').html();
        $('#questions').html(Mustache.to_html(t, {questions:votes.votes_data}));
        $('.button').click(function() {
            var vote = votes.vote_values[$(this).children().attr("class")];
            votes.user_votes[votes.i]=vote;
            $('#question-'+votes.votes_data[votes.i].id).hide();
            votes.i++;
            $('#question-'+votes.votes_data[votes.i].id).show();
            votes.update_mks(vote)

        });
    }

}
