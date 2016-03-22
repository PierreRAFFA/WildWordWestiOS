var socketio = require('socket.io');
var cookie            = require('express/node_modules/cookie');
var cookieParser = require('cookie-parser');
var Game = require('../app/data/game');

/**
 * Module exports.
 */
var socket = module.exports = exports = new Socket;

/**
 * Socket constructor.
 *
 * @param {http.Server|Number|Object} http server, port or options
 * @param {Object} options
 * @api public
 */

function Socket(){
    //if (!(this instanceof Socket)) return new Socket();

    this.io             = null;
    this.userSockets =   [];

    this.rand = Math.random();

}
Socket.prototype.setServer = function(server)
{
    this.server = server;
    this.io = socketio(server);

    this.configure();
    this.listen();
}
Socket.prototype.configure = function()
{
    var self = this;

    this.io.use(function(socket, next) {
        var handshakeData = socket.request;

        if (handshakeData.headers.cookie)
        {
            // if there is, parse the cookie
            // note that you will need to use the same key to grad the
            // session id, as you specified in the Express setup.
            handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
            handshakeData.sessionId = cookieParser.signedCookie(handshakeData.cookie['connect.sid'], 'MEAN');
            console.log("handshakeData.sessionId:"+handshakeData.sessionId);
        } else {
            // if there isn't, turn down the connection with a message
            // and leave the function.
            return next('No cookie transmitted.', false);
        }
        // accept the incoming connection
        next();
    });
}
Socket.prototype.listen = function()
{
    var self = this;
    this.io.on('connection', function (socket)
    {
        //self.session = socket.handshake.session;
        //console.log(socket.request.sessionId);
        self.addUserSocket(socket);

        console.log("A new player visits the game");
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        socket.on('init', function (data)
        {
            console.log("init");
            console.log(data);
            socket.data = data;
        });
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        /**
         * Event triggered client-side
         * Once called, server can emit some events ( initialized, gameOver, scoreSaved )
         *
         * @data data to create a new game
         * @callback
         */
        socket.on('new', function (data, callback)
        {
            console.log(data);
            if (data.hasOwnProperty('gameCenterId') &&
                data.hasOwnProperty('platform') &&
                data.hasOwnProperty('name') &&
                data.hasOwnProperty('numColumns') &&
                data.hasOwnProperty('numRows') &&
                data.hasOwnProperty('locale'))
            {
                console.log('on:new');

                //create a new game
                var game = new Game(data.numColumns, data.numRows, data.locale, data.platform, data.gameCenterId, data.name, data.avatar );

                game.getBoard().once('initialized' , function(update)
                {
                    //store infos in session socket
                    socket.game    = game;

                    //returns the newBlocks
                    socket.game.getBoard().visualize();

                    //returns the result
                    callback && callback.call(null, update);
                });

                game.getBoard().once('gameOver' , function(gameTime)
                {
                    console.log('gameover');
                    socket.emit('gameOver', gameTime);
                });

                game.once('scoreSaved', function(result)
                {
                    socket.emit('scoreSaved', result);
                });
            }else{
                console.log('Can not create a new game. One or more parameters are invalid');
            }
        });
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        socket.on('submitWord', function (data, callback)
        {
            socket.game.getBoard().analyzeWord(data);

            socket.game.getBoard().once('boardUpdated' , function(update)
            {
                console.log('points after emit'+update.points);
                socket.game.getBoard().visualize();

                //getNonSynchronizedBlocks return new blocks. If the word is not valid, this array is empty and nothing happens in the game
                callback && callback.call(null, update);
            })

        });
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        /**
         * This event is ONLY called for the first save of a player.
         */
        //socket.on('createAccount', function (data, callback)
        //{
        //    if (data.hasOwnProperty('name') &&
        //        data.hasOwnProperty('email'))
        //    {
        //        socket.game.createAccountAndSaveScore(data.name, data.email);
        //    }else{
        //        console.log('Can not save the score. One or more parameters are invalid');
        //    }
        //});
        ////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        socket.on('disconnect', function () {
            console.log("============= USER DISCONNECTED =============");

            socket.game = null;
            self.removeUserSocket(socket);
        });

    });
}
Socket.prototype.addUserSocket = function(socket)
{
    this.userSockets[socket.request.sessionId] = socket;
}
Socket.prototype.removeUserSocket = function(socket)
{
    delete this.userSockets[socket.request.sessionId];
}
Socket.prototype.getUserSessionById = function(id)
{
    return this.userSockets[id];
}
Socket.prototype.getRand = function()
{
    return this.rand;
}

