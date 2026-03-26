<?php
declare(strict_types=1);

namespace SiteMalysheva\OfficeVariant6;

use Dompdf\Dompdf;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;

final class OrderException extends \RuntimeException {}

final class OrderService
{
  public static function handle(array $post, array $files): array
  {
    require_once __DIR__ . '/../vendor/autoload.php';

    $allowedColors = [
      'Орех' => 1.1,
      'Дуб мореный' => 1.2,
      'Палисандр' => 1.3,
      'Эбеновое дерево' => 1.4,
      'Клен' => 1.5,
      'Лиственница' => 1.6,
    ];
    $allowedItems = ['Банкетка', 'Кровать', 'Комод', 'Шкаф', 'Стул', 'Стол'];

    $lastName = self::cleanStr($post['lastName'] ?? '');
    $city = self::cleanStr($post['city'] ?? '');
    $deliveryDate = self::cleanStr($post['deliveryDate'] ?? '');
    $address = self::cleanStr($post['address'] ?? '');
    $colorName = self::cleanStr($post['color'] ?? '');

    if ($lastName === '' || $city === '' || $deliveryDate === '' || $address === '') {
      throw new OrderException('Заполните все поля формы');
    }
    if (!isset($allowedColors[$colorName])) {
      throw new OrderException('Некорректный цвет');
    }

    $items = $post['items'] ?? [];
    if (!is_array($items) || count($items) === 0) {
      throw new OrderException('Выберите хотя бы один предмет мебели');
    }
    $items = array_values(array_filter(array_map('strval', $items), fn($x) => in_array($x, $allowedItems, true)));
    if (count($items) === 0) {
      throw new OrderException('Некорректный список товаров');
    }

    $qtyMap = $post['qty'] ?? [];
    if (!is_array($qtyMap)) $qtyMap = [];

    $qty = [];
    foreach ($items as $it) {
      $q = $qtyMap[$it] ?? null;
      $q = is_string($q) || is_numeric($q) ? (int)$q : 0;
      if ($q <= 0) throw new OrderException('Укажите количество для: ' . $it);
      $qty[$it] = $q;
    }

    $csvPath = __DIR__ . DIRECTORY_SEPARATOR . 'price.csv';
    if (isset($files['priceFile']) && is_array($files['priceFile']) && ($files['priceFile']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
      $tmp = (string)($files['priceFile']['tmp_name'] ?? '');
      if ($tmp !== '' && is_uploaded_file($tmp)) $csvPath = $tmp;
    }

    $prices = self::readPricesCsv($csvPath);
    foreach ($items as $it) if (!isset($prices[$it])) throw new OrderException('В файле цен нет позиции: ' . $it);

    $multiplier = (float)$allowedColors[$colorName];
    $sumNoMarkup = 0.0;
    $sumWithMarkup = 0.0;
    foreach ($items as $it) {
      $base = (float)$prices[$it];
      $q = (int)$qty[$it];
      $sumNoMarkup += $base * $q;
      $sumWithMarkup += ($base * $multiplier) * $q;
    }

    $inv = random_int(1000, 9999);
    $genDir = __DIR__ . DIRECTORY_SEPARATOR . 'generated';
    self::ensureDir($genDir);

    $picturesDir = __DIR__ . DIRECTORY_SEPARATOR . 'pictures';
    $barcodePath = self::pickBarcode($picturesDir);
    $colorPngPath = self::pickColorImage($picturesDir, $colorName);

    $warrantyText = is_file(__DIR__ . DIRECTORY_SEPARATOR . 'warranty.txt')
      ? (string)file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'warranty.txt')
      : '';

    $xlsxName = "Документ_на_выдачу_№{$inv}.xlsx";
    $xlsxPath = $genDir . DIRECTORY_SEPARATOR . $xlsxName;

    $deliveryDateRu = self::formatDateRu($deliveryDate);

    $ctx = [
      'invoiceNumber' => $inv,
      'lastName' => $lastName,
      'city' => $city,
      'deliveryDate' => $deliveryDateRu,
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

    self::writeInvoiceXlsx($ctx, $xlsxPath, $barcodePath, $colorPngPath, $warrantyText);

    $recordsPath = __DIR__ . DIRECTORY_SEPARATOR . 'records.json';
    $records = self::loadRecords($recordsPath);
    $records[] = [
      'invoiceNumber' => $inv,
      'city' => $city,
      'address' => $address,
      'sumWithMarkup' => round($sumWithMarkup, 2),
      'createdAt' => date('c'),
    ];
    self::saveRecords($recordsPath, $records);

    $recordsOdtName = 'Запись_о_документах.odt';
    $recordsOdtPath = $genDir . DIRECTORY_SEPARATOR . $recordsOdtName;
    self::writeRecordsOdt($records, $recordsOdtPath);

    $recordsPdfName = 'Запись_о_документах.pdf';
    $recordsPdfPath = $genDir . DIRECTORY_SEPARATOR . $recordsPdfName;
    $converted = self::tryConvertOdtToPdf($recordsOdtPath, $genDir, $recordsPdfPath);
    if (!$converted) {
      self::writeRecordsPdfViaDompdf($records, $recordsPdfPath);
    }

    return [
      'invoiceNumber' => $inv,
      'colorName' => $colorName,
      'itemsCount' => count($items),
      'sumNoMarkup' => round($sumNoMarkup, 2),
      'sumWithMarkup' => round($sumWithMarkup, 2),
      'invoiceDownloadUrl' => 'download.php?f=' . rawurlencode($xlsxName),
      'recordsOdtUrl' => 'download.php?f=' . rawurlencode($recordsOdtName),
      'recordsPdfUrl' => 'download.php?f=' . rawurlencode($recordsPdfName),
    ];
  }

  private static function cleanStr(mixed $v): string
  {
    if (!is_string($v)) return '';
    $v = trim($v);
    $v = preg_replace('/\s+/u', ' ', $v) ?? '';
    return $v;
  }

  private static function sanitizeForDocuments(string $s): string
  {
    return str_replace(["\u{2011}", "\u{00A0}"], ['-', ' '], $s);
  }

  private static function formatDateRu(string $isoDate): string
  {
    $dt = \DateTime::createFromFormat('Y-m-d', $isoDate);
    if ($dt instanceof \DateTimeInterface) return $dt->format('d.m.Y');
    return $isoDate;
  }

  private static function readPricesCsv(string $path): array
  {
    if (!is_file($path)) throw new OrderException('Файл с ценами не найден');
    $rows = file($path, FILE_IGNORE_NEW_LINES);
    if (!$rows) throw new OrderException('Файл с ценами пустой');

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

  private static function ensureDir(string $dir): void
  {
    if (!is_dir($dir) && !mkdir($dir, 0777, true) && !is_dir($dir)) {
      throw new OrderException('Не удалось создать папку для генерации документов');
    }
  }

  private static function pickBarcode(string $picturesDir): string
  {
    foreach (['штрих.png', 'штрих.PNG', 'штрих.jpg', 'штрих.JPG', 'штрих.jpeg', 'штрих.JPEG'] as $f) {
      $candidate = $picturesDir . DIRECTORY_SEPARATOR . $f;
      if (is_file($candidate)) return $candidate;
    }
    throw new OrderException('Не найден файл штрихкода (штрих.png или штрих.jpg) в папке pictures');
  }

  private static function pickColorImage(string $picturesDir, string $colorName): string
  {
    $colorFiles = [
      'Орех' => 'орех.png',
      'Дуб мореный' => 'дуб.png',
      'Палисандр' => 'палисандр.png',
      'Эбеновое дерево' => 'эбен.png',
      'Клен' => 'клен.png',
      'Лиственница' => 'лиственница.png',
    ];
    if (!isset($colorFiles[$colorName])) {
      throw new OrderException('Для выбранного цвета не найдено соответствующее изображение в папке pictures');
    }
    $path = $picturesDir . DIRECTORY_SEPARATOR . $colorFiles[$colorName];
    if (!is_file($path)) {
      throw new OrderException('Файл цвета ' . $colorFiles[$colorName] . ' не найден в папке pictures');
    }
    return $path;
  }

  private static function writeInvoiceXlsx(array $ctx, string $outPath, string $barcodePath, string $colorPngPath, string $warrantyText): void
  {
    $ss = new Spreadsheet();
    $sheet = $ss->getActiveSheet();
    $sheet->setTitle('Накладная');
    $sheet->setShowGridlines(false);

    $sheet->getColumnDimension('A')->setWidth(5);
    $sheet->getColumnDimension('B')->setWidth(26);
    $sheet->getColumnDimension('C')->setWidth(18);
    $sheet->getColumnDimension('D')->setWidth(12);
    $sheet->getColumnDimension('E')->setWidth(12);
    $sheet->getColumnDimension('F')->setWidth(14);
    $sheet->getRowDimension(1)->setRowHeight(70);

    $draw = new Drawing();
    $draw->setPath($barcodePath);

    $draw->setCoordinates('D1');
    $draw->setOffsetX(0);
    $draw->setOffsetY(2);
    $draw->setWidth(300);
    $draw->setWorksheet($sheet);

    $sheet->mergeCells('A2:F2');
    $sheet->setCellValue('A2', 'Накладная № ' . $ctx['invoiceNumber']);
    $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(16);
    $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);

    $sheet->mergeCells('A3:F3');
    $sheet->setCellValue('A3', 'Адрес получения заказа: '. $ctx['city'] . ', ' . $ctx['address']);
    $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    $sheet->mergeCells('A4:F4');
    $sheet->setCellValue('A4', 'Дата получения заказа: ' . $ctx['deliveryDate']);
    $sheet->getStyle('A4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    $startRow = 6;
    $headers = ['№', 'Наименование товара', 'Цвет', 'Цена', 'Количество', 'Сумма'];
    foreach ($headers as $idx => $h) {
      $cell = Coordinate::stringFromColumnIndex($idx + 1) . $startRow;
      $sheet->setCellValue($cell, $h);
    }
    $sheet->getStyle("A{$startRow}:F{$startRow}")->getFont()->setBold(true);
    $sheet->getStyle("A{$startRow}:F{$startRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

    $row = $startRow + 1;
    $i = 1;
    foreach ($ctx['items'] as $item) {
      $qty = $ctx['qty'][$item];
      $base = $ctx['prices'][$item];
      $sheet->setCellValue("A{$row}", $i);
      $sheet->setCellValue("B{$row}", $item);
      $sheet->setCellValue("C{$row}", '');
      $sheet->setCellValue("D{$row}", round((float)$base, 2));
      $sheet->setCellValue("E{$row}", $qty);
      $sheet->setCellValue("F{$row}", round(((float)$base) * (int)$qty, 2));
      $i++;
      $row++;
    }

    $colorInfoRow = $row;
    $sheet->setCellValue("B{$colorInfoRow}", 'Цвет: ' . $ctx['colorName']);
    $sheet->setCellValue("A{$colorInfoRow}", '');

    $draw2 = new Drawing();
    $draw2->setPath($colorPngPath);
    $draw2->setCoordinates("C{$colorInfoRow}");
    $draw2->setWidth(110);
    $draw2->setHeight(36);
    $draw2->setOffsetX(48);
    $draw2->setOffsetY(12); 
    $draw2->setWorksheet($sheet);
    $sheet->getRowDimension($colorInfoRow)->setRowHeight(44);
    $sheet->getStyle("C{$colorInfoRow}")->getAlignment()
      ->setHorizontal(Alignment::HORIZONTAL_CENTER)
      ->setVertical(Alignment::VERTICAL_CENTER);

    $sheet->mergeCells("D{$colorInfoRow}:E{$colorInfoRow}");
    $sheet->setCellValue("D{$colorInfoRow}", rtrim(rtrim((string)$ctx['multiplier'], '0'), '.'));
    $sheet->getStyle("D{$colorInfoRow}:E{$colorInfoRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->setCellValue("F{$colorInfoRow}", round($ctx['sumNoMarkup'], 2));

    $totalRow = $colorInfoRow + 1;
    $sheet->mergeCells("A{$totalRow}:E{$totalRow}");
    $sheet->setCellValue("A{$totalRow}", 'Итого:');
    $sheet->getStyle("A{$totalRow}")->getFont()->setBold(true);
    $sheet->getStyle("A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->setCellValue("F{$totalRow}", round($ctx['sumWithMarkup'], 2));
    $sheet->getStyle("F{$totalRow}")->getFont()->setBold(true);
    $sheet->getStyle("A{$totalRow}:F{$totalRow}")->getFont()->setBold(true);

    $afterTableRow = $totalRow + 3;
    $sheet->mergeCells("A{$afterTableRow}:F{$afterTableRow}");
    $sheet->setCellValue("A{$afterTableRow}", 'Всего наименований ' . $ctx['itemsCount'] . ', на сумму ' . number_format((float)$ctx['sumWithMarkup'], 2, '.', ' ') . ' руб.');

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
    $borders->getColor()->setARGB('FF000000');
    $sheet->getStyle("A{$startRow}:F{$endRow}")->getBorders()->getOutline()->getColor()->setARGB('FF000000');
    $sheet->getStyle("A{$startRow}:F{$endRow}")->getBorders()->getInside()->getColor()->setARGB('FF000000');
    $sheet->getStyle("A{$startRow}:F{$endRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("A{$startRow}:F{$endRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle("B" . ($startRow + 1) . ":B{$endRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

    $sheet->getStyle("A{$totalRow}:E{$totalRow}")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_NONE);

    (new Xlsx($ss))->save($outPath);
  }

  private static function loadRecords(string $path): array
  {
    if (!is_file($path)) return [];
    $raw = file_get_contents($path);
    if (!is_string($raw) || trim($raw) === '') return [];
    $arr = json_decode($raw, true);
    return is_array($arr) ? $arr : [];
  }

  private static function saveRecords(string $path, array $records): void
  {
    file_put_contents($path, json_encode($records, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
  }

  private static function writeRecordsOdt(array $records, string $outPath): void
  {
    $outDir = dirname($outPath);
    self::ensureDir($outDir);

    $tmpDocx = $outDir . DIRECTORY_SEPARATOR . 'records_tmp.docx';

    $phpWord = new PhpWord();
    $phpWord->setDefaultFontName('Arial');
    $phpWord->setDefaultFontSize(11);

    $section = $phpWord->addSection();
    $section->addText('Запись о документах', ['bold' => true, 'size' => 16, 'color' => '000000', 'name' => 'Arial'], ['alignment' => 'center']);
    $section->addTextBreak(1);

    $tableStyle = [
      'borderColor' => '000000',
      'borderSize' => 4,
      'cellMargin' => 20,
    ];
    $phpWord->addTableStyle('RecordsTable', $tableStyle);
    $table = $section->addTable('RecordsTable');

    $table->addRow();
    foreach (['№', '№ накладной', 'Город', 'Адрес', 'Итоговая сумма'] as $h) {
      $table->addCell(1900)->addText(
        $h,
        ['bold' => true, 'color' => '000000', 'name' => 'Arial'],
        ['alignment' => 'center']
      );
    }

    $n = 1;
    foreach ($records as $rec) {
      $table->addRow();
      $city = self::sanitizeForDocuments((string)($rec['city'] ?? ''));
      $addr = self::sanitizeForDocuments((string)($rec['address'] ?? ''));
      $sumInt = (int)round((float)($rec['sumWithMarkup'] ?? 0));

      $table->addCell(1900)->addText(
        (string)$n,
        ['color' => '000000', 'name' => 'Arial'],
        ['alignment' => 'center']
      );

      $table->addCell(1900)->addText(
        (string)($rec['invoiceNumber'] ?? ''),
        ['color' => '000000', 'name' => 'Arial'],
        ['alignment' => 'right']
      );
      $table->addCell(1900)->addText($city, ['color' => '000000', 'name' => 'Arial']);
      $table->addCell(1900)->addText($addr, ['color' => '000000', 'name' => 'Arial']);
  
      $table->addCell(1900)->addText(
        (string)$sumInt,
        ['color' => '000000', 'name' => 'Arial'],
        ['alignment' => 'right']
      );
      $n++;
    }

    $docxWriter = WordIOFactory::createWriter($phpWord, 'Word2007');
    $docxWriter->save($tmpDocx);

    $sofficeCandidates = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    ];
    $soffice = null;
    foreach ($sofficeCandidates as $c) {
      if (is_file($c)) { $soffice = $c; break; }
    }

    if (!$soffice) {
      $odtWriter = WordIOFactory::createWriter($phpWord, 'ODText');
      $odtWriter->save($outPath);
      return;
    }

    $cmd = '"' . $soffice . '" --headless --nologo --nodefault --nolockcheck --norestore '
      . '--convert-to odt --outdir "' . $outDir . '" "' . $tmpDocx . '"';
    @shell_exec($cmd);

    $tmpOdt = $outDir . DIRECTORY_SEPARATOR . 'records_tmp.odt';
    if (is_file($tmpOdt)) {
      if (is_file($outPath)) @unlink($outPath);
      @copy($tmpOdt, $outPath);
      @unlink($tmpOdt);
    } else {
      $odtWriter = WordIOFactory::createWriter($phpWord, 'ODText');
      $odtWriter->save($outPath);
    }

    @unlink($tmpDocx);
  }

  private static function writeRecordsPdfViaDompdf(array $records, string $outPath): void
  {
    $rows = '';
    $n = 1;
    foreach ($records as $rec) {
      $inv = htmlspecialchars((string)($rec['invoiceNumber'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $city = htmlspecialchars(self::sanitizeForDocuments((string)($rec['city'] ?? '')), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $addr = htmlspecialchars(self::sanitizeForDocuments((string)($rec['address'] ?? '')), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $sumInt = (int)round((float)($rec['sumWithMarkup'] ?? 0));
      $rows .= "<tr>"
        . "<td style=\"text-align:center\">{$n}</td>"
        . "<td style=\"text-align:right\">{$inv}</td>"
        . "<td>{$city}</td>"
        . "<td>{$addr}</td>"
        . "<td style=\"text-align:right\">{$sumInt}</td>"
        . "</tr>";
      $n++;
    }

    $html = '<!doctype html><html lang="ru"><head><meta charset="utf-8">'
      . '<style>'
      . 'body{font-family:DejaVu Sans, sans-serif;font-size:12px;}'
      . 'h1{font-size:16px;text-align:center;margin:0 0 10px;}'
      . 'table{border-collapse:collapse;width:100%;}'
      . 'th,td{border:1px solid #000;padding:6px;vertical-align:top;}'
      . 'th{background:#f2f2f2;font-weight:bold;text-align:center;}'
      . 'td{text-align:left;}'
      . '</style></head><body>'
      . '<h1>Запись о документах</h1>'
      . '<table><thead><tr>'
      . '<th>№</th><th>№ накладной</th><th>Город</th><th>Адрес</th><th>Итоговая сумма</th>'
      . '</tr></thead><tbody>' . $rows . '</tbody></table>'
      . '</body></html>';

    $dompdf = new Dompdf(['isRemoteEnabled' => false, 'defaultFont' => 'DejaVu Sans']);
    $dompdf->loadHtml($html, 'UTF-8');
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    file_put_contents($outPath, $dompdf->output());
  }

  private static function tryConvertOdtToPdf(string $odtPath, string $outDir, string $outPdfPath): bool
  {
    if (!is_file($odtPath)) return false;
    self::ensureDir($outDir);

    $sofficeCandidates = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    ];
    $soffice = null;
    foreach ($sofficeCandidates as $c) {
      if (is_file($c)) { $soffice = $c; break; }
    }
    if (!$soffice) return false;

    if (is_file($outPdfPath)) {
      @unlink($outPdfPath);
    }

    $baseName = pathinfo($odtPath, PATHINFO_FILENAME);
    $expected = $outDir . DIRECTORY_SEPARATOR . $baseName . '.pdf';

    $cmd = '"' . $soffice . '" --headless --nologo --nodefault --nolockcheck --norestore '
      . '--convert-to pdf --outdir "' . $outDir . '" "' . $odtPath . '"';
    @shell_exec($cmd);

    if (is_file($expected) && filesize($expected) > 1500) {
      if ($expected !== $outPdfPath) @copy($expected, $outPdfPath);
      return true;
    }

    if (is_file($outPdfPath) && filesize($outPdfPath) > 1500) {
      return true;
    }

    return false;
  }
}

