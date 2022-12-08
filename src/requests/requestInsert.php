<?php
    header('Content-Type: application/json');

    $post_data=json_decode(file_get_contents("php://input"));
    $table_name = $post_data -> table;
    $values = (array) $post_data -> values;

    $password = md5('rootUserPassword');
    $connection = pg_connect("host=localhost port=5432 dbname=HRM user=postgres password=$password");

    $result = pg_insert($connection, $table_name, $values);
    pg_close($connection);

    echo json_encode((bool) $result);
?>