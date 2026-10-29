<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_menu', 'mototec_settings_menu');
add_action('admin_post_mototec_regenerate_key', 'mototec_regenerate_key');

function mototec_settings_menu() {
    add_options_page(
        'موتوتک هدلس',
        'موتوتک هدلس',
        'manage_options',
        'mototec-headless',
        'mototec_settings_page'
    );
}

function mototec_regenerate_key() {
    if (!current_user_can('manage_options')) {
        wp_die('مجوز کافی نیست.');
    }
    check_admin_referer('mototec_regenerate_key');
    update_option('mototec_api_key', wp_generate_password(32, false));
    wp_safe_redirect(admin_url('options-general.php?page=mototec-headless&mototec-updated=1'));
    exit;
}

function mototec_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $key = (string) get_option('mototec_api_key', '');
    $base = rest_url('mototec/v1/');
    $routes = ['products', 'product-categories', 'posts', 'post-categories'];
    ?>
    <div class="wrap">
        <h1>موتوتک هدلس</h1>
        <?php if (isset($_GET['mototec-updated'])) : ?>
            <div class="notice notice-success is-dismissible"><p>کلید تازه ساخته شد. فروشگاه برای خواندن محصولات و نوشته‌ها به این کلید نیاز ندارد.</p></div>
        <?php endif; ?>
        <?php if (isset($_GET['mototec-import']) && $_GET['mototec-import'] === '1') : ?>
            <div class="notice notice-success is-dismissible"><p><?php echo esc_html((string) (int) $_GET['mototec-count']); ?> محصول نمونه در ووکامرس ساخته یا به‌روز شد. فروشگاه همان‌ها را نشان می‌دهد.</p></div>
        <?php elseif (isset($_GET['mototec-import']) && $_GET['mototec-import'] === 'error') : ?>
            <div class="notice notice-error is-dismissible"><p>وارد کردن انجام نشد. اول ووکامرس را فعال کنید.</p></div>
        <?php endif; ?>
        <?php if (!class_exists('WooCommerce')) : ?>
            <div class="notice notice-warning"><p>ووکامرس فعال نیست. بلاگ کار می‌کند، ولی محصولات تا فعال شدن ووکامرس خالی می‌مانند.</p></div>
        <?php endif; ?>
        <p>محصولات از ووکامرس و نوشته‌ها از بخش نوشته‌های وردپرس خوانده می‌شوند. فروشگاه این آدرس‌ها را در مرورگر می‌خواند، پس محصول یا نوشتهٔ تازه بدون بیلد دوباره روی سایت می‌آید. فقط <code>https://mototec.ir</code>، <code>https://www.mototec.ir</code> و لوکال‌هاست اجازهٔ خواندن دارند.</p>
        <table class="form-table" role="presentation">
            <tr>
                <th scope="row"><label for="mototec-api-key">کلید API</label></th>
                <td>
                    <input id="mototec-api-key" class="regular-text code" type="text" readonly value="<?php echo esc_attr($key); ?>" />
                    <p class="description">خواندن فروشگاه و بلاگ به این کلید نیاز ندارد.</p>
                </td>
            </tr>
        </table>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <?php wp_nonce_field('mototec_regenerate_key'); ?>
            <input type="hidden" name="action" value="mototec_regenerate_key" />
            <?php submit_button('ساخت کلید جدید', 'secondary'); ?>
        </form>
        <h2>محصولات نمونه</h2>
        <p>چهار محصول قبلی فروشگاه، با همان نام، قیمت، دسته، عکس، مشخصات و سوال‌ها، وارد ووکامرس می‌شوند. اگر دوباره بزنید، همان محصولات به‌روز می‌شوند و تکراری ساخته نمی‌شود.</p>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
            <?php wp_nonce_field('mototec_import_catalog'); ?>
            <input type="hidden" name="action" value="mototec_import_catalog" />
            <?php submit_button('وارد کردن محصولات نمونه', 'primary'); ?>
        </form>
        <h2>مسیرها</h2>
        <ul>
            <?php foreach ($routes as $route) : ?>
                <li><code><?php echo esc_html($base . $route); ?></code></li>
            <?php endforeach; ?>
        </ul>
        <p>مشخصات محصول را در زبانه «موتوتک» ووکامرس بنویسید. بلاگ همان نوشته‌های منتشرشده وردپرس است؛ تصویر شاخص، دسته و خلاصه روی سایت می‌آیند.</p>
    </div>
    <?php
}
