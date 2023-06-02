<?php
    header('Content-Type: application/json');

    $post_data=json_decode(file_get_contents("php://input"));
    $conditions = (array) $post_data -> conditions;

    $password = md5('rootUserPassword');
    $connection = pg_connect("host=localhost port=5432 dbname=HRM user=postgres password=$password");

    $result_task = pg_delete($connection, "task", $conditions);
    $result_question = pg_delete($connection, "question", $conditions);
    $result_event = pg_delete($connection, "event", $conditions);
    $result_worker_test = pg_delete($connection, "worker_test", $conditions);
    $result_worker = pg_delete($connection, "worker", $conditions);
    pg_close($connection);

    echo json_encode((bool) $result_worker);
?>