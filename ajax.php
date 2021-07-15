<?php
include "connect.php";

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS, post, get');
header("Access-Control-Max-Age", "3600");
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
header("Access-Control-Allow-Credentials", "true");


  $data = json_decode(file_get_contents("php://input"));



$request = $data->request;

// Fetch All records
if($request == 1){
  $userData = mysqli_query($con,"select * from donations order by id desc");

  $response = array();
  while($row = mysqli_fetch_assoc($userData)){
    $response[] = $row;
  }

  echo json_encode($response);
  exit;
}

if($request == 3){
  $userData = mysqli_query($con,"select * from crypto");
  


  $response = array();
  while($row = mysqli_fetch_assoc($userData)){
    $response[] = $row;
  }

  echo json_encode($response);
  exit;
}

// Add record
if($request == 2){
  $firstname = $data->firstname;
  $lastname = $data->lastname;
  $email = $data->email;
  $amount = $data->amount;


    mysqli_query($con,"INSERT INTO donations(firstname,lastname,email, amount) VALUES('".$firstname."','".$lastname."','".$email."','".$amount."')");
    echo "Insert successfully";
  
  exit;
}
// add crypto
if($request == 4){
  $address = $data->address;
  
    mysqli_query($con,"UPDATE crypto SET address='$address' WHERE id=0 ");
    echo "Insert successfully";
  
  exit;
}








?>