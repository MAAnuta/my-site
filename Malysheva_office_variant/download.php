<?php
declare(strict_types=1);

$baseDir = __DIR__ . DIRECTORY_SEPARATOR . 'generated' . DIRECTORY_SEPARATOR;

$name = $_GET['f'] ?? '';
if (!is_string($name) || $name === '' || str_contains($name, "\0")) {
  http_response_code(400);
  echo 'Bad request';
  exit;
}

$name = str_replace(['/', '\\'], '', $name);
if ($name === '' || $name === '.' || $name === '..') {
  http_response_code(400);
  echo 'Bad request';
  exit;
}

$path = $baseDir . $name;
if (!is_file($path)) {
  http_response_code(404);
  echo 'Not found';
  exit;
}

$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$mime = match ($ext) {
  'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'odt' => 'application/vnd.oasis.opendocument.text',
  'pdf' => 'application/pdf',
  'png' => 'image/png',
  default => 'application/octet-stream'
};

header('Content-Type: ' . $mime);
header('Content-Length: ' . (string)filesize($path));
header('Content-Disposition: attachment; filename="' . basename($name) . '"');
readfile($path);

