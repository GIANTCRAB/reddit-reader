'use strict';
const snoowrap = require('snoowrap'),
    fs = require('fs');

require('dotenv').config();

const r = new snoowrap({
    userAgent: 'NodeJS',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN
});

r.config({
    requestDelay: 1300,
    continueAfterRatelimitError: true
});

const stream = fs.createWriteStream('reddit.txt');

r.getSubreddit(process.env.SUB_REDDIT)
    .getNew({limit: Infinity})
    .map(submission => {
        stream.write(submission.title + "\n");

        submission.expandReplies({limit: Infinity, depth: Infinity})
            .then((thread) => {
                thread.comments.forEach((comment) => {
                    stream.write(comment.body + "\n");
                });
            });
    });

process.on('SIGINT', () => {
    stream.close();
});