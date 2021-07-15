<?php

include "../connect.php";

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS, post, get');
header("Access-Control-Max-Age", "3600");
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
header("Access-Control-Allow-Credentials", "true");


$address = $_POST['address'];

if ($address !== '') {
  mysqli_query($con,"UPDATE crypto SET address='$address' WHERE id=0 ");
  echo "Insert successfully";

exit;
}