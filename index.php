<?php
$width = 10;
$height = 10;
$num_mines = 10;
$mines = array();
$true_num_mines = 0;
$boardmap = array();

// Get random mine positions
for ($i = 0; $i < $num_mines; $i++) {
    $mines[$i] = sprintf("%02d,%02d", rand(0, $width - 1), rand(0, $height - 1));
}

// Create board
for ($y = 0; $y < $height; $y++) {
    $boardmap[$y] = array();
    for ($x = 0; $x < $width; $x++) {
        $boardmap[$y][$x] = 0;
    }
}

// Assign mine values
for ($i = 0; $i < count($mines); $i++) {
    echo("<!-- " . $mines[$i] . " -->\n");
    echo("<!-- [" . substr($mines[$i], 3, 2) . "][" . substr($mines[$i], 0, 2) . "] -->\n");
    $boardmap[(int)substr($mines[$i], 3, 2)][(int)substr($mines[$i],0,2)] = "M";
}

var_dump($boardmap);
// Assign numbers
for ($y = 0; $y < $height; $y++) {
    for ($x = 0; $x < $width; $x++) {
        $count = 0;
        if ($x > 0 and $boardmap[$y][$x - 1] == "M") $count++;
        if ($y > 0 and $boardmap[$y - 1][$x] == "M") $count++;
        if ($x < $width - 1 and $boardmap[$y][$x + 1] == "M") $count++;
        if ($y < $height - 1 and $boardmap[$y+1][$x] == "M") $count++;
        if ($x > 0 and $y > 0 and $boardmap[$y-1][$x - 1] == "M") $count++;
        if ($x > 0 and $y < $height - 1 and $boardmap[$y+1][$x - 1] == "M") $count++;
        if ($x < $width - 1 and $y > 0 and $boardmap[$y-1][$x + 1] == "M") $count++;
        if ($x > 0 and $y > 0 and $boardmap[$y - 1][$x - 1] == "M") $count++;
        if ($boardmap[$y][$x] != "M") $boardmap[$y][$x] = $count;
    }
}
var_dump($boardmap);
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
    <meta name="author" content="Aiden Woodruff">
    <title>Minesweeper</title>
    <link type="text/css" rel="stylesheet" href="tiles.css">
    <script type="application/javascript">
    var unrevealeds = document.getElementsByClassName('unrevealed');

function reveal (object) {
    object.classList.remove('unrevealed');
    object.classList.add('revealed');
    object.removeEventListener('click', reveal);
    if (object.classList.contains('n0')) {
        object.innerHTML = "0";
    } else if (object.classList.contains('n1')) {
        object.innerHTML = "1";
    } else if (object.classList.contains('n2')) {
        object.innerHTML = "2";
    } else if (object.classList.contains('n3')) {
        object.innerHTML = "3";
    } else if (object.classList.contains('n4')) {
        object.innerHTML = "4";
    } else if (object.classList.contains('n5')) {
        object.innerHTML = "5";
    } else if (object.classList.contains('mine')) {
        object.innerHTML = "M";
    }
}
</script>
</head>
<body>
<h1>Minesweeper</h1>
<table class="board">
<?php
    for ($y = 0; $y < $height; $y++) {
        echo("<tr>\n");
        for ($x = 0; $x < $width; $x++) {
            if ($boardmap[$y][$x] != "M") {
                echo("<td class='unrevealed n" . $boardmap[$y][$x] . "' onclick='reveal(this)'></td>\n");
            } else if ($boardmap[$y][$x] == "M") {
                echo("<td class='unrevealed mine' onclick='reveal(this)'></td>\n");
            } else {
                echo("<td class='unrevealed null' onclick='reveal(this)'></td>\n");
            }
        }
        echo("</tr>\n");
    }
?>
</table>
</body>
</html>
