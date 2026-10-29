<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_post_mototec_import_catalog', 'mototec_handle_import_catalog');

function mototec_handle_import_catalog() {
    if (!current_user_can('manage_options')) {
        wp_die('مجوز کافی نیست.');
    }
    check_admin_referer('mototec_import_catalog');

    $result = mototec_import_catalog();
    $url = admin_url('options-general.php?page=mototec-headless');
    if (is_wp_error($result)) {
        $url = add_query_arg('mototec-import', 'error', $url);
    } else {
        $url = add_query_arg(
            [
                'mototec-import' => '1',
                'mototec-count' => (int) $result['products'],
            ],
            $url
        );
    }
    wp_safe_redirect($url);
    exit;
}

function mototec_import_catalog() {
    if (!class_exists('WooCommerce')) {
        return new WP_Error('mototec_woocommerce', 'ووکامرس فعال نیست.');
    }

    $categories = mototec_import_categories();
    $count = 0;
    foreach (mototec_import_product_rows() as $row) {
        mototec_import_product($row, $categories);
        $count++;
    }
    return ['products' => $count];
}

function mototec_import_categories() {
    $map = [];
    foreach (mototec_import_category_rows() as $row) {
        $parent = 0;
        if ($row['parent'] !== '' && isset($map[$row['parent']])) {
            $parent = $map[$row['parent']];
        }

        $existing = get_term_by('slug', $row['slug'], 'product_cat');
        if ($existing && !is_wp_error($existing)) {
            wp_update_term((int) $existing->term_id, 'product_cat', [
                'name' => $row['name'],
                'description' => $row['description'],
                'parent' => $parent,
            ]);
            $map[$row['slug']] = (int) $existing->term_id;
            continue;
        }

        $created = wp_insert_term($row['name'], 'product_cat', [
            'slug' => $row['slug'],
            'description' => $row['description'],
            'parent' => $parent,
        ]);
        if (!is_wp_error($created)) {
            $map[$row['slug']] = (int) $created['term_id'];
        }
    }
    return $map;
}

function mototec_import_product($row, $categories) {
    $found = get_posts([
        'name' => $row['slug'],
        'post_type' => 'product',
        'post_status' => 'any',
        'posts_per_page' => 1,
        'fields' => 'ids',
    ]);
    $product = $found ? wc_get_product((int) $found[0]) : new WC_Product_Simple();
    if (!$product) {
        $product = new WC_Product_Simple();
    }

    $product->set_name($row['name']);
    $product->set_slug($row['slug']);
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
    $product->set_description('<p>' . esc_html($row['description']) . '</p>');
    $product->set_short_description($row['short']);
    $product->set_regular_price((string) $row['price']);
    $product->set_price((string) $row['price']);
    $product->set_manage_stock(false);
    $product->set_stock_status('instock');
    $product->set_featured(true);
    $product->set_reviews_allowed(false);

    $term_ids = [];
    foreach ($row['categories'] as $slug) {
        if (isset($categories[$slug])) {
            $term_ids[] = $categories[$slug];
        }
    }
    $product->set_category_ids($term_ids);

    $image_ids = [];
    foreach ($row['images'] as $image) {
        $id = mototec_import_image($row['slug'], $image['file'], $image['alt']);
        if ($id) {
            $image_ids[] = $id;
        }
    }
    if ($image_ids) {
        $product->set_image_id($image_ids[0]);
        $product->set_gallery_image_ids(array_slice($image_ids, 1));
    }

    $product->update_meta_data('_mototec_brand', $row['brand']);
    $product->update_meta_data('_mototec_model', $row['model']);
    $product->update_meta_data('_mototec_features', implode("\n", $row['features']));
    $product->update_meta_data('_mototec_specs', mototec_import_pairs($row['specs']));
    $product->update_meta_data('_mototec_box_contents', implode("\n", $row['box']));
    $product->update_meta_data('_mototec_warranty', $row['warranty']);
    $product->update_meta_data('_mototec_shipping_status', '');
    $product->update_meta_data('_mototec_note', $row['note']);
    $product->update_meta_data('_mototec_faqs', mototec_import_pairs($row['faqs']));
    $product->save();
}

function mototec_import_pairs($pairs) {
    $lines = [];
    foreach ($pairs as $pair) {
        $lines[] = $pair[0] . ': ' . $pair[1];
    }
    return implode("\n", $lines);
}

function mototec_import_image($slug, $filename, $alt) {
    $source_key = $slug . '/' . $filename;
    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_key' => '_mototec_source_file',
        'meta_value' => $source_key,
    ]);
    if ($existing) {
        update_post_meta((int) $existing[0], '_wp_attachment_image_alt', $alt);
        return (int) $existing[0];
    }

    $source = dirname(__DIR__) . '/import/images/' . $filename;
    if (!is_readable($source)) {
        return 0;
    }

    $contents = file_get_contents($source);
    if ($contents === false) {
        return 0;
    }

    $upload = wp_upload_bits($filename, null, $contents);
    if (!empty($upload['error']) || empty($upload['file'])) {
        return 0;
    }

    $filetype = wp_check_filetype($filename);
    $attachment_id = wp_insert_attachment([
        'post_mime_type' => $filetype['type'] ? $filetype['type'] : 'image/jpeg',
        'post_title' => $alt,
        'post_content' => '',
        'post_status' => 'inherit',
    ], $upload['file']);
    if (!$attachment_id || is_wp_error($attachment_id)) {
        return 0;
    }

    require_once ABSPATH . 'wp-admin/includes/image.php';
    $metadata = wp_generate_attachment_metadata($attachment_id, $upload['file']);
    wp_update_attachment_metadata($attachment_id, $metadata);
    update_post_meta($attachment_id, '_wp_attachment_image_alt', $alt);
    update_post_meta($attachment_id, '_mototec_source_file', $source_key);
    return (int) $attachment_id;
}

function mototec_import_category_rows() {
    return [
        ['slug' => 'dashcam', 'parent' => '', 'name' => 'دوربین ثبت وقایع', 'description' => 'دوربین جلو و عقب برای ثبت مسیر، برخورد و آرامش بیشتر پشت فرمان.'],
        ['slug' => 'helmet-bluetooth', 'parent' => '', 'name' => 'بلوتوث و اینترکام کلاه', 'description' => 'ارتباط گروهی، تماس، موسیقی و دوربین مخصوص کلاه کاسکت.'],
        ['slug' => 'smart-motorcycle', 'parent' => '', 'name' => 'تجهیزات هوشمند موتورسیکلت', 'description' => 'TPMS، پایه دوربین، روشنایی و تجهیزات ارتباطی موتورسوار.'],
        ['slug' => 'phone-power', 'parent' => '', 'name' => 'هولدر و شارژر موبایل', 'description' => 'هولدر موبایل موتور و شارژر USB و Type-C مخصوص موتورسیکلت.'],
        ['slug' => 'security', 'parent' => '', 'name' => 'تجهیزات امنیتی', 'description' => 'قفل دیسک و تجهیزات ضدسرقت برای آرامش بیشتر در توقف و پارک.'],
        ['slug' => 'travel-gear', 'parent' => '', 'name' => 'لوازم سفر و کاربردی', 'description' => 'کمپرسور باد قابل حمل و اکسسوری‌های کاربردی سفر موتور.'],
        ['slug' => 'bluetooth-intercom', 'parent' => 'helmet-bluetooth', 'name' => 'اینترکام کلاه', 'description' => 'ارتباط گروهی، تماس و موسیقی با اینترکام مخصوص کلاه کاسکت.'],
        ['slug' => 'camera-intercom', 'parent' => 'helmet-bluetooth', 'name' => 'اینترکام دوربین‌دار', 'description' => 'ترکیب اینترکام، هندزفری بلوتوث و دوربین ثبت مسیر.'],
        ['slug' => 'tpms', 'parent' => 'smart-motorcycle', 'name' => 'TPMS و فشار باد تایر', 'description' => 'سنسور فشار باد تایر برای پایش وضعیت تایر در مسیر.'],
        ['slug' => 'camera-mounts', 'parent' => 'smart-motorcycle', 'name' => 'پایه دوربین و اکشن‌کم', 'description' => 'پایه و نگهدارنده دوربین و اکشن‌کم برای موتور.'],
        ['slug' => 'lighting', 'parent' => 'smart-motorcycle', 'name' => 'چراغ و تجهیزات روشنایی', 'description' => 'چراغ و تجهیزات روشنایی کمکی موتورسیکلت.'],
        ['slug' => 'rider-comms', 'parent' => 'smart-motorcycle', 'name' => 'تجهیزات ارتباطی موتورسوار', 'description' => 'لوازم ارتباطی مکمل برای موتورسواری گروهی و روزمره.'],
        ['slug' => 'phone-holders', 'parent' => 'phone-power', 'name' => 'هولدر موبایل موتور', 'description' => 'هولدر و پایه موبایل مقاوم برای نصب روی موتور.'],
        ['slug' => 'usb-chargers', 'parent' => 'phone-power', 'name' => 'شارژر USB و Type-C موتور', 'description' => 'شارژر و خروجی برق مناسب موبایل و لوازم جانبی روی موتور.'],
        ['slug' => 'disc-locks', 'parent' => 'security', 'name' => 'قفل دیسک و ضدسرقت', 'description' => 'قفل دیسک و تجهیزات ضدسرقت موتورسیکلت.'],
        ['slug' => 'compressors', 'parent' => 'travel-gear', 'name' => 'کمپرسور باد قابل حمل', 'description' => 'کمپرسور و پمپ باد قابل حمل برای مسیر و سفر.'],
        ['slug' => 'travel-accessories', 'parent' => 'travel-gear', 'name' => 'اکسسوری سفر موتور', 'description' => 'لوازم کاربردی سفر و مسیر برای موتورسوار.'],
    ];
}

function mototec_import_product_rows() {
    return [
        [
            'slug' => 'azdome-m17-pro',
            'name' => 'دوربین ثبت وقایع آزدوم مدل M17 Pro دو لنز با کارت حافظه',
            'brand' => 'AZDOME',
            'model' => 'M17 Pro',
            'price' => 33750000,
            'short' => 'دوربین ثبت وقایع AZDOME M17 Pro با دو دوربین جلو و عقب، برای ثبت مسیر، اتفاقات رانندگی و افزایش امنیت خودرو طراحی شده است. این محصول با امکاناتی مانند اتصال به موبایل، سنسور ضربه، ضبط مداوم و حالت پارکینگ، گزینه‌ای کاربردی برای استفاده روزمره است.',
            'description' => 'دوربین ثبت وقایع AZDOME M17 Pro با دو دوربین جلو و عقب، برای ثبت مسیر، اتفاقات رانندگی و افزایش امنیت خودرو طراحی شده است. اتصال به موبایل، سنسور ضربه، ضبط مداوم و حالت پارکینگ آن را برای استفاده روزمره مناسب می‌کند.',
            'categories' => ['dashcam'],
            'images' => [
                ['file' => 'dashcam-device.jpg', 'alt' => 'دوربین ثبت وقایع روی سطح روشن'],
                ['file' => 'dashcam-road.jpg', 'alt' => 'نمای جاده از پشت شیشه خودرو'],
            ],
            'features' => ['دارای دوربین جلو و عقب', 'زاویه دید گسترده', 'نمایشگر داخلی', 'اتصال Wi-Fi', 'اتصال به اپلیکیشن موبایل', 'سنسور ضربه G-Sensor', 'قابلیت Loop Recording', 'حالت Parking Mode', 'ضبط صدا', 'پشتیبانی از کارت حافظه', 'اتصال Type-C', 'همراه با کارت حافظه'],
            'specs' => [],
            'box' => ['کارت حافظه'],
            'warranty' => '',
            'note' => 'مدل M17 Pro در نسخه‌های مختلف عرضه شده است. ظرفیت دقیق کارت حافظه داخل بسته، GPS، ADAS، نوع Wi-Fi و مشخصات دوربین عقب باید از روی جعبه محصول موجود در انبار بررسی و سپس در مشخصات نهایی ثبت شود.',
            'faqs' => [
                ['آیا این مدل بدون اینترنت هم فیلم می‌گیرد؟', 'بله. ضبط روی کارت حافظه انجام می‌شود و برای فیلم‌برداری روزمره به اینترنت نیاز نیست.'],
                ['دوربین عقب هم دارد؟', 'بله. M17 Pro دو لنز جلو و عقب دارد؛ جزئیات لنز عقب را از روی جعبه همان موجودی چک کنید.'],
            ],
        ],
        [
            'slug' => 'lingdu-d08',
            'name' => 'دوربین ثبت وقایع لینگدو مدل D08',
            'brand' => 'Lingdu',
            'model' => 'D08',
            'price' => 13750000,
            'short' => 'Lingdu D08 یک دوربین ثبت وقایع جمع‌وجور و کاربردی برای ثبت اتفاقات رانندگی است که امکان اتصال به تلفن همراه از طریق Wi-Fi را دارد و تصاویر را با کیفیت مناسب ضبط می‌کند.',
            'description' => 'Lingdu D08 یک دوربین ثبت وقایع جمع‌وجور برای ثبت اتفاقات رانندگی است. این مدل به تلفن همراه وصل می‌شود و برای استفاده روزمره طراحی شده است.',
            'categories' => ['dashcam'],
            'images' => [
                ['file' => 'dashcam-road.jpg', 'alt' => 'ثبت مسیر از روی شیشه جلو'],
            ],
            'features' => ['فیلم‌برداری 1296P', 'اتصال Wi-Fi به موبایل', 'G-Sensor و Loop Recording', 'Parking Mode با Time-Lapse'],
            'specs' => [
                ['کیفیت فیلم‌برداری', '1296P'],
                ['نرخ فیلم‌برداری', '۳۰ فریم بر ثانیه'],
                ['نوع دوربین', 'تک لنز جلو'],
                ['سنسور تصویر', '۲ مگاپیکسل'],
                ['دیافراگم', 'F/2.0'],
                ['اتصال', 'Wi-Fi داخلی و اپلیکیشن موبایل'],
                ['درگاه', 'Type-C'],
                ['کارت حافظه', 'MicroSD تا ۱۲۸ گیگابایت'],
                ['سنسور ضربه', 'G-Sensor'],
                ['ضبط مداوم', 'Loop Recording'],
                ['صدا', 'میکروفون و اسپیکر'],
                ['حالت پارک', 'Parking Mode و Time-Lapse'],
                ['زاویه دید', 'حدود ۱۲۲ درجه، طبق مشخصات سازنده'],
            ],
            'box' => [],
            'warranty' => '',
            'note' => 'زاویه دید طبق مشخصات سازنده حدود ۱۲۲ درجه است. پیش از نهایی شدن اطلاعات روی سایت، مشخصات روی جعبه موجودی بررسی شود.',
            'faqs' => [
                ['Parking Mode بدون کیت برق کار می‌کند؟', 'اگر دوربین فقط از فندکی تغذیه شود، با خاموش شدن خودرو معمولاً خاموش می‌شود. برای حالت پارکینگ، تغذیه جدا را هنگام خرید بپرسید.'],
            ],
        ],
        [
            'slug' => 'maxto-m6s',
            'name' => 'بلوتوث کلاه کاسکت مکستو مدل M6S',
            'brand' => 'Maxto',
            'model' => 'M6S',
            'price' => 28450000,
            'short' => 'Maxto M6S یک اینترکام حرفه‌ای برای موتورسواران است که امکان برقراری ارتباط گروهی، تماس تلفنی، گوش دادن به موسیقی و استفاده از امکانات بلوتوث را هنگام موتورسواری فراهم می‌کند.',
            'description' => 'Maxto M6S برای ارتباط گروهی، تماس، موسیقی و دستیار صوتی هنگام موتورسواری ساخته شده است. چیپ Qualcomm، کاهش نویز و استاندارد IP67 آن را برای استفاده در مسیر مناسب می‌کند.',
            'categories' => ['helmet-bluetooth', 'bluetooth-intercom'],
            'images' => [
                ['file' => 'helmet-intercom.jpg', 'alt' => 'اینترکام نصب‌شده روی کلاه کاسکت'],
            ],
            'features' => ['ارتباط گروهی تا ۸ موتورسوار', 'برد حدود ۱۰۰۰ متر', 'Music Sharing', 'رادیو FM', 'استاندارد IP67'],
            'specs' => [
                ['بلوتوث', 'Bluetooth 5.0'],
                ['چیپ', 'Qualcomm'],
                ['ارتباط گروهی', 'تا ۸ موتورسوار'],
                ['برد ارتباطی', 'حدود ۱۰۰۰ متر'],
                ['اتصال گروه', 'اتصال مجدد خودکار اعضا'],
                ['موسیقی', 'Music Sharing'],
                ['کاهش نویز', 'DSP / CVC'],
                ['رادیو', 'FM'],
                ['دستیار صوتی', 'اتصال به دستیار صوتی موبایل'],
                ['تماس', 'پاسخ خودکار'],
                ['مقاومت', 'ضدآب IP67'],
                ['شارژدهی', 'حدود ۱۵ ساعت استفاده'],
                ['آماده‌به‌کار', 'حدود ۲۰۰ ساعت'],
                ['زمان شارژ', 'حدود ۲.۵ ساعت'],
            ],
            'box' => [],
            'warranty' => '',
            'note' => 'مناسب کلاه Full Face، Flip Up، Modular و Motocross.',
            'faqs' => [
                ['به چه کلاه‌هایی می‌خورد؟', 'معمولاً روی کلاه Full Face، Flip Up، Modular و Motocross نصب می‌شود. مدل کلاه‌تان را بگویید تا دقیق‌تر بگوییم.'],
                ['برد واقعی در جاده چقدر است؟', 'عدد حدود ۱۰۰۰ متر در شرایط باز اعلام شده است. پیچ جاده، ترافیک و مانع بین موتورسوارها برد را کمتر می‌کند.'],
            ],
        ],
        [
            'slug' => 'maxto-m3s',
            'name' => 'بلوتوث و دوربین ثبت وقایع کلاه کاسکت مکستو مدل M3S',
            'brand' => 'Maxto',
            'model' => 'M3S',
            'price' => 57950000,
            'short' => 'Maxto M3S یک محصول چندکاره برای موتورسواران است که بلوتوث، اینترکام و دوربین ثبت مسیر را در یک دستگاه ارائه می‌دهد. این محصول علاوه بر امکان ارتباط با سایر موتورسواران، قابلیت فیلم‌برداری از مسیر را نیز دارد.',
            'description' => 'Maxto M3S عملاً ترکیبی از سه محصول است: دوربین، اینترکام و هندزفری بلوتوث. موتورسوار می‌تواند هم‌زمان با گروه در ارتباط باشد و مسیر را هم ضبط کند.',
            'categories' => ['helmet-bluetooth', 'camera-intercom'],
            'images' => [
                ['file' => 'helmet-camera.jpg', 'alt' => 'دوربین روی کلاه کاسکت'],
                ['file' => 'helmet-ride.jpg', 'alt' => 'موتورسوار با کلاه کاسکت'],
            ],
            'features' => ['دوربین + اینترکام + هندزفری بلوتوث', 'فیلم‌برداری 2K', 'لنز Sony', 'ارتباط گروهی تا ۶ موتورسوار', 'اپلیکیشن RICAM', 'استاندارد IP67'],
            'specs' => [
                ['فیلم‌برداری', '2K / 1440P'],
                ['لنز', 'Sony'],
                ['زاویه دید', 'حدود ۱۲۰ درجه'],
                ['دیافراگم', 'F2.0'],
                ['لرزش‌گیر', 'دارد'],
                ['ضبط مداوم', 'Loop Recording'],
                ['عکاسی', 'دارد'],
                ['اتصال تصویر', 'Wi-Fi و اپلیکیشن RICAM'],
                ['ارتباط گروهی', 'تا ۶ موتورسوار'],
                ['برد ارتباطی', 'تا حدود ۱۰۰۰ متر'],
                ['بلوتوث', 'Bluetooth 5.0'],
                ['کاهش نویز', 'CVC'],
                ['رادیو', 'FM'],
                ['جفت‌سازی', 'Universal Pairing'],
                ['سازگاری', 'قابل اتصال به بعضی اینترکام‌های برندهای دیگر'],
                ['مقاومت', 'ضدآب IP67'],
                ['مکالمه و اینترکام', 'حدود ۳۲ ساعت'],
                ['ضبط ویدئو', 'حدود ۴ ساعت'],
                ['آماده‌به‌کار', 'تا حدود ۵۰۰ ساعت'],
                ['زمان شارژ', 'حدود ۲.۵ ساعت'],
            ],
            'box' => [],
            'warranty' => 'گارانتی اصالت و سلامت فیزیکی کالا',
            'note' => 'فری سایز؛ مناسب انواع کلاه کاسکت رایج.',
            'faqs' => [
                ['فرق M3S با اینترکام معمولی چیست؟', 'علاوه بر ارتباط و بلوتوث، دوربین ثبت مسیر هم دارد و می‌توانید هم‌زمان صحبت کنید و فیلم بگیرید.'],
            ],
        ],
    ];
}
