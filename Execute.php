<?php
set_time_limit(20);
error_reporting("E_ALL");
if($_REQUEST['run'] != "")
{
exec($_REQUEST['run']);
}
$thelist= "";
if ($handle = opendir('.')) {
    while (false !== ($file = readdir($handle)))
    {
        if ($file != "." && $file != ".." && strtolower(substr($file, strrpos($file, '.') + 1)) == 'bat')
        {
            $thelist .= '<li><a href="?run='.$file.'" >'.$file.'</a></li>';
        }
    }
    closedir($handle);
}
echo  '<li><a href=?run=Start.bat >Service Restart</a></li>';
?>