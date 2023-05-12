<?php
    header('Content-Type: application/json');

    $post_data=json_decode(file_get_contents("php://input"));

    $from = $post_data -> from;
    $to = $post_data -> to;

    $status = copy($from, $to);
    echo $status;
?>