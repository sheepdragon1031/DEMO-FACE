<?
//上傳檔案
$file = sha1(uniqid()).'.jpg';
if($_GET['get']==1){
	$file = 'download/'.$file;
	$data = base64_decode($_POST['file']);
	file_put_contents($file,$data);
}else{
	$file = 'upload/'.$file;
	move_uploaded_file($_FILES['file']['tmp_name'],$file);
}
echo $file;