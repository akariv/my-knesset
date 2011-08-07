var votes = {};
votes = {
    i: 0,
    user_votes: [],
    votes_data: [],
    vote_values: {'for': 1, 'against': -1, 'abstain': 0},
    mks_cor: {},
	mks_cor_normalized: {},
	default_mk_cor: 0,
    init: function () {
        votes.data = data.v;
		// initialize votes data
        for ( var i = 0 ; i < data.v.length ; i++ ) {
            vote_id = data.v[i];
			votes.votes_data.push(votes_data[vote_id]);
			votes.votes_data[i].id = vote_id;
        }
		// initialize mk correlation value dictionary
		for (var j=0; j < data.mv.length; j++) {
            var mk_id = data.mi[j];
            votes.mks_cor[mk_id] = votes.default_mk_cor;
			votes.mks_cor_normalized[mk_id] = votes.default_mk_cor;
        }		
		votes.render_qs();
    },
    update_mks: function(user_vote) {
		// update correlation
		var output = "";
        for (var j=0; j < data.mv.length; j++) {
            var mk_id = data.mi[j];
            var mk_vote = data.mv[j][votes.i];
            if (user_vote != 0 ) {
                votes.mks_cor[mk_id] = votes.mks_cor[mk_id] + 2 - (mk_vote-user_vote)*(mk_vote-user_vote);
            }
 			output = output + Math.round(votes.mks_cor[mk_id]);
			if (j< data.mv.length-1) {
				output = output + ",";
			}
       }
	   console.log("Values");
	   console.log(output);
		//// recalculate normalized values
		// calc min/max
		var min = Number.MAX_VALUE;
		var max = Number.MIN_VALUE;
		for (var j=0; j < data.mv.length; j++) {
			var mk_id = data.mi[j];
			var mk_cor = votes.mks_cor[mk_id];
			if (min>mk_cor) {
				min = mk_cor;
			}
			if (max<mk_cor) {
				max = mk_cor;
			}
		}
		// normalize values
		var mks_range = max-min;
		console.log("Max: " + max + "; Min: " + min);
		var output = "";
		for (var j=0; j < data.mv.length; j++) {
			var mk_id = data.mi[j];
			var mk_cor = votes.mks_cor[mk_id];
			votes.mks_cor_normalized[mk_id] = (mk_cor-min)/mks_range;
			output = output + Math.round(votes.mks_cor_normalized[mk_id]);
			if (j< data.mv.length-1) {
				output = output + ",";
			}
		}
		console.log("Normalized values");
		console.log(output);
    },	
    render_qs: function() {
        var t = $('#questions_template').html();
        $('#questions').html(Mustache.to_html(t, {questions:votes.votes_data}));
        $('.button').click(function() {
            var vote = votes.vote_values[$(this).children().attr("class")];
            votes.user_votes[votes.i]=vote;
            $('#question-'+votes.votes_data[votes.i].id).hide();
            votes.i++;
            votes.update_mks(vote);
			Radar.updateTargets(votes.mks_cor_normalized);
			Radar.updateUserVoteBox(vote,votes.i-1);
			$('#question-'+votes.votes_data[votes.i].id).show();
        });
    }

}