var votes = {
    i: 0,
    user_votes: [],
    votes_data: [],

    init: function () {
        votes.data = data.v;
        for ( var i = 0 ; i < votes.data.length ; i++ ) {
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
            votes.user_votes[votes.i]=$(this).children().attr("class");
            $('#question-'+votes.votes_data[votes.i].id).hide();
            votes.i++;
            $('#question-'+votes.votes_data[votes.i].id).show();

        });
    },
}
