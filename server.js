/**
 * Slightly messy arduino experiments using sockets.
 * 
 * Requires http://nodejs.org/ and http://expressjs.com/ and https://github.com/ecto/duino 
 * 
 * @todo    Templates
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
  pins = { 11: null, 12: null, 13: null },
  board = new arduino.Board( ),
  list_of_pins = '<ul>';

for ( var i in pins ) {
  try {
    pins[ i ] = new arduino.Led( {
      board: board,
      debug: true,
      pin: i
    } );
    list_of_pins += '<li><a id="pin' + i + '" data-pin="' + i + '" href="/pin/' + i + '" data-bright="0">/pin/' + i + '</a></li>';
  }
  catch ( e ) { // probably no led plugged in
    console.log( e );
  }
}
list_of_pins += '</ul>';

io.sockets.on( 'connection', function ( socket ) {
  socket.on( 'pin', function ( data ) {
    if ( typeof data.bright != 'undefined' ) {
      switch_pin( data.pin );
    }
  } );
} );

app.use( function ( req, res, next ) {
  var send = res.send;
  res.send = function ( foo ) {
    res.send = send;
    res.send( '<html><head><style type="text/css">p, li { font-size: 2em, margin: 2em } .on { background-color: #0f0 } </style></head><body>' + list_of_pins + '<div id="msgs"></div>' + foo + '<script src="http://code.jquery.com/jquery-1.5.min.js"></script><script src="/socket.io/socket.io.js"></script> \
      <script> \
        $( function ( ) { \
          var socket = io.connect("http://localhost:' + port + '"); \
          if ( socket ) { \
            socket.on( "message", function ( data ) { \
              $("#msgs").prepend( "<p>" + JSON.stringify( data ) + "<\p>" ).find("p:gt(2)").remove( ); \
            } ); \
            socket.on( "pin", function ( data ) { \
              var $pin = $("#pin" + data.pin).data( "bright", data.bright ); \
              data.bright ? $pin.addClass( "on" ) : $pin.removeClass( "on" ); \
            } ); \
            $("a").each( function ( ) { \
              /* quick test, get each pin, see if it is on - I still need to update the pin data, hmm */ \
              socket.emit( "pin", { pin: $(this).data("pin") } ); \
            } ).click( function ( ) { \
              socket.emit( "pin", { pin: $(this).data("pin"), bright: ! $(this).data("bright") } ); \
              return false; \
            } ); \
          } \
        } ); \
      </script></body></html>' );
  }
  next( );
} );

var switch_pin = function ( pin, bright ) {
  io.sockets.emit( 'message', 'Someone just switched pin ' + pin );
  if ( pins[ pin ] ) {
    if ( bright === undefined ) bright = ! pins[ pin ].bright;
    pins[ pin ].bright ? pins[ pin ].off( ) : pins[ pin ].on( );
    io.sockets.emit( "pin", { pin: pin, bright: pins[ pin ].bright } );
    return get_pin( pin );
  }
  return false;
};

var get_pin = function ( pin ) {
  return pins[ pin ].bright;
};

app.post( '/pin/:pin(\\d{1,2})?', function( req, res, next ) {
  res.send( switch_pin( req.params.pin ));
} );

app.get( '/pin/:pin(\\d{1,2})?', function( req, res, next ) {
  res.send( get_pin( req.params.pin ));
} );

app.all( /(.*)/, function( req, res ) {
  res.send( '' );
} );

app.listen( port );

