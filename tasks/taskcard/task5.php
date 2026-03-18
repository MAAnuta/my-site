<?php
$name = "";
$shoe = "";
$color = "";
$animal = "";
$pairs = "";
$image = "";
$btn1 = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (isset($_POST["btn1"])) {
        $btn1 = $_POST["btn1"];
    } 
    else {
        $name = $_POST["name"];
        $shoe = $_POST["shoe"];
        $color = $_POST["color"];
        $animal = $_POST["animal"];

        switch ($animal) {
            case "Паук":
                $pairs = "4 пары";
                break;
            case "Утка":
                $pairs = "1 пара";
                break;
            case "Собака":
                $pairs = "2 пары";
                break;
        }

        switch ($shoe) {
            case "Ботинки":
                $image = "shoes/shoes3.png";
                break;
            case "Сандали":
                $image = "shoes/shoes1.png";
                break;
            case "Резиновые сапоги":
                $image = "shoes/shoes2.png";
                break;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Задание 5</title>
<style>
body {
    font-family: Arial;
    margin: 50px 0 0 80px;
}

.row, .result {
    width: 600px;
    margin-bottom: 20px;
}

.colors {
    display: flex;
    gap: 20px;
}

.animals button {
    flex: 1;
    padding: 5px 20px;
    font-size: 16px;
    margin: 20px;
    cursor: pointer;
}

.result {
    border: 2px solid #000;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.result-text {
    max-width: 65%;
}

.result img {
    width: 140px;
}
</style>
</head>
<body>

<form method="post">

<div class="row">
    <span class="inline">Имя</span>
    <input type="text" name="name" required>

    <span class="inline" style="margin-left:20px;">Обувь</span>
    <select name="shoe">
        <option>Ботинки</option>
        <option>Сандали</option>
        <option>Резиновые сапоги</option>
    </select>
</div>

<div class="colors">
    <label><input type="radio" name="color" value="Красный" checked> Красный</label>
    <label><input type="radio" name="color" value="Белый"> Белый</label>
    <label><input type="radio" name="color" value="Зеленый"> Зеленый</label>
    <label><input type="radio" name="color" value="Синий"> Синий</label>
</div>

<div class="animals">
    <button type="submit" name="animal" value="Паук">Паук</button>
    <button type="submit" name="animal" value="Утка">Утка</button>
    <button type="submit" name="animal" value="Собака">Собака</button>
    <button type="submit" name="btn1" value="btn1">btn1</button>
</div>

</form>

<?php if ($_SERVER["REQUEST_METHOD"] == "POST"): ?>

<div class="result">

    <?php if (!empty($btn1)): ?>
        <div class="hello-message">
            ПРИВЕТ!
        </div>
    <?php else: ?>
        <div class="result-text">
            <p><?php echo htmlspecialchars($name); ?>, Вы выбрали для животного:</p>
            <p><?php echo $animal; ?>, <?php echo $shoe; ?>, </p>
            <p>Цвет <?php echo $color; ?></p>
            <p>Количество <?php echo $pairs; ?></p>
        </div>

        <?php if ($image): ?>
            <img src="<?php echo $image; ?>" alt="обувь">
        <?php endif; ?>
    <?php endif; ?>

</div>

<?php endif; ?>

</body>
</html>