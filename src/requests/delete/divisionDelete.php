<?php
    header('Content-Type: application/json');

    $post_data=json_decode(file_get_contents("php://input"));
    $conditions = (array) $post_data -> conditions;

    $password = md5('rootUserPassword');
    $connection = pg_connect("host=localhost port=5432 dbname=HRM user=postgres password=$password");

    $workers = pg_select($connection, "worker", $conditions);

    foreach ($workers as $row) {
        $condition = array('worker_id' => $row['worker_id']);

        $result_task = pg_delete($connection, "task", $condition);
        $result_question = pg_delete($connection, "question", $condition);
        $result_event = pg_delete($connection, "event", $condition);
        $result_worker_test = pg_delete($connection, "worker_test", $condition);
        $result_worker = pg_delete($connection, "worker", $condition);
    }

    $result = pg_delete($connection, "division", $conditions);
    pg_close($connection);

    echo json_encode((bool) $result);
?>