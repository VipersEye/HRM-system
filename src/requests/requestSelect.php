<?php
    header('Content-Type: application/json');

    $post_data=json_decode(file_get_contents("php://input"));
    $table_name = $post_data -> table;
    $conditions = (array) $post_data -> conditions;

    $password = md5('rootUserPassword');
    $connection = pg_connect("host=localhost port=5432 dbname=HRM user=postgres password=$password");

    $result = pg_select($connection, $table_name, $conditions );
    pg_close($connection);

    echo json_encode($result);
?>