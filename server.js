/**
 * Slightly messy arduino experiments using sockets.
 * 
 * Requires http://nodejs.org/ and http://expressjs.com/ and https://github.com/ecto/duino 
 * 
 * @author  PC <paul.clarke+paulclarke@holidayextras.com>
 * @date    Tue 21 Feb 2012 08:57:00 GMT
 */

var port = 3000,
  io = require('socket.io'),
  express = require('express'),
  app = express.createServer( ),
  io = io.listen(app),
  arduino = require('duino'),
  board,
  pins = [],
  board = new arduino.Board( );

io.sockets.on( 'connection', function ( socket ) {
  socket.on( 'pin', function ( data ) {
    switch_pin( data.pin );
  } );
} );

var htmlWrapper = function ( req, res, next ) {
  var send = res.send;
  res.send = function ( foo ) {
    res.send = send;
    res.send( '<html><head><style type="text/css">p { padding: 2em } .on { background-color: #0f0 } </style></head><body> <p>Try <a id="pin12" data-pin="12" href="/pin/12">/pin/12</a> or <a id="pin13" data-pin="13" href="/pin/13">/pin/13</a>.</p> <div id="msgs"></div>' + foo + '<script src="http://code.jquery.com/jquery-1.5.min.js"></script><script src="/socket.io/socket.io.js"></script> \
      <script> \
        $( function ( ) { \
          var socket = io.connect("http://localhost:' + port + '"); \
          if ( socket ) { \
            socket.on( "message", function ( data ) { \
              $("#msgs").prepend( "<p>" + JSON.stringify( data ) + "<\p>" ).find("p:gt(2)").remove( ); \
            } ); \
            socket.on( "pin", function ( data ) { \
              data.bright ? $("#pin" + data.pin).addClass( "on" ) : $("#pin" + data.pin).removeClass( "on" ); \
            } ); \
            $("a").click( function ( ) { \
              socket.emit( "pin", { pin: $(this).data("pin"), bright: ! $(this).data("bright") } ); \
              return false; \
            } ); \
          } \
        } ); \
      </script></body></html>' );
  }
  next( );
};
app.use( htmlWrapper );

var switch_pin = function ( pin, bright ) {
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
    console.log( 'switch pin ' + pin );
    if ( bright === undefined ) bright = ! pins[ pin ].bright;
    pins[ pin ].bright ? pins[ pin ].off( ) : pins[ pin ].on( );
    io.sockets.emit( "pin", { pin: pin, bright: pins[ pin ].bright } );
    return 'LED ' + pin + ' is ' + ( pins[ pin ].bright ? 'on' : 'off' );
  }
  else {
    return 'No LED ' + pin;
  }
};

app.get( '/pin/:pin(\\d{1,2})?', function( req, res, next ) {
  res.send( switch_pin( req.params.pin ));
} );

app.all( /(.*)/, function( req, res ) {
  res.send( '' );
} );

app.listen( port );

