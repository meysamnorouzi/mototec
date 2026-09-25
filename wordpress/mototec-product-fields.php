<?php
/**
 * Plugin Name: فیلدهای محصول موتوتک
 * Description: برند، مدل، مشخصات، ویژگی‌ها، اقلام جعبه، گارانتی و وضعیت ارسال را به ووکامرس اضافه می‌کند و در REST API با کلید mototec برمی‌گرداند.
 * Version: 1.0.0
 * Author: MotoTec
 * Requires Plugins: woocommerce
 */

if (!defined('ABSPATH')) {
    exit;
}

const MOTOTEC_FIELDS = [
    'brand' => 'برند',
    'model' => 'مدل',
    'features' => 'ویژگی‌ها',
    'specs' => 'مشخصات فنی',
    'box_contents' => 'اقلام داخل جعبه',
    'warranty' => 'گارانتی',
    'shipping_status' => 'وضعیت ارسال',
    'note' => 'نکته',
];

add_filter('woocommerce_product_data_tabs', function ($tabs) {
    $tabs['mototec'] = [
        'label' => 'موتوتک',
        'target' => 'mototec_product_data',
        'class' => ['show_if_simple', 'show_if_variable'],
        'priority' => 80,
    ];
    return $tabs;
});

add_action('woocommerce_product_data_panels', function () {
    echo '<div id="mototec_product_data" class="panel woocommerce_options_panel hidden">';
    echo '<div class="options_group">';

    woocommerce_wp_text_input([
        'id' => '_mototec_brand',
        'label' => 'برند',
    ]);
    woocommerce_wp_text_input([
        'id' => '_mototec_model',
        'label' => 'مدل',
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_features',
        'label' => 'ویژگی‌ها',
        'description' => 'هر ویژگی در یک خط.',
        'desc_tip' => true,
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_specs',
        'label' => 'مشخصات فنی',
        'description' => 'هر مشخصه در یک خط، به شکل برچسب: مقدار',
        'desc_tip' => true,
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_box_contents',
        'label' => 'اقلام داخل جعبه',
        'description' => 'هر قلم در یک خط.',
        'desc_tip' => true,
    ]);
    woocommerce_wp_text_input([
        'id' => '_mototec_warranty',
        'label' => 'گارانتی',
    ]);
    woocommerce_wp_text_input([
        'id' => '_mototec_shipping_status',
        'label' => 'وضعیت ارسال',
    ]);
    woocommerce_wp_textarea_input([
        'id' => '_mototec_note',
        'label' => 'نکته',
    ]);

    echo '</div></div>';
});

add_action('woocommerce_admin_process_product_object', function ($product) {
    foreach (array_keys(MOTOTEC_FIELDS) as $key) {
        $field = '_mototec_' . $key;
        if (!isset($_POST[$field])) {
            continue;
        }
        $product->update_meta_data($field, wc_clean(wp_unslash($_POST[$field])));
    }
});

add_filter('woocommerce_rest_prepare_product_object', function ($response) {
    $data = [];
    foreach (array_keys(MOTOTEC_FIELDS) as $key) {
        $data[$key] = (string) $response->data['id']
            ? get_post_meta((int) $response->data['id'], '_mototec_' . $key, true)
            : '';
    }
    $response->data['mototec'] = $data;
    return $response;
}, 10, 1);
