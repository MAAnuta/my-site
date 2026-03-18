<?php
declare(strict_types=1);

use Dompdf\Dompdf;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../vendor/autoload.php';

function fail(string $msg, int $code = 400): void {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
  exit;
}

function ok(array $payload): void {
  echo json_encode(['ok' => true] + $payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function cleanStr(mixed $v): string {
  if (!is_string($v)) return '';
  $v = trim($v);
  $v = preg_replace('/\s+/u', ' ', $v) ?? '';
  return $v;
}

function readPricesCsv(string $path): array {
  if (!is_file($path)) fail('Файл с ценами не найден');
  $rows = file($path, FILE_IGNORE_NEW_LINES);
  if (!$rows) fail('Файл с ценами пустой');

  $prices = [];
  foreach ($rows as $i => $line) {
    $line = trim((string)$line);
    if ($line === '') continue;
    if ($i === 0 && mb_stripos($line, 'Название') !== false) continue;
    $parts = array_map('trim', explode(';', $line));
    if (count($parts) < 2) continue;
    $name = $parts[0];
    $raw = $parts[1];
    $raw = str_replace(['руб.', 'руб', '₽', ' '], '', $raw);
    $raw = str_replace(',', '.', $raw);
    $num = (float)preg_replace('/[^0-9.]/', '', $raw);
    if ($name !== '' && $num > 0) $prices[$name] = $num;
  }
  return $prices;
}

function invoiceNumber(): int {
  return random_int(1000, 9999);
}

function ensureDir(string $dir): void {
  if (!is_dir($dir) && !mkdir($dir, 0777, true) && !is_dir($dir)) {
    fail('Не удалось создать папку для генерации документов', 500);
  }
}

function writeInvoiceXlsx(array $ctx, string $outPath, string $barcodePath, string $colorPngPath, string $warrantyText): void {
  $ss = new Spreadsheet();
  $sheet = $ss->getActiveSheet();
  $sheet->setTitle('Накладная');

  foreach (range('A', 'F') as $col) $sheet->getColumnDimension($col)->setAutoSize(true);
  $sheet->getRowDimension(1)->setRowHeight(60);

  $draw = new Drawing();
  $draw->setPath($barcodePath);
  $draw->setCoordinates('F1');
  $draw->setOffsetX(10);
  $draw->setOffsetY(2);
  $draw->setHeight(80);
  $draw->setWorksheet($sheet);

  $sheet->mergeCells('A1:E1');
  $sheet->setCellValue('A1', 'Накладная № ' . $ctx['invoiceNumber']);
  $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
  $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);

  $sheet->mergeCells('A2:F2');
  $sheet->setCellValue('A2', $ctx['city'] . ', ' . $ctx['address']);
  $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

  $sheet->mergeCells('A3:F3');
  $sheet->setCellValue('A3', 'Дата получения заказа: ' . $ctx['deliveryDate']);
  $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

  $startRow = 5;
  $headers = ['№', 'Наименование товара', 'Цвет', 'Цена', 'Количество', 'Сумма'];
  foreach ($headers as $idx => $h) {
    $cell = Coordinate::stringFromColumnIndex($idx + 1) . $startRow;
    $sheet->setCellValue($cell, $h);
  }
  $sheet->getStyle("A{$startRow}:F{$startRow}")->getFont()->setBold(true);
  $sheet->getStyle("A{$startRow}:F{$startRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('22111111');
  $sheet->getStyle("A{$startRow}:F{$startRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

  $row = $startRow + 1;
  $i = 1;
  foreach ($ctx['items'] as $item) {
    $qty = $ctx['qty'][$item];
    $base = $ctx['prices'][$item];
    $priceWith = $base * $ctx['multiplier'];
    $sheet->setCellValue("A{$row}", $i);
    $sheet->setCellValue("B{$row}", $item);
    $sheet->setCellValue("C{$row}", $ctx['colorName']);
    $sheet->setCellValue("D{$row}", round($priceWith, 2));
    $sheet->setCellValue("E{$row}", $qty);
    $sheet->setCellValue("F{$row}", round($priceWith * $qty, 2));
    $i++;
    $row++;
  }

  $colorInfoRow = $row;
  $sheet->setCellValue("B{$colorInfoRow}", 'Цвет: ' . $ctx['colorName']);
  $sheet->setCellValue("A{$colorInfoRow}", '');

  $draw2 = new Drawing();
  $draw2->setPath($colorPngPath);
  $draw2->setCoordinates("C{$colorInfoRow}");
  $draw2->setOffsetX(5);
  $draw2->setOffsetY(4);
  $draw2->setHeight(34);
  $draw2->setWorksheet($sheet);

  $sheet->mergeCells("D{$colorInfoRow}:E{$colorInfoRow}");
  $sheet->setCellValue("D{$colorInfoRow}", 'Наценка: x' . rtrim(rtrim((string)$ctx['multiplier'], '0'), '.'));
  $sheet->setCellValue("F{$colorInfoRow}", round($ctx['sumNoMarkup'], 2));

  $totalRow = $colorInfoRow + 1;
  $sheet->mergeCells("A{$totalRow}:E{$totalRow}");
  $sheet->setCellValue("A{$totalRow}", 'Итого:');
  $sheet->getStyle("A{$totalRow}")->getFont()->setBold(true);
  $sheet->getStyle("A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
  $sheet->setCellValue("F{$totalRow}", round($ctx['sumWithMarkup'], 2));
  $sheet->getStyle("F{$totalRow}")->getFont()->setBold(true);

  $afterTableRow = $totalRow + 3;
  $sheet->mergeCells("A{$afterTableRow}:F{$afterTableRow}");
  $sheet->setCellValue("A{$afterTableRow}", 'Всего наименований ' . $ctx['itemsCount'] . ', на сумму ' . number_format($ctx['sumWithMarkup'], 2, '.', ' '));

  $warrantyRow = $afterTableRow + 2;
  $warrantyText = trim($warrantyText);
  if ($warrantyText !== '') {
    $lines = preg_split("/\r\n|\n|\r/u", $warrantyText) ?: [];
    $sheet->mergeCells("A{$warrantyRow}:F{$warrantyRow}");
    $sheet->setCellValue("A{$warrantyRow}", (string)array_shift($lines));
    $sheet->getStyle("A{$warrantyRow}")->getFont()->setBold(true);
    $sheet->getStyle("A{$warrantyRow}")->getAlignment()->setWrapText(true);
    $r = $warrantyRow + 1;
    foreach ($lines as $ln) {
      $sheet->mergeCells("A{$r}:F{$r}");
      $sheet->setCellValue("A{$r}", $ln);
      $sheet->getStyle("A{$r}")->getAlignment()->setWrapText(true);
      $r++;
    }
  }

  $endRow = $totalRow;
  $borders = $sheet->getStyle("A{$startRow}:F{$endRow}")->getBorders()->getAllBorders();
  $borders->setBorderStyle(Border::BORDER_THIN);
  $borders->getColor()->setARGB('44FFFFFF');
  $sheet->getStyle("A{$startRow}:F{$endRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
  $sheet->getStyle("A{$startRow}:F{$endRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
  $sheet->getStyle("B" . ($startRow + 1) . ":B{$endRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

  (new Xlsx($ss))->save($outPath);
}

function loadRecords(string $path): array {
  if (!is_file($path)) return [];
  $raw = file_get_contents($path);
  if (!is_string($raw) || trim($raw) === '') return [];
  $arr = json_decode($raw, true);
  return is_array($arr) ? $arr : [];
}

function saveRecords(string $path, array $records): void {
  file_put_contents($path, json_encode($records, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function writeRecordsOdt(array $records, string $outPath): void {
  $phpWord = new PhpWord();
  $phpWord->setDefaultFontName('DejaVu Sans');
  $phpWord->setDefaultFontSize(11);

  $section = $phpWord->addSection();
  $section->addText('Запись о документах', ['bold' => true, 'size' => 16], ['alignment' => 'center']);
  $section->addTextBreak(1);

  $tableStyle = [
    'borderColor' => '000000',
    'borderSize' => 8,
    'cellMargin' => 80,
  ];
  $phpWord->addTableStyle('RecordsTable', $tableStyle);
  $table = $section->addTable('RecordsTable');

  $table->addRow();
  foreach (['№', 'Номер накладной', 'Город', 'Адрес', 'Итоговая сумма'] as $h) {
    $table->addCell(2400)->addText($h, ['bold' => true]);
  }

  $n = 1;
  foreach ($records as $rec) {
    $table->addRow();
    $table->addCell(800)->addText((string)$n);
    $table->addCell(1600)->addText((string)($rec['invoiceNumber'] ?? ''));
    $table->addCell(1400)->addText((string)($rec['city'] ?? ''));
    $table->addCell(3600)->addText((string)($rec['address'] ?? ''));
    $table->addCell(1600)->addText(number_format((float)($rec['sumWithMarkup'] ?? 0), 2, '.', ' ') . ' руб.');
    $n++;
  }

  $writer = WordIOFactory::createWriter($phpWord, 'ODText');
  $writer->save($outPath);
}

function writeRecordsPdfViaDompdf(array $records, string $outPath): void {
  $rows = '';
  $n = 1;
  foreach ($records as $rec) {
    $inv = htmlspecialchars((string)($rec['invoiceNumber'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $city = htmlspecialchars((string)($rec['city'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $addr = htmlspecialchars((string)($rec['address'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $sum = number_format((float)($rec['sumWithMarkup'] ?? 0), 2, '.', ' ');
    $rows .= "<tr><td>{$n}</td><td>{$inv}</td><td>{$city}</td><td>{$addr}</td><td style=\"text-align:right\">{$sum} руб.</td></tr>";
    $n++;
  }

  $html = '<!doctype html><html lang="ru"><head><meta charset="utf-8">'
    . '<style>'
    . 'body{font-family:DejaVu Sans, sans-serif;font-size:12px;}'
    . 'h1{font-size:16px;text-align:center;margin:0 0 10px;}'
    . 'table{border-collapse:collapse;width:100%;}'
    . 'th,td{border:1px solid #000;padding:6px;vertical-align:top;}'
    . 'th{background:#f2f2f2;}'
    . '</style></head><body>'
    . '<h1>Запись о документах</h1>'
    . '<table><thead><tr>'
    . '<th>№</th><th>Номер накладной</th><th>Город</th><th>Адрес</th><th>Итоговая сумма</th>'
    . '</tr></thead><tbody>' . $rows . '</tbody></table>'
    . '</body></html>';

  $dompdf = new Dompdf(['isRemoteEnabled' => false, 'defaultFont' => 'DejaVu Sans']);
  $dompdf->loadHtml($html, 'UTF-8');
  $dompdf->setPaper('A4', 'portrait');
  $dompdf->render();
  file_put_contents($outPath, $dompdf->output());
}

function tryConvertOdtToPdf(string $odtPath, string $outDir): ?string {
  $possible = [
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ];
  $soffice = null;
  foreach ($possible as $p) {
    if (is_file($p)) { $soffice = $p; break; }
  }
  if (!$soffice) return null;

  $cmd = '"' . $soffice . '" --headless --nologo --nodefault --nolockcheck --norestore '
    . '--convert-to pdf --outdir "' . $outDir . '" "' . $odtPath . '"';
  @shell_exec($cmd);

  $pdf = $outDir . DIRECTORY_SEPARATOR . pathinfo($odtPath, PATHINFO_FILENAME) . '.pdf';
  return is_file($pdf) ? $pdf : null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Method not allowed', 405);

$allowedColors = [
  'Орех' => 1.1,
  'Дуб мореный' => 1.2,
  'Палисандр' => 1.3,
  'Эбеновое дерево' => 1.4,
  'Клен' => 1.5,
  'Лиственница' => 1.6,
];
$allowedItems = ['Банкетка', 'Кровать', 'Комод', 'Шкаф', 'Стул', 'Стол'];

$lastName = cleanStr($_POST['lastName'] ?? '');
$city = cleanStr($_POST['city'] ?? '');
$deliveryDate = cleanStr($_POST['deliveryDate'] ?? '');
$address = cleanStr($_POST['address'] ?? '');
$colorName = cleanStr($_POST['color'] ?? '');

if ($lastName === '' || $city === '' || $deliveryDate === '' || $address === '') fail('Заполните все поля формы');
if (!isset($allowedColors[$colorName])) fail('Некорректный цвет');

$items = $_POST['items'] ?? [];
if (!is_array($items) || count($items) === 0) fail('Выберите хотя бы один предмет мебели');
$items = array_values(array_filter(array_map('strval', $items), fn($x) => in_array($x, $allowedItems, true)));
if (count($items) === 0) fail('Некорректный список товаров');

$qtyMap = $_POST['qty'] ?? [];
if (!is_array($qtyMap)) $qtyMap = [];

$qty = [];
foreach ($items as $it) {
  $q = $qtyMap[$it] ?? null;
  $q = is_string($q) || is_numeric($q) ? (int)$q : 0;
  if ($q <= 0) fail('Укажите количество для: ' . $it);
  $qty[$it] = $q;
}

$csvPath = __DIR__ . DIRECTORY_SEPARATOR . 'price.csv';
if (isset($_FILES['priceFile']) && is_array($_FILES['priceFile']) && ($_FILES['priceFile']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
  $tmp = (string)($_FILES['priceFile']['tmp_name'] ?? '');
  if ($tmp !== '' && is_uploaded_file($tmp)) $csvPath = $tmp;
}
$prices = readPricesCsv($csvPath);
foreach ($items as $it) if (!isset($prices[$it])) fail('В файле цен нет позиции: ' . $it);

$multiplier = (float)$allowedColors[$colorName];
$sumNoMarkup = 0.0;
$sumWithMarkup = 0.0;
foreach ($items as $it) {
  $base = (float)$prices[$it];
  $q = (int)$qty[$it];
  $sumNoMarkup += $base * $q;
  $sumWithMarkup += ($base * $multiplier) * $q;
}

$inv = invoiceNumber();
$genDir = __DIR__ . DIRECTORY_SEPARATOR . 'generated';
ensureDir($genDir);

$picturesDir = __DIR__ . DIRECTORY_SEPARATOR . 'pictures';

// Штрихкод: штрих.png / штрих.JPG из папки pictures
$barcodePath = null;
foreach (['штрих.png', 'штрих.PNG', 'штрих.jpg', 'штрих.JPG', 'штрих.jpeg', 'штрих.JPEG'] as $f) {
  $candidate = $picturesDir . DIRECTORY_SEPARATOR . $f;
  if (is_file($candidate)) {
    $barcodePath = $candidate;
    break;
  }
}
if ($barcodePath === null) {
  fail('Не найден файл штрихкода (штрих.png или штрих.jpg) в папке pictures');
}

// Цвет: отдельный PNG для каждого варианта
$colorFiles = [
  'Орех' => 'орех.png',
  'Дуб мореный' => 'дуб.png',
  'Палисандр' => 'палисандр.png',
  'Эбеновое дерево' => 'эбен.png',
  'Клен' => 'клен.png',
  'Лиственница' => 'лиственница.png',
];

if (!isset($colorFiles[$colorName])) {
  fail('Для выбранного цвета не найдено соответствующее изображение в папке pictures');
}

$colorPngPath = $picturesDir . DIRECTORY_SEPARATOR . $colorFiles[$colorName];
if (!is_file($colorPngPath)) {
  fail('Файл цвета ' . $colorFiles[$colorName] . ' не найден в папке pictures');
}

$warrantyText = is_file(__DIR__ . DIRECTORY_SEPARATOR . 'warranty.txt') ? (string)file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'warranty.txt') : '';

$xlsxName = "Документ_на_выдачу_№{$inv}.xlsx";
$xlsxPath = $genDir . DIRECTORY_SEPARATOR . $xlsxName;

$ctx = [
  'invoiceNumber' => $inv,
  'lastName' => $lastName,
  'city' => $city,
  'deliveryDate' => $deliveryDate,
  'address' => $address,
  'colorName' => $colorName,
  'multiplier' => $multiplier,
  'items' => $items,
  'qty' => $qty,
  'prices' => $prices,
  'itemsCount' => count($items),
  'sumNoMarkup' => $sumNoMarkup,
  'sumWithMarkup' => $sumWithMarkup,
];

writeInvoiceXlsx($ctx, $xlsxPath, $barcodePath, $colorPngPath, $warrantyText);

$recordsPath = __DIR__ . DIRECTORY_SEPARATOR . 'records.json';
$records = loadRecords($recordsPath);
$records[] = [
  'invoiceNumber' => $inv,
  'city' => $city,
  'address' => $address,
  'sumWithMarkup' => round($sumWithMarkup, 2),
  'createdAt' => date('c'),
];
saveRecords($recordsPath, $records);

$recordsOdtName = 'Запись_о_документах.odt';
$recordsOdtPath = $genDir . DIRECTORY_SEPARATOR . $recordsOdtName;
writeRecordsOdt($records, $recordsOdtPath);

$recordsPdfName = 'Запись_о_документах.pdf';
$recordsPdfPath = $genDir . DIRECTORY_SEPARATOR . $recordsPdfName;

$converted = tryConvertOdtToPdf($recordsOdtPath, $genDir);
if ($converted && is_file($converted)) {
  if (basename($converted) !== $recordsPdfName) @copy($converted, $recordsPdfPath);
} else {
  writeRecordsPdfViaDompdf($records, $recordsPdfPath);
}

ok([
  'invoiceNumber' => $inv,
  'colorName' => $colorName,
  'itemsCount' => count($items),
  'sumNoMarkup' => round($sumNoMarkup, 2),
  'sumWithMarkup' => round($sumWithMarkup, 2),
  'invoiceDownloadUrl' => 'download.php?f=' . rawurlencode($xlsxName),
  'recordsOdtUrl' => 'download.php?f=' . rawurlencode($recordsOdtName),
  'recordsPdfUrl' => 'download.php?f=' . rawurlencode($recordsPdfName),
]);

