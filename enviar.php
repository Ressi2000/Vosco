<?php  
//Llamando a los campos

$nombre=$_POST['nombre'];
$correo=$_POST['correo'];
$asunto=$_POST['asunto'];
$mensaje=$_POST['mensaje'];

//Datos para el correo

$destinatario= "vosco.ve@gmail.com";
$motivo="Contacto desde nuestra web";

$carta="De: $nombre \n";
$carta .="Corre0: $correo \n";
$carta .="Asunto: $asunto \n";
$carta .="Mensaje: $mensaje \n";

//Enviando mensaje

mail($destinatario, $motivo, $carta);

header('Location:Contactanos.html');


//https://www.youtube.com/watch?v=mqW_D9n7ao4




?>