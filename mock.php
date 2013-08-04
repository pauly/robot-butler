<?php

/**
 * Mock server for the robot butler
 * Response format based on older code, safe to ignore this.
 * 
 * @author PC <pauly@clarkeology.com>
 * @date Sun May 27 17:55:35 BST 2012
 */

header( 'content-type: application/json' );
echo json_encode( array( 'a' => array( '3' => 666 ), 'd' => array( '13' => 1 ), 'r' => array( 'method' => $_SERVER['REQUEST_METHOD'], 'path' => $_SERVER['REQUEST_URI'], 'pin' => '13', 'msg' => 'Thanks!' )));

?>
