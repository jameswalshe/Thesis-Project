<?php

  $username = "root";
  $pass = "";
  $db = "donedeal";
  $host = "127.0.0.1";
 
    $conn = new mysqli($host, $username, $pass, $db);
 
    if($conn->error){
        echo "not connected".$conn->error;
    } 
 
?>