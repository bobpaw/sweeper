<?php
  $current = array();
  if (file_exists("leaderboard.json") && filesize("leaderboard.json") !== 0) {
    $current = json_decode(file_get_contents("leaderboard.json"), true);
  }
  if (!$current) {
    $current = array();
  }
  array_push($current, json_decode(file_get_contents("php://input"),
  true));
  file_put_contents("leaderboard.json", json_encode($current));
?>
