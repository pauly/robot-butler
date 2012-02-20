var port = 3000,
  io = require('socket.io'),
  express = require('express'),
  app = express.createServer(),
  io = io.listen(app),
  arduino = require('duino'),
  board,
  pins = [];
// board = new arduino.Board( {
//   debug: true
// } );

io.sockets.on( 'connection', function ( socket ) {
  socket.on( 'message', function ( data ) {
    console.log( 'got an answer: ' + JSON.stringify( data ));
  } );
} );

var htmlWrapper = function ( req, res, next ) {
  var send = res.send;
  res.send = function ( foo ) {
    res.send = send;
    res.send( '<html><head><style type="text/css">h1 { padding: 2em }</style><script src="/socket.io/socket.io.js"></script> <script> var socket = io.connect("http://localhost:' + port + '"); socket.on("message", function (data) { console.log("triggered event message"); console.log(data); socket.emit("message", data ); var msg = document.createElement("p"); msg.innerHTML = JSON.stringify( data ); document.getElementsByTagName("body")[0].appendChild( msg ); }); </script> </head> <body> <h1>Try <a href="/led/12">/led/12</a> or <a href="/led/13">/led/13</a>.</h1> <div id="msgs"></div>' + foo + '</body></html>' );
  }
  next();
};
app.use( htmlWrapper );

var p = function ( ) {
  var r = '';
  for ( var i in arguments ) {
    r += '<h1>' + arguments[i] + '</h1>';
  }
  return r;
};


app.get( '/led/:pin(\\d{1,2})?', function( req, res, next ) {
  console.log( req.params );
  var pin = req.params.pin;
  io.sockets.emit( 'message', 'Someone just switched pin ' + pin );
  if ( ! pins[ pin ] ) {
    try {
      pins[ pin ] = new arduino.Led( {
        board: board,
        debug: true,
        pin: pin
      } );
    }
    catch ( e ) {
      console.log( e );
    }
  }
  if ( pins[ pin ] ) {
    console.log( pins[ pin ] );
    pins[ pin ].bright ? pins[ pin ].off( ) : pins[ pin ].on( );
    res.send( p( 'LED ' + pin + ' is ' + ( pins[ pin ].bright ? 'on' : 'off' )));
  }
  else {
    res.send( p( 'No LED ' + pin ));
  }
} );

app.all( /(.*)/, function( req, res ) {
  res.send( p( 'Custom 404 page, did not find ' + req.params[0] ));
} );

app.listen( port );

