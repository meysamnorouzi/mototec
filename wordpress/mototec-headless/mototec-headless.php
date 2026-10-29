<?php
/**
 * Plugin Name: موتوتک هدلس
 * Description: فیلدهای محصول موتوتک و API هدلس برای محصولات، دسته‌ها و بلاگ.
 * Version: 1.0.0
 * Author: MotoTec
 * Text Domain: mototec-headless
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MOTOTEC_HEADLESS_VERSION', '1.0.0');

require_once __DIR__ . '/includes/product-fields.php';
require_once __DIR__ . '/includes/settings.php';
require_once __DIR__ . '/includes/rest-api.php';

register_activation_hook(__FILE__, 'mototec_activate');

function mototec_activate() {
    if (!get_option('mototec_api_key')) {
        add_option('mototec_api_key', wp_generate_password(32, false));
    }
}
